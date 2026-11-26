# Production RAG answerability evaluation

This evaluation runs against the user's actual uploaded research corpus and Dasaiko's existing hybrid retrieval, reranking, prompt and Groq generation components. It is separate from the fictional Harbor & Pine seed benchmark.

## 1. Export the corpus

From the `backend/` directory, with the same `.env` and database used by Dasaiko:

```bash
python -m evaluation.export_rag_answerability_corpus --user-id YOUR_USER_ID --output artifacts/rag_corpus.json
```

The export contains document/chunk text and provenance. Treat it as private research material; do not commit it or share it without checking document permissions.

## 2. Build an annotated benchmark

Create a JSON array of cases. Each case needs a stable ID, user ID, query, optional document ID (to evaluate within a selected paper), and independently annotated ground truth:

```json
[
  {
    "id": "paper_001",
    "user_id": 1,
    "document_id": 12,
    "query": "What objective does the paper optimize?",
    "scenario_type": "answerable",
    "ground_truth": {
      "answerability": "answerable",
      "expected_action": "answer",
      "required_facts": ["The exact objective stated in the paper."],
      "supporting_evidence": [
        {"source_id": "chunk:345", "quote": "Verbatim supporting text from the exported chunk."}
      ]
    }
  }
]
```

Use only evidence actually present in the exported corpus. Include answerable questions, questions with only partial support, unanswerable questions, hard negatives, conflicting evidence and ambiguous questions. For each case, an annotator must determine the expected action and source IDs. Do not infer labels from model outputs. For stronger reliability, double-annotate cases and adjudicate disagreements.

## 3. Run the production retrieval and generation path

```bash
python -m evaluation.run_rag_answerability \
  --dataset evaluation/datasets/your_annotated_cases.json \
  --predictions artifacts/rag_predictions.json
```

The runner calls the same `SearchService.search`, evidence score filtering, `PromptService.build_prompt`, configured Groq model and citation validation used by chat. It does not create conversations or persist messages. It deliberately uses an empty conversation history so each case is independent.

The runner labels an output as `abstain` only when the production prompt's exact insufficient-information sentence appears; otherwise it records `answer`. This simple action classifier does not detect partial answers, clarification or escalation. Review and annotate those behaviors manually before relying on action metrics. Confidence, required-fact coverage and claim assessments are not fabricated.

## 4. Evaluate

The current evaluator expects one prediction per case and can consume the runner output after adding independent annotations for required-fact coverage and claim assessments where appropriate. Map runner outputs into the existing prediction contract; do not treat retrieved chunks as proof that answer claims are supported.

## Limitations

- Results depend on the local database contents, user ID, embedding/reranker configuration, Groq model and model availability.
- The runner exercises retrieval/reranking and generation, but not chat history rewriting, conversation selection flows, streaming transport or API authentication.
- It uses the real production retrieval service, not a mock. Retrieval can therefore be slow and may invoke configured model providers.
- The generated answer is not automatically judged for semantic correctness. Human/independent semantic annotation remains required.
- Keep corpus exports, predictions and reports out of version control if they contain private uploaded-document content.
