# Dasaiko

> An AI-powered research workspace for understanding, exploring, and learning from research papers.

Dasaiko is a full-stack research assistant built around one principle: **AI answers should remain grounded in the source material.**

Instead of treating a research paper as plain text, Dasaiko combines document-aware retrieval, hybrid search, reciprocal rank fusion, cross-encoder reranking, persistent research context, streaming responses, and page-level evidence to create a more reliable paper-reading workflow.

---

## Overview

Dasaiko is designed to sit between a researcher and the papers they are trying to understand.

The system allows users to:

- Upload and manage research papers as PDFs
- Ask questions against a selected research paper
- Search using both semantic and lexical retrieval
- Combine Vector Search and BM25 using Reciprocal Rank Fusion (RRF)
- Rerank candidates with a BGE Cross-Encoder
- Handle metadata and summary questions with specialized retrieval strategies
- Explicitly switch retrieval to another uploaded paper
- Receive grounded answers with source citations
- Inspect evidence alongside the original PDF
- Preserve conversations and research context across sessions

The goal is not to replace reading. It is to make research papers easier to **question, navigate, compare, and learn from**.

---

## Architecture

```text
                         React Research Workspace
                                  │
                                  ▼
                              FastAPI
                           REST + SSE APIs
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        PDF Ingestion       Conversations        Chat / RAG
              │                   │                   │
              ▼                   │                   ▼
       Text + Layout             │             Query Analysis
              │                   │                   │
              ▼                   │                   ▼
          Chunking                │          Retrieval Scope
              │                   │                   │
              ▼                   │                   ▼
     Sentence Transformers        │        ┌──────────┴──────────┐
         Embeddings               │        │                     │
              │                   │        ▼                     ▼
              └───────────────────┼──► Vector Search          BM25
                                  │        │                     │
                                  │        └──────────┬──────────┘
                                  │                   ▼
                                  │              RRF Fusion
                                  │                   │
                                  │                   ▼
                                  │          BGE Cross-Encoder
                                  │             Reranking
                                  │                   │
                                  │                   ▼
                                  │         RRF + BGE Score Fusion
                                  │                   │
                                  │                   ▼
                                  │          Evidence Selection
                                  │                   │
                                  │                   ▼
                                  │             LLM / Groq
                                  │                   │
                                  └───────────────────┘
                                                      │
                                                      ▼
                                             Grounded SSE Response
```

---

## Retrieval Pipeline

Dasaiko uses a multi-stage retrieval pipeline rather than relying on vector similarity alone.

```text
User Query
    │
    ├──────────────► Vector Search ──────────────┐
    │                                             │
    └──────────────► BM25 Search ─────────────────┤
                                                  ▼
                                      Reciprocal Rank Fusion
                                               (RRF)
                                                  │
                                                  ▼
                                        Hybrid Candidate Pool
                                                  │
                                                  ▼
                                        BGE Cross-Encoder
                                             Reranking
                                                  │
                                                  ▼
                                      RRF + BGE Score Fusion
                                                  │
                                                  ▼
                                      Duplicate Evidence Filter
                                                  │
                                                  ▼
                                          Top-K Evidence
                                                  │
                                                  ▼
                                           Grounded LLM
```

### Why hybrid retrieval?

Vector retrieval is effective for semantic similarity, while BM25 provides strong lexical matching for exact terminology, technical phrases, names, and keyword-sensitive queries.

RRF combines their rankings without requiring the raw vector and BM25 scores to exist on the same numerical scale.

### Reciprocal Rank Fusion

Dasaiko uses:

```text
RRF(d) = 1 / (k + vector_rank)
       + 1 / (k + bm25_rank)
```

with:

```text
k = 60
```

A candidate ranked highly by both retrieval systems therefore receives a stronger hybrid score.

### BGE Cross-Encoder reranking

The RRF candidate pool is passed to a BGE Cross-Encoder for semantic reranking.

This creates a deliberate separation of responsibilities:

```text
Vector + BM25
     ↓
Broad candidate retrieval
     ↓
RRF
     ↓
Evidence consolidation
     ↓
BGE Cross-Encoder
     ↓
Semantic relevance refinement
```

The reranker can promote semantically useful evidence that was not highly ranked by the initial retrieval systems and demote candidates that were retrieved primarily because of lexical or embedding similarity.

---

## Retrieval Configuration

| Component | Configuration |
|---|---|
| Vector retrieval | Top 50 candidates |
| BM25 retrieval | Top 50 candidates |
| Hybrid fusion | Reciprocal Rank Fusion |
| RRF constant | `k = 60` |
| Reranker | BGE Cross-Encoder |
| RRF fusion weight | `0.50` |
| BGE fusion weight | `0.50` |
| Final evidence | Top 5 chunks by default |
| Duplicate filtering | Sequence, token containment, token-set similarity, document/page similarity |

Final fusion uses normalized component scores:

```text
Final Score = 0.50 × BGE_normalized
            + 0.50 × RRF_normalized
```

---

## Context-Aware Retrieval

A core design problem in research assistants is deciding **where a query should search**.

Dasaiko explicitly controls retrieval scope.

### Selected research paper

Normal questions use the currently selected research paper as the retrieval boundary.

### Explicitly referenced paper

If a user explicitly refers to another uploaded paper, Dasaiko resolves that document and restricts retrieval to it for the current query.

### External or global research

Only explicit requests for other research or external context intentionally expand retrieval beyond the selected paper.

This prevents unrelated uploaded documents from silently becoming evidence for a question about the active research context.

---

## Query-Aware Retrieval

Not every question should be answered using the same retrieval strategy.

### Paper metadata

Questions such as:

- Who are the authors?
- When was this published?
- What is the title?
- Where was it published?

prioritize front-matter chunks rather than relying solely on semantic retrieval.

### Paper summaries

Summary questions prioritize:

- Abstract
- Introduction
- Problem or motivation
- Relevant section neighborhoods
- Conclusion
- Final findings

This produces more coherent evidence for high-level paper understanding.

### Comparative questions

Comparison queries are enriched to favor complementary evidence for each side of the comparison, including mechanisms, objectives, training procedures, strengths, limitations, and outcomes.

---

## Evidence and Citations

Every retrieved evidence object preserves document-level and page-level information, including:

- Document ID
- Document title
- Chunk ID
- Chunk index
- Page number
- Page dimensions
- Bounding boxes
- Retrieval and ranking scores
- Source preview

The final context sent to the LLM is therefore traceable back to the original document.

Dasaiko also validates source references before returning the generated response, helping prevent unsupported or invalid citations from reaching the user.

---

## Retrieval Evaluation

The current retrieval pipeline has been manually evaluated using representative research queries covering conceptual understanding, paper-specific retrieval, and comparative reasoning.

### Evaluation results

| Query | Hybrid Candidates | BGE Candidates | Final Evidence | Result |
|---|---:|---:|---:|---|
| Main idea behind GloVe | 88 | 88 | 5 | Pass |
| GloVe evaluation / broader query | 88 | 88 | 5 | Pass |
| CBOW vs Skip-gram | 72 | 72 | 5 | Pass |

### Observed results

- **3/3 end-to-end queries passed** — 100% observed pass rate on the current manual test set
- **3/3 queries retrieved the intended research document**
- **5 final evidence chunks returned per query**
- **Citation validation passed on tested outputs**
- Vector Search and BM25 produced complementary candidate sets
- RRF combined lexical and semantic ranking signals before reranking
- BGE materially changed candidate ordering based on semantic relevance
- Duplicate evidence filtering reduced redundant context before LLM generation

### RRF and reranking observations

The evaluation demonstrates that the ranking stages perform different roles rather than simply duplicating one another.

For the CBOW vs Skip-gram query, for example:

```text
Chunk 593
RRF rank: 14
BGE rank:  1
```

BGE promoted the candidate from rank 14 to rank 1 based on semantic relevance.

For the GloVe evaluation, another candidate moved from:

```text
Chunk 5
RRF rank: 38
BGE rank:  4
```

This demonstrates that the Cross-Encoder is actively refining the initial hybrid ranking.

The current evaluation is a small manually curated engineering benchmark, not a statistically significant retrieval benchmark. Formal Recall@K, MRR, nDCG, citation precision, and faithfulness measurements require a larger labeled evaluation set and are planned as the evaluation suite expands.

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- PDF rendering and evidence viewer
- Server-Sent Events for streamed responses

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- pgvector

### AI and Retrieval

- Sentence Transformers
- BGE Cross-Encoder
- BM25
- Vector similarity search
- Groq LLM API

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL + pgvector

---

## Project Structure

```text
Dasaiko/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── rag/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── bm25_service.py
│   │   │   ├── vector_search_service.py
│   │   │   ├── reranker_service.py
│   │   │   ├── search_service.py
│   │   │   └── chat_service.py
│   │   └── main.py
│   ├── evaluation/
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── ...
│
├── docs/
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker / Docker Compose
- Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/aawhan0/Dasaiko.git
cd Dasaiko
```

### 2. Start PostgreSQL and pgvector

```bash
docker compose up -d
```

The repository uses PostgreSQL with pgvector for vector storage and similarity search.

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Configure the required environment variables, including the LLM API key and database connection.

### 4. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 5. Start FastAPI

```bash
uvicorn app.main:app --reload
```

### 6. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite development server in your browser.

> Local setup and production configuration may evolve as deployment is finalized.

---

## Evaluation Tooling

The repository contains dedicated retrieval evaluation tooling under:

```text
backend/evaluation/
```

The evaluation flow is designed to reproduce the production retrieval path:

```text
Query
  ↓
Vector Search + BM25
  ↓
RRF
  ↓
BGE Cross-Encoder
  ↓
Score Fusion
  ↓
Evidence Selection
  ↓
LLM Context
```

This keeps retrieval behavior observable and makes future improvements measurable instead of treating RAG quality as a black box.

---

## Design Principles

### Ground answers in sources

The system should make it easy to inspect the evidence behind an answer.

### Preserve research context

A research conversation should understand which paper the user is currently studying.

### Improve retrieval before prompting

Retrieval quality is treated as a core engineering problem rather than something that can be solved entirely with increasingly complex LLM prompts.

### Separate retrieval responsibilities

Vector Search, BM25, RRF, and Cross-Encoder reranking each serve a distinct purpose in the pipeline.

### Keep the researcher connected to the paper

The objective is not to replace the paper with an AI-generated summary. The objective is to make the original research easier to read, question, navigate, compare, and understand.

---

## Roadmap

### Research Workspace

- [x] PDF upload and document management
- [x] Persistent research context
- [x] Research-focused chat
- [x] Streaming responses
- [x] Evidence inspection
- [x] PDF evidence navigation

### Retrieval

- [x] Document chunking
- [x] Embedding generation
- [x] pgvector semantic retrieval
- [x] BM25 lexical retrieval
- [x] Reciprocal Rank Fusion
- [x] BGE Cross-Encoder reranking
- [x] RRF + BGE score fusion
- [x] Query-aware retrieval
- [x] Document-scoped retrieval
- [x] Duplicate evidence filtering

### Research Learning

- [ ] Research path generation
- [ ] Paper prerequisite mapping
- [ ] Related-paper discovery
- [ ] Visual research maps
- [ ] Learning progression from foundational to advanced papers

### Production

- [ ] Expanded automated evaluation suite
- [ ] Formal retrieval metrics such as Recall@K, MRR, and nDCG
- [ ] Production deployment
- [ ] Automated CI pipeline
- [ ] Production observability

---

## Engineering Highlights

- Hybrid semantic + lexical retrieval
- Reciprocal Rank Fusion for rank-based candidate consolidation
- BGE Cross-Encoder semantic reranking
- RRF + BGE score fusion
- Document-scoped retrieval to prevent cross-paper contamination
- Query-aware retrieval strategies for metadata, summaries, and comparisons
- Persistent research context across conversations
- Page-aware evidence objects for source navigation
- Citation-aware LLM context construction
- Streaming responses through Server-Sent Events
- Dedicated retrieval evaluation tooling

---

## Project Status

**Active development — portfolio-ready MVP**

The core research workspace, document management, context-aware retrieval, hybrid RAG pipeline, evidence system, and conversational workflow are implemented.

Current development is focused on completing authentication hardening, expanding automated evaluation, production deployment, and the longer-term research-learning layer.

---

## Author

**Aawhan Vyas**  
Computer Science Engineering

[GitHub](https://github.com/aawhan0)

---

## Why Dasaiko?

Most basic chat-with-PDF systems follow:

```text
PDF → chunks → embeddings → LLM
```

Dasaiko is being developed as a broader research-learning system:

```text
Research Paper
      ↓
Understand the document
      ↓
Retrieve relevant evidence
      ↓
Combine semantic + lexical signals
      ↓
Rerank evidence intelligently
      ↓
Ask grounded questions
      ↓
Inspect the source
      ↓
Compare research
      ↓
Build a research path
```

The long-term goal is to turn research-paper reading from a fragmented workflow into a structured learning experience.
