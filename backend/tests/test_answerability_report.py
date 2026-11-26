import unittest

from evaluation.build_answerability_report import build_comparison, render_markdown


def make_report(action_accuracy, false_answer_rate, scenario_accuracy, claim_support=None):
    metrics = {
        "action_accuracy": action_accuracy,
        "false_answer_rate_on_non_answer_cases": false_answer_rate,
        "answer_coverage": 0.6,
    }
    if claim_support is not None:
        metrics["claim_support_rate"] = claim_support
    return {
        "case_count": 10,
        "metrics": metrics,
        "by_scenario": {
            "answerable": {
                "cases": 5,
                "action_accuracy": scenario_accuracy,
                "false_answer_rate": None,
            }
        },
        "counts": {"action_correct": int(action_accuracy * 10)},
    }


class AnswerabilityReportTests(unittest.TestCase):
    def test_comparison_computes_candidate_minus_baseline_deltas(self):
        result = build_comparison(
            [
                ("baseline", make_report(0.7, 0.4, 0.8, 0.6)),
                ("candidate", make_report(0.9, 0.2, 1.0, 0.8)),
            ],
            baseline_name="baseline",
        )
        comparison = result["comparisons"]["candidate"]
        self.assertAlmostEqual(comparison["metric_deltas"]["action_accuracy"], 0.2)
        self.assertAlmostEqual(
            comparison["metric_deltas"]["false_answer_rate_on_non_answer_cases"], -0.2
        )
        self.assertAlmostEqual(
            comparison["scenario_deltas"]["answerable"]["action_accuracy_delta"], 0.2
        )

    def test_missing_metrics_remain_missing_not_zero(self):
        result = build_comparison(
            [
                ("baseline", make_report(0.7, 0.4, 0.8)),
                ("candidate", make_report(0.8, 0.3, 0.9)),
            ],
            baseline_name="baseline",
        )
        self.assertNotIn("claim_support_rate", result["runs"]["candidate"]["metrics"])
        self.assertNotIn("claim_support_rate", result["comparisons"]["candidate"]["metric_deltas"])

    def test_duplicate_run_names_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "unique"):
            build_comparison(
                [
                    ("same", make_report(0.7, 0.4, 0.8)),
                    ("same", make_report(0.8, 0.3, 0.9)),
                ]
            )

    def test_unknown_baseline_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Baseline"):
            build_comparison([("candidate", make_report(0.8, 0.3, 0.9))], "missing")

    def test_markdown_summary_contains_run_and_delta_tables(self):
        result = build_comparison(
            [
                ("baseline", make_report(0.7, 0.4, 0.8)),
                ("candidate", make_report(0.8, 0.3, 0.9)),
            ],
            baseline_name="baseline",
        )
        markdown = render_markdown(result)
        self.assertIn("Run summary", markdown)
        self.assertIn("candidate vs baseline", markdown)
        self.assertIn("Per-scenario action-accuracy deltas", markdown)


if __name__ == "__main__":
    unittest.main()
