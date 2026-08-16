import os
import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile

from sqlalchemy.orm import Session

from app.core.exceptions import (
    DocumentNotFoundException,
)

from app.db.transaction import (
    transactional,
)

from app.models.chunk import Chunk
from app.models.document import Document
from app.models.embedding import Embedding

from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
)

from app.services.embedding_service import (
    generate_embedding,
)

from app.utils.pdf import (
    extract_text_from_pdf,
    extract_pages_from_pdf,
)

from app.utils.chunker import (
    split_page,
)


class DocumentService:

    @staticmethod
    @transactional
    def create_document(
        db: Session,
        document: DocumentCreate,
        user_id: int,
    ) -> Document:

        new_document = Document(
            user_id=user_id,
            title=document.title,
            content=document.content,
        )

        db.add(new_document)
        db.flush()
        db.refresh(new_document)

        return new_document

    @staticmethod
    def get_documents(
        db: Session,
        user_id: int,
    ) -> list[Document]:

        return (
            db.query(Document)
            .filter(
                Document.user_id == user_id
            )
            .order_by(
                Document.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_document_by_id(
        db: Session,
        document_id: int,
        user_id: int,
    ) -> Document:

        document = (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.user_id == user_id,
            )
            .first()
        )

        if not document:
            raise DocumentNotFoundException()

        return document

    @staticmethod
    @transactional
    def update_document(
        db: Session,
        document_id: int,
        updated_document: DocumentUpdate,
        user_id: int,
    ) -> Document:

        document = (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.user_id == user_id,
            )
            .first()
        )

        if not document:
            raise DocumentNotFoundException()

        if (
            updated_document.title
            is not None
        ):
            document.title = (
                updated_document.title
            )

        if (
            updated_document.content
            is not None
        ):
            document.content = (
                updated_document.content
            )

        db.refresh(document)

        return document

    @staticmethod
    @transactional
    def delete_document(
        db: Session,
        document_id: int,
        user_id: int,
    ) -> bool:

        document = (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.user_id == user_id,
            )
            .first()
        )

        if not document:
            raise DocumentNotFoundException()

        upload_dir = Path(
            "uploads"
        ).resolve()

        uploaded_file = (
            upload_dir
            / Path(
                document.file_path
            ).name
        )

        db.delete(document)
        db.flush()

        if uploaded_file.is_file():
            uploaded_file.unlink()

        return True

    @staticmethod
    @transactional
    def upload_pdf(
        db: Session,
        file: UploadFile,
        user_id: int,
    ) -> Document:

        upload_dir = Path(
            "uploads"
        )

        upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        unique_name = (
            f"{uuid.uuid4()}.pdf"
        )

        disk_path = (
            upload_dir /
            unique_name
        )

        public_path = (
            f"/uploads/{unique_name}"
        )

        try:
            # ---------------------------------
            # Save uploaded PDF
            # ---------------------------------

            with disk_path.open(
                "wb"
            ) as buffer:
                shutil.copyfileobj(
                    file.file,
                    buffer,
                )

            file.file.close()

            if (
                not disk_path.is_file()
                or disk_path.stat().st_size
                == 0
            ):
                raise ValueError(
                    "The uploaded PDF is empty."
                )

            # ---------------------------------
            # Extract full text
            # ---------------------------------

            extracted_text = (
                extract_text_from_pdf(
                    str(disk_path)
                )
            )

            if not extracted_text.strip():
                raise ValueError(
                    "Could not extract text "
                    "from this PDF."
                )

            # ---------------------------------
            # Create document
            # ---------------------------------

            filename = (
                file.filename
                or "Untitled.pdf"
            )

            title = filename

            if title.lower().endswith(
                ".pdf"
            ):
                title = title[:-4]

            document = Document(
                user_id=user_id,
                title=title,
                content=extracted_text,
                source="pdf",
                file_name=filename,
                file_path=public_path,
            )

            db.add(document)
            db.flush()

            # ---------------------------------
            # Page-aware chunking
            # ---------------------------------

            pages = (
                extract_pages_from_pdf(
                    str(disk_path)
                )
            )

            if not pages:
                raise ValueError(
                    "Could not extract any "
                    "pages from this PDF."
                )

            global_chunk_index = 0

            for page in pages:

                page_chunks = split_page(
                    page
                )

                for chunk in page_chunks:

                    content = (
                        chunk["content"]
                    )

                    if not content.strip():
                        continue

                    chunk_obj = Chunk(
                        document_id=(
                            document.id
                        ),
                        content=content,
                        chunk_index=(
                            global_chunk_index
                        ),
                        page_number=(
                            chunk[
                                "page_number"
                            ]
                        ),
                        page_width=(
                            chunk[
                                "page_width"
                            ]
                        ),
                        page_height=(
                            chunk[
                                "page_height"
                            ]
                        ),
                        bboxes=(
                            chunk["bboxes"]
                        ),
                        token_count=len(
                            content.split()
                        ),
                    )

                    db.add(
                        chunk_obj
                    )

                    db.flush()

                    embedding_obj = Embedding(
                        chunk_id=(
                            chunk_obj.id
                        ),
                        model_name=(
                            "all-MiniLM-L6-v2"
                        ),
                        embedding=(
                            generate_embedding(
                                content
                            )
                        ),
                    )

                    db.add(
                        embedding_obj
                    )

                    global_chunk_index += 1

            if (
                global_chunk_index == 0
            ):
                raise ValueError(
                    "No searchable text "
                    "could be extracted "
                    "from this PDF."
                )

            db.refresh(document)

            return document

        except Exception:

            if disk_path.is_file():
                try:
                    disk_path.unlink()
                except OSError:
                    pass

            raise
