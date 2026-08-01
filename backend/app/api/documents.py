from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
)
from app.services.document_service import DocumentService

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "",
    response_model=DocumentResponse,
)
def create_document(
    document: DocumentCreate,
    db: Session = Depends(get_db),
):
    return DocumentService.create_document(
        db,
        document,
    )