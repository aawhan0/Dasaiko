import os
import shutil
import uuid

from fastapi import UploadFile

from app.utils.pdf import extract_text_from_pdf


from app.models.chunk import Chunk
from app.utils.chunker import split_text


from sqlalchemy.orm import Session

from app.models.document import Document
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
)

class DocumentService:
    @staticmethod
    def create_document(
        db: Session,
        document: DocumentCreate,
    ) -> Document:
        

        #Create a new document.
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
        updated_document,
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

        os.makedirs("app/storage/uploads", exist_ok=True)

        unique_name = f"{uuid.uuid4()}.pdf"

        file_path = os.path.join(
            "app/storage/uploads",
            unique_name,
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text_from_pdf(file_path)

        document = Document(
            title=file.filename.replace(".pdf", ""),
            content=extracted_text,
            source="pdf",
            file_name=file.filename,
            file_path=file_path,
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        chunks = split_text(extracted_text)

        for index, chunk in enumerate(chunks):
            db.add(
                Chunk(
                    document_id=document.id,
                    content=chunk,
                    chunk_index=index,
                    token_count=len(chunk.split()),
                )
            )

        db.commit()

        return document