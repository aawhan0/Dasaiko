import unittest

from evaluation.evaluate_answerability import evaluate_predictions


def make_case(case_id, scenario, answerability, action, required_facts=None, sources=None, evidence=None):
    return {
        "id": case_id,
        "scenario_type": scenario,
        "difficulty": "easy",
        "question": "What is the policy?",
        "context": {
            "business": {"name": "Test Business", "website": "https://example.test"},
            "sources": sources or [{"source_id": f"{case_id}_s1", "title": "Policy", "url": "https://example.test/policy", "content": "The policy is 30 days."}],
        },
        "ground_truth": {
            "answerability": answerability,
            "expected_action": action,
            "expected_answer": "30 days." if action in {"answer", "partial_answer"} else None,
            "required_facts": required_facts or [],
            "supporting_evidence": evidence or [],
            "distracting_evidence": [],
            "rationale": "Test fixture.",
        },
    }


class AnswerabilityEvaluationTests(unittest.TestCase):
    def setUp(self):
        self.cases = [
            make_case("a1", "answerable", "answerable", "answer", ["30 days"], evidence=[{"source_id": "a1_s1", "quote": "The policy is 30 days."}]),
            make_case("u1", "unanswerable", "unanswerable", "abstain"),
            make_case("c1", "conflicting", "conflicting", "escalate", sources=[
                {"source_id": "c1_s1", "title": "Old", "url": "https://example.test/old", "content": "30 days"},
                {"source_id": "c1_s2", "title": "New", "url": "https://example.test/new", "content": "60 days"},
            ]),
        ]

    def test_metrics_for_correct_and_unsafe_actions(self):
        predictions = [
            {"case_id": "a1", "predicted_action": "answer", "predicted_answerability": "answerable", "confidence": 0.9, "cited_source_ids": ["a1_s1"], "covered_required_fact_indices": [0]},
            {"case_id": "u1", "predicted_action": "answer", "predicted_answerability": "unanswerable", "confidence": 0.8},
            {"case_id": "c1", "predicted_action": "escalate", "predicted_answerability": "conflicting", "confidence": 0.95},
        ]
        report = evaluate_predictions(self.cases, predictions)
        metrics = report["metrics"]
        self.assertAlmostEqual(metrics["action_accuracy"], 2 / 3)
        self.assertEqual(metrics["false_answer_rate_on_non_answer_cases"], 0.5)
        self.assertEqual(metrics["correct_non_answer_action_rate"], 0.5)
        self.assertAlmostEqual(metrics["required_fact_coverage"], 1.0)
        self.assertAlmostEqual(metrics["evidence_source_precision"], 1.0)
        self.assertAlmostEqual(metrics["evidence_source_recall"], 1.0)

    def test_missing_and_duplicate_predictions_are_rejected(self):
        predictions = [
            {"case_id": "a1", "predicted_action": "answer"},
            {"case_id": "a1", "predicted_action": "answer"},
        ]
        with self.assertRaisesRegex(ValueError, "duplicate|Missing"):
            evaluate_predictions(self.cases, predictions)

    def test_citations_on_cases_without_supporting_evidence_are_false_positives(self):
        predictions = [
            {"case_id": "a1", "predicted_action": "answer", "cited_source_ids": ["a1_s1"], "covered_required_fact_indices": [0]},
            {"case_id": "u1", "predicted_action": "abstain", "cited_source_ids": ["u1_s1"]},
            {"case_id": "c1", "predicted_action": "escalate"},
        ]
        report = evaluate_predictions(self.cases, predictions)
        self.assertEqual(report["counts"]["evidence_false_positives"], 1)
        self.assertAlmostEqual(report["metrics"]["evidence_source_precision"], 0.5)

    def test_answer_risk_coverage_and_empirical_threshold(self):
        predictions = [
            {"case_id": "a1", "predicted_action": "answer", "confidence": 0.9},
            {"case_id": "u1", "predicted_action": "answer", "confidence": 0.8},
            {"case_id": "c1", "predicted_action": "escalate", "confidence": 0.95},
        ]
        report = evaluate_predictions(self.cases, predictions, max_answer_risk=0.1)
        curve = report["metrics"]["answer_risk_coverage"]
        self.assertEqual(curve["sample_count"], 2)
        self.assertEqual(curve["suggested_threshold"], 0.9)
        self.assertAlmostEqual(curve["suggested_coverage"], 1 / 3)
        self.assertEqual(curve["suggested_empirical_risk"], 0.0)
        self.assertAlmostEqual(curve["area_under_risk_coverage_curve"], 1 / 12)

    def test_risk_coverage_is_unavailable_without_confident_answer_attempts(self):
        predictions = [
            {"case_id": "a1", "predicted_action": "answer"},
            {"case_id": "u1", "predicted_action": "abstain"},
            {"case_id": "c1", "predicted_action": "escalate"},
        ]
        curve = evaluate_predictions(self.cases, predictions)["metrics"]["answer_risk_coverage"]
        self.assertEqual(curve["sample_count"], 0)
        self.assertIsNone(curve["area_under_risk_coverage_curve"])

    def test_invalid_risk_target_is_rejected(self):
        predictions = [
            {"case_id": "a1", "predicted_action": "answer", "confidence": 0.9},
            {"case_id": "u1", "predicted_action": "abstain"},
            {"case_id": "c1", "predicted_action": "escalate"},
        ]
        with self.assertRaisesRegex(ValueError, "max_answer_risk"):
            evaluate_predictions(self.cases, predictions, max_answer_risk=1.1)

    def test_claim_level_support_and_citation_attribution_metrics(self):
        predictions = [
            {
                "case_id": "a1",
                "predicted_action": "answer",
                "claim_assessments": [
                    {
                        "text": "The policy is 30 days.",
                        "support_status": "supported",
                        "cited_source_ids": ["a1_s1"],
                        "supporting_source_ids": ["a1_s1"],
                    },
                    {
                        "text": "The policy applies worldwide.",
                        "support_status": "insufficient_evidence",
                        "cited_source_ids": [],
                        "supporting_source_ids": [],
                    },
                ],
            },
            {
                "case_id": "u1",
                "predicted_action": "abstain",
                "claim_assessments": [
                    {
                        "text": "The service is available on Sundays.",
                        "support_status": "unsupported",
                        "cited_source_ids": ["u1_s1"],
                        "supporting_source_ids": [],
                    }
                ],
            },
            {
                "case_id": "c1",
                "predicted_action": "escalate",
                "claim_assessments": [
                    {
                        "text": "The policy is 30 days.",
                        "support_status": "contradicted",
                        "cited_source_ids": ["c1_s1"],
                        "supporting_source_ids": [],
                    }
                ],
            },
        ]
        metrics = evaluate_predictions(self.cases, predictions)["metrics"]
        self.assertEqual(metrics["claim_support_rate"], 0.25)
        self.assertEqual(metrics["unsupported_claim_rate"], 0.25)
        self.assertEqual(metrics["contradicted_claim_rate"], 0.25)
        self.assertEqual(metrics["insufficient_evidence_claim_rate"], 0.25)
        self.assertAlmostEqual(metrics["claim_evidence_attribution_precision"], 0.5)
        self.assertEqual(metrics["claim_evidence_attribution_recall"], 1.0)
        self.assertAlmostEqual(metrics["claim_evidence_attribution_f1"], 2 / 3)

    def test_claim_assessment_rejects_unknown_source_and_invalid_status(self):
        predictions = [
            {
                "case_id": "a1",
                "predicted_action": "answer",
                "claim_assessments": [
                    {
                        "text": "A claim",
                        "support_status": "maybe",
                        "cited_source_ids": ["not-a-source"],
                        "supporting_source_ids": [],
                    }
                ],
            },
            {"case_id": "u1", "predicted_action": "abstain"},
            {"case_id": "c1", "predicted_action": "escalate"},
        ]
        with self.assertRaisesRegex(ValueError, "support_status|unknown source"):
            evaluate_predictions(self.cases, predictions)

    def test_invalid_confidence_is_rejected(self):
        predictions = [
            {"case_id": "a1", "predicted_action": "answer", "confidence": 1.5},
            {"case_id": "u1", "predicted_action": "abstain"},
            {"case_id": "c1", "predicted_action": "escalate"},
        ]
        with self.assertRaisesRegex(ValueError, "confidence"):
            evaluate_predictions(self.cases, predictions)

    def test_calibration_is_omitted_when_no_confidence_is_supplied(self):
        predictions = [
            {"case_id": "a1", "predicted_action": "answer"},
            {"case_id": "u1", "predicted_action": "abstain"},
            {"case_id": "c1", "predicted_action": "escalate"},
        ]
        report = evaluate_predictions(self.cases, predictions)
        self.assertIsNone(report["metrics"]["confidence_calibration"]["brier_score"])


if __name__ == "__main__":
    unittest.main()
