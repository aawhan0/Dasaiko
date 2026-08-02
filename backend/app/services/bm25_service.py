from rank_bm25 import BM25Okapi
from sqlalchemy.orm import Session

from app.models.chunk import Chunk


class BM25Service:

    bm25 = None
    chunks = []

    @staticmethod
    def search(
        db: Session,
        query: str,
        limit: int = 5,
    ):
        if BM25Service.bm25 is None:
            BM25Service.build_index(db)

        query_tokens = query.split()

        scores = BM25Service.bm25.get_scores(query_tokens)




        ranked = sorted(
            zip(BM25Service.chunks, scores),
            key=lambda x: x[1],
            reverse=True,
        )

        return ranked[:limit]


    @staticmethod
    def build_index(
        db: Session,
    ):
        BM25Service.chunks = db.query(Chunk).all()

        corpus = [
            chunk.content.split()
            for chunk in BM25Service.chunks
        ]

        BM25Service.bm25 = BM25Okapi(corpus)