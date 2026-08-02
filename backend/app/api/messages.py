from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.schemas.base import APIResponse
from app.schemas.message import MessageResponse

from app.services.message_service import MessageService

router = APIRouter(
    prefix="/messages",
    tags=["Messages"],
)


@router.get(
    "/{conversation_id}",
    response_model=APIResponse[list[MessageResponse]],
)
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    messages = MessageService.get_messages(
        db=db,
        conversation_id=conversation_id,
    )

    return APIResponse(
        success=True,
        message="Messages fetched successfully.",
        data=messages,
    )