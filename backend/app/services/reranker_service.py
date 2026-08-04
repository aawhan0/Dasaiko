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
        try:
            print("Building pairs...")

            pairs = [
                (query, chunk.content)
                for chunk, _ in results
            ]

            print(f"Built {len(pairs)} pairs")

            print("Calling CrossEncoder.predict()...")

            scores = RerankerService.model.predict(pairs)

            print(f"Received {len(scores)} scores")

            reranked = sorted(
                zip(results, scores),
                key=lambda x: x[1],
                reverse=True,
            )

            print("Sorting complete")

            return [
                result
                for result, _ in reranked[:limit]
            ]

        except Exception as e:
            print("\n========== RERANKER ERROR ==========")
            import traceback
            traceback.print_exc()
            print("====================================\n")
            raise