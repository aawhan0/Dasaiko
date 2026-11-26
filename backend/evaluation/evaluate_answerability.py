from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from evaluation.validate_answerability_dataset import validate_cases

ROOT = Path(__file__).resolve().parent
DEFAULT_DATASET = ROOT / "datasets" / "answerability_cases.json"
DEFAULT_OUTPUT = ROOT / "results" / "answerability_evaluation.json"

ACTIONS = {"answer", "partial_answer", "abstain", "escalate", "clarify"}
ANSWERABILITY_LABELS = {
    "answerable", "partially_answerable", "unanswerable",
    "conflicting", "stale", "ambiguous",
}
ANSWER_ACTIONS = {"answer", "partial_answer"}
CLAIM_SUPPORT_STATUSES = {"supported", "unsupported", "contradicted", "insufficient_evidence"}
NON_ANSWER_ACTIONS = {"abstain", "escalate", "clarify"}


def _validate_predictions(
    cases: list[dict[str, Any]],
    predictions: list[dict[str, Any]],
) -> list[str]:
    errors: list[str] = []
    case_by_id = {case["id"]: case for case in cases}
    seen: set[str] = set()

    if not isinstance(predictions, list):
        return ["Predictions root must be a JSON array."]

    for index, prediction in enumerate(predictions):
        prefix = f"prediction[{index}]"
        if not isinstance(prediction, dict):
            errors.append(f"{prefix}: must be an object.")
            continue

        case_id = prediction.get("case_id")
        if not isinstance(case_id, str) or not case_id:
            errors.append(f"{prefix}: case_id must be a non-empty string.")
            continue
        if case_id not in case_by_id:
            errors.append(f"{prefix}: unknown case_id {case_id!r}.")
            continue
        if case_id in seen:
            errors.append(f"{prefix}: duplicate case_id {case_id!r}.")
        seen.add(case_id)

        action = prediction.get("predicted_action")
        if action not in ACTIONS:
            errors.append(f"{prefix}: predicted_action must be one of {sorted(ACTIONS)}.")

        label = prediction.get("predicted_answerability")
        if label is not None and label not in ANSWERABILITY_LABELS:
            errors.append(f"{prefix}: invalid predicted_answerability {label!r}.")

        confidence = prediction.get("confidence")
        if confidence is not None:
            if isinstance(confidence, bool) or not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
                errors.append(f"{prefix}: confidence must be a number in [0, 1].")

        cited = prediction.get("cited_source_ids", [])
        if not isinstance(cited, list) or any(not isinstance(item, str) for item in cited):
            errors.append(f"{prefix}: cited_source_ids must be a list of strings.")
        else:
            source_ids = {
                source["source_id"]
                for source in case_by_id[case_id]["context"]["sources"]
            }
            unknown = set(cited) - source_ids
            if unknown:
                errors.append(f"{prefix}: cites unknown source IDs {sorted(unknown)}.")

        covered = prediction.get("covered_required_fact_indices", [])
        required_count = len(case_by_id[case_id]["ground_truth"].get("required_facts", []))
        if not isinstance(covered, list) or any(
            isinstance(item, bool) or not isinstance(item, int) or item < 0 or item >= required_count
            for item in covered
        ):
            errors.append(
                f"{prefix}: covered_required_fact_indices must contain valid zero-based "
                f"indices for this case (0..{required_count - 1})."
            )
        elif len(covered) != len(set(covered)):
            errors.append(f"{prefix}: covered_required_fact_indices must be unique.")

        claims = prediction.get("claim_assessments", [])
        if not isinstance(claims, list):
            errors.append(f"{prefix}: claim_assessments must be a list.")
            continue
        source_ids = {
            source["source_id"]
            for source in case_by_id[case_id]["context"]["sources"]
        }
        for claim_index, claim in enumerate(claims):
            claim_prefix = f"{prefix}.claim_assessments[{claim_index}]"
            if not isinstance(claim, dict):
                errors.append(f"{claim_prefix}: must be an object.")
                continue
            if not isinstance(claim.get("text"), str) or not claim["text"].strip():
                errors.append(f"{claim_prefix}: text must be a non-empty string.")
            status = claim.get("support_status")
            if status not in CLAIM_SUPPORT_STATUSES:
                errors.append(
                    f"{claim_prefix}: support_status must be one of {sorted(CLAIM_SUPPORT_STATUSES)}."
                )
            for field in ("cited_source_ids", "supporting_source_ids"):
                values = claim.get(field, [])
                if not isinstance(values, list) or any(not isinstance(item, str) for item in values):
                    errors.append(f"{claim_prefix}: {field} must be a list of strings.")
                    continue
                if len(values) != len(set(values)):
                    errors.append(f"{claim_prefix}: {field} must contain unique IDs.")
                unknown = set(values) - source_ids
                if unknown:
                    errors.append(f"{claim_prefix}: {field} contains unknown source IDs {sorted(unknown)}.")
            supporting = claim.get("supporting_source_ids", [])
            if status != "supported" and supporting:
                errors.append(
                    f"{claim_prefix}: supporting_source_ids must be empty unless support_status is 'supported'."
                )

    missing = set(case_by_id) - seen
    if missing:
        errors.append(f"Missing predictions for case IDs: {sorted(missing)}.")
    return errors


def _ratio(numerator: float, denominator: float) -> float | None:
    return numerator / denominator if denominator else None


def _calibration(confidence_pairs: list[tuple[float, bool]], bins: int = 10) -> dict[str, Any]:
    if not confidence_pairs:
        return {"sample_count": 0, "brier_score": None, "expected_calibration_error": None, "bins": []}

    brier = sum((score - float(correct)) ** 2 for score, correct in confidence_pairs) / len(confidence_pairs)
    grouped: list[list[tuple[float, bool]]] = [[] for _ in range(bins)]
    for score, correct in confidence_pairs:
        index = min(int(score * bins), bins - 1)
        grouped[index].append((score, correct))

    bin_results = []
    ece = 0.0
    total = len(confidence_pairs)
    for index, values in enumerate(grouped):
        if not values:
            continue
        mean_confidence = sum(score for score, _ in values) / len(values)
        accuracy = sum(float(correct) for _, correct in values) / len(values)
        weight = len(values) / total
        ece += weight * abs(mean_confidence - accuracy)
        bin_results.append({
            "lower_bound": index / bins,
            "upper_bound": (index + 1) / bins,
            "count": len(values),
            "mean_confidence": mean_confidence,
            "accuracy": accuracy,
        })

    return {
        "sample_count": total,
        "brier_score": brier,
        "expected_calibration_error": ece,
        "bins": bin_results,
    }


def _risk_coverage(
    answer_attempts: list[tuple[float, bool]],
    total_cases: int,
    max_answer_risk: float | None = None,
) -> dict[str, Any]:
    """Build an empirical confidence-threshold curve for answer attempts."""
    if max_answer_risk is not None and not 0 <= max_answer_risk <= 1:
        raise ValueError("max_answer_risk must be in [0, 1].")

    if not answer_attempts:
        return {
            "sample_count": 0,
            "confidence_coverage": 0.0,
            "curve": [],
            "area_under_risk_coverage_curve": None,
            "target_risk": max_answer_risk,
            "suggested_threshold": None,
            "suggested_coverage": None,
            "suggested_empirical_risk": None,
        }

    thresholds = sorted({score for score, _ in answer_attempts}, reverse=True)
    curve: list[dict[str, float | int]] = []
    for threshold in thresholds:
        accepted = [(score, correct) for score, correct in answer_attempts if score >= threshold]
        errors = sum(not correct for _, correct in accepted)
        curve.append({
            "threshold": threshold,
            "accepted_answers": len(accepted),
            "coverage": len(accepted) / total_cases if total_cases else 0.0,
            "risk": errors / len(accepted),
        })

    # Thresholds are descending, so coverage increases from left to right.
    previous_coverage = 0.0
    previous_risk = 0.0
    aurc = 0.0
    for point in curve:
        coverage = float(point["coverage"])
        risk = float(point["risk"])
        aurc += (coverage - previous_coverage) * (risk + previous_risk) / 2
        previous_coverage, previous_risk = coverage, risk

    eligible = [
        point for point in curve
        if max_answer_risk is not None and float(point["risk"]) <= max_answer_risk
    ]
    suggested = max(eligible, key=lambda point: float(point["coverage"])) if eligible else None

    return {
        "sample_count": len(answer_attempts),
        "confidence_coverage": len(answer_attempts) / total_cases if total_cases else 0.0,
        "curve": curve,
        "area_under_risk_coverage_curve": aurc,
        "target_risk": max_answer_risk,
        "suggested_threshold": suggested["threshold"] if suggested else None,
        "suggested_coverage": suggested["coverage"] if suggested else None,
        "suggested_empirical_risk": suggested["risk"] if suggested else None,
        "interpretation": (
            "Empirical threshold selection on this evaluation sample only. "
            "Choose thresholds on a development set and verify once on a separate holdout; "
            "do not treat the suggested threshold as a production guarantee."
        ),
    }


def evaluate_predictions(
    cases: list[dict[str, Any]],
    predictions: list[dict[str, Any]],
    max_answer_risk: float | None = None,
) -> dict[str, Any]:
    dataset_errors = validate_cases(cases, enforce_distribution=False)
    if dataset_errors:
        raise ValueError("Invalid answerability dataset: " + "; ".join(dataset_errors))

    prediction_errors = _validate_predictions(cases, predictions)
    if prediction_errors:
        raise ValueError("Invalid predictions: " + "; ".join(prediction_errors))

    prediction_by_id = {item["case_id"]: item for item in predictions}
    total = len(cases)
    action_correct = 0
    answer_attempts_correct = 0
    label_evaluated = 0
    label_correct = 0
    non_answer_total = 0
    correct_non_answer_action = 0
    false_answer = 0
    answer_attempts = 0
    fact_total = 0
    fact_covered = 0
    evidence_tp = 0
    evidence_fp = 0
    evidence_fn = 0
    claim_status_counts: Counter = Counter()
    claim_evidence_tp = 0
    claim_evidence_fp = 0
    claim_evidence_fn = 0
    claim_count = 0
    confidence_pairs: list[tuple[float, bool]] = []
    answer_confidence_pairs: list[tuple[float, bool]] = []
    action_confusion: dict[str, Counter] = defaultdict(Counter)
    scenario_stats: dict[str, dict[str, int]] = defaultdict(lambda: {
        "cases": 0, "action_correct": 0, "false_answers": 0, "non_answer_cases": 0,
    })

    for case in cases:
        truth = case["ground_truth"]
        prediction = prediction_by_id[case["id"]]
        expected_action = truth["expected_action"]
        predicted_action = prediction["predicted_action"]
        action_is_correct = predicted_action == expected_action

        action_correct += int(action_is_correct)
        action_confusion[expected_action][predicted_action] += 1

        if prediction.get("predicted_answerability") is not None:
            label_evaluated += 1
            label_correct += int(prediction["predicted_answerability"] == truth["answerability"])

        scenario = case["scenario_type"]
        stats = scenario_stats[scenario]
        stats["cases"] += 1
        stats["action_correct"] += int(action_is_correct)

        if expected_action in NON_ANSWER_ACTIONS:
            non_answer_total += 1
            stats["non_answer_cases"] += 1
            if predicted_action == expected_action:
                correct_non_answer_action += 1
            if predicted_action in ANSWER_ACTIONS:
                false_answer += 1
                stats["false_answers"] += 1

        if predicted_action in ANSWER_ACTIONS:
            answer_attempts += 1
            answer_attempts_correct += int(action_is_correct)
            if prediction.get("confidence") is not None:
                answer_confidence_pairs.append((float(prediction["confidence"]), action_is_correct))

        required_facts = truth.get("required_facts", [])
        if required_facts and predicted_action in ANSWER_ACTIONS:
            fact_total += len(required_facts)
            covered_indices = set(prediction.get("covered_required_fact_indices", []))
            fact_covered += len(covered_indices)

        gold_sources = {item["source_id"] for item in truth.get("supporting_evidence", [])}
        predicted_sources = set(prediction.get("cited_source_ids", []))
        evidence_tp += len(gold_sources & predicted_sources)
        evidence_fp += len(predicted_sources - gold_sources)
        evidence_fn += len(gold_sources - predicted_sources)

        for claim in prediction.get("claim_assessments", []):
            claim_count += 1
            claim_status_counts[claim["support_status"]] += 1
            cited_claim_sources = set(claim.get("cited_source_ids", []))
            supported_claim_sources = set(claim.get("supporting_source_ids", []))
            claim_evidence_tp += len(cited_claim_sources & supported_claim_sources)
            claim_evidence_fp += len(cited_claim_sources - supported_claim_sources)
            claim_evidence_fn += len(supported_claim_sources - cited_claim_sources)

        confidence = prediction.get("confidence")
        if confidence is not None:
            confidence_pairs.append((float(confidence), action_is_correct))

    action_accuracy = action_correct / total if total else 0.0
    return {
        "case_count": total,
        "metrics": {
            "action_accuracy": action_accuracy,
            "answerability_accuracy": _ratio(label_correct, label_evaluated),
            "answerability_label_coverage": label_evaluated / total if total else 0.0,
            "false_answer_rate_on_non_answer_cases": _ratio(false_answer, non_answer_total),
            "correct_non_answer_action_rate": _ratio(correct_non_answer_action, non_answer_total),
            "answer_coverage": answer_attempts / total if total else 0.0,
            "selective_action_accuracy": _ratio(answer_attempts_correct, answer_attempts),
            "required_fact_coverage": _ratio(fact_covered, fact_total),
            "evidence_source_precision": _ratio(evidence_tp, evidence_tp + evidence_fp),
            "evidence_source_recall": _ratio(evidence_tp, evidence_tp + evidence_fn),
            "evidence_source_f1": _ratio(
                2 * evidence_tp,
                2 * evidence_tp + evidence_fp + evidence_fn,
            ),
            "confidence_calibration": _calibration(confidence_pairs),
            "answer_risk_coverage": _risk_coverage(
                answer_confidence_pairs, total, max_answer_risk=max_answer_risk
            ),
            "claim_support_rate": _ratio(claim_status_counts["supported"], claim_count),
            "unsupported_claim_rate": _ratio(claim_status_counts["unsupported"], claim_count),
            "contradicted_claim_rate": _ratio(claim_status_counts["contradicted"], claim_count),
            "insufficient_evidence_claim_rate": _ratio(
                claim_status_counts["insufficient_evidence"], claim_count
            ),
            "claim_evidence_attribution_precision": _ratio(
                claim_evidence_tp, claim_evidence_tp + claim_evidence_fp
            ),
            "claim_evidence_attribution_recall": _ratio(
                claim_evidence_tp, claim_evidence_tp + claim_evidence_fn
            ),
            "claim_evidence_attribution_f1": _ratio(
                2 * claim_evidence_tp,
                2 * claim_evidence_tp + claim_evidence_fp + claim_evidence_fn,
            ),
        },
        "counts": {
            "action_correct": action_correct,
            "answerability_correct": label_correct,
            "answerability_evaluated": label_evaluated,
            "non_answer_cases": non_answer_total,
            "false_answers": false_answer,
            "correct_non_answer_actions": correct_non_answer_action,
            "answer_attempts": answer_attempts,
            "claim_count": claim_count,
            "claim_status_counts": dict(sorted(claim_status_counts.items())),
            "claim_evidence_true_positives": claim_evidence_tp,
            "claim_evidence_false_positives": claim_evidence_fp,
            "claim_evidence_false_negatives": claim_evidence_fn,
            "required_facts_covered": fact_covered,
            "required_facts_evaluated": fact_total,
            "evidence_true_positives": evidence_tp,
            "evidence_false_positives": evidence_fp,
            "evidence_false_negatives": evidence_fn,
        },
        "action_confusion_matrix": {
            expected: dict(sorted(predicted.items()))
            for expected, predicted in sorted(action_confusion.items())
        },
        "by_scenario": {
            scenario: {
                **values,
                "action_accuracy": values["action_correct"] / values["cases"] if values["cases"] else 0.0,
                "false_answer_rate": _ratio(values["false_answers"], values["non_answer_cases"]),
            }
            for scenario, values in sorted(scenario_stats.items())
        },
        "metric_notes": {
            "false_answer_rate_on_non_answer_cases": "Fraction of unanswerable/conflicting/stale/ambiguous cases where the system attempted an answer instead of taking the labelled non-answer action.",
            "correct_non_answer_action_rate": "Exact expected-action match among cases labelled abstain, escalate, or clarify.",
            "answer_coverage": "Fraction of all cases where the system attempted an answer (answer or partial_answer).",
            "selective_action_accuracy": "Exact expected-action accuracy restricted to cases where the system attempted an answer; it must be read with answer coverage.",
            "required_fact_coverage": "Coverage of required facts, based on externally supplied covered_required_fact_indices; this evaluator does not judge answer text semantically.",
            "evidence_source_metrics": "Source-ID overlap against annotated supporting_evidence; this is a provenance proxy, not claim-level entailment verification.",
            "confidence_calibration": "Confidence is evaluated against exact expected_action correctness, not answer truth probability. Brier score and equal-width-bin ECE are reported only for supplied confidence values.",
            "answer_risk_coverage": "Confidence-threshold curve over answer/partial_answer attempts with supplied confidence. Coverage is accepted answer attempts divided by all cases; risk is the fraction of accepted attempts with an incorrect expected action. Missing-confidence attempts are excluded from this curve.",
            "claim_support_metrics": "Based only on claim_assessments supplied by an independent semantic evaluator. support_status must reflect whether the complete claim is supported, unsupported, contradicted, or not established by the provided sources; this script does not infer entailment from text.",
            "claim_evidence_attribution_metrics": "Per-claim overlap between cited_source_ids and independently annotated supporting_source_ids. It measures citation attribution, not semantic entailment by itself.",
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Evaluate answerability, abstention, evidence references and confidence."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--predictions", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--max-answer-risk",
        type=float,
        default=None,
        help="Optional empirical risk cap in [0, 1] for reporting a candidate confidence threshold.",
    )
    args = parser.parse_args()

    with args.dataset.open("r", encoding="utf-8") as handle:
        cases = json.load(handle)
    with args.predictions.open("r", encoding="utf-8") as handle:
        predictions = json.load(handle)

    report = evaluate_predictions(cases, predictions, max_answer_risk=args.max_answer_risk)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)

    metrics = report["metrics"]
    print(f"Evaluated {report['case_count']} cases.")
    print(f"Action accuracy: {metrics['action_accuracy']:.3f}")
    print(f"False answer rate (non-answer cases): {metrics['false_answer_rate_on_non_answer_cases']:.3f}")
    print(f"Correct non-answer action rate: {metrics['correct_non_answer_action_rate']:.3f}")
    print(f"Answer coverage: {metrics['answer_coverage']:.3f}")
    risk_coverage = metrics["answer_risk_coverage"]
    if risk_coverage["suggested_threshold"] is not None:
        print(
            "Empirical answer-confidence threshold: "
            f"{risk_coverage['suggested_threshold']:.3f} "
            f"(coverage={risk_coverage['suggested_coverage']:.3f}, "
            f"risk={risk_coverage['suggested_empirical_risk']:.3f})"
        )
    print(f"Report written to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
