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

        # ---------------------------------------------------
        # Vector Search
        # ---------------------------------------------------
        print("1. Running Vector Search...")

        vector_results = VectorSearchService.search(
            db=db,
            query=query,
            limit=limit,
        )

        print(
            f"✓ Vector Search returned {len(vector_results)} results"
        )

        # ---------------------------------------------------
        # BM25 Search
        # ---------------------------------------------------
        print("2. Running BM25 Search...")

        bm25_results = BM25Service.search(
            db=db,
            query=query,
            limit=limit,
        )

        print(
            f"✓ BM25 Search returned {len(bm25_results)} results"
        )

        # ---------------------------------------------------
        # Merge Results
        # ---------------------------------------------------
        print("3. Merging results...")

        combined = {}

        print("\n========== VECTOR RESULTS ==========")

        for index, result in enumerate(vector_results):
            try:
                print(f"[{index}] {type(result)}")

                chunk, score = result

                if chunk is None:
                    print("⚠ Skipping None chunk")
                    continue

                combined[chunk.id] = (
                    chunk,
                    float(score),
                )

            except Exception as e:
                print(
                    f"❌ Vector Result #{index} failed:"
                )
                print(result)
                raise

        print("====================================")

        print("\n========== BM25 RESULTS ==========")

        for index, result in enumerate(bm25_results):
            try:
                print(f"[{index}] {type(result)}")

                chunk, score = result

                if chunk is None:
                    print("⚠ Skipping None chunk")
                    continue

                if chunk.id not in combined:
                    combined[chunk.id] = (
                        chunk,
                        float(score),
                    )

            except Exception as e:
                print(
                    f"❌ BM25 Result #{index} failed:"
                )
                print(result)
                raise

        print("===================================")

        combined_results = list(combined.values())

        print(
            f"✓ Combined into {len(combined_results)} unique chunks"
        )

        # ---------------------------------------------------
        # Empty Search Protection
        # ---------------------------------------------------
        if len(combined_results) == 0:
            print("⚠ No search results found.")

            print("========== SEARCH END ==========\n")

            return []

        # ---------------------------------------------------
        # Reranker
        # ---------------------------------------------------
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