from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db

from app.models.user import User

from app.schemas.base import APIResponse
from app.schemas.message import MessageResponse

from app.services.message_service import MessageService


router = APIRouter(
    prefix="/messages",
    tags=["Messages"],
)


# ========================================
# GET MESSAGES
# ========================================

@router.get(
    "/{conversation_id}",
    response_model=APIResponse[
        list[MessageResponse]
    ],
)
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    messages = MessageService.get_messages(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    return APIResponse(
        success=True,
        message="Messages fetched successfully.",
        data=messages,
    )