import math

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.schemas.base import APIResponse
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    SourceResponse,
    PaperOptionResponse,
    PaperSelectionResponse,
)

from app.services.chat_service import ChatService


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


def relevance_percentage(
    score: float,
) -> float:

    score = max(
        min(
            float(score),
            20.0,
        ),
        -20.0,
    )

    percentage = (
        1.0
        /
        (
            1.0
            +
            math.exp(-score)
        )
    ) * 100.0

    return round(
        percentage,
        1,
    )


@router.post(
    "",
    response_model=APIResponse[ChatResponse],
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):

    answer, evidence, paper_options = (
        ChatService.chat(
            db=db,
            conversation_id=
                request.conversation_id,
            query=request.query,
            selected_document_id=
                request.selected_document_id,
            selection_continuation=
                request.selection_continuation,
        )
    )

    sources = []

    for item in evidence:

        preview = (
            item["preview"]
            .strip()
        )

        if len(preview) > 180:
            preview = (
                preview[:180]
                .rstrip()
                + "..."
            )

        sources.append(
            SourceResponse(
                id=item["id"],
                document_id=
                    item["document_id"],
                document_name=
                    item["document_name"],
                chunk_index=
                    item["chunk_index"],
                page_number=
                    item["page_number"],
                page_width=
                    item.get("page_width"),
                page_height=
                    item.get("page_height"),
                bboxes=
                    item["bboxes"],
                confidence=
                    relevance_percentage(
                        item["score"]
                    ),
                preview=preview,
            )
        )

    paper_selection = None

    if paper_options:

        paper_selection = (
            PaperSelectionResponse(
                required=True,
                documents=[
                    PaperOptionResponse(
                        id=document["id"],
                        title=document["title"],
                    )
                    for document
                    in paper_options
                ],
            )
        )

    return APIResponse(
        success=True,
        message=(
            "Response generated successfully."
        ),
        data=ChatResponse(
            answer=answer,
            sources=sources,
            paper_selection=
                paper_selection,
        ),
    )
