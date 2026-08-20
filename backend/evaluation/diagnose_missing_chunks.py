from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.services.vector_search_service import VectorSearchService
from app.services.bm25_service import BM25Service


SessionLocal = sessionmaker(bind=engine)


cases = [
    (
        "glove_02",
        "How does GloVe use word co-occurrence statistics?",
        16,
    ),
    (
        "glove_04",
        "What happens to GloVe performance when the training corpus becomes much larger?",
        1179,
    ),
]


db = SessionLocal()


try:
    for name, query, target in cases:

        print()
        print("=" * 80)
        print(name)
        print("=" * 80)

        print("TARGET:", target)
        print("QUERY :", query)

        # ========================================
        # VECTOR SEARCH
        # ========================================

        vector_results = VectorSearchService.search(
            db=db,
            query=query,
            user_id=1,
            limit=100,
        )

        vector_ids = [
            item[0].id
            for item in vector_results
            if item and item[0] is not None
        ]

        if target in vector_ids:
            vector_rank = (
                vector_ids.index(target)
                + 1
            )
        else:
            vector_rank = None

        print(
            "VECTOR:",
            vector_rank
            if vector_rank is not None
            else "NOT FOUND",
        )

        # ========================================
        # BM25 SEARCH
        # ========================================

        bm25_results = BM25Service.search(
            db=db,
            query=query,
            user_id=1,
            limit=100,
        )

        bm25_ids = [
            item[0].id
            for item in bm25_results
            if item and item[0] is not None
        ]

        if target in bm25_ids:
            bm25_rank = (
                bm25_ids.index(target)
                + 1
            )
        else:
            bm25_rank = None

        print(
            "BM25  :",
            bm25_rank
            if bm25_rank is not None
            else "NOT FOUND",
        )

finally:

    db.close()

print()
print("=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80)
