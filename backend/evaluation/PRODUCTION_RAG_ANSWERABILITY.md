# Production RAG answerability evaluation

This workflow evaluates Dasaiko's research-paper RAG against an explicitly annotated corpus. It is separate from the fictional Harbor & Pine seed benchmark.

## 1. Export the corpus

From `backend/`, using the same environment and database as Dasaiko:

```bash
python -m evaluation.export_rag_answerability_corpus --user-id YOUR_USER_ID --output artifacts/rag_corpus.json
```

The export contains uploaded document text and provenance. Treat it as private research material; do not commit or share it without checking document permissions.

## 2. Create an annotated dataset

Create a JSON array. The schema is the same schema enforced by `validate_answerability_dataset.py`. In particular, each case needs `scenario_type`, `difficulty`, `question`, `context.sources`, and `ground_truth`. The `context.sources` list must contain the source excerpts used by the annotator to establish the gold label. Use source IDs from the corpus export.

```json
[
  {
    "id": "paper_001",
    "scenario_type": "answerable",
    "difficulty": "medium",
    "user_id": 1,
    "document_id": 12,
    "question": "What objective does the paper optimize?",
    "context": {
      "sources": [
        {
          "source_id": "chunk:345",
          "content": "Verbatim text copied from the exported chunk."
        }
      ]
    },
    "ground_truth": {
      "answerability": "answerable",
      "expected_action": "answer",
      "required_facts": ["The exact objective stated in the paper."],
      "supporting_evidence": [
        {
          "source_id": "chunk:345",
          "quote": "Verbatim text copied from the exported chunk."
        }
      ]
    }
  }
]
```

Use the exact scenario/action mapping enforced by the validator. For every case, annotate labels and supporting quotes from the corpus, not from model output. Include answerable, partially answerable, unanswerable, hard-negative, conflicting, stale-evidence and ambiguous cases as appropriate. The validator's distribution check is disabled by the runner, so a small development set is allowed. Double-annotate and adjudicate disagreements when feasible.

## 3. Run retrieval and generation

```bash
python -m evaluation.run_rag_answerability \
  --dataset evaluation/datasets/your_annotated_cases.json \
  --predictions artifacts/rag_predictions.json \
  --evaluation-dataset artifacts/rag_evaluation_dataset.json
```

The runner calls production `SearchService.search`, production evidence filtering (including the selected-paper summary-query safeguard), `PromptService.build_prompt`, the configured Groq model and citation validation. It does not create conversations or persist messages. It uses empty conversation history, so this is single-turn evaluation only.

The runner writes two files:
- `rag_predictions.json`: generated answers, predicted action heuristic, cited source IDs and retrieved evidence.
- `rag_evaluation_dataset.json`: original annotated cases plus runtime-retrieved source excerpts. This lets the evaluator validate citations against the actual retrieved source registry.

Runtime-retrieved sources are added only to `context.sources`; they are NOT added to `ground_truth.supporting_evidence`. Retrieval is not proof that an answer claim is supported.

The runner records two distinct action signals:
- `answer_generation_action`: an action explicitly present in the generated answer, if it follows the supported format. Otherwise it is `unclassified`.
- `predicted_action`: a separate model call classifies the question, retrieved evidence and generated answer as `answer`, `partial_answer`, `abstain`, `clarify` or `escalate`.

The separate classifier is an additional model call, not evidence that the answer-generation call itself followed the action format. Treat classifier output as a model prediction, not an independent semantic judgment. Review it against annotated ground truth.

## 4. Evaluate

Use the augmented dataset with the existing evaluator:

```bash
python -m evaluation.evaluate_answerability \
  --dataset artifacts/rag_evaluation_dataset.json \
  --predictions artifacts/rag_predictions.json
```

Required-fact coverage and claim assessments remain independent annotations. Do not fabricate them from retrieval results or model self-report. If the evaluator CLI in your checkout uses different arguments, inspect its `--help` output; do not assume the command above is valid without checking.

## Limitations

- Results depend on the local database, user ID, embeddings, reranker configuration, Groq model and provider availability.
- The runner exercises retrieval/reranking and generation, but not chat history rewriting, conversation selection, streaming transport or API authentication.
- The runner uses the real retrieval service and may invoke configured model providers.
- No automatic semantic answer-quality judge is included. Human/independent annotation is required.
- Keep corpus exports, predictions and reports out of version control if they contain private uploaded-document content.
