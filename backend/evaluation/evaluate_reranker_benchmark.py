from __future__ import annotations

import json
import os
from pathlib import Path

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

# IMPORTANT:
# This matches SearchService production behavior:
#
# max(limit * 5, 50)
#
# With TOP_K=10:
#
#     RRF candidate pool = 50
#
RRF_CANDIDATE_LIMIT = int(
    os.getenv(
        "DASAIKO_RRF_CANDIDATE_LIMIT",
        str(
            max(
                TOP_K * 5,
                50,
            )
        ),
    )
)

# Retrieval services get enough candidates to build
# the production RRF pool.
RETRIEVAL_LIMIT = max(
    TOP_K * 10,
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
# RESULT HELPERS
# ============================================================

def get_chunk(result):

    if isinstance(result, tuple):

        chunk = result[0]

    else:

        chunk = result

    if not hasattr(chunk, "id"):

        try:
            chunk = chunk[0]
        except Exception:
            pass

    if not hasattr(chunk, "id"):

        raise TypeError(
            f"Unable to extract Chunk from: {result!r}"
        )

    return chunk


# ============================================================
# VECTOR
# ============================================================

def run_vector(
    db,
    query: str,
):

    results = VectorSearchService.search(
        db=db,
        query=query,
        user_id=USER_ID,
        limit=RETRIEVAL_LIMIT,
    )

    return [
        get_chunk(result)
        for result in results
        if get_chunk(result) is not None
    ]


# ============================================================
# BM25
# ============================================================

def run_bm25(
    db,
    query: str,
):

    results = BM25Service.search(
        db=db,
        query=query,
        user_id=USER_ID,
        limit=RETRIEVAL_LIMIT,
    )

    return [
        get_chunk(result)
        for result in results
        if get_chunk(result) is not None
    ]


# ============================================================
# RRF
# ============================================================

def run_rrf(
    vector_chunks: list,
    bm25_chunks: list,
):

    RRF_K = 60

    rrf_scores = {}
    chunks_by_id = {}

    # --------------------------------------------------------
    # Vector ranks
    # --------------------------------------------------------

    for rank, chunk in enumerate(
        vector_chunks,
        start=1,
    ):

        chunks_by_id[chunk.id] = chunk

        rrf_scores.setdefault(
            chunk.id,
            0.0,
        )

        rrf_scores[chunk.id] += (
            1.0
            / (RRF_K + rank)
        )

    # --------------------------------------------------------
    # BM25 ranks
    # --------------------------------------------------------

    for rank, chunk in enumerate(
        bm25_chunks,
        start=1,
    ):

        chunks_by_id[chunk.id] = chunk

        rrf_scores.setdefault(
            chunk.id,
            0.0,
        )

        rrf_scores[chunk.id] += (
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

    ranked = ranked[
        :RRF_CANDIDATE_LIMIT
    ]

    return [
        (
            chunks_by_id[chunk_id],
            score,
        )
        for chunk_id, score in ranked
    ]


# ============================================================
# DUPLICATE FILTERING
# ============================================================

def unique_ids(
    chunks,
):

    seen = set()
    ids = []

    for chunk in chunks:

        if chunk.id in seen:
            continue

        seen.add(chunk.id)
        ids.append(chunk.id)

    return ids


# ============================================================
# EVALUATE ONE CASE
# ============================================================

def evaluate_case(
    db,
    case: dict,
):

    query = case["query"]

    relevant_ids = [
        int(chunk_id)
        for chunk_id in case[
            "relevant_chunk_ids"
        ]
    ]

    # --------------------------------------------------------
    # VECTOR
    # --------------------------------------------------------

    vector_chunks = run_vector(
        db,
        query,
    )

    vector_ids = unique_ids(
        vector_chunks
    )

    # --------------------------------------------------------
    # BM25
    # --------------------------------------------------------

    bm25_chunks = run_bm25(
        db,
        query,
    )

    bm25_ids = unique_ids(
        bm25_chunks
    )

    # --------------------------------------------------------
    # RRF
    # --------------------------------------------------------

    rrf_results = run_rrf(
        vector_chunks,
        bm25_chunks,
    )

    rrf_chunks = [
        chunk
        for chunk, _score in rrf_results
    ]

    rrf_ids = unique_ids(
        rrf_chunks
    )

    # --------------------------------------------------------
    # RRF METRICS
    # --------------------------------------------------------

    rrf_metrics = evaluate_ranking(
        rrf_ids,
        relevant_ids,
    )

    # --------------------------------------------------------
    # CROSS ENCODER
    # --------------------------------------------------------
    #
    # This is the important experiment.
    #
    # We feed exactly the same RRF candidate pool that
    # production SearchService sends to the reranker.
    #
    # The CrossEncoder then produces a new ranking.
    # --------------------------------------------------------

    reranker_input = [
        (
            chunk,
            rrf_score,
        )
        for chunk, rrf_score in rrf_results
    ]

    reranked_results = (
        RerankerService.rerank(
            query=query,
            results=reranker_input,
            limit=len(reranker_input),
        )
    )

    reranked_ids = [
        chunk.id
        for chunk, _score in reranked_results
    ]

    # --------------------------------------------------------
    # BGE / CROSS-ENCODER METRICS
    # --------------------------------------------------------

    bge_metrics = evaluate_ranking(
        reranked_ids,
        relevant_ids,
    )

    # --------------------------------------------------------
    # RANK CHANGES
    # --------------------------------------------------------

    rrf_rank = {
        chunk_id: rank
        for rank, chunk_id in enumerate(
            rrf_ids,
            start=1,
        )
    }

    bge_rank = {
        chunk_id: rank
        for rank, chunk_id in enumerate(
            reranked_ids,
            start=1,
        )
    }

    rank_changes = {}

    for chunk_id in relevant_ids:

        rank_changes[str(chunk_id)] = {
            "rrf_rank": rrf_rank.get(
                chunk_id
            ),
            "bge_rank": bge_rank.get(
                chunk_id
            ),
        }

    # --------------------------------------------------------
    # CANDIDATE RECALL
    # --------------------------------------------------------

    relevant_in_rrf_candidates = len(
        set(
            rrf_ids
        ).intersection(
            relevant_ids
        )
    )

    # --------------------------------------------------------
    # RESULT
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

        "vector": {
            **evaluate_ranking(
                vector_ids[:TOP_K],
                relevant_ids,
            ),
        },

        "bm25": {
            **evaluate_ranking(
                bm25_ids[:TOP_K],
                relevant_ids,
            ),
        },

        "rrf": {
            **rrf_metrics,
            "candidate_count": len(
                rrf_ids
            ),
            "relevant_in_candidates":
                relevant_in_rrf_candidates,
        },

        "bge_reranker": {
            **bge_metrics,
            "candidate_count": len(
                reranked_ids
            ),
            "rank_changes": rank_changes,
        },
    }


# ============================================================
# PRINT CASE
# ============================================================

def print_case(
    result: dict,
):

    vector = result["vector"]
    bm25 = result["bm25"]
    rrf = result["rrf"]
    bge = result["bge_reranker"]

    print()

    print(
        f"Vector   "
        f"R@5={vector['recall@5']:.3f} "
        f"R@10={vector['recall@10']:.3f} "
        f"MRR={vector['mrr']:.3f} "
        f"nDCG@10={vector['ndcg@10']:.3f}"
    )

    print(
        f"BM25     "
        f"R@5={bm25['recall@5']:.3f} "
        f"R@10={bm25['recall@10']:.3f} "
        f"MRR={bm25['mrr']:.3f} "
        f"nDCG@10={bm25['ndcg@10']:.3f}"
    )

    print(
        f"RRF      "
        f"R@5={rrf['recall@5']:.3f} "
        f"R@10={rrf['recall@10']:.3f} "
        f"MRR={rrf['mrr']:.3f} "
        f"nDCG@10={rrf['ndcg@10']:.3f}"
    )

    print(
        f"BGE      "
        f"R@5={bge['recall@5']:.3f} "
        f"R@10={bge['recall@10']:.3f} "
        f"MRR={bge['mrr']:.3f} "
        f"nDCG@10={bge['ndcg@10']:.3f}"
    )


# ============================================================
# AGGREGATE
# ============================================================

def print_aggregate(
    results: list[dict],
):

    print()
    print("=" * 100)
    print("RERANKER BENCHMARK — AGGREGATE")
    print("=" * 100)

    methods = (
        "vector",
        "bm25",
        "rrf",
        "bge_reranker",
    )

    averages = {}

    for method in methods:

        metrics = average_metrics(
            [
                result[method]
                for result in results
            ]
        )

        averages[method] = metrics

        print(
            f"{method:15s} "
            f"R@5={metrics['recall@5']:.4f} "
            f"R@10={metrics['recall@10']:.4f} "
            f"MRR={metrics['mrr']:.4f} "
            f"nDCG@10={metrics['ndcg@10']:.4f}"
        )

    # --------------------------------------------------------
    # RRF -> BGE DELTAS
    # --------------------------------------------------------

    rrf = averages["rrf"]
    bge = averages["bge_reranker"]

    print()
    print("=" * 100)
    print("RRF -> CROSS-ENCODER DELTA")
    print("=" * 100)

    metrics = (
        "recall@5",
        "recall@10",
        "mrr",
        "ndcg@10",
    )

    for metric in metrics:

        delta = (
            bge[metric]
            - rrf[metric]
        )

        print(
            f"{metric:12s}: "
            f"{delta:+.4f}"
        )

    # --------------------------------------------------------
    # IMPROVEMENT PERCENTAGES
    # --------------------------------------------------------

    print()
    print("=" * 100)
    print("RELATIVE CHANGE")
    print("=" * 100)

    for metric in metrics:

        baseline = rrf[metric]
        reranked = bge[metric]

        if baseline != 0:

            relative = (
                (
                    reranked
                    - baseline
                )
                / baseline
            ) * 100

        else:

            relative = 0.0

        print(
            f"{metric:12s}: "
            f"{relative:+.2f}%"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 100)
    print("DASAIKO CROSS-ENCODER RERANKER EVALUATION")
    print("=" * 100)

    print()
    print(
        f"Evaluation user ID: {USER_ID}"
    )

    print(
        f"Top K: {TOP_K}"
    )

    print(
        f"Retrieval limit: "
        f"{RETRIEVAL_LIMIT}"
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

                print_case(
                    result
                )

            except Exception as error:

                print(
                    f"ERROR: {error}"
                )

    finally:

        db.close()

    if not case_results:

        print(
            "\nNo cases were successfully evaluated."
        )

        return

    print_aggregate(
        case_results
    )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_file = (
        OUTPUT_DIR
        / "reranker_evaluation.json"
    )

    output = {
        "user_id": USER_ID,
        "top_k": TOP_K,
        "retrieval_limit": RETRIEVAL_LIMIT,
        "rrf_candidate_limit":
            RRF_CANDIDATE_LIMIT,
        "case_count":
            len(case_results),
        "results":
            case_results,
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
    print("RERANKER EVALUATION COMPLETE")
    print("=" * 100)


if __name__ == "__main__":
    main()