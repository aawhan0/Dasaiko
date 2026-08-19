from functools import lru_cache
import os

import requests


MODEL_NAME = "BAAI/bge-reranker-v2-m3"
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
            "cross-encoder/ms-marco-MiniLM-L-6-v2",
            device="cpu",
        )

    @staticmethod
    def _rerank_remote(query: str, results: list, limit: int):
        """Rerank candidates using Hugging Face Inference Providers."""
        token = os.getenv("HF_TOKEN")
        if not token:
            raise RuntimeError("HF_TOKEN is required for remote reranking")

        pairs = [
            {"text": query, "text_pair": chunk.content}
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
                "parameters": {"function_to_apply": "sigmoid"},
            },
            timeout=60,
        )
        response.raise_for_status()

        outputs = response.json()

        # Hugging Face's text-classification pipeline can return the batched
        # results in either of these shapes:
        #
        #   [ {"label": "LABEL_0", "score": ...}, ... ]
        #   [ [ {"label": "LABEL_0", "score": ...}, ... ] ]
        #
        # With the current router/model combination, the second shape is
        # returned: one outer item containing one score per input pair.
        if (
            isinstance(outputs, list)
            and len(outputs) == 1
            and isinstance(outputs[0], list)
            and len(outputs[0]) == len(results)
        ):
            outputs = outputs[0]

        if not isinstance(outputs, list) or len(outputs) != len(results):
            raise RuntimeError(
                f"Unexpected Hugging Face reranker response: {outputs}"
            )

        scored = []
        for (chunk, _), output in zip(results, outputs):
            # Some providers return a list of labels for one input. For the
            # BGE reranker endpoint we want the single LABEL_0 score.
            if isinstance(output, list):
                if not output:
                    raise RuntimeError("Empty Hugging Face reranker response")

                label_output = next(
                    (
                        item
                        for item in output
                        if isinstance(item, dict)
                        and item.get("label") == "LABEL_0"
                    ),
                    output[0],
                )
                score = label_output["score"]
            elif isinstance(output, dict) and "score" in output:
                score = output["score"]
            else:
                raise RuntimeError(
                    f"Unexpected reranker item: {output}"
                )

            scored.append((chunk, float(score)))

        scored.sort(key=lambda item: item[1], reverse=True)
        return scored[:limit]

    @staticmethod
    def rerank(query: str, results: list, limit: int = 5):
        if not results:
            return []

        provider = os.getenv("RERANKER_PROVIDER", "remote").lower()

        try:
            if provider == "remote":
                return RerankerService._rerank_remote(query, results, limit)

            if provider == "local":
                pairs = [(query, chunk.content) for chunk, _ in results]
                model = RerankerService.get_model()
                scores = model.predict(pairs)
                reranked = sorted(
                    zip([chunk for chunk, _ in results], scores),
                    key=lambda item: float(item[1]),
                    reverse=True,
                )
                return [
                    (chunk, float(score))
                    for chunk, score in reranked[:limit]
                ]

            raise ValueError(f"Unsupported RERANKER_PROVIDER: {provider}")

        except Exception:
            import traceback
            print("\n========== RERANKER ERROR ==========")
            traceback.print_exc()
            print("====================================\n")
            raise
