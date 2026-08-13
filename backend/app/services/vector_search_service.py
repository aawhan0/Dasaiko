from sqlalchemy.orm import Session

from app.models.chunk import Chunk
from app.models.document import Document
from app.models.embedding import Embedding

from app.services.embedding_service import generate_embedding


class VectorSearchService:

    @staticmethod
    def search(
        db: Session,
        query: str,
        user_id: int,
        limit: int = 5,
        document_id: int | None = None,
    ):

        query_embedding = generate_embedding(
            query
        )

        query_builder = (
            db.query(
                Chunk,
                Embedding.embedding
                .cosine_distance(
                    query_embedding
                )
                .label("distance"),
            )
            .join(
                Embedding,
                Chunk.id == Embedding.chunk_id,
            )
            .join(
                Document,
                Chunk.document_id == Document.id,
            )
            .filter(
                Document.user_id == user_id
            )
        )

        # -----------------------------------------
        # Optional document filter
        # -----------------------------------------

        if document_id is not None:

            query_builder = query_builder.filter(
                Chunk.document_id == document_id
            )

        return (
            query_builder
            .order_by(
                Embedding.embedding.cosine_distance(
                    query_embedding
                )
            )
            .limit(limit)
            .all()
        )
