from sentence_transformers import SentenceTransformer

model = SentenceTransformer(
    "all-MiniLM-L6-v2",
    local_files_only=True,
)
def generate_embedding(text: str) -> list[float]:
    return model.encode(text).tolist()