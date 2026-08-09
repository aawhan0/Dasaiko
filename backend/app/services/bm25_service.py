from rank_bm25 import BM25Okapi
from sqlalchemy.orm import Session

from app.models.chunk import Chunk


class BM25Service:

    bm25 = None

    indexed_chunks = []

    indexed_document_id = None

    @staticmethod
    def search(
        db: Session,
        query: str,
        limit: int = 5,
        document_id: int | None = None,
    ):

        # -----------------------------------------
        # Load chunks
        # -----------------------------------------

        query_builder = (
            db.query(Chunk)
            .order_by(Chunk.id)
        )

        # -----------------------------------------
        # Optional document filter
        # -----------------------------------------
        #
        # No document selected:
        #   Search all chunks.
        #
        # Document selected:
        #   Search only chunks belonging to
        #   that document.
        # -----------------------------------------

        if document_id is not None:

            query_builder = (
                query_builder.filter(
                    Chunk.document_id
                    == document_id
                )
            )

        chunks = (
            query_builder
            .all()
        )

        current_ids = {
            chunk.id
            for chunk in chunks
        }

        indexed_ids = {
            item["id"]
            for item in BM25Service.indexed_chunks
        }

        # -----------------------------------------
        # Rebuild index if necessary
        # -----------------------------------------
        #
        # We also compare document_id because:
        #
        # Paper A -> Paper B
        #
        # could otherwise reuse the old BM25 index.
        # -----------------------------------------

        if (
            BM25Service.bm25 is None
            or current_ids != indexed_ids
            or (
                BM25Service.indexed_document_id
                != document_id
            )
        ):

            print(
                "Building BM25 Index..."
            )

            BM25Service.build_index(
                db=db,
                chunks=chunks,
                document_id=document_id,
            )

            print(
                f"✓ Indexed "
                f"{len(chunks)} chunks"
            )

        # -----------------------------------------
        # No chunks available
        # -----------------------------------------

        if BM25Service.bm25 is None:

            return []

        # -----------------------------------------
        # Tokenize Query
        # -----------------------------------------

        query_tokens = (
            query
            .lower()
            .split()
        )

        # -----------------------------------------
        # Calculate BM25 scores
        # -----------------------------------------

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

        # -----------------------------------------
        # Chunk lookup
        # -----------------------------------------

        chunk_map = {
            chunk.id: chunk
            for chunk in chunks
        }

        print(
            "\n========== BM25 RESULTS =========="
        )

        # -----------------------------------------
        # Top results
        # -----------------------------------------

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
        chunks=None,
        document_id: int | None = None,
    ):

        # -----------------------------------------
        # Load chunks if not supplied
        # -----------------------------------------

        if chunks is None:

            query_builder = (
                db.query(Chunk)
                .order_by(Chunk.id)
            )

            if document_id is not None:

                query_builder = (
                    query_builder.filter(
                        Chunk.document_id
                        == document_id
                    )
                )

            chunks = (
                query_builder
                .all()
            )

        # -----------------------------------------
        # Reset index
        # -----------------------------------------

        BM25Service.indexed_chunks = []

        BM25Service.indexed_document_id = (
            document_id
        )

        corpus = []

        # -----------------------------------------
        # Build corpus
        # -----------------------------------------

        for chunk in chunks:

            tokens = (
                chunk.content
                .lower()
                .split()
            )

            BM25Service.indexed_chunks.append(
                {
                    "id": chunk.id,

                    "content":
                        chunk.content,

                    "tokens":
                        tokens,
                }
            )

            corpus.append(
                tokens
            )

        # -----------------------------------------
        # Empty corpus
        # -----------------------------------------

        if not corpus:

            BM25Service.bm25 = None

            return

        # -----------------------------------------
        # Build BM25 index
        # -----------------------------------------

        BM25Service.bm25 = BM25Okapi(
            corpus
        )