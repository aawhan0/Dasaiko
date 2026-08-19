import os
from functools import lru_cache

import requests


MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"
HF_RERANK_URL = (
    "https://router.huggingface.co/hf-inference/"
    f"models/{MODEL_NAME}/pipeline/text-classification"
)


class RerankerService:

    @staticmethod
    @lru_cache(maxsize=1)
    def get_model():
        """Load the local reranker only when explicitly requested."""
        from sentence_transformers import CrossEncoder

        return CrossEncoder(
            MODEL_NAME,
            device="cpu",
        )

    @staticmethod
    def _rerank_remote(query: str, results: list, limit: int):
        token = os.getenv("HF_TOKEN")
        if not token:
            raise RuntimeError("HF_TOKEN is required for remote reranking")

        pairs = [
            {
                "text": query,
                "text_pair": chunk.content,
            }
            for chunk, _ in results
        ]

        response = requests.post(
            HF_RERANK_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "inputs": pairs,
                "parameters": {
                    "function_to_apply": "sigmoid",
                },
            },
            timeout=60,
        )
        response.raise_for_status()

        outputs = response.json()
        if not isinstance(outputs, list) or len(outputs) != len(results):
            raise RuntimeError("Unexpected Hugging Face reranker response")

        scored = []
        for (chunk, _), output in zip(results, outputs):
            if isinstance(output, list):
                if not output:
                    raise RuntimeError("Empty Hugging Face reranker response")
                score = output[0]["score"]
            else:
                score = output["score"]

            scored.append((chunk, float(score)))

        scored.sort(key=lambda item: item[1], reverse=True)
        return scored[:limit]

    @staticmethod
    def rerank(
        query: str,
        results: list,
        limit: int = 5,
    ):
        if not results:
            return []

        try:
            provider = os.getenv("RERANKER_PROVIDER", "remote").lower()

            if provider == "remote":
                return RerankerService._rerank_remote(
                    query,
                    results,
                    limit,
                )

            if provider == "local":
                pairs = [
                    (
                        query,
                        chunk.content,
                    )
                    for chunk, _ in results
                ]

                model = RerankerService.get_model()
                scores = model.predict(pairs)

                reranked = sorted(
                    zip(
                        [chunk for chunk, _ in results],
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

            raise ValueError(
                f"Unsupported RERANKER_PROVIDER: {provider}"
            )

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
