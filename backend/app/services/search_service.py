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

        # ----------------------------------------
        # Vector Search
        # ----------------------------------------
        vector_results = VectorSearchService.search(
            db=db,
            query=query,
            limit=limit,
        )

        # ----------------------------------------
        # BM25 Search
        # ----------------------------------------
        bm25_results = BM25Service.search(
            db=db,
            query=query,
            limit=limit,
        )

        # ----------------------------------------
        # Merge Results
        # ----------------------------------------
        combined = {}

        for chunk, score in vector_results:

            if chunk is None:
                continue

            combined[chunk.id] = (
                chunk,
                float(score),
            )

        for chunk, score in bm25_results:

            if chunk is None:
                continue

            if chunk.id not in combined:

                combined[chunk.id] = (
                    chunk,
                    float(score),
                )

        combined_results = list(
            combined.values()
        )

        if not combined_results:
            return []

        # ----------------------------------------
        # Rerank
        # ----------------------------------------
        reranked_results = (
            RerankerService.rerank(
                query=query,
                results=combined_results,
                limit=limit,
            )
        )

        # ----------------------------------------
        # Return page-aware metadata
        # ----------------------------------------
        final_results = []

        for chunk, score in reranked_results:

            final_results.append(
                {
                    "id": chunk.id,

                    "document_id": chunk.document_id,

                    "document_name": chunk.document.title,

                    "chunk_index": chunk.chunk_index,

                    "page_number": chunk.page_number,

                    "page_width": chunk.page_width,

                    "page_height": chunk.page_height,

                    "bboxes": chunk.bboxes,

                    "score": score,

                    "preview": chunk.content,

                    "chunk": chunk,
                }
            )

        print("========== SEARCH END ==========\n")

        return final_results
