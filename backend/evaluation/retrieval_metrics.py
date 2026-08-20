from __future__ import annotations

import math
from typing import Iterable


def recall_at_k(
    retrieved_ids: Iterable[int],
    relevant_ids: Iterable[int],
    k: int,
) -> float:
    retrieved = list(retrieved_ids)[:k]
    relevant = set(relevant_ids)

    if not relevant:
        return 0.0

    hits = sum(
        1
        for chunk_id in retrieved
        if chunk_id in relevant
    )

    return hits / len(relevant)


def reciprocal_rank(
    retrieved_ids: Iterable[int],
    relevant_ids: Iterable[int],
) -> float:
    relevant = set(relevant_ids)

    for rank, chunk_id in enumerate(
        retrieved_ids,
        start=1,
    ):
        if chunk_id in relevant:
            return 1.0 / rank

    return 0.0


def ndcg_at_k(
    retrieved_ids: Iterable[int],
    relevant_ids: Iterable[int],
    k: int,
) -> float:
    retrieved = list(retrieved_ids)[:k]
    relevant = set(relevant_ids)

    if not relevant:
        return 0.0

    dcg = 0.0

    for rank, chunk_id in enumerate(
        retrieved,
        start=1,
    ):
        if chunk_id in relevant:
            dcg += 1.0 / math.log2(rank + 1)

    ideal_hits = min(
        len(relevant),
        k,
    )

    idcg = sum(
        1.0 / math.log2(rank + 1)
        for rank in range(
            1,
            ideal_hits + 1,
        )
    )

    if idcg == 0.0:
        return 0.0

    return dcg / idcg


def evaluate_ranking(
    retrieved_ids: list[int],
    relevant_ids: list[int],
) -> dict[str, float]:
    return {
        "recall@5": recall_at_k(
            retrieved_ids,
            relevant_ids,
            5,
        ),
        "recall@10": recall_at_k(
            retrieved_ids,
            relevant_ids,
            10,
        ),
        "mrr": reciprocal_rank(
            retrieved_ids,
            relevant_ids,
        ),
        "ndcg@10": ndcg_at_k(
            retrieved_ids,
            relevant_ids,
            10,
        ),
    }


def average_metrics(
    results: list[dict[str, float]],
) -> dict[str, float]:
    if not results:
        return {
            "recall@5": 0.0,
            "recall@10": 0.0,
            "mrr": 0.0,
            "ndcg@10": 0.0,
        }

    keys = (
        "recall@5",
        "recall@10",
        "mrr",
        "ndcg@10",
    )

    return {
        key: sum(
            result[key]
            for result in results
        ) / len(results)
        for key in keys
    }