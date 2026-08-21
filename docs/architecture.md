# Dasaiko Architecture

Dasaiko is organized around a research workspace, application services, retrieval and reasoning pipeline, and persistent evidence layer.

## 1. System Architecture

![Dasaiko system architecture](./assets/diagrams/01-dasaiko-system-architecture.svg)

The frontend communicates with the FastAPI API. API routers delegate application behavior to focused services, while PostgreSQL/pgvector and external inference/authentication providers sit behind those service boundaries.

## 2. Research Pipeline

![Dasaiko research pipeline](./assets/diagrams/02-dasaiko-research-pipeline.svg)

The question-time path is deliberately layered:

```text
User query
   ↓
Query analysis / routing
   ↓
Vector Search + BM25
   ↓
RRF candidate fusion
   ↓
BGE cross-encoder reranking
   ↓
Evidence selection + validation
   ↓
Prompt construction
   ↓
Grounded LLM response
```

Retrieval is responsible for finding evidence. Reranking refines relevance. Evidence selection determines what the model is allowed to use. The LLM generates the response but is not treated as the source of truth.

## 3. Document Ingestion

![Dasaiko document ingestion](./assets/diagrams/03-dasaiko-document-ingestion.svg)

Documents are transformed into structured searchable evidence:

```text
PDF
 ↓
Parsed pages / metadata
 ↓
Chunks
 ↓
Embeddings
 ↓
Searchable corpus
```

Page numbers, dimensions, bounding boxes, chunk identity, and document identity are retained so retrieved evidence can be traced back to the original source.

## 4. Data Architecture

![Dasaiko data architecture](./assets/diagrams/04-dasaiko-data-architecture.svg)

The persistent model centers on users, documents, chunks, embeddings, conversations, and messages. Authentication verification state is persisted alongside the user model.

## Architectural Decisions

### Hybrid retrieval

Vector search captures semantic similarity while BM25 handles exact terminology, technical phrases, names, and keyword-sensitive questions.

### Reciprocal Rank Fusion

RRF combines rankings rather than assuming dense and lexical retrieval scores share a meaningful numeric scale.

### Cross-encoder reranking

Initial retrieval is optimized for candidate recall. The cross-encoder evaluates query-passage pairs together to improve ordering before evidence reaches the generation layer.

### Context-aware retrieval

Normal questions remain scoped to the active research paper. Explicit references to another uploaded paper can change the scope for the current query, while global or external research requires an explicit broader request.

### Evidence-first generation

Generated answers are backed by source evidence carrying document identity, chunk identity, page information, and ranking metadata. Source references are validated before being returned to the client.

## Deployment

```text
Vercel frontend
      ↓ HTTPS
Render FastAPI API
      ↓
PostgreSQL + pgvector

External inference/authentication services
```

The repository also provides a backend Docker image for reproducible local/container execution.
