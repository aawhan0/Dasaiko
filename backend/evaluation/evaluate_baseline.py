from collections import defaultdict
from statistics import mean

from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.models.document import Document
from app.services.bm25_service import BM25Service
from app.services.vector_search_service import VectorSearchService

from evaluation.datasets.retrieval_cases import EVALUATION_CASES


SessionLocal = sessionmaker(bind=engine)

USER_ID = 1

TOP_K_VALUES = [1, 3, 5, 10]


def reciprocal_rank(
    ranked_document_ids,
    relevant_document_ids,
):
    relevant = set(relevant_document_ids)

    for index, document_id in enumerate(
        ranked_document_ids,
        start=1,
    ):
        if document_id in relevant:
            return 1.0 / index

    return 0.0


def recall_at_k(
    ranked_document_ids,
    relevant_document_ids,
    k,
):
    relevant = set(relevant_document_ids)

    retrieved = set(
        ranked_document_ids[:k]
    )

    return (
        1.0
        if retrieved.intersection(relevant)
        else 0.0
    )


def run_vector(
    db,
    query,
):
    results = VectorSearchService.search(
        db=db,
        query=query,
        user_id=USER_ID,
        limit=10,
        document_id=None,
    )

    return [
        chunk.document_id
        for chunk, _distance in results
    ]


def run_bm25(
    db,
    query,
):
    results = BM25Service.search(
        db=db,
        query=query,
        user_id=USER_ID,
        limit=10,
        document_id=None,
    )

    return [
        chunk.document_id
        for chunk, _score in results
    ]


def evaluate_method(
    db,
    method_name,
    search_function,
):
    print()
    print("=" * 90)
    print(method_name)
    print("=" * 90)

    results_by_k = defaultdict(list)
    reciprocal_ranks = []

    for case in EVALUATION_CASES:

        ranked_documents = search_function(
            db,
            case["query"],
        )

        relevant_documents = set(
            case["relevant_document_ids"]
        )

        # Remove duplicate document IDs while
        # preserving ranking order.
        unique_ranked_documents = list(
            dict.fromkeys(
                ranked_documents
            )
        )

        rr = reciprocal_rank(
            unique_ranked_documents,
            relevant_documents,
        )

        reciprocal_ranks.append(rr)

        for k in TOP_K_VALUES:

            score = recall_at_k(
                unique_ranked_documents,
                relevant_documents,
                k,
            )

            results_by_k[k].append(
                score
            )

        print()
        print(
            f"{case['id']:12} | "
            f"expected={sorted(relevant_documents)} | "
            f"retrieved={unique_ranked_documents[:5]} | "
            f"RR={rr:.3f}"
        )

    print()
    print("-" * 90)

    for k in TOP_K_VALUES:

        score = mean(
            results_by_k[k]
        )

        print(
            f"Recall@{k:<2}: "
            f"{score:.4f}"
        )

    print(
        f"MRR:       "
        f"{mean(reciprocal_ranks):.4f}"
    )

    return {
        "method": method_name,
        "recall": {
            k: mean(
                results_by_k[k]
            )
            for k in TOP_K_VALUES
        },
        "mrr": mean(
            reciprocal_ranks
        ),
    }


def main():

    db = SessionLocal()

    try:

        documents = (
            db.query(Document)
            .filter(
                Document.user_id == USER_ID
            )
            .order_by(Document.id)
            .all()
        )

        print("=" * 90)
        print("DASAIKO RETRIEVAL BASELINE")
        print("=" * 90)

        print()
        print(
            f"Evaluation user: {USER_ID}"
        )

        print(
            f"Documents: {len(documents)}"
        )

        for document in documents:

            print(
                f"  {document.id} | "
                f"{document.title}"
            )

        vector_results = evaluate_method(
            db=db,
            method_name="VECTOR SEARCH",
            search_function=run_vector,
        )

        # Reset BM25 explicitly so this run
        # always starts from the fresh corpus.
        BM25Service.bm25 = None
        BM25Service.indexed_chunks = []
        BM25Service.indexed_document_id = None
        BM25Service.indexed_user_id = None

        bm25_results = evaluate_method(
            db=db,
            method_name="BM25 SEARCH",
            search_function=run_bm25,
        )

        print()
        print("=" * 90)
        print("FINAL COMPARISON")
        print("=" * 90)

        for result in (
            vector_results,
            bm25_results,
        ):

            print()
            print(
                result["method"]
            )

            print(
                f"Recall@1:  "
                f"{result['recall'][1]:.4f}"
            )

            print(
                f"Recall@3:  "
                f"{result['recall'][3]:.4f}"
            )

            print(
                f"Recall@5:  "
                f"{result['recall'][5]:.4f}"
            )

            print(
                f"Recall@10: "
                f"{result['recall'][10]:.4f}"
            )

            print(
                f"MRR:        "
                f"{result['mrr']:.4f}"
            )

    finally:

        db.close()


if __name__ == "__main__":
    main()