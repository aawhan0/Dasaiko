from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.schemas.base import APIResponse
from app.schemas.conversation import (
    ConversationCreate,
    ConversationRename,
    ConversationResponse,
)

from app.services.conversation_service import ConversationService

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.post(
    "",
    response_model=APIResponse[ConversationResponse],
)
def create_conversation(
    request: ConversationCreate,
    db: Session = Depends(get_db),
):
    conversation = ConversationService.create_conversation(
        db=db,
        title=request.title,
    )

    return APIResponse(
        success=True,
        message="Conversation created successfully.",
        data=conversation,
    )


@router.get(
    "",
    response_model=APIResponse[list[ConversationResponse]],
)
def get_conversations(
    db: Session = Depends(get_db),
):
    conversations = ConversationService.get_conversations(
        db=db,
    )

    return APIResponse(
        success=True,
        message="Conversations fetched successfully.",
        data=conversations,
    )


@router.patch(
    "/{conversation_id}/pin",
    response_model=APIResponse[ConversationResponse],
)
def toggle_pin(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    conversation = ConversationService.toggle_pin(
        db=db,
        conversation_id=conversation_id,
    )

    return APIResponse(
        success=True,
        message="Conversation updated successfully.",
        data=conversation,
    )


@router.patch(
    "/{conversation_id}/rename",
    response_model=APIResponse[ConversationResponse],
)
def rename_conversation(
    conversation_id: int,
    request: ConversationRename,
    db: Session = Depends(get_db),
):
    conversation = ConversationService.rename_conversation(
        db=db,
        conversation_id=conversation_id,
        title=request.title,
    )

    return APIResponse(
        success=True,
        message="Conversation renamed successfully.",
        data=conversation,
    )


@router.delete(
    "/{conversation_id}",
    response_model=APIResponse[None],
)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    deleted = (
        ConversationService.delete_conversation(
            db=db,
            conversation_id=conversation_id,
        )
    )

    if not deleted:
        return APIResponse(
            success=False,
            message="Conversation not found.",
            data=None,
        )

    return APIResponse(
        success=True,
        message="Conversation deleted successfully.",
        data=None,
    )