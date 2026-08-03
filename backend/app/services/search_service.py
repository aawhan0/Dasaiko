from sqlalchemy.orm import Session

from app.services.bm25_service import BM25Service
from app.services.vector_search_service import VectorSearchService
from app.services.reranker_service import RerankerService


class SearchService:

    @staticmethod
    def search(
        db: Session,
        query: str,
        limit: int = 5,
    ):
        print("\n========== SEARCH START ==========")

        print("1. Running Vector Search...")
        vector_results = VectorSearchService.search(
            db=db,
            query=query,
            limit=limit,
        )
        print(f"✓ Vector Search returned {len(vector_results)} results")

        print("2. Running BM25 Search...")
        bm25_results = BM25Service.search(
            db=db,
            query=query,
            limit=limit,
        )
        print(f"✓ BM25 Search returned {len(bm25_results)} results")

        print("3. Merging results...")

        combined = {}

        for chunk, score in vector_results:
            combined[chunk.id] = (
                chunk,
                float(score),
            )

        for chunk, score in bm25_results:
            if chunk.id not in combined:
                combined[chunk.id] = (
                    chunk,
                    float(score),
                )

        combined_results = list(combined.values())

        print(
            f"✓ Combined into {len(combined_results)} unique chunks"
        )

        print("4. Starting reranker...")

        reranked_results = RerankerService.rerank(
            query=query,
            results=combined_results,
            limit=limit,
        )

        print(
            f"✓ Reranker returned {len(reranked_results)} results"
        )

        print("========== SEARCH END ==========\n")

        return reranked_results