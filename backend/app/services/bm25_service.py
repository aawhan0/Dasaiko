from rank_bm25 import BM25Okapi
from sqlalchemy.orm import Session

from app.models.chunk import Chunk
from app.models.document import Document


class BM25Service:

    bm25 = None

    indexed_chunks = []

    indexed_document_id = None

    indexed_user_id = None

    @staticmethod
    def search(
        db: Session,
        query: str,
        user_id: int,
        limit: int = 5,
        document_id: int | None = None,
    ):

        # -----------------------------------------
        # Load only chunks belonging to this user
        # -----------------------------------------

        query_builder = (
            db.query(Chunk)
            .join(
                Document,
                Chunk.document_id == Document.id,
            )
            .filter(
                Document.user_id == user_id
            )
            .order_by(Chunk.id)
        )

        if document_id is not None:

            query_builder = (
                query_builder.filter(
                    Chunk.document_id == document_id
                )
            )

        chunks = query_builder.all()

        current_ids = {
            chunk.id
            for chunk in chunks
        }

        indexed_ids = {
            item["id"]
            for item in BM25Service.indexed_chunks
        }

        # -----------------------------------------
        # Rebuild index when user/document scope
        # changes.
        # -----------------------------------------

        if (
            BM25Service.bm25 is None
            or current_ids != indexed_ids
            or (
                BM25Service.indexed_document_id
                != document_id
            )
            or (
                BM25Service.indexed_user_id
                != user_id
            )
        ):

            print(
                "Building BM25 Index..."
            )

            BM25Service.build_index(
                db=db,
                chunks=chunks,
                user_id=user_id,
                document_id=document_id,
            )

            print(
                f"Indexed {len(chunks)} chunks"
            )

        if BM25Service.bm25 is None:
            return []

        query_tokens = (
            query
            .lower()
            .split()
        )

        scores = (
            BM25Service.bm25
            .get_scores(
                query_tokens
            )
        )

        ranked = sorted(
            zip(
                BM25Service.indexed_chunks,
                scores,
            ),
            key=lambda item:
                float(item[1]),
            reverse=True,
        )

        top_results = []

        chunk_map = {
            chunk.id: chunk
            for chunk in chunks
        }

        print(
            "\n========== BM25 RESULTS =========="
        )

        for item, score in ranked[:limit]:

            chunk = chunk_map.get(
                item["id"]
            )

            if chunk is None:
                continue

            print(
                f"Chunk {chunk.id} | "
                f"Document {chunk.document_id} | "
                f"Score {float(score):.4f}"
            )

            top_results.append(
                (
                    chunk,
                    float(score),
                )
            )

        print(
            "=================================\n"
        )

        return top_results

    @staticmethod
    def build_index(
        db: Session,
        user_id: int,
        chunks=None,
        document_id: int | None = None,
    ):

        # -----------------------------------------
        # Load only this user's chunks if needed
        # -----------------------------------------

        if chunks is None:

            query_builder = (
                db.query(Chunk)
                .join(
                    Document,
                    Chunk.document_id == Document.id,
                )
                .filter(
                    Document.user_id == user_id
                )
                .order_by(Chunk.id)
            )

            if document_id is not None:

                query_builder = (
                    query_builder.filter(
                        Chunk.document_id
                        == document_id
                    )
                )

            chunks = query_builder.all()

        # -----------------------------------------
        # Reset index
        # -----------------------------------------

        BM25Service.indexed_chunks = []

        BM25Service.indexed_document_id = (
            document_id
        )

        BM25Service.indexed_user_id = (
            user_id
        )

        corpus = []

        for chunk in chunks:

            tokens = (
                chunk.content
                .lower()
                .split()
            )

            BM25Service.indexed_chunks.append(
                {
                    "id": chunk.id,
                    "content": chunk.content,
                    "tokens": tokens,
                }
            )

            corpus.append(tokens)

        if not corpus:

            BM25Service.bm25 = None

            return

        BM25Service.bm25 = BM25Okapi(
            corpus
        )
