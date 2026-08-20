from pathlib import Path

from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.models.document import Document
from app.models.chunk import Chunk
from app.models.embedding import Embedding


SessionLocal = sessionmaker(bind=engine)

DUPLICATE_DOCUMENT_IDS = [6, 7, 8]


def main():
    db = SessionLocal()

    deleted_files = []
    failed_files = []

    try:
        documents = (
            db.query(Document)
            .filter(
                Document.id.in_(
                    DUPLICATE_DOCUMENT_IDS
                )
            )
            .all()
        )

        if not documents:
            print(
                "No duplicate documents found."
            )
            return

        print("=" * 70)
        print("DASAIKO DUPLICATE DOCUMENT CLEANUP")
        print("=" * 70)

        print()

        for document in documents:
            print(
                f"Document {document.id}: "
                f"{document.title}"
            )

            print(
                f"  File: {document.file_path}"
            )

            chunk_count = (
                db.query(Chunk)
                .filter(
                    Chunk.document_id
                    == document.id
                )
                .count()
            )

            embedding_count = (
                db.query(Embedding)
                .join(
                    Chunk,
                    Embedding.chunk_id
                    == Chunk.id,
                )
                .filter(
                    Chunk.document_id
                    == document.id
                )
                .count()
            )

            print(
                f"  Chunks: {chunk_count}"
            )

            print(
                f"  Embeddings: "
                f"{embedding_count}"
            )

            print()

        print(
            "Deleting duplicate database records..."
        )

        # ----------------------------------------------------
        # Delete embeddings first
        # ----------------------------------------------------

        duplicate_chunks = (
            db.query(Chunk)
            .filter(
                Chunk.document_id.in_(
                    DUPLICATE_DOCUMENT_IDS
                )
            )
            .all()
        )

        chunk_ids = [
            chunk.id
            for chunk in duplicate_chunks
        ]

        if chunk_ids:
            deleted_embeddings = (
                db.query(Embedding)
                .filter(
                    Embedding.chunk_id.in_(
                        chunk_ids
                    )
                )
                .delete(
                    synchronize_session=False
                )
            )

            print(
                f"Deleted embeddings: "
                f"{deleted_embeddings}"
            )

        # ----------------------------------------------------
        # Delete chunks
        # ----------------------------------------------------

        deleted_chunks = (
            db.query(Chunk)
            .filter(
                Chunk.document_id.in_(
                    DUPLICATE_DOCUMENT_IDS
                )
            )
            .delete(
                synchronize_session=False
            )
        )

        print(
            f"Deleted chunks: "
            f"{deleted_chunks}"
        )

        # ----------------------------------------------------
        # Remember file paths before deleting documents
        # ----------------------------------------------------

        file_paths = [
            document.file_path
            for document in documents
            if document.file_path
        ]

        # ----------------------------------------------------
        # Delete documents
        # ----------------------------------------------------

        deleted_documents = (
            db.query(Document)
            .filter(
                Document.id.in_(
                    DUPLICATE_DOCUMENT_IDS
                )
            )
            .delete(
                synchronize_session=False
            )
        )

        print(
            f"Deleted documents: "
            f"{deleted_documents}"
        )

        # ----------------------------------------------------
        # Commit database changes
        # ----------------------------------------------------

        db.commit()

        print()
        print(
            "Database cleanup committed."
        )

        # ----------------------------------------------------
        # Delete physical duplicate PDFs
        # ----------------------------------------------------

        print()
        print(
            "Cleaning duplicate PDF files..."
        )

        for file_path in file_paths:

            if not file_path:
                continue

            path = Path(file_path)

            if not path.is_absolute():
                path = (
                    Path.cwd()
                    / path
                )

            try:

                if path.exists():

                    path.unlink()

                    deleted_files.append(
                        str(path)
                    )

                    print(
                        f"Deleted file: "
                        f"{path}"
                    )

                else:

                    print(
                        f"File not found: "
                        f"{path}"
                    )

            except Exception as error:

                failed_files.append(
                    (
                        str(path),
                        str(error),
                    )
                )

                print(
                    f"Could not delete "
                    f"{path}: {error}"
                )

        print()
        print("=" * 70)
        print("CLEANUP COMPLETE")
        print("=" * 70)

        print(
            f"Database documents deleted: "
            f"{deleted_documents}"
        )

        print(
            f"Chunks deleted: "
            f"{deleted_chunks}"
        )

        print(
            f"Files deleted: "
            f"{len(deleted_files)}"
        )

        if failed_files:
            print()
            print(
                "Files that could not be deleted:"
            )

            for path, error in failed_files:
                print(
                    f"  {path}: {error}"
                )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()