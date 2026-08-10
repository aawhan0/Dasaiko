import asyncio
import json
import queue
import threading
import math

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
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


def _build_chat_response(
    answer: str,
    evidence: list,
    paper_options: list[dict] | None,
) -> ChatResponse:

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
                document_id=item["document_id"],
                document_name=item["document_name"],
                chunk_index=item["chunk_index"],
                page_number=item["page_number"],
                page_width=item.get("page_width"),
                page_height=item.get("page_height"),
                bboxes=item["bboxes"],
                confidence=(
                    relevance_percentage(
                        item["score"]
                    )
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
                    for document in paper_options
                ],
            )
        )

    return ChatResponse(
        answer=answer,
        sources=sources,
        paper_selection=paper_selection,
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
            conversation_id=request.conversation_id,
            query=request.query,
            selected_document_id=(
                request.selected_document_id
            ),
            selection_continuation=(
                request.selection_continuation
            ),
        )
    )

    return APIResponse(
        success=True,
        message="Response generated successfully.",
        data=_build_chat_response(
            answer=answer,
            evidence=evidence,
            paper_options=paper_options,
        ),
    )


@router.post(
    "/stream",
)
async def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
):

    events: queue.Queue = queue.Queue()

    engine = db.get_bind()

    def worker():

        worker_db = Session(
            bind=engine
        )

        try:

            def on_token(
                token: str,
            ):

                events.put(
                    {
                        "type": "chunk",
                        "content": token,
                    }
                )

            answer, evidence, paper_options = (
                ChatService.chat(
                    db=worker_db,
                    conversation_id=(
                        request.conversation_id
                    ),
                    query=request.query,
                    selected_document_id=(
                        request.selected_document_id
                    ),
                    selection_continuation=(
                        request.selection_continuation
                    ),
                    on_token=on_token,
                )
            )

            final_response = (
                _build_chat_response(
                    answer=answer,
                    evidence=evidence,
                    paper_options=paper_options,
                )
            )

            events.put(
                {
                    "type": "done",
                    "data": final_response.model_dump(),
                }
            )

        except Exception as error:

            worker_db.rollback()

            events.put(
                {
                    "type": "error",
                    "message": str(error),
                }
            )

        finally:

            worker_db.close()

    thread = threading.Thread(
        target=worker,
        daemon=True,
    )

    thread.start()

    async def event_stream():

        # SSE comment padding helps prevent small
        # events from being buffered before reaching
        # the browser.
        yield (
            ": "
            + (" " * 2048)
            + "\n\n"
        )

        yield (
            "data: "
            + json.dumps(
                {"type": "start"}
            )
            + "\n\n"
        )

        while True:

            event = await asyncio.to_thread(
                events.get
            )

            payload = (
                "data: "
                + json.dumps(
                    event,
                    ensure_ascii=False,
                )
                + "\n\n"
            )

            # The comment is ignored by the SSE client.
            # Padding encourages progressive HTTP delivery.
            yield (
                ": "
                + (" " * 2048)
                + "\n"
                + payload
            )

            if event["type"] in {
                "done",
                "error",
            }:
                break

            # Yield control back to the ASGI loop so the
            # response can be flushed before waiting again.
            await asyncio.sleep(0)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":
                "no-cache, no-transform",
            "Connection":
                "keep-alive",
            "X-Accel-Buffering":
                "no",
            "Content-Encoding":
                "identity",
        },
    )
