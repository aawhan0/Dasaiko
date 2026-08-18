from sentence_transformers import SentenceTransformer


_model = None


def get_model() -> SentenceTransformer:
    global _model

    if _model is None:
        _model = SentenceTransformer(
            "all-MiniLM-L6-v2",
            local_files_only=True,
            device="cpu",
        )

    return _model


def generate_embedding(text: str) -> list[float]:
    model = get_model()

    return model.encode(
        text,
        convert_to_numpy=True,
    ).tolist()