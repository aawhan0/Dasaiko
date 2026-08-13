from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db

from app.models.user import User

from app.schemas.base import APIResponse
from app.schemas.conversation import (
    ConversationCreate,
    ConversationRename,
    ConversationResponse,
)

from app.services.conversation_service import (
    ConversationService,
)


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


# ========================================
# CREATE CONVERSATION
# ========================================

@router.post(
    "",
    response_model=APIResponse[
        ConversationResponse
    ],
)
def create_conversation(
    request: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    conversation = (
        ConversationService.create_conversation(
            db=db,
            title=request.title,
            user_id=current_user.id,
        )
    )

    return APIResponse(
        success=True,
        message="Conversation created successfully.",
        data=conversation,
    )


# ========================================
# GET MY CONVERSATIONS
# ========================================

@router.get(
    "",
    response_model=APIResponse[
        list[ConversationResponse]
    ],
)
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    conversations = (
        ConversationService.get_conversations(
            db=db,
            user_id=current_user.id,
        )
    )

    return APIResponse(
        success=True,
        message="Conversations fetched successfully.",
        data=conversations,
    )


# ========================================
# TOGGLE PIN
# ========================================

@router.patch(
    "/{conversation_id}/pin",
    response_model=APIResponse[
        ConversationResponse
    ],
)
def toggle_pin(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    conversation = (
        ConversationService.toggle_pin(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
        )
    )

    return APIResponse(
        success=True,
        message="Conversation updated successfully.",
        data=conversation,
    )


# ========================================
# RENAME
# ========================================

@router.patch(
    "/{conversation_id}/rename",
    response_model=APIResponse[
        ConversationResponse
    ],
)
def rename_conversation(
    conversation_id: int,
    request: ConversationRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    conversation = (
        ConversationService.rename_conversation(
            db=db,
            conversation_id=conversation_id,
            title=request.title,
            user_id=current_user.id,
        )
    )

    return APIResponse(
        success=True,
        message="Conversation renamed successfully.",
        data=conversation,
    )


# ========================================
# DELETE
# ========================================

@router.delete(
    "/{conversation_id}",
    response_model=APIResponse[None],
)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    deleted = (
        ConversationService.delete_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
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