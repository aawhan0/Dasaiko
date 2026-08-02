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
        vector_results = VectorSearchService.search(
            db=db,
            query=query,
            limit=limit,
        )

        bm25_results = BM25Service.search(
            db=db,
            query=query,
            limit=limit,
        )

        combined = {}

        for chunk, score in vector_results:
            combined[chunk.id] = (chunk, float(score))

        for chunk, score in bm25_results:
            if chunk.id not in combined:
                combined[chunk.id] = (chunk, float(score))


        combined_results = list(combined.values())

        reranked_results = RerankerService.rerank(
            query=query,
            results=combined_results,
            limit=limit,
        )

        return reranked_results