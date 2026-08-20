from __future__ import annotations

import json
import os
from pathlib import Path

from sqlalchemy.orm import sessionmaker

from app.db.database import engine
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

# Number of candidates passed through the retrieval/RRF stage
# before BGE reranking.
RRF_CANDIDATE_LIMIT = int(
    os.getenv(
        "DASAIKO_RRF_CANDIDATE_LIMIT",
        str(
            max(
                TOP_K * 10,
                100,
            )
        ),
    )
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
# RESULT ID HELPERS
# ============================================================

def chunk_id_from_vector_result(
    result,
) -> int:
    """
    VectorSearchService returns SQLAlchemy rows:

        (Chunk, score)

    Extract the Chunk ID safely.
    """

    if isinstance(result, tuple):

        chunk = result[0]

    else:

        chunk = result

    # SQLAlchemy Row can also behave like a tuple.
    if not hasattr(chunk, "id"):

        try:

            chunk = chunk[0]

        except Exception:

            pass

    if not hasattr(chunk, "id"):

        raise TypeError(
            f"Unable to extract Chunk from "
            f"vector result: {result!r}"
        )

    return int(chunk.id)


def chunk_id_from_bm25_result(
    result,
) -> int:
    """
    BM25Service returns:

        (Chunk, score)

    Extract the Chunk ID safely.
    """

    if isinstance(result, tuple):

        chunk = result[0]

    else:

        chunk = result

    if hasattr(chunk, "id"):

        return int(chunk.id)

    if isinstance(chunk, dict):

        return int(chunk["id"])

    raise TypeError(
        f"Unable to extract Chunk from "
        f"BM25 result: {result!r}"
    )


def chunk_id_from_search_result(
    result,
) -> int:
    """
    SearchService returns dictionaries.
    """

    if isinstance(result, dict):

        return int(result["id"])

    if hasattr(result, "id"):

        return int(result.id)

    raise TypeError(
        f"Unsupported SearchService result: "
        f"{result!r}"
    )


# ============================================================
# VECTOR
# ============================================================

def run_vector(
    db,
    query: str,
) -> dict:
    """
    Run vector retrieval across the entire user corpus.

    We keep the full retrieval list so that we can measure
    both top-10 quality and candidate availability.
    """

    candidates = VectorSearchService.search(
        db=db,
        query=query,
        user_id=USER_ID,
        limit=100,
    )

    ids = [
        chunk_id_from_vector_result(
            result
        )
        for result in candidates
    ]

    return {
        "retrieved_ids": ids[:TOP_K],
        "candidate_ids": ids,
    }


# ============================================================
# BM25
# ============================================================

def run_bm25(
    db,
    query: str,
) -> dict:
    """
    Run BM25 retrieval across the entire user corpus.

    We retain the full candidate list so that we can
    determine whether relevant evidence entered the
    candidate pool.
    """

    candidates = BM25Service.search(
        db=db,
        query=query,
        user_id=USER_ID,
        limit=100,
    )

    ids = [
        chunk_id_from_bm25_result(
            result
        )
        for result in candidates
    ]

    return {
        "retrieved_ids": ids[:TOP_K],
        "candidate_ids": ids,
    }


# ============================================================
# RRF
# ============================================================

def run_rrf(
    vector_ids: list[int],
    bm25_ids: list[int],
) -> dict:
    """
    Reproduce Dasaiko's production RRF logic.

    Production configuration:

        RRF_K = 60
        candidate pool = max(limit * 5, 50)

    With TOP_K=10 this gives:

        50 RRF candidates

    We return BOTH:

        RRF@10
        RRF@50

    because BGE receives the 50-candidate pool, not just
    the top 10.
    """

    RRF_K = 60

    rrf_scores: dict[int, float] = {}

    # --------------------------------------------------------
    # Vector ranks
    # --------------------------------------------------------

    for rank, chunk_id in enumerate(
        vector_ids,
        start=1,
    ):

        rrf_scores.setdefault(
            chunk_id,
            0.0,
        )

        rrf_scores[chunk_id] += (
            1.0
            / (RRF_K + rank)
        )

    # --------------------------------------------------------
    # BM25 ranks
    # --------------------------------------------------------

    for rank, chunk_id in enumerate(
        bm25_ids,
        start=1,
    ):

        rrf_scores.setdefault(
            chunk_id,
            0.0,
        )

        rrf_scores[chunk_id] += (
            1.0
            / (RRF_K + rank)
        )

    # --------------------------------------------------------
    # Rank
    # --------------------------------------------------------

    ranked = sorted(
        rrf_scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    ranked_ids = [
        chunk_id
        for chunk_id, _score in ranked
    ]

    return {
        "retrieved_ids": ranked_ids[:TOP_K],
        "candidate_ids": ranked_ids[
            :RRF_CANDIDATE_LIMIT
        ],
    }


# ============================================================
# PRODUCTION SEARCH
# ============================================================

def run_production_search(
    db,
    query: str,
) -> list[int]:
    """
    Run Dasaiko's actual production SearchService.

    This searches the entire user's corpus.

    Production pipeline:

        Vector
            +
        BM25
            ↓
        RRF
            ↓
        RRF candidate pool
            ↓
        BGE reranker
            ↓
        evidence filtering
            ↓
        final results
    """

    results = SearchService.search(
        db=db,
        query=query,
        user_id=USER_ID,
        limit=TOP_K,
    )

    return [
        chunk_id_from_search_result(
            result
        )
        for result in results
    ]


# ============================================================
# DIAGNOSTIC HELPERS
# ============================================================

def count_relevant(
    retrieved_ids: list[int],
    relevant_ids: list[int],
) -> int:
    """
    Count how many annotated relevant chunks occur
    in a retrieved/candidate list.
    """

    return len(
        set(retrieved_ids).intersection(
            relevant_ids
        )
    )


def ranks_of_relevant(
    retrieved_ids: list[int],
    relevant_ids: list[int],
) -> dict[str, int]:
    """
    Return the rank of each relevant chunk when present.
    """

    ranks = {}

    for chunk_id in relevant_ids:

        if chunk_id in retrieved_ids:

            ranks[str(chunk_id)] = (
                retrieved_ids.index(chunk_id)
                + 1
            )

    return ranks


# ============================================================
# CASE EVALUATION
# ============================================================

def evaluate_case(
    db,
    case: dict,
) -> dict:

    query = case["query"]

    relevant_ids = [
        int(chunk_id)
        for chunk_id in case[
            "relevant_chunk_ids"
        ]
    ]

    # --------------------------------------------------------
    # Vector
    # --------------------------------------------------------

    vector = run_vector(
        db,
        query,
    )

    # --------------------------------------------------------
    # BM25
    # --------------------------------------------------------

    bm25 = run_bm25(
        db,
        query,
    )

    # --------------------------------------------------------
    # RRF
    # --------------------------------------------------------

    rrf = run_rrf(
        vector["candidate_ids"],
        bm25["candidate_ids"],
    )

    # --------------------------------------------------------
    # Production
    # --------------------------------------------------------

    production_ids = (
        run_production_search(
            db,
            query,
        )
    )

    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    vector_metrics = evaluate_ranking(
        vector["retrieved_ids"],
        relevant_ids,
    )

    bm25_metrics = evaluate_ranking(
        bm25["retrieved_ids"],
        relevant_ids,
    )

    rrf_metrics = evaluate_ranking(
        rrf["retrieved_ids"],
        relevant_ids,
    )

    rrf50_metrics = evaluate_ranking(
        rrf["candidate_ids"],
        relevant_ids,
    )

    production_metrics = evaluate_ranking(
        production_ids,
        relevant_ids,
    )

    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    return {
        "id": case["id"],
        "query": query,
        "category": case.get(
            "category"
        ),
        "expected_document_id": case.get(
            "expected_document_id"
        ),
        "expected_document_title": case.get(
            "expected_document_title"
        ),
        "relevant_ids": relevant_ids,

        # ----------------------------------------------------
        # Vector
        # ----------------------------------------------------

        "vector": {
            "retrieved_ids": vector[
                "retrieved_ids"
            ],
            "candidate_count": len(
                vector["candidate_ids"]
            ),
            "relevant_in_candidates": count_relevant(
                vector["candidate_ids"],
                relevant_ids,
            ),
            "relevant_ranks": ranks_of_relevant(
                vector["candidate_ids"],
                relevant_ids,
            ),
            **vector_metrics,
        },

        # ----------------------------------------------------
        # BM25
        # ----------------------------------------------------

        "bm25": {
            "retrieved_ids": bm25[
                "retrieved_ids"
            ],
            "candidate_count": len(
                bm25["candidate_ids"]
            ),
            "relevant_in_candidates": count_relevant(
                bm25["candidate_ids"],
                relevant_ids,
            ),
            "relevant_ranks": ranks_of_relevant(
                bm25["candidate_ids"],
                relevant_ids,
            ),
            **bm25_metrics,
        },

        # ----------------------------------------------------
        # RRF top 10
        # ----------------------------------------------------

        "rrf": {
            "retrieved_ids": rrf[
                "retrieved_ids"
            ],
            "candidate_count": len(
                rrf["candidate_ids"]
            ),
            **rrf_metrics,
        },

        # ----------------------------------------------------
        # RRF candidate pool
        # ----------------------------------------------------

        "rrf_candidates": {
            "retrieved_ids": rrf[
                "candidate_ids"
            ],
            "candidate_count": len(
                rrf["candidate_ids"]
            ),
            "relevant_in_candidates": count_relevant(
                rrf["candidate_ids"],
                relevant_ids,
            ),
            "relevant_ranks": ranks_of_relevant(
                rrf["candidate_ids"],
                relevant_ids,
            ),
            **rrf50_metrics,
        },

        # ----------------------------------------------------
        # Production
        # ----------------------------------------------------

        "production": {
            "retrieved_ids": production_ids,
            **production_metrics,
        },
    }


# ============================================================
# PRINT CASE DIAGNOSTIC
# ============================================================

def print_case_summary(
    result: dict,
) -> None:

    vector = result["vector"]
    bm25 = result["bm25"]
    rrf = result["rrf"]
    rrf_candidates = result[
        "rrf_candidates"
    ]
    production = result[
        "production"
    ]

    print()

    print(
        f"Vector      "
        f"R@5={vector['recall@5']:.3f} "
        f"R@10={vector['recall@10']:.3f} "
        f"MRR={vector['mrr']:.3f}"
    )

    print(
        f"BM25        "
        f"R@5={bm25['recall@5']:.3f} "
        f"R@10={bm25['recall@10']:.3f} "
        f"MRR={bm25['mrr']:.3f}"
    )

    print(
        f"RRF@10      "
        f"R@5={rrf['recall@5']:.3f} "
        f"R@10={rrf['recall@10']:.3f} "
        f"MRR={rrf['mrr']:.3f}"
    )

    print(
        f"RRF@50      "
        f"relevant="
        f"{rrf_candidates['relevant_in_candidates']}/"
        f"{len(result['relevant_ids'])}"
    )

    print(
        f"Production   "
        f"R@5={production['recall@5']:.3f} "
        f"R@10={production['recall@10']:.3f} "
        f"MRR={production['mrr']:.3f}"
    )


# ============================================================
# AGGREGATE
# ============================================================

def print_aggregate(
    case_results: list[dict],
) -> None:

    print()
    print("=" * 100)
    print("AGGREGATE RESULTS")
    print("=" * 100)

    methods = (
        "vector",
        "bm25",
        "rrf",
        "production",
    )

    for method in methods:

        metrics = average_metrics(
            [
                result[method]
                for result in case_results
            ]
        )

        print(
            f"{method:12s} "
            f"R@5={metrics['recall@5']:.3f} "
            f"R@10={metrics['recall@10']:.3f} "
            f"MRR={metrics['mrr']:.3f} "
            f"NDCG@10={metrics['ndcg@10']:.3f}"
        )

    # --------------------------------------------------------
    # RRF candidate recall
    # --------------------------------------------------------

    relevant_total = 0
    relevant_found = 0

    for result in case_results:

        relevant_total += len(
            result["relevant_ids"]
        )

        relevant_found += (
            result[
                "rrf_candidates"
            ][
                "relevant_in_candidates"
            ]
        )

    candidate_recall = (
        relevant_found / relevant_total
        if relevant_total
        else 0.0
    )

    print()

    print(
        f"RRF candidate recall@"
        f"{RRF_CANDIDATE_LIMIT}: "
        f"{candidate_recall:.3f}"
    )

    print(
        f"Relevant chunks found in RRF "
        f"candidate pools: "
        f"{relevant_found}/{relevant_total}"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 100)
    print(
        "DASAIKO CORPUS-WIDE RETRIEVAL EVALUATION"
    )
    print("=" * 100)

    print()

    print(
        f"Evaluation user ID: {USER_ID}"
    )

    print(
        f"Top K: {TOP_K}"
    )

    print(
        f"RRF candidate limit: "
        f"{RRF_CANDIDATE_LIMIT}"
    )

    print(
        f"Dataset: {DATASET_FILE}"
    )

    dataset = load_dataset()

    print(
        f"Cases: {len(dataset)}"
    )

    db = SessionLocal()

    case_results = []

    try:

        for index, case in enumerate(
            dataset,
            start=1,
        ):

            print()
            print("-" * 100)

            print(
                f"[{index}/{len(dataset)}] "
                f"{case['id']}"
            )

            print(
                f"Query: {case['query']}"
            )

            try:

                result = evaluate_case(
                    db,
                    case,
                )

                case_results.append(
                    result
                )

                print_case_summary(
                    result
                )

            except Exception as error:

                print(
                    f"ERROR: {error}"
                )

    finally:

        db.close()

    # --------------------------------------------------------
    # Aggregate
    # --------------------------------------------------------

    if not case_results:

        print()
        print(
            "No cases were successfully evaluated."
        )

        return

    print_aggregate(
        case_results
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_file = (
        OUTPUT_DIR
        / "retrieval_evaluation.json"
    )

    output = {
        "user_id": USER_ID,
        "top_k": TOP_K,
        "rrf_candidate_limit": (
            RRF_CANDIDATE_LIMIT
        ),
        "case_count": len(
            case_results
        ),
        "results": case_results,
    }

    with output_file.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            output,
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
    print("=" * 100)
    print("EVALUATION COMPLETE")
    print("=" * 100)


if __name__ == "__main__":
    main()