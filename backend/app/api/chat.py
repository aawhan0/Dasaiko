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
    answer, evidence = ChatService.chat(
        db=db,
        conversation_id=request.conversation_id,
        query=request.query,
    )

    # ----------------------------------------
    # Normalize confidence scores
    # ----------------------------------------
    if evidence:
        scores = [
            item["score"]
            for item in evidence
        ]

        min_score = min(scores)
        max_score = max(scores)
    else:
        min_score = 0
        max_score = 1

    sources = []

    for item in evidence:

        if max_score == min_score:
            confidence = 100.0
        else:
            confidence = (
                (item["score"] - min_score)
                / (max_score - min_score)
            ) * 100

        preview = item["preview"].strip()

        if len(preview) > 180:
            preview = (
                preview[:180].rstrip()
                + "..."
            )

        sources.append(
            SourceResponse(
                id=item["id"],
                document_id=item["document_id"],
                document_name=item["document_name"],
                chunk_index=item["chunk_index"],
                page_number=item["page_number"],
                bboxes=item["bboxes"],
                confidence=round(
                    confidence,
                    1,
                ),
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