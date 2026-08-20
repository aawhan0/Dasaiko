from dotenv import load_dotenv

load_dotenv()

from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.services.search_service import SearchService


SessionLocal = sessionmaker(bind=engine)

USER_ID = 1


QUERIES = [
    (
        "attn",
        "How does scaled dot-product attention work?",
    ),
    (
        "seq",
        "How does beam search generate translations in the sequence-to-sequence model?",
    ),
    (
        "glove",
        "How does GloVe use word co-occurrence statistics?",
    ),
    (
        "dpr",
        "How does dense passage retrieval differ from BM25?",
    ),
    (
        "word2vec",
        "How does hierarchical softmax reduce the computational cost of softmax?",
    ),
]


def main():

    db = SessionLocal()

    try:

        print("=" * 90)
        print("DASAIKO PRODUCTION SEARCH DIAGNOSTIC")
        print("=" * 90)

        for name, query in QUERIES:

            print()
            print("=" * 90)
            print(f"QUERY: {name}")
            print(query)
            print("=" * 90)

            results = SearchService.search(
                db=db,
                query=query,
                user_id=USER_ID,
                limit=5,
                document_id=None,
            )

            print()
            print("FINAL DOCUMENT RANKING:")

            seen_documents = set()

            for index, result in enumerate(
                results,
                start=1,
            ):

                document_id = result[
                    "document_id"
                ]

                if document_id in seen_documents:
                    continue

                seen_documents.add(
                    document_id
                )

                print(
                    f"{index}. "
                    f"Document {document_id} | "
                    f"{result['document_name']} | "
                    f"Chunk {result['id']} | "
                    f"Page {result['page_number']} | "
                    f"Score {result['score']:.4f}"
                )

    finally:

        db.close()


if __name__ == "__main__":
    main()