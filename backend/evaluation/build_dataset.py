from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.models.chunk import Chunk
from app.models.document import Document


SessionLocal = sessionmaker(bind=engine)


# ============================================================
# CURRENT DASAiKO EVALUATION QUERIES
# ============================================================

EVALUATION_QUERIES = {
    3: [
        "How does scaled dot-product attention work?",
        "Why does the Transformer use multi-head attention?",
        "Why does the Transformer remove recurrence?",
        "What advantage does the Transformer gain from removing recurrence?",
        "What translation performance does the Transformer achieve?",
    ],

    4: [
        "What problem does attention solve in neural machine translation?",
        "How does the attention model compute the context vector?",
        "Why does attention help the encoder-decoder translate long sentences?",
        "Why is soft alignment useful for translating phrases?",
    ],

    2: [
        "How does the Skip-gram model learn word representations?",
        "How does hierarchical softmax reduce the computational cost of softmax?",
        "Why does the Skip-gram paper use a Huffman tree?",
        "What do the phrase analogy experiments demonstrate about Skip-gram representations?",
    ],

    5: [
        "What is the main idea behind GloVe?",
        "How does GloVe use word co-occurrence statistics?",
        "How does GloVe relate to prediction-based word-vector models such as skip-gram?",
        "What happens to GloVe performance when the training corpus becomes much larger?",
    ],

    1: [
        "Why are sequences challenging for standard feedforward neural networks?",
        "How does the LSTM encoder-decoder model represent an input sequence?",
        "How does beam search generate translations in the sequence-to-sequence model?",
    ],
}


def print_document_summary(db):
    print()
    print("=" * 100)
    print("CURRENT EVALUATION DOCUMENTS")
    print("=" * 100)

    documents = (
        db.query(Document)
        .order_by(Document.id)
        .all()
    )

    for document in documents:
        chunk_count = (
            db.query(Chunk)
            .filter(
                Chunk.document_id == document.id
            )
            .count()
        )

        print(
            f"ID={document.id} | "
            f"Title={document.title} | "
            f"File={document.file_name} | "
            f"Chunks={chunk_count}"
        )

    print("=" * 100)


def main():

    db = SessionLocal()

    try:

        print_document_summary(db)

        for document_id, queries in EVALUATION_QUERIES.items():

            document = (
                db.query(Document)
                .filter(
                    Document.id == document_id
                )
                .first()
            )

            if document is None:

                print()
                print(
                    f"WARNING: Document {document_id} "
                    f"does not exist."
                )

                continue

            print()
            print("=" * 100)
            print(
                f"DOCUMENT {document.id}: "
                f"{document.title}"
            )
            print("=" * 100)

            chunks = (
                db.query(Chunk)
                .filter(
                    Chunk.document_id == document_id
                )
                .order_by(
                    Chunk.chunk_index
                )
                .all()
            )

            for query in queries:

                terms = {
                    word.lower().strip(".,?!:;()[]{}\"'")
                    for word in query.split()
                    if len(word) >= 4
                }

                scored = []

                for chunk in chunks:

                    content = (
                        chunk.content
                        .lower()
                    )

                    score = sum(
                        1
                        for term in terms
                        if term in content
                    )

                    if score > 0:

                        scored.append(
                            (
                                score,
                                chunk,
                            )
                        )

                scored.sort(
                    key=lambda item: item[0],
                    reverse=True,
                )

                print()
                print(
                    f"QUERY: {query}"
                )

                print("-" * 100)

                if not scored:

                    print(
                        "No keyword matches found."
                    )

                    continue

                for rank, (score, chunk) in enumerate(
                    scored[:5],
                    start=1,
                ):

                    print()
                    print(
                        f"[{rank}] "
                        f"Score={score} | "
                        f"Chunk ID={chunk.id} | "
                        f"Chunk Index={chunk.chunk_index} | "
                        f"Page={chunk.page_number}"
                    )

                    print("-" * 80)

                    # IMPORTANT:
                    # Print the FULL chunk.
                    # Do NOT truncate it.
                    print(
                        chunk.content
                    )

                    print("-" * 80)

    finally:

        db.close()


if __name__ == "__main__":
    main()