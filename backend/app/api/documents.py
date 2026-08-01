from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.schemas.document import UploadedDocumentResponse

from app.db.dependencies import get_db
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
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




@router.get("",
    response_model=list[DocumentResponse],
)
def get_documents(
    db: Session = Depends(get_db),
):
    return DocumentService.get_documents(db)




@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
):

    document = DocumentService.get_document_by_id(
        db,
        document_id,
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return document



@router.put(
    "/{document_id}",
    response_model=DocumentResponse,
)
def update_document(
    document_id: int,
    document: DocumentUpdate,
    db: Session = Depends(get_db),
):

    updated = DocumentService.update_document(
        db,
        document_id,
        document,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return updated




@router.delete(
    "/{document_id}",
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
):

    deleted = DocumentService.delete_document(
        db,
        document_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return {
        "message": "Document deleted successfully"
    }


@router.post(
    "/upload",
    response_model=UploadedDocumentResponse,
)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return DocumentService.upload_pdf(
        db,
        file,
    )

