from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

DATASET_PATH = (
    Path(__file__).resolve().parent
    / "datasets"
    / "answerability_cases.json"
)

SCENARIO_COUNTS = {
    "answerable": 15,
    "partially_answerable": 10,
    "unanswerable": 10,
    "hard_negative": 10,
    "conflicting": 5,
    "stale_evidence": 5,
    "ambiguous": 5,
}

ANSWERABILITY_BY_SCENARIO = {
    "answerable": "answerable",
    "partially_answerable": "partially_answerable",
    "unanswerable": "unanswerable",
    "hard_negative": "answerable",
    "conflicting": "conflicting",
    "stale_evidence": "stale",
    "ambiguous": "ambiguous",
}

ACTION_BY_SCENARIO = {
    "answerable": "answer",
    "partially_answerable": "partial_answer",
    "unanswerable": "abstain",
    "hard_negative": "answer",
    "conflicting": "escalate",
    "stale_evidence": "escalate",
    "ambiguous": "clarify",
}


def validate_cases(cases: list[dict], enforce_distribution: bool = True) -> list[str]:
    errors: list[str] = []
    if not isinstance(cases, list):
        return ["Dataset root must be a JSON array."]

    ids = [case.get("id") for case in cases if isinstance(case, dict)]
    if len(ids) != len(cases):
        errors.append("Every dataset item must be an object.")
    if len(ids) != len(set(ids)):
        errors.append("Case IDs must be unique.")

    counts = Counter()
    for index, case in enumerate(cases):
        prefix = f"case[{index}]"
        for key in ("id", "scenario_type", "difficulty", "question", "context", "ground_truth"):
            if key not in case:
                errors.append(f"{prefix}: missing {key!r}.")
        scenario = case.get("scenario_type")
        counts[scenario] += 1
        if scenario not in SCENARIO_COUNTS:
            errors.append(f"{prefix}: unknown scenario_type {scenario!r}.")
            continue

        context = case.get("context", {})
        sources = context.get("sources", []) if isinstance(context, dict) else []
        if not isinstance(sources, list):
            errors.append(f"{prefix}: context.sources must be a list.")
            sources = []
        source_ids_list = [
            source.get("source_id")
            for source in sources
            if isinstance(source, dict)
        ]
        if len(source_ids_list) != len(sources):
            errors.append(f"{prefix}: every source excerpt must be an object.")
        valid_source_ids = [
            source_id
            for source_id in source_ids_list
            if isinstance(source_id, str) and source_id
        ]
        source_ids = set(valid_source_ids)
        if len(valid_source_ids) != len(source_ids):
            errors.append(f"{prefix}: source_id values must be unique within a case.")
        if len(valid_source_ids) != len(source_ids_list):
            errors.append(f"{prefix}: every source must have a non-empty string source_id.")
        if not sources:
            errors.append(f"{prefix}: at least one source excerpt is required.")

        truth = case.get("ground_truth", {})
        if truth.get("answerability") != ANSWERABILITY_BY_SCENARIO[scenario]:
            errors.append(f"{prefix}: answerability label does not match scenario.")
        if truth.get("expected_action") != ACTION_BY_SCENARIO[scenario]:
            errors.append(f"{prefix}: expected_action does not match scenario.")

        for evidence in truth.get("supporting_evidence", []):
            if evidence.get("source_id") not in source_ids:
                errors.append(f"{prefix}: supporting evidence references an unknown source.")
                continue
            source = next(s for s in sources if isinstance(s, dict) and s.get("source_id") == evidence["source_id"])
            if evidence.get("quote", "") not in source.get("content", ""):
                errors.append(f"{prefix}: supporting quote is not verbatim in its source.")

        if scenario in {"answerable", "hard_negative"} and not truth.get("required_facts"):
            errors.append(f"{prefix}: answerable case must define required_facts.")
        if scenario in {"unanswerable", "conflicting", "stale_evidence", "ambiguous"} and truth.get("expected_answer") is not None:
            errors.append(f"{prefix}: non-answer case must not contain a definitive expected_answer.")

    if enforce_distribution:
        if len(cases) != sum(SCENARIO_COUNTS.values()):
            errors.append(f"Expected {sum(SCENARIO_COUNTS.values())} cases; found {len(cases)}.")
        for scenario, expected in SCENARIO_COUNTS.items():
            if counts[scenario] != expected:
                errors.append(f"Expected {expected} {scenario} cases; found {counts[scenario]}.")
    return errors


def main() -> int:
    with DATASET_PATH.open("r", encoding="utf-8") as handle:
        cases = json.load(handle)
    errors = validate_cases(cases)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print(f"Validated {len(cases)} answerability cases.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
