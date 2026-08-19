_model = None


def get_model():
    """Load the embedding model only when embeddings are actually needed."""
    global _model

    if _model is None:
        # Keep sentence-transformers/PyTorch out of API startup memory.
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(
            "all-MiniLM-L6-v2",
            device="cpu",
        )

    return _model


def generate_embedding(text: str) -> list[float]:
    model = get_model()

    return model.encode(
        text,
        convert_to_numpy=True,
    ).tolist()
