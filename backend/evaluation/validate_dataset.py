from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.models.chunk import Chunk

from evaluation.datasets.retrieval_cases import EVALUATION_CASES


SessionLocal = sessionmaker(bind=engine)


def main():
    db = SessionLocal()

    try:
        print("=" * 100)
        print("DASAIKO RETRIEVAL DATASET VALIDATION")
        print("=" * 100)

        all_valid = True

        for case in EVALUATION_CASES:
            print()
            print("=" * 100)
            print(f"{case['id']}")
            print(f"QUERY: {case['query']}")
            print(f"CATEGORY: {case['category']}")
            print("-" * 100)

            chunks = (
                db.query(Chunk)
                .filter(
                    Chunk.id.in_(
                        case["relevant_chunk_ids"]
                    )
                )
                .all()
            )

            found_ids = {
                chunk.id
                for chunk in chunks
            }

            expected_ids = set(
                case["relevant_chunk_ids"]
            )

            missing_ids = (
                expected_ids - found_ids
            )

            wrong_documents = [
                chunk
                for chunk in chunks
                if chunk.document_id
                not in case["relevant_document_ids"]
            ]

            if missing_ids:
                all_valid = False

                print(
                    "❌ MISSING CHUNKS:",
                    sorted(missing_ids),
                )

            if wrong_documents:
                all_valid = False

                print(
                    "❌ WRONG DOCUMENT:",
                    [
                        (
                            chunk.id,
                            chunk.document_id,
                        )
                        for chunk in wrong_documents
                    ],
                )

            if not missing_ids and not wrong_documents:
                print("✅ Chunk references valid")

            for chunk in sorted(
                chunks,
                key=lambda item: item.id,
            ):
                preview = (
                    chunk.content
                    .replace("\n", " ")
                    .strip()
                )

                if len(preview) > 700:
                    preview = (
                        preview[:700]
                        + "..."
                    )

                print()
                print(
                    f"DB ID: {chunk.id} | "
                    f"Document: {chunk.document_id} | "
                    f"Chunk: {chunk.chunk_index} | "
                    f"Page: {chunk.page_number}"
                )

                print(preview)

        print()
        print("=" * 100)

        if all_valid:
            print(
                "✅ DATASET VALIDATION PASSED"
            )
            print(
                f"Validated {len(EVALUATION_CASES)} cases."
            )
        else:
            print(
                "❌ DATASET VALIDATION FAILED"
            )
            print(
                "Fix the cases above before "
                "running retrieval evaluation."
            )

    finally:
        db.close()


if __name__ == "__main__":
    main()