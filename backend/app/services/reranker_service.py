from sentence_transformers import CrossEncoder


class RerankerService:

    model = CrossEncoder(
        "cross-encoder/ms-marco-MiniLM-L-6-v2"
    )

    @staticmethod
    def rerank(
        query: str,
        results: list,
        limit: int = 5,
    ):

        pairs = [
            (query, chunk.content)
            for chunk, _ in results
        ]

        scores = RerankerService.model.predict(pairs)

        reranked = sorted(
            zip(results, scores),
            key=lambda x: x[1],
            reverse=True,
        )

        return [
            result
            for result, _ in reranked[:limit]
        ]