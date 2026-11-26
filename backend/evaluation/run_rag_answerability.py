"""Run Dasaiko's production hybrid retrieval, reranking and prompt/generation path.

The dataset must be independently annotated against the exported corpus.
This runner does not create ground truth or semantic claim annotations.
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


ABSTENTION_TEXT = "I don't have enough information in the uploaded documents."


def prepare_evidence(results: list[dict], document_id: int | None) -> list[dict]:
    """Mirror ChatService's evidence filtering and source-block construction."""
    if document_id is not None and results:
        top_score = float(results[0]["score"])
        floor = top_score - ChatService.SELECTED_PAPER_SCORE_MARGIN
        usable = [item for item in results if float(item["score"]) >= floor]
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
            "text": chunk.content,
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
    return [{"evidence": evidence, "context": "\n".join(context_parts)}]


def classify_action(answer: str) -> str:
    """Conservative operational label; semantic correctness remains human-annotated."""
    normalized = " ".join(answer.lower().split())
    abstention = " ".join(ABSTENTION_TEXT.lower().split())
    if abstention in normalized:
        return "abstain"
    return "answer"


def run_case(case: dict[str, Any], db, client: Groq) -> dict[str, Any]:
    query = case["query"]
    user_id = int(case["user_id"])
    document_id = case.get("document_id")
    results = SearchService.search(
        db=db, query=query, user_id=user_id, limit=5, document_id=document_id
    )
    prepared = prepare_evidence(results, document_id)[0]
    prompt = PromptService.build_prompt(
        conversation_history="",
        context=prepared["context"],
        query=query,
    )
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": "You are Dasaiko, an AI research assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )
    answer = response.choices[0].message.content or ""
    answer = ChatService._validate_source_citations(
        answer, len(prepared["evidence"])
    )
    source_by_prompt_id = {
        item["prompt_source_id"]: item["source_id"]
        for item in prepared["evidence"]
    }
    cited_prompt_ids = set(re.findall(r"\[SOURCE_(\d+)\]", answer))
    cited_source_ids = [
        source_by_prompt_id[f"SOURCE_{index}"]
        for index in sorted(cited_prompt_ids, key=int)
        if f"SOURCE_{index}" in source_by_prompt_id
    ]
    return {
        "case_id": case["id"],
        "predicted_action": classify_action(answer),
        "cited_source_ids": cited_source_ids,
        "answer": answer,
        "retrieved_evidence": prepared["evidence"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--predictions", type=Path, default=Path("artifacts/rag_predictions.json"))
    args = parser.parse_args()

    cases = json.loads(args.dataset.read_text(encoding="utf-8"))
    if not isinstance(cases, list) or not cases:
        raise ValueError("Dataset must be a non-empty JSON array.")
    required = {"id", "query", "user_id", "ground_truth"}
    for index, case in enumerate(cases):
        missing = required - case.keys()
        if missing:
            raise ValueError(f"Case at index {index} is missing: {sorted(missing)}")
        if "expected_action" not in case["ground_truth"]:
            raise ValueError(f"Case {case['id']} is missing ground_truth.expected_action")

    client = Groq(api_key=settings.groq_api_key)
    db = SessionLocal()
    try:
        predictions = [run_case(case, db, client) for case in cases]
    finally:
        db.close()

    args.predictions.parent.mkdir(parents=True, exist_ok=True)
    args.predictions.write_text(
        json.dumps(predictions, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {len(predictions)} predictions at {args.predictions}.")
    print("These are model outputs, not validated quality scores. Run independent annotation before evaluation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
