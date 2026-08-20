from __future__ import annotations

import json
import os
from pathlib import Path

from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.models.chunk import Chunk
from app.models.document import Document

from app.services.bm25_service import BM25Service
from app.services.search_service import SearchService
from app.services.vector_search_service import (
    VectorSearchService,
)

from evaluation.retrieval_metrics import (
    average_metrics,
    evaluate_ranking,
)


# ============================================================
# CONFIG
# ============================================================

USER_ID = int(
    os.getenv(
        "EVAL_USER_ID",
        "1",
    )
)

TOP_K = 10

# Candidate depth used for the RRF ablation.
# This mirrors the current SearchService setup:
# Vector/BM25 retrieve 100 candidates, then RRF keeps
# max(TOP_K * 5, 50) candidates before reranking.
RETRIEVAL_CANDIDATES = 100
RRF_K = 60
RRF_CANDIDATE_LIMIT = max(
    TOP_K * 5,
    50,
)

DATASET_FILE = (
    Path(__file__).resolve().parent
    / "datasets"
    / "retrieval_cases_current.json"
)

OUTPUT_DIR = (
    Path(__file__).resolve().parent
    / "results"
)

SessionLocal = sessionmaker(
    bind=engine,
)


# ============================================================
# DATASET
# ============================================================

def load_dataset() -> list[dict]:
    """
    Load the manually annotated retrieval dataset.
    """

    if not DATASET_FILE.exists():
        raise FileNotFoundError(
            f"Evaluation dataset not found:\n"
            f"{DATASET_FILE}"
        )

    with DATASET_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:

        dataset = json.load(file)

    if not isinstance(dataset, list):
        raise ValueError(
            "Evaluation dataset must contain a JSON list."
        )

    return dataset


# ============================================================
# DATABASE HELPERS
# ============================================================

def get_user_document_ids(
    db,
) -> list[int]:
    """
    Return every document belonging to the
    evaluation user.

    Retrieval evaluation must search across
    the complete user corpus.
    """

    documents = (
        db.query(Document.id)
        .filter(
            Document.user_id == USER_ID
        )
        .order_by(
            Document.id
        )
        .all()
    )

    return [
        document_id
        for document_id, in documents
    ]


def get_document_ids_for_chunks(
    db,
    chunk_ids: list[int],
) -> list[int]:
    """
    Resolve annotated relevant chunks to
    their document IDs.

    Used for diagnostics only.
    """

    if not chunk_ids:
        return []

    rows = (
        db.query(
            Chunk.id,
            Chunk.document_id,
        )
        .filter(
            Chunk.id.in_(chunk_ids)
        )
        .all()
    )

    return sorted(
        {
            document_id
            for _, document_id in rows
        }
    )


def validate_relevant_chunks(
    db,
    chunk_ids: list[int],
) -> None:
    """
    Verify that all annotated chunks still
    exist in the current database.
    """

    if not chunk_ids:
        raise ValueError(
            "Case contains no relevant_chunk_ids."
        )

    existing_ids = {
        chunk_id
        for chunk_id, in (
            db.query(Chunk.id)
            .filter(
                Chunk.id.in_(chunk_ids)
            )
            .all()
        )
    }

    missing = [
        chunk_id
        for chunk_id in chunk_ids
        if chunk_id not in existing_ids
    ]

    if missing:
        raise ValueError(
            "Annotated chunks no longer exist: "
            f"{missing}"
        )


# ============================================================
# RESULT ID HELPERS
# ============================================================

def chunk_id_from_vector_result(
    result,
) -> int:
    """
    VectorSearchService returns SQLAlchemy
    Row objects containing:

        (Chunk, distance)

    SQLAlchemy Row is NOT necessarily a
    normal Python tuple, so checking only
    isinstance(result, tuple) is insufficient.

    Explicitly extract the first element when
    a Row-like object is returned.
    """

    if hasattr(
        result,
        "_mapping",
    ):

        chunk = result[0]

    elif isinstance(
        result,
        tuple,
    ):

        chunk = result[0]

    else:

        chunk = result

    if hasattr(
        chunk,
        "id",
    ):

        return int(
            chunk.id
        )

    if isinstance(
        chunk,
        dict,
    ):

        if "id" in chunk:
            return int(
                chunk["id"]
            )

        if "chunk_id" in chunk:
            return int(
                chunk["chunk_id"]
            )

    raise TypeError(
        "Could not extract chunk ID "
        "from vector result: "
        f"{result!r}"
    )


def chunk_id_from_bm25_result(
    result,
) -> int:
    """
    BM25Service returns:

        (Chunk, score)

    Extract the Chunk ID safely.
    """

    if isinstance(
        result,
        tuple,
    ):

        first = result[0]

        if hasattr(
            first,
            "id",
        ):

            return int(
                first.id
            )

        if isinstance(
            first,
            dict,
        ):

            if "id" in first:
                return int(
                    first["id"]
                )

            if "chunk_id" in first:
                return int(
                    first["chunk_id"]
                )

    if hasattr(
        result,
        "id",
    ):

        return int(
            result.id
        )

    if isinstance(
        result,
        dict,
    ):

        if "id" in result:
            return int(
                result["id"]
            )

        if "chunk_id" in result:
            return int(
                result["chunk_id"]
            )

    raise TypeError(
        "Unsupported BM25 result: "
        f"{result!r}"
    )


def chunk_id_from_search_result(
    result,
) -> int:
    """
    SearchService returns dictionaries
    containing the chunk ID under 'id'.
    """

    if isinstance(
        result,
        dict,
    ):

        if "id" in result:
            return int(
                result["id"]
            )

        if "chunk_id" in result:
            return int(
                result["chunk_id"]
            )

    if hasattr(
        result,
        "id",
    ):

        return int(
            result.id
        )

    raise TypeError(
        "Unsupported SearchService result: "
        f"{result!r}"
    )


# ============================================================
# RETRIEVAL METHODS
# ============================================================

def run_vector(
    db,
    query: str,
    document_ids: list[int],
) -> list[int]:
    """
    Run vector retrieval across the complete
    evaluation corpus.

    Each document contributes up to TOP_K
    candidates and the combined results are
    truncated to TOP_K.
    """

    results = []

    for document_id in document_ids:

        candidates = (
            VectorSearchService.search(
                db=db,
                query=query,
                user_id=USER_ID,
                limit=TOP_K,
                document_id=document_id,
            )
        )

        results.extend(
            chunk_id_from_vector_result(
                result
            )
            for result in candidates
        )

    return results[:TOP_K]


def run_bm25(
    db,
    query: str,
    document_ids: list[int],
) -> list[int]:
    """
    Run BM25 retrieval across the complete
    evaluation corpus.
    """

    results = []

    for document_id in document_ids:

        candidates = (
            BM25Service.search(
                db=db,
                query=query,
                user_id=USER_ID,
                limit=TOP_K,
                document_id=document_id,
            )
        )

        results.extend(
            chunk_id_from_bm25_result(
                result
            )
            for result in candidates
        )

    return results[:TOP_K]



def run_rrf(
    db,
    query: str,
    document_ids: list[int],
) -> list[int]:
    """
    Run the same Vector + BM25 candidate fusion used by
    SearchService, but STOP before the BGE reranker.

    This is the RRF ablation baseline.

    Pipeline:

        Vector top 100
             +
        BM25 top 100
             |
             v
        Reciprocal Rank Fusion
             |
             v
        top RRF candidates
             |
             v
        top TOP_K

    We intentionally do not call SearchService here because
    SearchService continues into the reranker. The goal is to
    measure RRF independently.
    """

    all_results = []

    for document_id in document_ids:

        vector_results = (
            VectorSearchService.search(
                db=db,
                query=query,
                user_id=USER_ID,
                limit=RETRIEVAL_CANDIDATES,
                document_id=document_id,
            )
        )

        bm25_results = (
            BM25Service.search(
                db=db,
                query=query,
                user_id=USER_ID,
                limit=RETRIEVAL_CANDIDATES,
                document_id=document_id,
            )
        )

        rrf_scores = {}
        chunks_by_id = {}

        # -------------------------------
        # Vector ranks
        # -------------------------------

        for rank, result in enumerate(
            vector_results,
            start=1,
        ):

            chunk_id = (
                chunk_id_from_vector_result(
                    result
                )
            )

            chunk = (
                result[0]
                if hasattr(result, "_mapping")
                or isinstance(result, tuple)
                else result
            )

            chunks_by_id[chunk_id] = chunk

            rrf_scores.setdefault(
                chunk_id,
                0.0,
            )

            rrf_scores[chunk_id] += (
                1.0
                / (RRF_K + rank)
            )

        # -------------------------------
        # BM25 ranks
        # -------------------------------

        for rank, result in enumerate(
            bm25_results,
            start=1,
        ):

            chunk_id = (
                chunk_id_from_bm25_result(
                    result
                )
            )

            chunk = result[0]

            chunks_by_id[chunk_id] = chunk

            rrf_scores.setdefault(
                chunk_id,
                0.0,
            )

            rrf_scores[chunk_id] += (
                1.0
                / (RRF_K + rank)
            )

        # -------------------------------
        # RRF ranking
        # -------------------------------

        ranked = sorted(
            rrf_scores.items(),
            key=lambda item: item[1],
            reverse=True,
        )

        ranked = ranked[
            :RRF_CANDIDATE_LIMIT
        ]

        all_results.extend(
            chunk_id
            for chunk_id, _ in ranked
        )

    return all_results[:TOP_K]


def run_production_search(
    db,
    query: str,
    document_ids: list[int],
) -> list[int]:
    """
    Run Dasaiko's real SearchService.

    This measures the current production
    retrieval pipeline.
    """

    all_results = []

    for document_id in document_ids:

        results = (
            SearchService.search(
                db=db,
                query=query,
                user_id=USER_ID,
                limit=TOP_K,
                document_id=document_id,
            )
        )

        all_results.extend(
            chunk_id_from_search_result(
                result
            )
            for result in results
        )

    return all_results[:TOP_K]


# ============================================================
# CASE EVALUATION
# ============================================================

def evaluate_case(
    db,
    case: dict,
    document_ids: list[int],
) -> dict:

    query = case["query"]

    relevant_ids = [
        int(chunk_id)
        for chunk_id
        in case["relevant_chunk_ids"]
    ]

    validate_relevant_chunks(
        db,
        relevant_ids,
    )

    annotated_document_ids = (
        get_document_ids_for_chunks(
            db,
            relevant_ids,
        )
    )

    vector_ids = run_vector(
        db,
        query,
        document_ids,
    )

    bm25_ids = run_bm25(
        db,
        query,
        document_ids,
    )

    rrf_ids = run_rrf(
        db,
        query,
        document_ids,
    )

    production_ids = (
        run_production_search(
            db,
            query,
            document_ids,
        )
    )

    return {
        "id": case["id"],
        "query": query,
        "category": case.get(
            "category",
            "unknown",
        ),

        "relevant_ids": relevant_ids,

        "annotated_document_ids": (
            annotated_document_ids
        ),

        "vector": {
            "retrieved_ids": vector_ids,
            **evaluate_ranking(
                vector_ids,
                relevant_ids,
            ),
        },

        "bm25": {
            "retrieved_ids": bm25_ids,
            **evaluate_ranking(
                bm25_ids,
                relevant_ids,
            ),
        },

        "rrf": {
            "retrieved_ids": rrf_ids,
            **evaluate_ranking(
                rrf_ids,
                relevant_ids,
            ),
        },

        "production": {
            "retrieved_ids": production_ids,
            **evaluate_ranking(
                production_ids,
                relevant_ids,
            ),
        },
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 90)
    print(
        "DASAIKO RETRIEVAL EVALUATION"
    )
    print("=" * 90)

    dataset = load_dataset()

    print()
    print(
        f"Evaluation user ID: {USER_ID}"
    )

    print(
        f"Cases: {len(dataset)}"
    )

    print(
        f"Top K: {TOP_K}"
    )

    print()
    print(
        f"Dataset: {DATASET_FILE}"
    )

    db = SessionLocal()

    case_results = []

    try:

        document_ids = (
            get_user_document_ids(db)
        )

        print()
        print(
            "Evaluation corpus:"
        )

        print(
            document_ids
        )

        print(
            f"Total documents: "
            f"{len(document_ids)}"
        )

        if not document_ids:

            raise RuntimeError(
                f"No documents found for "
                f"user {USER_ID}."
            )

        for index, case in enumerate(
            dataset,
            start=1,
        ):

            print()
            print("-" * 90)

            print(
                f"[{index}/{len(dataset)}] "
                f"{case['id']}"
            )

            print(
                f"Query: {case['query']}"
            )

            try:

                result = evaluate_case(
                    db=db,
                    case=case,
                    document_ids=document_ids,
                )

                case_results.append(
                    result
                )

                for method in (
                    "vector",
                    "bm25",
                    "rrf",
                    "production",
                ):

                    metrics = result[
                        method
                    ]

                    print(
                        f"{method:12s} "
                        f"R@5="
                        f"{metrics['recall@5']:.3f} "
                        f"R@10="
                        f"{metrics['recall@10']:.3f} "
                        f"MRR="
                        f"{metrics['mrr']:.3f} "
                        f"NDCG@10="
                        f"{metrics['ndcg@10']:.3f}"
                    )

            except Exception as error:

                print(
                    f"ERROR: {error}"
                )

    finally:

        db.close()

    # ========================================================
    # AGGREGATE RESULTS
    # ========================================================

    print()
    print("=" * 90)
    print(
        "AGGREGATE RESULTS"
    )
    print("=" * 90)

    if not case_results:

        print(
            "No cases were successfully evaluated."
        )

    else:

        for method in (
            "vector",
            "bm25",
            "rrf",
            "production",
        ):

            metrics = average_metrics(
                [
                    result[method]
                    for result in case_results
                ]
            )

            print(
                f"{method:12s} "
                f"R@5="
                f"{metrics['recall@5']:.3f} "
                f"R@10="
                f"{metrics['recall@10']:.3f} "
                f"MRR="
                f"{metrics['mrr']:.3f} "
                f"NDCG@10="
                f"{metrics['ndcg@10']:.3f}"
            )

    # ========================================================
    # SAVE RESULTS
    # ========================================================

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_file = (
        OUTPUT_DIR
        / "retrieval_evaluation.json"
    )

    with output_file.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            {
                "user_id": USER_ID,
                "top_k": TOP_K,
                "case_count": len(
                    case_results
                ),
                "evaluation_corpus_document_ids": (
                    document_ids
                ),
                "results": case_results,
            },
            file,
            indent=2,
        )

    print()
    print(
        "Detailed results saved to:"
    )

    print(
        output_file
    )

    print()
    print("=" * 90)
    print(
        "EVALUATION COMPLETE"
    )
    print("=" * 90)


if __name__ == "__main__":
    main()