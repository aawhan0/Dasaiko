from functools import lru_cache

from app.core.config import settings


LOCAL_MODEL_NAME = "all-MiniLM-L6-v2"
EXPECTED_DIMENSION = 384


@lru_cache(maxsize=1)
def get_remote_client():
    """Create the remote inference client only when embeddings are needed."""
    if not settings.hf_token:
        raise RuntimeError(
            "HF_TOKEN is required when EMBEDDING_PROVIDER=remote."
        )

    from huggingface_hub import InferenceClient

    return InferenceClient(
        provider="hf-inference",
        api_key=settings.hf_token,
    )


@lru_cache(maxsize=1)
def get_local_model():
    """Load the local embedding model only when local embeddings are needed."""
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(
        LOCAL_MODEL_NAME,
        device="cpu",
    )


def _validate_embedding(embedding) -> list[float]:
    vector = [float(value) for value in embedding]

    if len(vector) != EXPECTED_DIMENSION:
        raise RuntimeError(
            "Embedding provider returned an unexpected vector dimension: "
            f"expected {EXPECTED_DIMENSION}, got {len(vector)}."
        )

    return vector


def generate_embedding(text: str) -> list[float]:
    """
    Generate one embedding using the configured provider.

    Production can use Hugging Face remote inference so the Render API
    process never loads PyTorch/SentenceTransformer into its 512 MB memory.
    Local development can continue using SentenceTransformer directly.
    """
    provider = settings.embedding_provider.lower().strip()

    if provider == "remote":
        client = get_remote_client()
        result = client.feature_extraction(
            text,
            model=settings.embedding_model,
        )

        return _validate_embedding(result)

    if provider == "local":
        model = get_local_model()
        result = model.encode(
            text,
            convert_to_numpy=True,
        )

        return _validate_embedding(result.tolist())

    raise RuntimeError(
        "Unsupported EMBEDDING_PROVIDER: "
        f"{settings.embedding_provider}. "
        "Use 'local' or 'remote'."
    )
