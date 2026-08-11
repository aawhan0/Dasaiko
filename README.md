# Dasaiko

> **An AI-powered research workspace for understanding, exploring, and learning from research papers.**

Dasaiko is a full-stack research assistant designed around a simple idea: **AI answers should remain grounded in the source material**.

Instead of treating a research paper like a plain text document, Dasaiko combines document-aware retrieval, hybrid search, reranking, persistent research context, streaming responses, and page-level evidence so users can ask questions while staying connected to the original paper.

---

## ✨ What Dasaiko Does

- 📄 Upload and work with research papers as PDFs
- 🔎 Search paper content using **semantic + lexical retrieval**
- 🧠 Rerank retrieved evidence with a **CrossEncoder**
- 💬 Ask questions and receive **streaming AI responses**
- 📚 Maintain persistent **research-paper context**
- 🧾 Handle paper metadata and summary questions differently from normal retrieval
- 🔗 Explicitly switch retrieval to another uploaded paper when requested
- 📌 Return page-aware evidence with source previews and bounding-box information
- 🗂️ Persist conversations, messages, documents, and research context
- 🖥️ Inspect retrieved evidence directly alongside the PDF

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      React UI       │
                         │ Research Workspace  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │     REST / SSE      │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
              PDF Ingestion    Conversation     Chat / RAG
                    │          Persistence          │
                    ▼                                ▼
              Text + Layout                  Query Processing
                    │                                │
                    ▼                                ▼
                 Chunking                  ┌──────────────────┐
                    │                      │ Hybrid Retrieval │
                    ▼                      └────────┬─────────┘
          Sentence Transformer                       │
             Embeddings                    ┌─────────┴─────────┐
                    │                      │                   │
                    ▼                      ▼                   ▼
          PostgreSQL + pgvector       Vector Search         BM25
                                           │                   │
                                           └─────────┬─────────┘
                                                     ▼
                                            Candidate Merging
                                                     │
                                                     ▼
                                           CrossEncoder Reranker
                                                     │
                                                     ▼
                                                Evidence
                                                     │
                                                     ▼
                                                  LLM
                                                     │
                                                     ▼
                                           Streaming Response
```

---

## 🔍 Retrieval Pipeline

Dasaiko does not rely on vector similarity alone.

```text
User Query
    │
    ├──► Vector Search
    │
    └──► BM25 Search
             │
             ▼
       Hybrid Candidate Pool
             │
             ▼
       CrossEncoder Reranking
             │
             ▼
       Evidence Selection
             │
             ▼
       Grounded LLM Response
```

Vector search provides semantic similarity, while BM25 provides strong lexical matching for exact terminology, names, technical phrases, and keyword-sensitive queries. The combined candidate pool is then reranked by a CrossEncoder.

---

## 🧠 Context-Aware Retrieval

A major part of Dasaiko is controlling **where retrieval is allowed to search**.

### Selected paper

Normal paper-related questions search the currently selected research paper.

### Explicitly referenced paper

If the user explicitly refers to another uploaded paper, Dasaiko resolves that document and restricts retrieval to it for that query.

### External/global research

Only explicit requests for other research or external context intentionally expand retrieval beyond the selected paper.

This prevents unrelated documents from accidentally becoming evidence for a question about the currently selected paper.

---

## 📑 Query-Aware Retrieval

Dasaiko changes retrieval behavior based on the type of question.

### Paper metadata

Questions such as *Who are the authors?*, *When was this published?*, or *What is the title?* prioritize the front matter of the selected paper instead of relying only on semantic retrieval.

### Paper summaries

Summary questions prioritize the abstract, introduction, motivation/problem, section neighborhoods, and conclusion to provide a more coherent representation of the paper.

---

## 📌 Evidence-Aware Answers

Retrieved evidence contains information such as:

- document ID
- document title
- chunk index
- page number
- page dimensions
- bounding boxes
- relevance score
- source preview

This lets the frontend connect an AI answer back to the original PDF instead of presenting an unsupported response.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- PDF rendering / evidence viewer
- Server-Sent Events for streamed responses

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- pgvector

### AI / Retrieval

- Sentence Transformers
- CrossEncoder
- BM25
- Vector similarity search
- Groq LLM API

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL + pgvector

---

## 📂 Project Structure

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

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker / Docker Compose
- A Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/aawhan0/Dasaiko.git
cd Dasaiko
```

### 2. Start PostgreSQL + pgvector

```bash
docker compose up -d
```

The repository uses the `pgvector/pgvector:pg17` image for PostgreSQL.

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Configure the required environment variables, including your LLM API key and database configuration.

### 4. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 5. Start the FastAPI backend

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

> **Note:** Local setup and production configuration may evolve as deployment is finalized.

---

## 🧪 Retrieval Evaluation

Dasaiko includes a retrieval/reranker evaluation script:

```text
backend/evaluation/evaluate_reranker.py
```

The evaluation queries include strongly relevant, related/partially relevant, and irrelevant questions. The evaluation reproduces the retrieval flow:

```text
Vector Search + BM25
        ↓
Hybrid Candidates
        ↓
CrossEncoder
        ↓
Ranked Results
```

This provides a foundation for measuring and improving retrieval quality rather than treating RAG behavior as a black box.

---

## 🎯 Design Goals

### 1. Ground answers in sources

Make it easy to inspect the evidence behind an answer.

### 2. Preserve research context

A research conversation should understand which paper the user is currently studying.

### 3. Improve retrieval before improving prompts

Better evidence selection is treated as a core engineering problem, not something that can be solved purely with a longer LLM prompt.

### 4. Encourage actual paper reading

The goal is not to replace research papers with AI summaries. The goal is to make papers easier to **read, question, navigate, compare, and learn from**.

---

## 🗺️ Roadmap

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
- [x] Hybrid candidate merging
- [x] CrossEncoder reranking
- [x] Query-aware retrieval
- [x] Document-scoped retrieval

### Research Learning

- [ ] Research path generation
- [ ] Paper prerequisite mapping
- [ ] Related-paper discovery
- [ ] Visual research maps
- [ ] Learning progression from foundational → advanced papers

### Production

- [ ] Automated test suite expansion
- [ ] Production deployment
- [ ] Automated CI pipeline
- [ ] Retrieval evaluation metrics
- [ ] Production observability

---

## 🔬 Engineering Highlights

- **Hybrid retrieval** instead of vector-only RAG
- **CrossEncoder reranking** after candidate retrieval
- **Document-scoped retrieval** to avoid cross-paper contamination
- **Specialized metadata retrieval** for bibliographic questions
- **Summary-specific retrieval** for coherent paper overviews
- **Persistent research context** across conversations
- **Page-aware evidence objects** for source navigation
- **Streaming chat responses** using server-sent events
- **Dedicated retrieval evaluation tooling**

---

## 📸 Screenshots

Add 3–4 screenshots here before publishing the repository as a portfolio project.

Recommended:

1. Research workspace
2. AI response with evidence cards
3. PDF evidence viewer
4. Research-paper/library interface

Suggested paths:

```text
docs/images/research-workspace.png
docs/images/evidence-viewer.png
docs/images/streaming-chat.png
```

---

## 📌 Project Status

**Active development — portfolio-ready MVP**

The core research workspace and retrieval pipeline are implemented. The project is continuing toward research-path generation, prerequisite mapping, visual research maps, stronger automated evaluation, and production deployment.

---

## 👨‍💻 Author

**Aawhan Vyas**

Computer Science Engineering

GitHub: [aawhan0](https://github.com/aawhan0)

---

## ⭐ Why Dasaiko?

Most "chat with PDF" applications stop at:

```text
PDF → chunks → embeddings → LLM
```

Dasaiko is being developed as a more complete **research learning system**:

```text
Research Paper
      ↓
Understand the document
      ↓
Retrieve relevant evidence
      ↓
Rank evidence intelligently
      ↓
Ask grounded questions
      ↓
Inspect the source
      ↓
Connect the paper to other research
      ↓
Build a research path
```

The long-term goal is to turn research-paper reading from a fragmented workflow into a structured learning experience.
