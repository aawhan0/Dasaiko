import os
import shutil
import uuid

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.chunk import Chunk
from app.models.document import Document
from app.models.embedding import Embedding
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
)
from app.services.embedding_service import generate_embedding
from app.utils.chunker import split_text
from app.utils.pdf import extract_text_from_pdf


class DocumentService:
    @staticmethod
    def create_document(
        db: Session,
        document: DocumentCreate,
    ) -> Document:

        new_document = Document(
            title=document.title,
            content=document.content,
        )

        db.add(new_document)
        db.commit()
        db.refresh(new_document)

        return new_document

    @staticmethod
    def get_documents(db: Session) -> list[Document]:
        return db.query(Document).all()

    @staticmethod
    def get_document_by_id(
        db: Session,
        document_id: int,
    ) -> Document | None:

        return (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

    @staticmethod
    def update_document(
        db: Session,
        document_id: int,
        updated_document: DocumentUpdate,
    ) -> Document | None:

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if not document:
            return None

        if updated_document.title is not None:
            document.title = updated_document.title

        if updated_document.content is not None:
            document.content = updated_document.content

        db.commit()
        db.refresh(document)

        return document

    @staticmethod
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
            return False

        db.delete(document)
        db.commit()

        return True

    @staticmethod
    def upload_pdf(
        db: Session,
        file: UploadFile,
    ) -> Document:

        try:
            upload_dir = "app/storage/uploads"
            os.makedirs(upload_dir, exist_ok=True)

            unique_name = f"{uuid.uuid4()}.pdf"

            file_path = os.path.join(
                upload_dir,
                unique_name,
            )

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            file.file.close()

            extracted_text = extract_text_from_pdf(file_path)

            document = Document(
                title=file.filename.replace(".pdf", ""),
                content=extracted_text,
                source="pdf",
                file_name=file.filename,
                file_path=file_path,
            )

            db.add(document)
            db.flush()

            chunks = split_text(extracted_text)

            for index, chunk in enumerate(chunks):

                chunk_obj = Chunk(
                    document_id=document.id,
                    content=chunk,
                    chunk_index=index,
                    token_count=len(chunk.split()),
                )

                db.add(chunk_obj)
                db.flush()

                embedding_obj = Embedding(
                    chunk_id=chunk_obj.id,
                    model_name="all-MiniLM-L6-v2",
                    embedding=generate_embedding(chunk),
                )

                db.add(embedding_obj)

            db.commit()
            db.refresh(document)

            return document

        except Exception:
            db.rollback()
            raise