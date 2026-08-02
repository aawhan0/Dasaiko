from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.schemas.base import APIResponse
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    SourceResponse,
)

from app.services.chat_service import ChatService

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post(
    "",
    response_model=APIResponse[ChatResponse],
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    answer, results = ChatService.chat(
        db=db,
        conversation_id=request.conversation_id,
        query=request.query,
    )

    return APIResponse(
        success=True,
        message="Response generated successfully.",
        data=ChatResponse(
            answer=answer,
            sources=[
                SourceResponse(
                    document=chunk.document.title,
                    chunk_index=chunk.chunk_index,
                    score=float(score),
                )
                for chunk, score in results
            ],
        ),
    )