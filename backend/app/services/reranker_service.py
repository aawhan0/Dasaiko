from functools import lru_cache
import os
import traceback

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
        """
        Load the local reranker only when explicitly requested.

        Local reranking is optional because Render's free instance
        should not have to load the CrossEncoder model into memory.
        """
        from sentence_transformers import CrossEncoder

        return CrossEncoder(
            "cross-encoder/ms-marco-MiniLM-L-6-v2",
            device="cpu",
        )

    @staticmethod
    def _rerank_remote(
        query: str,
        results: list,
        limit: int,
    ):
        """
        Rerank candidates using Hugging Face Inference Providers.
        """

        token = os.getenv("HF_TOKEN")

        if not token:
            raise RuntimeError(
                "HF_TOKEN is required for remote reranking"
            )

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
                    "function_to_apply": "sigmoid"
                },
            },
            timeout=60,
        )

        response.raise_for_status()

        outputs = response.json()

        # ---------------------------------------------------------
        # Hugging Face response normalization
        #
        # Possible shapes:
        #
        # [
        #     {"label": "LABEL_0", "score": 0.91},
        #     ...
        # ]
        #
        # OR:
        #
        # [
        #     [
        #         {"label": "LABEL_0", "score": 0.91},
        #         ...
        #     ]
        # ]
        # ---------------------------------------------------------

        if (
            isinstance(outputs, list)
            and len(outputs) == 1
            and isinstance(outputs[0], list)
            and len(outputs[0]) == len(results)
        ):
            outputs = outputs[0]

        if (
            not isinstance(outputs, list)
            or len(outputs) != len(results)
        ):
            raise RuntimeError(
                "Unexpected Hugging Face reranker response: "
                f"{outputs}"
            )

        scored = []

        for (chunk, original_score), output in zip(
            results,
            outputs,
        ):

            # Some providers return multiple labels
            # for one input.
            if isinstance(output, list):

                if not output:
                    raise RuntimeError(
                        "Empty Hugging Face reranker response"
                    )

                label_output = next(
                    (
                        item
                        for item in output
                        if (
                            isinstance(item, dict)
                            and item.get("label")
                            == "LABEL_0"
                        )
                    ),
                    output[0],
                )

                if (
                    not isinstance(label_output, dict)
                    or "score" not in label_output
                ):
                    raise RuntimeError(
                        "Invalid Hugging Face reranker item: "
                        f"{label_output}"
                    )

                score = label_output["score"]

            elif (
                isinstance(output, dict)
                and "score" in output
            ):

                score = output["score"]

            else:

                raise RuntimeError(
                    "Unexpected reranker item: "
                    f"{output}"
                )

            scored.append(
                (
                    chunk,
                    float(score),
                )
            )

        scored.sort(
            key=lambda item: item[1],
            reverse=True,
        )

        return scored[:limit]

    @staticmethod
    def _rerank_local(
        query: str,
        results: list,
        limit: int,
    ):
        """
        Rerank candidates locally using CrossEncoder.
        """

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

    @staticmethod
    def _fallback(
        results: list,
        limit: int,
    ):
        """
        Fallback to the existing hybrid-search ranking.

        SearchService already provides an ordered list of
        candidates. If the optional reranker is unavailable,
        we preserve that ranking rather than failing the
        entire chat request.
        """

        print(
            "⚠ Reranker unavailable."
        )

        print(
            "⚠ Falling back to hybrid-search ranking."
        )

        return [
            (
                chunk,
                float(score),
            )
            for chunk, score in results[:limit]
        ]

    @staticmethod
    def rerank(
        query: str,
        results: list,
        limit: int = 5,
    ):
        """
        Rerank search results.

        Reranking is an optimization layer, not a hard
        dependency for the chat system.

        If remote/local reranking fails, return the original
        hybrid-search ordering instead of crashing the
        entire RAG pipeline.
        """

        if not results:
            return []

        provider = (
            os.getenv(
                "RERANKER_PROVIDER",
                "remote",
            )
            .strip()
            .lower()
        )

        try:

            if provider == "remote":

                return RerankerService._rerank_remote(
                    query=query,
                    results=results,
                    limit=limit,
                )

            if provider == "local":

                return RerankerService._rerank_local(
                    query=query,
                    results=results,
                    limit=limit,
                )

            raise ValueError(
                f"Unsupported RERANKER_PROVIDER: "
                f"{provider}"
            )

        except Exception as exc:

            print(
                "\n========== RERANKER ERROR =========="
            )

            print(
                f"Provider: {provider}"
            )

            print(
                f"Error: {exc}"
            )

            traceback.print_exc()

            print(
                "====================================\n"
            )

            return RerankerService._fallback(
                results=results,
                limit=limit,
            )