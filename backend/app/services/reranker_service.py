from functools import lru_cache
import os

import requests


MODEL_NAME = "BAAI/bge-reranker-v2-m3"
HF_RERANK_URL = "https://router.huggingface.co/hf-inference/models/BAAI/bge-reranker-v2-m3"


class RerankerService:

    @staticmethod
    @lru_cache(maxsize=1)
    def get_model():
        """Load the local reranker only when explicitly requested."""
        from sentence_transformers import CrossEncoder

        return CrossEncoder(
            "cross-encoder/ms-marco-MiniLM-L-6-v2",
            device="cpu",
        )

    @staticmethod
    def _rerank_remote(query: str, results: list, limit: int):
        """Rerank candidates using Hugging Face Inference Providers."""
        token = os.getenv("HF_TOKEN")
        if not token:
            raise RuntimeError("HF_TOKEN is required for remote reranking")

        ranked = []
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        for chunk, _ in results:
            # The HF text-classification API accepts one text input. For a
            # reranker, represent the query/document pair as a single input.
            # BGE reranker models are trained to score query/passage pairs.
            payload = {
                "inputs": {
                    "text": query,
                    "text_pair": chunk.content,
                }
            }

            response = requests.post(
                HF_RERANK_URL,
                headers=headers,
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            if isinstance(data, list) and data:
                first = data[0]
                score = float(first.get("score", 0.0))
            elif isinstance(data, dict) and "score" in data:
                score = float(data["score"])
            else:
                raise RuntimeError(
                    f"Unexpected reranker response: {data}"
                )

            ranked.append((chunk, score))

        ranked.sort(key=lambda item: item[1], reverse=True)
        return ranked[:limit]

    @staticmethod
    def rerank(
        query: str,
        results: list,
        limit: int = 5,
    ):
        if not results:
            return []

        provider = os.getenv("RERANKER_PROVIDER", "remote").lower()

        try:
            if provider == "local":
                pairs = [
                    (query, chunk.content)
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
                    (chunk, float(score))
                    for chunk, score in reranked[:limit]
                ]

            return RerankerService._rerank_remote(
                query=query,
                results=results,
                limit=limit,
            )

        except Exception:
            import traceback

            print("\n========== RERANKER ERROR ==========")
            traceback.print_exc()
            print("====================================\n")
            raise
