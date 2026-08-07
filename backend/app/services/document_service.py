import os
import shutil
import uuid

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import DocumentNotFoundException
from app.db.transaction import transactional

from app.models.chunk import Chunk
from app.models.document import Document
from app.models.embedding import Embedding

from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
)

from app.services.embedding_service import generate_embedding

from app.utils.pdf import (
    extract_text_from_pdf,
    extract_pages_from_pdf,
)

from app.utils.chunker import (
    split_text,
    split_page,
)


class DocumentService:

    @staticmethod
    @transactional
    def create_document(
        db: Session,
        document: DocumentCreate,
    ) -> Document:

        new_document = Document(
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
    ) -> list[Document]:

        return (
            db.query(Document)
            .order_by(Document.created_at.desc())
            .all()
        )

    @staticmethod
    def get_document_by_id(
        db: Session,
        document_id: int,
    ) -> Document:

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
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
    ) -> Document:

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if not document:
            raise DocumentNotFoundException()

        if updated_document.title is not None:
            document.title = updated_document.title

        if updated_document.content is not None:
            document.content = updated_document.content

        db.refresh(document)

        return document

    @staticmethod
    @transactional
    def delete_document(
        db: Session,
        document_id: int,
    ) -> bool:

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if not document:
            raise DocumentNotFoundException()

        db.delete(document)

        return True

    @staticmethod
    @transactional
    def upload_pdf(
        db: Session,
        file: UploadFile,
    ) -> Document:

        # -----------------------------
        # Save PDF
        # -----------------------------
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)

        unique_name = f"{uuid.uuid4()}.pdf"

        disk_path = os.path.join(
            upload_dir,
            unique_name,
        )

        public_path = f"/uploads/{unique_name}"

        with open(disk_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file.file.close()

        # -----------------------------
        # Extract Full Text
        # -----------------------------
        extracted_text = extract_text_from_pdf(
            disk_path
        )

        # -----------------------------
        # Create Document
        # -----------------------------
        document = Document(
            title=file.filename.replace(".pdf", ""),
            content=extracted_text,
            source="pdf",
            file_name=file.filename,
            file_path=public_path,
        )

        db.add(document)
        db.flush()

        # -----------------------------
        # Page-aware Chunking
        # -----------------------------
        pages = extract_pages_from_pdf(
            disk_path
        )

        global_chunk_index = 0

        for page in pages:

            page_chunks = split_page(page)

            for chunk in page_chunks:

                chunk_obj = Chunk(
                    document_id=document.id,

                    content=chunk["content"],

                    chunk_index=global_chunk_index,

                    page_number=chunk["page_number"],

                    page_width=chunk["page_width"],

                    page_height=chunk["page_height"],

                    bboxes=chunk["bboxes"],

                    token_count=len(
                        chunk["content"].split()
                    ),
                )

                db.add(chunk_obj)
                db.flush()

                embedding_obj = Embedding(
                    chunk_id=chunk_obj.id,
                    model_name="all-MiniLM-L6-v2",
                    embedding=generate_embedding(
                        chunk["content"]
                    ),
                )

                db.add(embedding_obj)

                global_chunk_index += 1

        db.refresh(document)

        return document