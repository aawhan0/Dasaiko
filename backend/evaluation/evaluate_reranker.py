from sqlalchemy.orm import sessionmaker

from app.db.database import engine

from app.services.vector_search_service import (
    VectorSearchService,
)

from app.services.bm25_service import (
    BM25Service,
)

from app.services.reranker_service import (
    RerankerService,
)


# ========================================
# DATABASE SESSION
# ========================================

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# ========================================
# TEST QUERIES
# ========================================

TEST_QUERIES = [

    # ----------------------------------------
    # STRONGLY RELEVANT
    # ----------------------------------------

    "What problem does attention solve in sequence-to-sequence models?",

    "Why does the Transformer remove recurrence?",

    "How does self-attention work in the Transformer?",

    "How does the decoder use attention?",

    "Why are recurrent models difficult to parallelize?",

    # ----------------------------------------
    # RELATED / PARTIAL
    # ----------------------------------------

    "How are RNNs used in neural machine translation?",

    "What are the limitations of sequence-to-sequence models?",

    "How are word representations learned?",

    "How does neural machine translation work?",

    "What is the role of embeddings in NLP?",

    # ----------------------------------------
    # IRRELEVANT
    # ----------------------------------------

    "Who is John Cena?",

    "What is the capital of India?",

    "How do I make pizza?",

    "What is the weather today?",

    "Who won the football World Cup?",
]


CANDIDATE_LIMIT = 20


# ========================================
# RETRIEVAL
# ========================================

def retrieve_candidates(
    db,
    query: str,
):
    """
    Reproduce Dasaiko's current retrieval stage.

    Vector Search + BM25
    """

    vector_results = (
        VectorSearchService.search(
            db=db,
            query=query,
            limit=CANDIDATE_LIMIT,
        )
    )

    bm25_results = (
        BM25Service.search(
            db=db,
            query=query,
            limit=CANDIDATE_LIMIT,
        )
    )

    combined = {}

    # ----------------------------------------
    # Vector candidates
    # ----------------------------------------

    for chunk, _ in vector_results:

        if chunk is None:
            continue

        combined[chunk.id] = chunk

    # ----------------------------------------
    # BM25 candidates
    # ----------------------------------------

    for chunk, _ in bm25_results:

        if chunk is None:
            continue

        combined[chunk.id] = chunk

    return list(
        combined.values()
    )


# ========================================
# EVALUATE ONE QUERY
# ========================================

def evaluate_query(
    db,
    query: str,
):
    """
    Retrieve real chunks from the database and
    evaluate the current CrossEncoder scores.
    """

    print(
        "\n"
        + "=" * 80
    )

    print(
        f"QUERY: {query}"
    )

    print(
        "=" * 80
    )

    # ----------------------------------------
    # Retrieve candidates
    # ----------------------------------------

    candidates = retrieve_candidates(
        db=db,
        query=query,
    )

    print(
        f"\nHybrid candidates: "
        f"{len(candidates)}"
    )

    if not candidates:

        print(
            "No candidates found."
        )

        return []

    # ----------------------------------------
    # Prepare reranker input
    # ----------------------------------------

    reranker_input = [
        (
            chunk,
            0.0,
        )
        for chunk in candidates
    ]

    # ----------------------------------------
    # CrossEncoder
    # ----------------------------------------

    reranked = (
        RerankerService.rerank(
            query=query,
            results=reranker_input,
            limit=len(reranker_input),
        )
    )

    # ----------------------------------------
    # Store results
    # ----------------------------------------

    results = []

    for rank, (
        chunk,
        score,
    ) in enumerate(
        reranked,
        start=1,
    ):

        result = {
            "rank": rank,
            "score": float(score),
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "document_name": (
                chunk.document.title
                if chunk.document
                else "UNKNOWN"
            ),
            "page": chunk.page_number,
            "content": chunk.content,
        }

        results.append(
            result
        )

    # ----------------------------------------
    # Print top 10
    # ----------------------------------------

    print(
        "\nRERANKER RESULTS:"
    )

    for result in results[:10]:

        print(
            f"\n{result['rank']}. "
            f"Score = "
            f"{result['score']:.4f}"
        )

        print(
            f"   Document: "
            f"{result['document_name']}"
        )

        print(
            f"   Page: "
            f"{result['page']}"
        )

        print(
            f"   Chunk: "
            f"{result['chunk_id']}"
        )

        preview = (
            result["content"]
            .replace("\n", " ")
            .strip()
        )

        if len(preview) > 250:

            preview = (
                preview[:250]
                + "..."
            )

        print(
            f"   Preview: "
            f"{preview}"
        )

    return results


# ========================================
# MAIN
# ========================================

def main():

    print(
        "\n"
        + "=" * 80
    )

    print(
        "        DASAIKO RERANKER SCORE EVALUATION"
    )

    print(
        "=" * 80
    )

    db = SessionLocal()

    all_results = []

    try:

        for query in TEST_QUERIES:

            results = evaluate_query(
                db=db,
                query=query,
            )

            all_results.append(
                {
                    "query": query,
                    "results": results,
                }
            )

    finally:

        db.close()

    # ========================================
    # SUMMARY
    # ========================================

    print(
        "\n\n"
        + "=" * 80
    )

    print(
        "                    SUMMARY"
    )

    print(
        "=" * 80
    )

    for item in all_results:

        query = item["query"]
        results = item["results"]

        print(
            f"\nQUERY: {query}"
        )

        if not results:

            print(
                "  No results."
            )

            continue

        scores = [
            result["score"]
            for result in results
        ]

        top_five = [
            round(score, 4)
            for score in scores[:5]
        ]

        print(
            f"  Highest score: "
            f"{max(scores):.4f}"
        )

        print(
            f"  Lowest score: "
            f"{min(scores):.4f}"
        )

        print(
            f"  Top 5 scores: "
            f"{top_five}"
        )

    print(
        "\n"
        + "=" * 80
    )

    print(
        "Evaluation complete."
    )

    print(
        "=" * 80
        + "\n"
    )


if __name__ == "__main__":
    main()