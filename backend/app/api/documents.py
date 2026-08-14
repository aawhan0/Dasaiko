from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
)

from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_user,
)

from app.db.dependencies import (
    get_db,
)

from app.models.user import User

from app.schemas.base import (
    APIResponse,
)

from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
    UploadedDocumentResponse,
)

from app.services.document_service import (
    DocumentService,
)

from app.services.bm25_service import (
    BM25Service,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "",
    response_model=APIResponse[
        DocumentResponse
    ],
)
def create_document(
    document: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    created_document = (
        DocumentService.create_document(
            db=db,
            document=document,
            user_id=current_user.id,
        )
    )

    return APIResponse(
        success=True,
        message=(
            "Document created successfully."
        ),
        data=created_document,
    )


@router.get(
    "",
    response_model=APIResponse[
        list[DocumentResponse]
    ],
)
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    documents = (
        DocumentService.get_documents(
            db=db,
            user_id=current_user.id,
        )
    )

    return APIResponse(
        success=True,
        message=(
            "Documents fetched successfully."
        ),
        data=documents,
    )


@router.get(
    "/{document_id}",
    response_model=APIResponse[
        DocumentResponse
    ],
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    document = (
        DocumentService.get_document_by_id(
            db=db,
            document_id=document_id,
            user_id=current_user.id,
        )
    )

    return APIResponse(
        success=True,
        message=(
            "Document fetched successfully."
        ),
        data=document,
    )


@router.put(
    "/{document_id}",
    response_model=APIResponse[
        DocumentResponse
    ],
)
def update_document(
    document_id: int,
    document: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    updated_document = (
        DocumentService.update_document(
            db=db,
            document_id=document_id,
            updated_document=document,
            user_id=current_user.id,
        )
    )

    return APIResponse(
        success=True,
        message=(
            "Document updated successfully."
        ),
        data=updated_document,
    )


@router.delete(
    "/{document_id}",
    response_model=APIResponse[None],
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    DocumentService.delete_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    if BM25Service.bm25 is not None:
        BM25Service.build_index(
            db,
            current_user.id,
        )

    return APIResponse(
        success=True,
        message=(
            "Document deleted successfully."
        ),
        data=None,
    )


@router.post(
    "/upload",
    response_model=APIResponse[
        UploadedDocumentResponse
    ],
)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    document = (
        DocumentService.upload_pdf(
            db=db,
            file=file,
            user_id=current_user.id,
        )
    )

    BM25Service.build_index(
        db,
        current_user.id,
        )

    return APIResponse(
        success=True,
        message=(
            "Document uploaded successfully."
        ),
        data=UploadedDocumentResponse(
            id=document.id,
            title=document.title,
            source=document.source,
            file_name=document.file_name,
            file_path=document.file_path,
            created_at=document.created_at,
        ),
    )