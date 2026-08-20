from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.services.vector_search_service import (
    VectorSearchService,
)
from app.services.bm25_service import (
    BM25Service,
)


SessionLocal = sessionmaker(
    bind=engine,
)


CASES = [
    (
        "w2v_01",
        "How does the Skip-gram model learn word representations?",
        [588, 350, 266],
    ),
    (
        "w2v_02",
        "How does hierarchical softmax reduce the computational cost of softmax?",
        [190, 214, 183],
    ),
    (
        "w2v_03",
        "Why does the Skip-gram paper use a Huffman tree?",
        [190],
    ),
    (
        "glove_01",
        "What is the main idea behind GloVe?",
        [1651, 121],
    ),
    (
        "glove_02",
        "How does GloVe use word co-occurrence statistics?",
        [1651, 121, 58, 50, 16],
    ),
]


USER_ID = 1


def main():

    db = SessionLocal()

    try:

        print()
        print("=" * 100)
        print("DASAIKO RETRIEVAL DIAGNOSTIC")
        print("=" * 100)

        for case_id, query, relevant_ids in CASES:

            print()
            print("=" * 100)
            print(case_id)
            print("=" * 100)

            print()
            print("QUERY:")
            print(query)

            print()
            print("RELEVANT CHUNKS:")
            print(relevant_ids)

            # ====================================================
            # VECTOR SEARCH
            # ====================================================

            print()
            print("-" * 100)
            print("VECTOR SEARCH")
            print("-" * 100)

            vector_results = (
                VectorSearchService.search(
                    db=db,
                    query=query,
                    user_id=USER_ID,
                    limit=100,
                )
            )

            vector_ids = [
                result[0].id
                for result in vector_results
            ]

            vector_found = []

            for chunk_id in relevant_ids:

                if chunk_id in vector_ids:

                    rank = (
                        vector_ids.index(chunk_id)
                        + 1
                    )

                    vector_found.append(
                        (chunk_id, rank)
                    )

            print(
                "Relevant chunks found:"
            )

            if vector_found:

                for chunk_id, rank in vector_found:

                    print(
                        f"  Chunk {chunk_id}"
                        f" -> rank {rank}"
                    )

            else:

                print("  NONE")

            # ====================================================
            # BM25 SEARCH
            # ====================================================

            print()
            print("-" * 100)
            print("BM25 SEARCH")
            print("-" * 100)

            bm25_results = (
                BM25Service.search(
                    db=db,
                    query=query,
                    user_id=USER_ID,
                    limit=100,
                )
            )

            bm25_ids = [
                result[0].id
                for result in bm25_results
            ]

            bm25_found = []

            for chunk_id in relevant_ids:

                if chunk_id in bm25_ids:

                    rank = (
                        bm25_ids.index(chunk_id)
                        + 1
                    )

                    bm25_found.append(
                        (chunk_id, rank)
                    )

            print(
                "Relevant chunks found:"
            )

            if bm25_found:

                for chunk_id, rank in bm25_found:

                    print(
                        f"  Chunk {chunk_id}"
                        f" -> rank {rank}"
                    )

            else:

                print("  NONE")

            # ====================================================
            # SUMMARY
            # ====================================================

            print()
            print("-" * 100)
            print("SUMMARY")
            print("-" * 100)

            print(
                "Vector:"
            )

            if vector_found:

                print(
                    "  "
                    + ", ".join(
                        f"{chunk_id}@{rank}"
                        for chunk_id, rank
                        in vector_found
                    )
                )

            else:

                print("  NONE")

            print(
                "BM25:"
            )

            if bm25_found:

                print(
                    "  "
                    + ", ".join(
                        f"{chunk_id}@{rank}"
                        for chunk_id, rank
                        in bm25_found
                    )
                )

            else:

                print("  NONE")

    finally:

        db.close()


if __name__ == "__main__":

    main()