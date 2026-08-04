from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.schemas.base import APIResponse
from app.schemas.conversation import (
    ConversationCreate,
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