# Answerability evaluation

The answerability seed set is evaluated separately from the existing retrieval ranking benchmark.

## Run

From the `backend` directory, provide one prediction record for every dataset case:

```bash
python -m evaluation.evaluate_answerability --predictions evaluation/datasets/answerability_predictions.json
```

The evaluator writes `evaluation/results/answerability_evaluation.json`. The prediction file is intentionally not populated with fabricated model outputs.

## Prediction contract

Predictions are a JSON array. Every case must appear exactly once:

```json
[
  {
    "case_id": "ans_01",
    "predicted_action": "answer",
    "predicted_answerability": "answerable",
    "confidence": 0.91,
    "cited_source_ids": ["ans_01_s1"],
    "covered_required_fact_indices": [0]
  }
]
```

- `predicted_action`: one of `answer`, `partial_answer`, `abstain`, `escalate`, `clarify`.
- `predicted_answerability`: optional classification label: `answerable`, `partially_answerable`, `unanswerable`, `conflicting`, `stale`, or `ambiguous`.
- `confidence`: optional number from 0 to 1 representing confidence in the predicted action being correct. It is not a reranker score.
- `cited_source_ids`: source IDs actually cited by the generated answer or response.
- `covered_required_fact_indices`: zero-based indices of required facts that an independent evaluator has judged as supported in the answer. This is an annotation input, not an automatic text-matching heuristic. For cases without required facts, use an empty list.

## Metrics and definitions

| Metric | Definition |
|---|---|
| Action accuracy | Exact expected-action matches / all cases. |
| Answerability accuracy | Exact answerability-label matches / cases with a supplied label. |
| Label coverage | Cases with a predicted answerability label / all cases. |
| False answer rate on non-answer cases | Non-answer cases predicted as `answer` or `partial_answer` / all cases whose expected action is `abstain`, `escalate`, or `clarify`. |
| Correct non-answer action rate | Exact expected-action matches among those same non-answer cases. |
| Answer coverage | Cases predicted as `answer` or `partial_answer` / all cases. |
| Required-fact coverage | Covered required facts / required facts evaluated on answer attempts. |
| Evidence-source precision / recall / F1 | Set overlap between cited source IDs and annotated supporting source IDs, on cases with supporting evidence. |
| Brier score | Mean squared error between action confidence and binary exact-action correctness. Lower is better. |
| Expected calibration error | Weighted absolute gap between mean confidence and action accuracy in ten equal-width confidence bins. Lower is better. |

## Interpretation and limits

- A low false-answer rate is desirable, but it can be achieved by refusing everything. Always read it alongside answer coverage and action accuracy.
- Required-fact coverage depends on an independent semantic assessment of answer text. The evaluator deliberately does not use brittle substring matching as a proxy for factual support.
- Evidence-source overlap measures provenance at source level. It does not prove that each cited passage entails each answer claim.
- Confidence calibration concerns confidence in the selected action, not probability that every answer claim is true.
- No prediction file or performance score is shipped by default. Run the target agent and obtain independent fact-coverage annotations before reporting quality metrics.
- This synthetic 60-case seed set is a development benchmark, not a production reliability guarantee.
