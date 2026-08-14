import asyncio
import json
import queue
import threading
import math

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db

from app.models.user import User

from app.schemas.base import APIResponse
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    SourceResponse,
    PaperOptionResponse,
    PaperSelectionResponse,
)

from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService


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


def _is_displayable_evidence(
    preview: str,
    *,
    is_metadata_query: bool = False,
) -> bool:

    text = " ".join(
        (preview or "").split()
    ).strip()

    if not text:
        return False

    # Metadata evidence can legitimately be
    # very short, for example:
    #
    # "Vaswani et al."
    # "Google Research"
    #
    if is_metadata_query:
        return True

    # Normal research evidence should contain
    # enough actual text to be useful in the
    # Evidence Vault.
    if len(text) < 35:
        return False

    # Ignore tiny fragments such as:
    #
    # "Abstract"
    # "11"
    # "1 Introduction"
    #
    if len(text.split()) <= 4:
        return False

    return True


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

        # ------------------------------------------------
        # Evidence Vault filtering
        #
        # This only affects what is displayed to the user.
        #
        # The original evidence returned by ChatService is
        # still available to the answer-generation pipeline.
        # ------------------------------------------------

        if not _is_displayable_evidence(
            preview,
            is_metadata_query=False,
        ):
            continue

        # Keep the evidence card informative without
        # making it unnecessarily large.
        if len(preview) > 280:

            preview = (
                preview[:280]
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
                page_width=item.get(
                    "page_width"
                ),
                page_height=item.get(
                    "page_height"
                ),
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


# ========================================================
# NORMAL CHAT
# ========================================================

@router.post(
    "",
    response_model=APIResponse[ChatResponse],
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ----------------------------------------------------
    # Verify conversation ownership
    #
    # The authenticated user can only chat inside
    # conversations that belong to them.
    # ----------------------------------------------------

    conversation = (
        ConversationService.get_conversation(
            db=db,
            conversation_id=request.conversation_id,
            user_id=current_user.id,
        )
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    # ----------------------------------------------------
    # Run ChatService
    # ----------------------------------------------------

    answer, evidence, paper_options = (
        ChatService.chat(
            db=db,
            conversation_id=request.conversation_id,
            user_id=current_user.id,
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


# ========================================================
# STREAMING CHAT
# ========================================================

@router.post(
    "/stream",
)
async def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ----------------------------------------------------
    # Verify conversation ownership BEFORE starting
    # the background worker.
    #
    # This is important because otherwise an unauthorized
    # user could start a streaming/RAG request.
    # ----------------------------------------------------

    conversation = (
        ConversationService.get_conversation(
            db=db,
            conversation_id=request.conversation_id,
            user_id=current_user.id,
        )
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

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
                    user_id=current_user.id,
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

            print(
                "\n========== CHAT STREAM ERROR =========="
            )

            import traceback

            traceback.print_exc()

            print(
                "=======================================\n"
            )

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