from sqlalchemy.orm import Session

from app.models.chunk import Chunk
from app.models.embedding import Embedding

from app.services.embedding_service import generate_embedding


class VectorSearchService:

    @staticmethod
    def search(
        db: Session,
        query: str,
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
        )

        # -----------------------------------------
        # Optional document filter
        # -----------------------------------------
        #
        # If the user explicitly selected a paper,
        # only retrieve chunks from that paper.
        #
        # If document_id is None, search everything
        # exactly as before.
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