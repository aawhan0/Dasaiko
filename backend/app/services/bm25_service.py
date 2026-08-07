from rank_bm25 import BM25Okapi
from sqlalchemy.orm import Session

from app.models.chunk import Chunk


class BM25Service:

    bm25 = None

    indexed_chunks = []

    @staticmethod
    def search(
        db: Session,
        query: str,
        limit: int = 5,
    ):
        if BM25Service.bm25 is None:
            print("Building BM25 Index...")
            BM25Service.build_index(db)
            print(
                f"✓ Indexed {len(BM25Service.indexed_chunks)} chunks"
            )

        query_tokens = query.lower().split()

        scores = BM25Service.bm25.get_scores(
            query_tokens
        )

        ranked = sorted(
            zip(BM25Service.indexed_chunks, scores),
            key=lambda x: x[1],
            reverse=True,
        )

        top_results = []

        print("\n========== BM25 RESULTS ==========")

        for item, score in ranked[:limit]:

            chunk = (
                db.query(Chunk)
                .filter(Chunk.id == item["id"])
                .first()
            )

            if chunk is None:
                continue

            print(
                f"Chunk {chunk.id} | "
                f"Score {float(score):.4f}"
            )

            top_results.append(
                (
                    chunk,
                    float(score),
                )
            )

        print("=================================\n")

        return top_results

    @staticmethod
    def build_index(
        db: Session,
    ):

        chunks = db.query(Chunk).all()

        BM25Service.indexed_chunks = []

        corpus = []

        for chunk in chunks:

            tokens = chunk.content.lower().split()

            BM25Service.indexed_chunks.append(
                {
                    "id": chunk.id,
                    "content": chunk.content,
                    "tokens": tokens,
                }
            )

            corpus.append(tokens)

        BM25Service.bm25 = BM25Okapi(corpus)