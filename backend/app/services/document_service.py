from sqlalchemy.orm import Session

from app.models.document import Document
from app.schemas.document import DocumentCreate

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