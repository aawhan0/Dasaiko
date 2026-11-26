import unittest

from evaluation.validate_answerability_dataset import validate_cases


class AnswerabilityDatasetTests(unittest.TestCase):
    def test_seed_dataset_passes_validation(self):
        import json
        from pathlib import Path

        dataset_path = (
            Path(__file__).resolve().parents[1]
            / "evaluation"
            / "datasets"
            / "answerability_cases.json"
        )
        with dataset_path.open("r", encoding="utf-8") as handle:
            cases = json.load(handle)
        self.assertEqual(validate_cases(cases), [])

    def test_duplicate_ids_are_rejected(self):
        cases = [{
            "id": "same",
            "scenario_type": "answerable",
            "difficulty": "easy",
            "question": "Q?",
            "context": {"sources": [{"source_id": "s1", "content": "The answer is yes."}]},
            "ground_truth": {
                "answerability": "answerable",
                "expected_action": "answer",
                "expected_answer": "Yes",
                "required_facts": ["Yes"],
                "supporting_evidence": [{"source_id": "s1", "quote": "The answer is yes."}],
            },
        }, {
            "id": "same",
            "scenario_type": "answerable",
            "difficulty": "easy",
            "question": "Q?",
            "context": {"sources": [{"source_id": "s1", "content": "The answer is yes."}]},
            "ground_truth": {
                "answerability": "answerable",
                "expected_action": "answer",
                "expected_answer": "Yes",
                "required_facts": ["Yes"],
                "supporting_evidence": [{"source_id": "s1", "quote": "The answer is yes."}],
            },
        }]
        errors = validate_cases(cases)
        self.assertTrue(any("unique" in error for error in errors))

    def test_duplicate_source_ids_within_case_are_rejected(self):
        cases = [{
            "id": "duplicate_sources",
            "scenario_type": "answerable",
            "difficulty": "easy",
            "question": "Q?",
            "context": {
                "sources": [
                    {"source_id": "s1", "content": "The answer is yes."},
                    {"source_id": "s1", "content": "A different excerpt."},
                ]
            },
            "ground_truth": {
                "answerability": "answerable",
                "expected_action": "answer",
                "expected_answer": "Yes",
                "required_facts": ["Yes"],
                "supporting_evidence": [{"source_id": "s1", "quote": "The answer is yes."}],
            },
        }]
        errors = validate_cases(cases)
        self.assertTrue(any("source_id values must be unique" in error for error in errors))

    def test_non_verbatim_evidence_is_rejected(self):
        cases = [{
            "id": "bad_quote",
            "scenario_type": "answerable",
            "difficulty": "easy",
            "question": "Q?",
            "context": {"sources": [{"source_id": "s1", "content": "The answer is yes."}]},
            "ground_truth": {
                "answerability": "answerable",
                "expected_action": "answer",
                "expected_answer": "Yes",
                "required_facts": ["Yes"],
                "supporting_evidence": [{"source_id": "s1", "quote": "The answer is no."}],
            },
        }]
        errors = validate_cases(cases)
        self.assertTrue(any("verbatim" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
