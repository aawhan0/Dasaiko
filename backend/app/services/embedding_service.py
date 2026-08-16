from functools import lru_cache

from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """
    Load the embedding model only when it is actually needed.

    The model is cached after the first load so subsequent
    embedding requests reuse the same instance.
    """

    return SentenceTransformer(
        MODEL_NAME,
        device="cpu",
    )


def generate_embedding(
    text: str,
) -> list[float]:

    model = get_embedding_model()

    return model.encode(
        text,
        convert_to_numpy=True,
    ).tolist()