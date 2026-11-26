"""Aggregate answerability evaluator outputs into reproducible benchmark comparisons.

Usage:
  python -m evaluation.build_answerability_report \
    --run baseline=artifacts/baseline.json \
    --run candidate=artifacts/candidate.json \
    --baseline baseline \
    --output artifacts/benchmark_comparison.json \
    --markdown-output artifacts/benchmark_comparison.md
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


METRICS = (
    "action_accuracy",
    "answerability_accuracy",
    "answerability_label_coverage",
    "false_answer_rate_on_non_answer_cases",
    "correct_non_answer_action_rate",
    "answer_coverage",
    "selective_action_accuracy",
    "required_fact_coverage",
    "evidence_source_precision",
    "evidence_source_recall",
    "evidence_source_f1",
    "claim_support_rate",
    "unsupported_claim_rate",
    "contradicted_claim_rate",
    "insufficient_evidence_claim_rate",
    "claim_evidence_attribution_precision",
    "claim_evidence_attribution_recall",
    "claim_evidence_attribution_f1",
    "confidence_calibration",
    "answer_risk_coverage",
)


def _parse_run(value: str) -> tuple[str, Path]:
    if "=" not in value:
        raise argparse.ArgumentTypeError("Each --run must use NAME=PATH.")
    name, raw_path = value.split("=", 1)
    if not name.strip() or not raw_path.strip():
        raise argparse.ArgumentTypeError("Each --run needs a non-empty name and path.")
    return name.strip(), Path(raw_path)


def _load_report(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            report = json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Could not read report {path}: {exc}") from exc
    if not isinstance(report, dict) or not isinstance(report.get("metrics"), dict):
        raise ValueError(f"{path} is not an evaluator report with a metrics object.")
    if not isinstance(report.get("by_scenario", {}), dict):
        raise ValueError(f"{path} has an invalid by_scenario section.")
    return report


def build_comparison(
    named_reports: list[tuple[str, dict[str, Any]]],
    baseline_name: str | None = None,
) -> dict[str, Any]:
    if not named_reports:
        raise ValueError("At least one named report is required.")
    names = [name for name, _ in named_reports]
    if len(names) != len(set(names)):
        raise ValueError("Run names must be unique.")
    reports = dict(named_reports)
    if baseline_name is not None and baseline_name not in reports:
        raise ValueError(f"Baseline {baseline_name!r} is not among the supplied runs.")

    runs: dict[str, Any] = {}
    for name, report in named_reports:
        metrics = report["metrics"]
        runs[name] = {
            "case_count": report.get("case_count"),
            "metrics": {key: metrics.get(key) for key in METRICS if key in metrics},
            "by_scenario": {
                scenario: {
                    "cases": values.get("cases"),
                    "action_accuracy": values.get("action_accuracy"),
                    "false_answer_rate": values.get("false_answer_rate"),
                }
                for scenario, values in sorted(report.get("by_scenario", {}).items())
            },
            "counts": report.get("counts", {}),
            "action_confusion_matrix": report.get("action_confusion_matrix", {}),
        }

    comparisons: dict[str, Any] = {}
    if baseline_name is not None:
        baseline = runs[baseline_name]
        for name, candidate in runs.items():
            if name == baseline_name:
                continue
            metric_deltas = {}
            for metric, value in candidate["metrics"].items():
                base_value = baseline["metrics"].get(metric)
                if isinstance(value, (int, float)) and not isinstance(value, bool) and isinstance(base_value, (int, float)) and not isinstance(base_value, bool):
                    metric_deltas[metric] = round(value - base_value, 8)
            scenario_deltas = {}
            for scenario, values in candidate["by_scenario"].items():
                base_values = baseline["by_scenario"].get(scenario, {})
                delta = values.get("action_accuracy")
                base_delta = base_values.get("action_accuracy")
                if isinstance(delta, (int, float)) and isinstance(base_delta, (int, float)):
                    scenario_deltas[scenario] = {
                        "action_accuracy_delta": round(delta - base_delta, 8)
                    }
            comparisons[name] = {
                "baseline": baseline_name,
                "case_count_delta": (
                    candidate["case_count"] - baseline["case_count"]
                    if isinstance(candidate["case_count"], int)
                    and isinstance(baseline["case_count"], int)
                    else None
                ),
                "metric_deltas": metric_deltas,
                "scenario_deltas": scenario_deltas,
                "interpretation": (
                    "Deltas are candidate minus baseline. Positive is not universally better: "
                    "for error rates such as false_answer_rate_on_non_answer_cases and "
                    "unsupported_claim_rate, negative is preferable. Compare only runs "
                    "using the same dataset version and annotation protocol."
                ),
            }

    return {
        "report_type": "answerability_benchmark_comparison",
        "baseline": baseline_name,
        "run_count": len(runs),
        "runs": runs,
        "comparisons": comparisons,
        "limitations": [
            "This tool aggregates evaluator outputs; it does not run the target RAG system.",
            "Comparisons are meaningful only when dataset version, prediction protocol and annotation rules are held constant.",
            "Metric deltas are descriptive and are not statistical significance tests.",
            "Missing or null metrics remain missing; they are not treated as zero.",
        ],
    }


def render_markdown(comparison: dict[str, Any]) -> str:
    lines = [
        "# Answerability benchmark comparison",
        "",
        f"- Baseline: {comparison.get('baseline') or 'Not specified'}",
        f"- Runs: {comparison['run_count']}",
        "",
        "## Run summary",
        "",
        "| Run | Cases | Action accuracy | False-answer rate | Answer coverage | Claim support rate |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for name, run in comparison["runs"].items():
        metrics = run["metrics"]
        def fmt(value: Any) -> str:
            return "—" if value is None else f"{value:.3f}" if isinstance(value, (int, float)) else str(value)
        lines.append(
            f"| {name} | {fmt(run['case_count'])} | "
            f"{fmt(metrics.get('action_accuracy'))} | "
            f"{fmt(metrics.get('false_answer_rate_on_non_answer_cases'))} | "
            f"{fmt(metrics.get('answer_coverage'))} | "
            f"{fmt(metrics.get('claim_support_rate'))} |"
        )
    for name, comparison_data in comparison["comparisons"].items():
        lines.extend(["", f"## {name} vs {comparison_data['baseline']}", "", "### Metric deltas (candidate − baseline)", ""])
        if comparison_data["metric_deltas"]:
            lines.extend(["| Metric | Delta |", "|---|---:|"])
            lines.extend(f"| {metric} | {delta:+.4f} |" for metric, delta in comparison_data["metric_deltas"].items())
        else:
            lines.append("No comparable numeric metrics were present.")
        lines.extend(["", "### Per-scenario action-accuracy deltas", ""])
        if comparison_data["scenario_deltas"]:
            lines.extend(["| Scenario | Delta |", "|---|---:|"])
            lines.extend(
                f"| {scenario} | {values['action_accuracy_delta']:+.4f} |"
                for scenario, values in comparison_data["scenario_deltas"].items()
            )
        else:
            lines.append("No comparable scenario metrics were present.")
    lines.extend(["", "## Limitations", ""])
    lines.extend(f"- {item}" for item in comparison["limitations"])
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", action="append", type=_parse_run, required=True, metavar="NAME=PATH")
    parser.add_argument("--baseline", default=None, help="Optional run name to compare against.")
    parser.add_argument("--output", type=Path, required=True, help="Output JSON comparison path.")
    parser.add_argument("--markdown-output", type=Path, default=None, help="Optional Markdown summary path.")
    args = parser.parse_args()

    reports = [(name, _load_report(path)) for name, path in args.run]
    comparison = build_comparison(reports, baseline_name=args.baseline)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(comparison, indent=2) + "\n", encoding="utf-8")
    if args.markdown_output:
        args.markdown_output.parent.mkdir(parents=True, exist_ok=True)
        args.markdown_output.write_text(render_markdown(comparison), encoding="utf-8")
    print(f"Compared {comparison['run_count']} benchmark run(s).")
    print(f"JSON report written to {args.output}")
    if args.markdown_output:
        print(f"Markdown report written to {args.markdown_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
