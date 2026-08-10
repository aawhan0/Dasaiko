from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.schemas.base import APIResponse
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
    UploadedDocumentResponse,
)

from app.services.document_service import DocumentService
from app.services.bm25_service import BM25Service

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "",
    response_model=APIResponse[DocumentResponse],
)
def create_document(
    document: DocumentCreate,
    db: Session = Depends(get_db),
):
    created_document = DocumentService.create_document(
        db,
        document,
    )

    return APIResponse(
        success=True,
        message="Document created successfully.",
        data=created_document,
    )


@router.get(
    "",
    response_model=APIResponse[list[DocumentResponse]],
)
def get_documents(
    db: Session = Depends(get_db),
):
    documents = DocumentService.get_documents(db)

    return APIResponse(
        success=True,
        message="Documents fetched successfully.",
        data=documents,
    )


@router.get(
    "/{document_id}",
    response_model=APIResponse[DocumentResponse],
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = DocumentService.get_document_by_id(
        db,
        document_id,
    )

    return APIResponse(
        success=True,
        message="Document fetched successfully.",
        data=document,
    )


@router.put(
    "/{document_id}",
    response_model=APIResponse[DocumentResponse],
)
def update_document(
    document_id: int,
    document: DocumentUpdate,
    db: Session = Depends(get_db),
):
    updated_document = DocumentService.update_document(
        db,
        document_id,
        document,
    )

    return APIResponse(
        success=True,
        message="Document updated successfully.",
        data=updated_document,
    )


@router.delete(
    "/{document_id}",
    response_model=APIResponse[None],
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    DocumentService.delete_document(
        db,
        document_id,
    )

    if BM25Service.bm25 is not None:
        BM25Service.build_index(db)

    return APIResponse(
        success=True,
        message="Document deleted successfully.",
        data=None,
    )


@router.post(
    "/upload",
    response_model=APIResponse[UploadedDocumentResponse],
)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    document = DocumentService.upload_pdf(
        db,
        file,
    )

    BM25Service.build_index(db)

    return APIResponse(
        success=True,
        message="Document uploaded successfully.",
        data=UploadedDocumentResponse(
            id=document.id,
            title=document.title,
            source=document.source,
            file_name=document.file_name,
            file_path=document.file_path,
            created_at=document.created_at,
        ),
    )
