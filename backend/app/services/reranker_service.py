from sentence_transformers import CrossEncoder


class RerankerService:

    model = CrossEncoder(
        "cross-encoder/ms-marco-MiniLM-L-6-v2",
        local_files_only=True,
    )

    @staticmethod
    def rerank(
        query: str,
        results: list,
        limit: int = 5,
    ):
        if not results:
            return []

        try:
            pairs = [
                (query, chunk.content)
                for chunk, _ in results
            ]

            scores = RerankerService.model.predict(
                pairs
            )

            reranked = sorted(
                zip(
                    [
                        chunk
                        for chunk, _ in results
                    ],
                    scores,
                ),
                key=lambda item: float(item[1]),
                reverse=True,
            )

            return [
                (
                    chunk,
                    float(score),
                )
                for chunk, score in reranked[:limit]
            ]

        except Exception:
            import traceback

            print(
                "\n========== RERANKER ERROR =========="
            )

            traceback.print_exc()

            print(
                "====================================\n"
            )

            raise