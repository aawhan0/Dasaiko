from functools import lru_cache

from sentence_transformers import CrossEncoder


MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"


class RerankerService:

    @staticmethod
    @lru_cache(maxsize=1)
    def get_model() -> CrossEncoder:
        """
        Load the reranker only when reranking is actually required.

        The model is cached after the first load so subsequent
        reranking requests reuse the same instance.
        """

        return CrossEncoder(
            MODEL_NAME,
            device="cpu",
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
                (
                    query,
                    chunk.content,
                )
                for chunk, _ in results
            ]


            model = (
                RerankerService.get_model()
            )


            scores = model.predict(
                pairs,
            )


            reranked = sorted(
                zip(
                    [
                        chunk
                        for chunk, _ in results
                    ],
                    scores,
                ),
                key=lambda item:
                    float(item[1]),
                reverse=True,
            )


            return [
                (
                    chunk,
                    float(score),
                )
                for chunk, score
                in reranked[:limit]
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