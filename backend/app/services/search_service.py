from sqlalchemy.orm import Session

from app.models.chunk import Chunk
from app.models.embedding import Embedding
from app.services.embedding_service import generate_embedding


class SearchService:

    @staticmethod
    def search(
        db: Session,
        query: str,
        limit: int = 5,
    ):
        query_embedding = generate_embedding(query)

        results = (
            db.query(
                Chunk,
                Embedding.embedding
                .cosine_distance(query_embedding)
                .label("distance"),
            )
            .join(
                Embedding,
                Chunk.id == Embedding.chunk_id,
            )
            .join(
                Chunk.document,
            )
            .order_by("distance")
            .limit(limit)
            .all()
        )

        return results