# Answerability evaluation

The answerability seed set is evaluated separately from the existing retrieval ranking benchmark.

## Run

From the `backend` directory, provide one prediction record for every dataset case:

```bash
python -m evaluation.evaluate_answerability --predictions evaluation/datasets/answerability_predictions.json

# Optional: report the highest-coverage observed threshold meeting a 5% empirical answer-risk cap
python -m evaluation.evaluate_answerability --predictions evaluation/datasets/answerability_predictions.json --max-answer-risk 0.05
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
    "covered_required_fact_indices": [0],
    "claim_assessments": [
      {
        "text": "The cancellation window is 30 days.",
        "support_status": "supported",
        "cited_source_ids": ["ans_01_s1"],
        "supporting_source_ids": ["ans_01_s1"]
      }
    ]
  }
]
```

- `predicted_action`: one of `answer`, `partial_answer`, `abstain`, `escalate`, `clarify`.
- `predicted_answerability`: optional classification label: `answerable`, `partially_answerable`, `unanswerable`, `conflicting`, `stale`, or `ambiguous`.
- `confidence`: optional number from 0 to 1 representing confidence in the predicted action being correct. It is not a reranker score.
- `cited_source_ids`: source IDs actually cited by the generated answer or response.
- `covered_required_fact_indices`: zero-based indices of required facts that an independent evaluator has judged as supported in the answer. This is an annotation input, not an automatic text-matching heuristic. For cases without required facts, use an empty list.
- `claim_assessments`: optional list of atomic factual claims extracted from the generated response and independently assessed against that case's source excerpts. Each item has:
  - `text`: the claim as expressed in the response.
  - `support_status`: `supported`, `unsupported`, `contradicted`, or `insufficient_evidence`.
  - `cited_source_ids`: source IDs cited for this specific claim in the response.
  - `supporting_source_ids`: source IDs independently judged to support the complete claim. This must be empty unless the status is `supported`.
  Assess the full claim, including qualifiers, quantities, dates and conditions. Do not mark a claim supported merely because a source is topically related.

## Metrics and definitions

| Metric | Definition |
|---|---|
| Action accuracy | Exact expected-action matches / all cases. |
| Answerability accuracy | Exact answerability-label matches / cases with a supplied label. |
| Label coverage | Cases with a predicted answerability label / all cases. |
| False answer rate on non-answer cases | Non-answer cases predicted as `answer` or `partial_answer` / all cases whose expected action is `abstain`, `escalate`, or `clarify`. |
| Correct non-answer action rate | Exact expected-action matches among those same non-answer cases. |
| Answer coverage | Cases predicted as `answer` or `partial_answer` / all cases. |
| Selective action accuracy | Exact expected-action matches among answer attempts / all answer attempts. Read alongside answer coverage to expose systems that answer only easy cases. |
| Required-fact coverage | Covered required facts / required facts evaluated on answer attempts. |
| Evidence-source precision / recall / F1 | Set overlap between cited source IDs and annotated supporting source IDs, on cases with supporting evidence. |
| Brier score | Mean squared error between action confidence and binary exact-action correctness. Lower is better. |
| Expected calibration error | Weighted absolute gap between mean confidence and action accuracy in ten equal-width confidence bins. Lower is better. |
| Answer risk–coverage curve | For each observed confidence threshold, retain answer/partial-answer attempts at or above it. Coverage = retained attempts / all dataset cases; risk = incorrect expected actions / retained attempts. |
| Area under risk–coverage curve (AURC) | Trapezoidal area under the empirical risk-versus-coverage curve, starting at zero coverage. Lower is better for comparable evaluation sets. |
| Suggested threshold | Optional highest-coverage observed confidence threshold whose empirical answer risk is at or below `--max-answer-risk`. No threshold is suggested if none meets the cap. |
| Claim support rate | Independently assessed supported claims / all assessed claims. |
| Unsupported / contradicted / insufficient-evidence claim rates | Count in each respective status / all assessed claims. These are separate failure categories. |
| Claim evidence attribution precision / recall / F1 | Per-claim overlap between cited source IDs and independently annotated supporting source IDs. |

## Interpretation and limits

- A low false-answer rate is desirable, but it can be achieved by refusing everything. Always read it alongside answer coverage and action accuracy.
- Required-fact coverage depends on an independent semantic assessment of answer text. The evaluator deliberately does not use brittle substring matching as a proxy for factual support.
- Evidence-source overlap measures provenance at source level. A citation on a case with no annotated supporting source is counted as a false positive. It does not prove that each cited passage entails each answer claim.
- Claim-level metrics are calculated only when `claim_assessments` are supplied. They depend on independent claim extraction and semantic annotation; this evaluator does not extract claims or determine entailment automatically.
- Claim evidence attribution is measured per claim. A source can be relevant to the topic but still fail to support the complete claim; annotators should account for qualifiers, scope and contradictions.
- Confidence calibration concerns confidence in the selected action, not probability that every answer claim is true.
- Risk–coverage uses only answer/partial-answer attempts with supplied confidence. Missing-confidence attempts are excluded from the curve and its AURC, but remain in aggregate metrics. Coverage is measured against the full dataset size.
- `--max-answer-risk` is an optional empirical target, not a default policy. The suggested threshold is selected on the supplied sample and can overfit; choose it on a development split and verify it once on a separate holdout before considering deployment.
- A low-risk threshold may sharply reduce answer coverage. Review the full curve rather than optimizing risk alone.
- No prediction file or performance score is shipped by default. Run the target agent and obtain independent fact-coverage annotations before reporting quality metrics.
- This synthetic 60-case seed set is a development benchmark, not a production reliability guarantee.
