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

    # ----------------------------------------
    # Normalize confidence scores
    # ----------------------------------------
    if results:
        scores = [score for _, score in results]

        min_score = min(scores)
        max_score = max(scores)
    else:
        min_score = 0
        max_score = 1

    sources = []

    for chunk, score in results:

        if max_score == min_score:
            confidence = 100.0
        else:
            confidence = (
                (score - min_score)
                / (max_score - min_score)
            ) * 100

        preview = chunk.content.strip()

        if len(preview) > 180:
            preview = preview[:180].rstrip() + "..."

        sources.append(
            SourceResponse(
                paper_title=chunk.document.title,
                chunk_number=chunk.chunk_index + 1,
                confidence=round(confidence, 1),
                preview=preview,
            )
        )

    return APIResponse(
        success=True,
        message="Response generated successfully.",
        data=ChatResponse(
            answer=answer,
            sources=sources,
        ),
    )