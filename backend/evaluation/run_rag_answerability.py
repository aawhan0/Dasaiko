"""Run Dasaiko's production retrieval, prompt and generation path.

Cases must be independently annotated. Retrieved evidence is recorded separately
from gold supporting evidence; this runner never creates ground-truth labels.
"""
import argparse
import json
import re
from pathlib import Path
from typing import Any

from groq import Groq

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.chat_service import ChatService
from app.services.prompt_service import PromptService
from app.services.search_service import SearchService
from evaluation.validate_answerability_dataset import validate_cases


ABSTENTION_TEXT = "I don't have enough information in the uploaded documents."


def prepare_evidence(
    results: list[dict], document_id: int | None, query: str
) -> dict:
    """Mirror ChatService evidence selection, including selected-paper summaries."""
    if document_id is not None and results:
        top_score = float(results[0]["score"])
        floor = top_score - ChatService.SELECTED_PAPER_SCORE_MARGIN
        usable = [item for item in results if float(item["score"]) >= floor]

        if SearchService._is_summary_query(query):
            content_results = [
                item for item in results
                if len((item.get("preview") or "").strip()) >= 100
            ]
            if content_results and content_results[0] not in usable:
                usable.append(content_results[0])

        if not usable:
            usable = [results[0]]
    else:
        usable = [
            item for item in results
            if float(item["score"]) >= ChatService.MIN_EVIDENCE_SCORE
        ]

    evidence = []
    context_parts = []
    for index, item in enumerate(usable, start=1):
        chunk = item["chunk"]
        source_id = f"chunk:{chunk.id}"
        evidence.append({
            "source_id": source_id,
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "document_title": chunk.document.title,
            "page_number": item["page_number"],
            "score": float(item["score"]),
            "content": chunk.content,
            "prompt_source_id": f"SOURCE_{index}",
        })
        context_parts.append(
            f"[SOURCE_{index}]\n"
            f"Document: {chunk.document.title}\n"
            f"Document ID: {chunk.document_id}\n"
            f"Chunk ID: {chunk.id}\n"
            f"Page: {item['page_number']}\n"
            f"Chunk Index: {chunk.chunk_index}\n"
            f"----------------------------------------\n"
            f"{chunk.content}\n"
            f"[/SOURCE_{index}]"
        )
    return {"evidence": evidence, "context": "\n".join(context_parts)}


def classify_action(answer: str) -> str:
    """Extract and validate the model's explicit evaluation action."""
    pattern = (
        r"<ACTION>\s*(answer|partial_answer|abstain|clarify|escalate)\s*</ACTION>"
        r"|(?:\*\*)?\s*ACTION\s*:?\s*(?:\*\*)?\s*"
        r"(?:\*\*)?(answer|partial_answer|abstain|clarify|escalate)(?:\*\*)?\s*$"
    )
    matches = re.findall(
        pattern,
        answer,
        flags=re.IGNORECASE | re.MULTILINE,
    )
    matches = [next(group for group in match if group).lower() for match in matches]

    if len(matches) == 1:
        return matches[0]

    return "unclassified"

def run_case(case: dict[str, Any], db, client: Groq) -> tuple[dict, list[dict]]:
    query = case["question"]
    user_id = int(case["user_id"])
    document_id = case.get("document_id")
    results = SearchService.search(
        db=db, query=query, user_id=user_id, limit=8, document_id=document_id
    )
    prepared = prepare_evidence(results, document_id, query)
    base_prompt = PromptService.build_prompt(
        conversation_history="",
        context=prepared["context"],
        query=query,
    )
    answer_prompt = base_prompt + """

ANSWER REQUIREMENTS:
- Answer using only the retrieved evidence.
- Cite every substantive factual claim using the supplied [SOURCE_n] identifiers.
- Use only source identifiers present in the retrieved context.
- If evidence is insufficient, clearly state what cannot be established.
- Do not invent facts or citations.
"""
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": "You are Dasaiko, an evidence-grounded AI research assistant.",
            },
            {"role": "user", "content": answer_prompt},
        ],
        temperature=0.2,
        max_tokens=2048,
    )

    print("ANSWER FINISH REASON:", response.choices[0].finish_reason)
    print("ANSWER USAGE:", response.usage)

    raw_answer = response.choices[0].message.content or ""
    print("RAW ANSWER END:", repr(raw_answer[-250:]))

    answer = ChatService._validate_source_citations(
        raw_answer,
        len(prepared["evidence"]),
    )

    classifier_prompt = f"""Classify the response using ONLY the question, retrieved evidence, and generated answer below.

QUESTION:
{query}

RETRIEVED EVIDENCE:
{prepared["context"]}

GENERATED ANSWER:
{answer}

Choose exactly one label:
- answer: Every requested part is adequately supported by the retrieved evidence and answered.
- partial_answer: At least one requested part is supported, but another requested part is unsupported or unanswered.
- abstain: No requested part can be usefully answered from the evidence.
- clarify: The question is materially ambiguous and needs clarification.
- escalate: The evidence is materially conflicting or stale.

Return ONLY the label. No explanation, punctuation, markdown, or additional text.
"""

    classifier_response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": "You are a strict answerability classifier. Output exactly one permitted label.",
            },
            {"role": "user", "content": classifier_prompt},
        ],
        temperature=0,
        max_tokens=256,
    )

    classifier_raw = (
        classifier_response.choices[0].message.content or ""
    ).strip()

    print("CLASSIFIER FINISH REASON:", classifier_response.choices[0].finish_reason)
    print("CLASSIFIER RAW RESPONSE:", repr(classifier_raw))

    allowed_actions = {
        "answer",
        "partial_answer",
        "abstain",
        "clarify",
        "escalate",
    }
    predicted_action = classifier_raw.strip().lower()
    if predicted_action not in allowed_actions:
        predicted_action = "unclassified"
    action_classification = (
        "separate_classifier"
        if predicted_action != "unclassified"
        else "unclassified_classifier"
    )
    answer_generation_action = classify_action(raw_answer)

    source_by_prompt_id = {
        item["prompt_source_id"]: item["source_id"]
        for item in prepared["evidence"]
    }
    cited_prompt_ids = set(re.findall(r"\[\s*SOURCE_(\d+)\s*\]", answer))
    cited_source_ids = [
        source_by_prompt_id[f"SOURCE_{index}"]
        for index in sorted(cited_prompt_ids, key=int)
        if f"SOURCE_{index}" in source_by_prompt_id
    ]
    prediction = {
        "case_id": case["id"],
        "predicted_action": predicted_action,
        "action_classification": action_classification,
        "answer_generation_action": answer_generation_action,
        "classifier_raw_response": classifier_raw,
        "cited_source_ids": cited_source_ids,
        "answer": answer,
        "retrieved_evidence": prepared["evidence"],
    }
    return prediction, prepared["evidence"]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--predictions", type=Path, default=Path("artifacts/rag_predictions.json"))
    parser.add_argument(
        "--evaluation-dataset",
        type=Path,
        default=Path("artifacts/rag_evaluation_dataset.json"),
        help="Validated cases augmented with retrieved sources for citation-ID checking.",
    )
    args = parser.parse_args()

    cases = json.loads(args.dataset.read_text(encoding="utf-8"))
    if not isinstance(cases, list) or not cases:
        raise ValueError("Dataset must be a non-empty JSON array.")
    errors = validate_cases(cases, enforce_distribution=False)
    if errors:
        raise ValueError("Invalid annotated dataset:\n- " + "\n- ".join(errors))
    for case in cases:
        if "user_id" not in case:
            raise ValueError(f"Case {case['id']} is missing user_id.")
        if "question" not in case:
            raise ValueError(f"Case {case['id']} is missing question.")

    client = Groq(
        api_key=settings.groq_api_key,
        max_retries=3,
        timeout=120.0,
    )
    db = SessionLocal()
    augmented_cases = json.loads(json.dumps(cases))
    predictions = []
    completed_ids = set()

    if args.predictions.exists():
        predictions = json.loads(args.predictions.read_text(encoding="utf-8"))
        if not isinstance(predictions, list):
            raise ValueError("Existing predictions file must contain a JSON array.")

        dataset_ids = {case["id"] for case in cases}
        prediction_ids = [item.get("case_id") for item in predictions]

        if len(prediction_ids) != len(set(prediction_ids)):
            raise ValueError("Existing predictions contain duplicate case IDs.")
        if not set(prediction_ids).issubset(dataset_ids):
            raise ValueError("Existing predictions belong to a different dataset.")

        completed_ids = set(prediction_ids)

    if args.evaluation_dataset.exists() and completed_ids:
        saved_cases = json.loads(
            args.evaluation_dataset.read_text(encoding="utf-8")
        )
        saved_by_id = {case["id"]: case for case in saved_cases}

        for case in augmented_cases:
            saved = saved_by_id.get(case["id"])
            if saved and case["id"] in completed_ids:
                case["context"]["sources"] = saved["context"]["sources"]

    print(f"Resuming: {len(completed_ids)}/{len(cases)} cases already completed.")

    try:
        for index, case in enumerate(cases):
            if case["id"] in completed_ids:
                continue

            prediction, retrieved = run_case(case, db, client)
            predictions.append(prediction)

            # Register retrieved chunks so the evaluator can validate citation IDs.
            # This does NOT add them to ground_truth.supporting_evidence.
            registered = {
                source["source_id"]
                for source in augmented_cases[index]["context"]["sources"]
            }
            for item in retrieved:
                if item["source_id"] not in registered:
                    augmented_cases[index]["context"]["sources"].append({
                        "source_id": item["source_id"],
                        "content": item["content"],
                        "provenance": "runtime_retrieval",
                    })
                    registered.add(item["source_id"])

            # Checkpoint after each successfully completed case.
            args.predictions.parent.mkdir(parents=True, exist_ok=True)
            args.evaluation_dataset.parent.mkdir(parents=True, exist_ok=True)
            args.predictions.write_text(
                json.dumps(predictions, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            args.evaluation_dataset.write_text(
                json.dumps(augmented_cases, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"Checkpoint saved: {len(predictions)}/{len(cases)} cases.")

    finally:
        db.close()
    print(f"Generated {len(predictions)} predictions at {args.predictions}.")
    print(f"Registered runtime-retrieved sources in {args.evaluation_dataset}.")
    print("Retrieved sources are not gold supporting evidence; annotate answer and claim quality independently.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
