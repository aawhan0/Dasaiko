# Answerability benchmark dataset

This file defines the annotation contract for `datasets/answerability_cases.json`.

## Purpose

Evaluate whether a website-grounded agent has enough current, relevant evidence to answer a question, and whether it takes the correct action when evidence is incomplete, absent, conflicting, stale, or ambiguous.

The dataset is deliberately self-contained. Each case includes source excerpts and provenance metadata so that labels can be reviewed without a live database. URLs use the reserved `example.test` domain and are illustrative, not live sources.

## Labels

### scenario_type

One of:
- `answerable`: all required facts are explicitly supported.
- `partially_answerable`: some requested facts are supported and at least one is missing.
- `unanswerable`: the provided content does not support the requested fact.
- `hard_negative`: answer is supported, but a plausible nearby distractor could be mistaken for it.
- `conflicting`: supplied sources disagree on a material fact.
- `stale_evidence`: only expired or archived evidence supports a historical value; current status is unknown.
- `ambiguous`: question lacks enough specificity to identify the requested service, item, location, or intent.

### ground_truth.answerability

One of `answerable`, `partially_answerable`, `unanswerable`, `conflicting`, `stale`, `ambiguous`.

This is separate from `scenario_type`: a hard-negative case is still answerable when the correct source is present.

### ground_truth.expected_action

One of:
- `answer`: answer using supported facts only.
- `partial_answer`: provide supported parts and explicitly identify what is not stated.
- `abstain`: do not invent the missing fact; explain that the site does not provide it.
- `escalate`: do not choose between conflicting or expired evidence; recommend human confirmation.
- `clarify`: ask one focused question to resolve ambiguity.

## Record shape

Each record contains:
- `id`: stable unique case identifier.
- `scenario_type`, `difficulty`, `question`.
- `context.business`: fictional business identity.
- `context.sources[]`: source ID, title, illustrative URL, verbatim excerpt, optional freshness metadata.
- `ground_truth.answerability`, `expected_action`, `expected_answer`.
- `required_facts[]`: facts that must be supported for a complete answer.
- `supporting_evidence[]`: source ID and exact supporting quote.
- `distracting_evidence[]`: explanation of nearby but non-supporting content.
- `rationale`: concise annotation explanation.

## Annotation rules

1. Relevance is not sufficiency. A source about a service does not establish its price, duration, availability, or terms unless those facts appear.
2. Do not infer missing values from industry norms, adjacent services, arithmetic guesses, or similarly named products.
3. Match the requested entity, service, plan, location, amount, currency, billing period, and conditions exactly where applicable.
4. Treat temporary promotions and expired/archived pages as historical evidence, not current policy.
5. When current first-party sources conflict on a material fact and no authoritative precedence is provided, escalate rather than selecting the more convenient value.
6. For partial evidence, answer only supported sub-questions and state which requested detail is unavailable.
7. For ambiguity, clarify rather than guessing the referent or user location.
8. Every supporting quote must occur verbatim in its referenced source excerpt.
9. Distractors are not supporting evidence. They are included to test entity and attribute discrimination.
10. This is a small manually authored seed set. It is suitable for pipeline development and qualitative error analysis, not claims of production reliability.

## Current composition

| Scenario | Cases |
|---|---:|
| Answerable | 15 |
| Partially answerable | 10 |
| Unanswerable | 10 |
| Hard negative | 10 |
| Conflicting | 5 |
| Stale evidence | 5 |
| Ambiguous | 5 |
| **Total** | **60** |

## Known limitations

- Fictional single-business domain; not representative of all verticals.
- Source excerpts are synthetic and do not model website crawling, DOM extraction, or retrieval failures yet.
- The seed set is not independently double-annotated.
- No model predictions or performance scores are included. Those belong in the evaluator output after the dataset is wired to a tested system.
