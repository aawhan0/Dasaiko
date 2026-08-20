import time
from typing import Callable

from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.services.search_service import SearchService
from app.services.query_rewriter_service import QueryRewriterService
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
from app.services.prompt_service import PromptService


# ============================================================
# GROQ CLIENT
# ============================================================

client = Groq(
    api_key=settings.groq_api_key,
)


class ChatService:

    # ========================================================
    # EVIDENCE FILTERING
    # ========================================================

    # CrossEncoder scores are ranking scores, NOT probabilities.
    MIN_EVIDENCE_SCORE = -2.0

    # When a paper is explicitly selected, use a relative
    # score margin instead of requiring an absolute score.
    SELECTED_PAPER_SCORE_MARGIN = 3.0

    # ========================================================
    # SOURCE CITATION VALIDATION
    # ========================================================

    @staticmethod
    def _validate_source_citations(
        answer: str,
        evidence_count: int,
    ) -> str:

        import re

        valid_source_ids = {
            f"SOURCE_{index}"
            for index in range(
                1,
                evidence_count + 1,
            )
        }

        pattern = re.compile(
            r"\[SOURCE_(\d+)\]"
        )

        def replace_match(match):

            source_id = (
                f"SOURCE_{match.group(1)}"
            )

            if source_id in valid_source_ids:
                return match.group(0)

            return ""

        return pattern.sub(
            replace_match,
            answer,
        )

    # ========================================================
    # CASUAL MESSAGE DETECTION
    # ========================================================

    @staticmethod
    def _is_casual_message(
        query: str,
    ) -> bool:

        normalized = (
            query
            .strip()
            .lower()
            .rstrip("!?.,")
        )

        casual_messages = {
            "hi",
            "hello",
            "hey",
            "hii",
            "hiii",
            "heyy",
            "heyyy",
            "hellooo",
            "hello there",
            "hey there",
            "hi there",
            "good morning",
            "good afternoon",
            "good evening",
            "thanks",
            "thank you",
            "thank you so much",
            "thanks a lot",
        }

        return normalized in casual_messages

    # ========================================================
    # PAPER-CONTEXT QUERY DETECTION
    # ========================================================

    @staticmethod
    def _is_paper_context_query(
        query: str,
    ) -> bool:

        normalized = (
            query
            .strip()
            .lower()
            .rstrip("!?.,")
        )

        paper_reference_phrases = (
            "this paper",
            "the paper",
            "this research paper",
            "the research paper",
            "this paper's",
            "the paper's",
            "this research",
            "the research",
            "this study",
            "the study",
            "this work",
            "the work",
            "its author",
            "the author",
            "its authors",
            "the authors",
            "who wrote",
            "who is the author",
            "who are the authors",
            "when was it published",
            "when was this published",
            "what year was it published",
            "what year was this published",
            "what year",
            "publication year",
            "prerequisites for this",
            "prerequisites for the paper",
            "what are the prerequisites",
            "what should i know before",
            "what should i know first",
            "what should i read next",
            "what should i read after this",
            "what comes next",
            "what are its contributions",
            "what is its contribution",
            "what are its limitations",
            "what is its methodology",
            "what is its approach",
            "what problem does it solve",
            "what problem did it solve",
        )

        if any(
            phrase in normalized
            for phrase in paper_reference_phrases
        ):
            return True

        tokens = normalized.split()

        if len(tokens) <= 6:

            contextual_tokens = (
                "it",
                "its",
                "this",
                "that",
                "paper",
                "research",
                "study",
                "work",
                "author",
                "authors",
                "publication",
                "prerequisites",
            )

            if any(
                token in contextual_tokens
                for token in tokens
            ):
                return True

        return False

    # ========================================================
    # PAPER SELECTION REQUIREMENT
    # ========================================================

    @staticmethod
    def _needs_paper_selection(
        query: str,
        conversation_history: str,
    ) -> bool:

        return ChatService._is_paper_context_query(
            query
        )

    # ========================================================
    # GET PAPER SELECTION OPTIONS
    # ========================================================

    @staticmethod
    def _get_paper_selection_options(
        db: Session,
        user_id: int,
    ) -> list[dict]:

        documents = (
            db.query(Document)
            .filter(
                Document.user_id == user_id
            )
            .order_by(
                Document.id.asc()
            )
            .all()
        )

        unique_documents = []

        seen_titles = set()

        for document in documents:

            title = (
                document.title
                or "Untitled document"
            )

            normalized_title = (
                title
                .strip()
                .lower()
            )

            if normalized_title in seen_titles:
                continue

            seen_titles.add(
                normalized_title
            )

            unique_documents.append(
                {
                    "id": document.id,
                    "title": title,
                }
            )

        return unique_documents

    # ========================================================
    # BUILD PAPER SELECTION RESPONSE
    # ========================================================

    @staticmethod
    def _build_paper_selection_response(
        db: Session,
        user_id: int,
    ) -> str:

        documents = (
            ChatService
            ._get_paper_selection_options(
                db=db,
                user_id=user_id,
            )
        )

        if not documents:

            return (
                "I don't currently have any "
                "uploaded papers to use for this "
                "question."
            )

        return (
            "I found multiple papers that could "
            "match your question. Select the paper "
            "you'd like to use as your research "
            "context."
        )

    # ========================================================
    # MAIN CHAT
    # ========================================================

    @staticmethod
    def chat(
        db: Session,
        conversation_id: int,
        user_id: int,
        query: str,
        selected_document_id: int | None = None,
        selection_continuation: bool = False,
        on_token: Callable[[str], None] | None = None,
    ) -> tuple[
        str,
        list,
        list[dict] | None,
    ]:

        print(
            "\n========== CHAT START =========="
        )

        # ====================================================
        # CONVERSATION
        # ====================================================

        conversation = (
            ConversationService.get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=user_id,
            )
        )

        if conversation is None:

            raise ValueError(
                "Conversation not found"
            )

        print(
            "✓ Conversation found"
        )

        # ====================================================
        # RESEARCH CONTEXT SELECTION
        # ====================================================

        is_new_research_context_selection = (
            selection_continuation
            and selected_document_id is not None
        )

        # ====================================================
        # RESTORE PERSISTED RESEARCH CONTEXT
        # ====================================================

        if selected_document_id is None:

            persisted_document_id = getattr(
                conversation,
                "selected_document_id",
                None,
            )

            if persisted_document_id is not None:

                selected_document_id = (
                    persisted_document_id
                )

                print(
                    "✓ Restored conversation "
                    "research context:"
                )

                print(
                    f"  Document ID: "
                    f"{selected_document_id}"
                )

        # ====================================================
        # LOAD RECENT MESSAGES
        # ====================================================

        messages = (
            MessageService.get_messages(
                db=db,
                conversation_id=conversation_id,
                user_id=user_id,
            )
        )

        messages = messages[-4:]

        conversation_history = "\n".join(
            f"{message.role.upper()}: "
            f"{message.content}"
            for message in messages
        )

        print(
            f"✓ Loaded "
            f"{len(messages)} previous messages"
        )

        # ====================================================
        # SAVE USER MESSAGE
        # ====================================================

        if not selection_continuation:

            MessageService.create_message(
                db=db,
                conversation_id=conversation_id,
                role="user",
                content=query,
                user_id=user_id,
            )

            print(
                "✓ User message saved"
            )

        else:

            print(
                "✓ Continuing original question "
                "after paper selection"
            )

        # ====================================================
        # CASUAL MESSAGE
        # ====================================================

        if ChatService._is_casual_message(
            query
        ):

            print(
                "✓ Casual message detected"
            )

            answer = (
                "Hello. How can I assist you "
                "with your research?"
            )

            if on_token is not None:
                on_token(answer)

            MessageService.create_message(
                db=db,
                conversation_id=conversation_id,
                role="assistant",
                content=answer,
                user_id=user_id,
            )

            print(
                "✓ Assistant message saved"
            )

            print(
                "Evidence Vault: 0"
            )

            print(
                "========== CHAT END ==========\n"
            )

            return (
                answer,
                [],
                None,
            )

        # ====================================================
        # AMBIGUOUS PAPER REFERENCE
        # ====================================================

        if (
            selected_document_id is None
            and
            ChatService._needs_paper_selection(
                query=query,
                conversation_history=conversation_history,
            )
        ):

            print(
                "✓ Ambiguous paper reference detected"
            )

            paper_options = (
                ChatService
                ._get_paper_selection_options(
                    db=db,
                    user_id=user_id,
                )
            )

            answer = (
                ChatService
                ._build_paper_selection_response(
                    db=db,
                    user_id=user_id,
                )
            )

            MessageService.create_message(
                db=db,
                conversation_id=conversation_id,
                role="assistant",
                content=answer,
                user_id=user_id,
            )

            print(
                "✓ Paper selection response saved"
            )

            print(
                "Evidence Vault: 0"
            )

            print(
                "========== CHAT END ==========\n"
            )

            return (
                answer,
                [],
                paper_options,
            )

        # ====================================================
        # EXPLICIT PAPER SELECTION
        # ====================================================

        if selected_document_id is not None:

            selected_document = (
                db.query(Document)
                .filter(
                    Document.id == selected_document_id,
                    Document.user_id == user_id,
                )
                .first()
            )

            if selected_document is None:

                print(
                    "⚠ Selected document "
                    "does not exist"
                )

                selected_document_id = None

            else:

                print(
                    "✓ Paper selected:"
                )

                print(
                    f"  ID: "
                    f"{selected_document.id}"
                )

                print(
                    f"  Title: "
                    f"{selected_document.title}"
                )

                # --------------------------------------------
                # Persist selected document
                # --------------------------------------------

                if hasattr(
                    conversation,
                    "selected_document_id",
                ):

                    conversation.selected_document_id = (
                        selected_document.id
                    )

                    db.commit()

                    print(
                        "✓ Conversation research "
                        "context saved"
                    )

                # --------------------------------------------
                # Persist research context event once
                # --------------------------------------------

                if (
                    is_new_research_context_selection
                ):

                    MessageService.create_message(
                        db=db,
                        conversation_id=conversation_id,
                        user_id=user_id,
                        role="research_context",
                        content=(
                            selected_document.title
                            or "Selected research paper"
                        ),
                    )

                    print(
                        "✓ Research context event saved"
                    )

        # ====================================================
        # QUERY REWRITING
        # ====================================================

        rewritten_query = query

        if selected_document_id is not None:

            print(
                "✓ Selected paper active; "
                "preserving original query"
            )

        elif len(messages) > 0:

            try:

                rewritten_query = (
                    QueryRewriterService.rewrite(
                        conversation_history=(
                            conversation_history
                        ),
                        query=query,
                    )
                )

                print(
                    "\n========== QUERY REWRITE =========="
                )

                print(
                    "Original:",
                    query,
                )

                print(
                    "Rewritten:",
                    rewritten_query,
                )

                print(
                    "===================================\n"
                )

            except Exception as e:

                print(
                    "⚠ Query rewriting failed."
                )

                print(
                    f"Error: {e}"
                )

                rewritten_query = query

        # ====================================================
        # SEARCH
        # ====================================================

        print(
            "Searching..."
        )

        results = SearchService.search(
            db=db,
            query=rewritten_query,
            user_id=user_id,
            limit=5,
            document_id=selected_document_id,
        )

        print(
            "✓ Search returned"
        )

        print(
            f"Retrieved "
            f"{len(results)} results"
        )

        # ====================================================
        # FILTER WEAK EVIDENCE
        # ====================================================

        if (
            selected_document_id is not None
            and results
        ):

            top_score = float(
                results[0]["score"]
            )

            score_floor = (
                top_score
                - ChatService
                .SELECTED_PAPER_SCORE_MARGIN
            )

            usable_results = [
                result
                for result in results
                if float(
                    result["score"]
                ) >= score_floor
            ]

            # --------------------------------------------
            # Summary-query safety
            # --------------------------------------------

            if (
                SearchService._is_summary_query(query)
                and results
            ):

                content_results = [
                    result
                    for result in results
                    if len(
                        (
                            result.get("preview")
                            or ""
                        ).strip()
                    ) >= 100
                ]

                if content_results:

                    best_content_result = (
                        content_results[0]
                    )

                    if (
                        best_content_result
                        not in usable_results
                    ):

                        usable_results.append(
                            best_content_result
                        )

            # --------------------------------------------
            # Always keep strongest result
            # --------------------------------------------

            if not usable_results:

                usable_results = [
                    results[0]
                ]

            print(
                "Selected paper evidence filtering:"
            )

            print(
                f"  Top score: "
                f"{top_score:.4f}"
            )

            print(
                f"  Score floor: "
                f"{score_floor:.4f}"
            )

            print(
                f"  Margin: "
                f"{ChatService.SELECTED_PAPER_SCORE_MARGIN:.2f}"
            )

        else:

            usable_results = [
                result
                for result in results
                if float(
                    result["score"]
                )
                >= ChatService.MIN_EVIDENCE_SCORE
            ]

        print(
            f"Usable evidence: "
            f"{len(usable_results)}"
        )

        # ====================================================
        # BUILD CITATION-AWARE CONTEXT
        # ====================================================

        if not usable_results:

            print(
                "\n⚠ No sufficiently "
                "relevant evidence."
            )

            context = ""

            evidence = []

        else:

            context_parts = []

            for index, result in enumerate(
                usable_results,
                start=1,
            ):

                chunk = result["chunk"]

                source_id = (
                    f"SOURCE_{index}"
                )

                context_parts.append(
                    f"""
[{source_id}]
Document: {chunk.document.title}
Document ID: {chunk.document_id}
Chunk ID: {chunk.id}
Page: {result["page_number"]}
Chunk Index: {chunk.chunk_index}
----------------------------------------
{chunk.content}
[/{source_id}]
"""
                )

            context = "\n".join(
                context_parts
            )

            print(
                "✓ Citation-aware context built"
            )

        # ====================================================
        # DEBUG CONTEXT
        # ====================================================

        print(
            "\n"
            + "=" * 100
        )

        print(
            "QUESTION:"
        )

        print(
            query
        )

        print(
            "=" * 100
        )

        print(
            "REWRITTEN QUERY:"
        )

        print(
            rewritten_query
        )

        print(
            "=" * 100
        )

        print(
            "SELECTED DOCUMENT ID:"
        )

        print(
            selected_document_id
        )

        print(
            "=" * 100
        )

        print(
            "CONTEXT SENT TO LLM:"
        )

        if context:

            print(
                context
            )

        else:

            print(
                "[NO DOCUMENT CONTEXT]"
            )

        print(
            "=" * 100
            + "\n"
        )

        # ====================================================
        # BUILD PROMPT
        # ====================================================

        prompt = PromptService.build_prompt(
            conversation_history=(
                conversation_history
            ),
            context=context,
            query=query,
        )

        # ====================================================
        # CALL GROQ
        # ====================================================

        print(
            "Calling Groq..."
        )

        print(
            f"Groq model: "
            f"{settings.groq_model}"
        )

        try:

            request_kwargs = {
                "model": settings.groq_model,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are Dasaiko, "
                            "an AI research "
                            "assistant."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                "temperature": 0.2,
            }

            # =================================================
            # STREAMING RESPONSE
            # =================================================

            if on_token is not None:

                request_kwargs["stream"] = True

                stream = (
                    client
                    .chat
                    .completions
                    .create(
                        **request_kwargs
                    )
                )

                answer_parts = []

                # ---------------------------------------------
                # Stream batching
                # ---------------------------------------------

                stream_buffer: list[str] = []

                last_flush = (
                    time.perf_counter()
                )

                FLUSH_INTERVAL = 0.045
                MAX_BUFFER_CHARS = 24

                def flush_stream_buffer() -> None:

                    nonlocal last_flush

                    if not stream_buffer:
                        return

                    text = "".join(
                        stream_buffer
                    )

                    stream_buffer.clear()

                    on_token(text)

                    last_flush = (
                        time.perf_counter()
                    )

                for chunk in stream:

                    if not chunk.choices:
                        continue

                    delta = (
                        chunk
                        .choices[0]
                        .delta
                        .content
                    )

                    if not delta:
                        continue

                    answer_parts.append(
                        delta
                    )

                    stream_buffer.append(
                        delta
                    )

                    buffered_length = len(
                        "".join(
                            stream_buffer
                        )
                    )

                    now = (
                        time.perf_counter()
                    )

                    if (
                        buffered_length
                        >= MAX_BUFFER_CHARS
                        or
                        (
                            now - last_flush
                            >= FLUSH_INTERVAL
                        )
                    ):

                        flush_stream_buffer()

                flush_stream_buffer()

                answer = "".join(
                    answer_parts
                )

            # =================================================
            # NON-STREAMING RESPONSE
            # =================================================

            else:

                response = (
                    client
                    .chat
                    .completions
                    .create(
                        **request_kwargs
                    )
                )

                answer = (
                    response
                    .choices[0]
                    .message
                    .content
                )

        # ====================================================
        # GROQ ERROR HANDLING
        # ====================================================

        except Exception as e:

            print(
                "\n========== GROQ ERROR =========="
            )

            print(
                f"Error type: "
                f"{type(e).__name__}"
            )

            print(
                f"Error: {e}"
            )

            print(
                "================================\n"
            )

            # ---------------------------------------------
            # IMPORTANT:
            #
            # Do NOT pretend every error is a timeout.
            # This could be:
            #
            # - model_not_found
            # - authentication failure
            # - rate limit
            # - server error
            # - network error
            #
            # The user gets a clean message while the
            # actual technical error remains in Render logs.
            # ---------------------------------------------

            answer = (
                "I couldn't generate the answer "
                "right now. Your document was "
                "retrieved successfully, but the "
                "language model is temporarily "
                "unavailable. Please try again."
            )

            # ---------------------------------------------
            # If streaming has already started, send the
            # fallback through the same stream.
            # ---------------------------------------------

            if on_token is not None:

                on_token(answer)

        print(
            "✓ Groq returned"
        )

        # ====================================================
        # VALIDATE SOURCE CITATIONS
        # ====================================================

        answer = (
            ChatService._validate_source_citations(
                answer=answer,
                evidence_count=len(
                    usable_results
                ),
            )
        )

        print(
            "✓ Source citations validated"
        )

        # ====================================================
        # SAVE ASSISTANT MESSAGE
        # ====================================================

        MessageService.create_message(
            db=db,
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
            user_id=user_id,
        )

        print(
            "✓ Assistant message saved"
        )

        # ====================================================
        # DEBUG ANSWER
        # ====================================================

        print(
            "\n"
            + "=" * 100
        )

        print(
            "LLM ANSWER:"
        )

        print(
            answer
        )

        print(
            "=" * 100
            + "\n"
        )

        # ====================================================
        # DEBUG EVIDENCE
        # ====================================================

        print(
            "\n===== RESULTS ====="
        )

        for result in usable_results:

            chunk = result["chunk"]

            print(
                f"Chunk ID: {chunk.id} | "
                f"Document ID: "
                f"{chunk.document_id} | "
                f"Document: "
                f"{chunk.document.title} | "
                f"Page: "
                f"{result['page_number']} | "
                f"Chunk Index: "
                f"{chunk.chunk_index} | "
                f"Score: "
                f"{result['score']}"
            )

        print(
            "===================\n"
        )

        # ====================================================
        # BUILD EVIDENCE RESPONSE
        # ====================================================

        evidence = []

        for result in usable_results:

            chunk = result["chunk"]

            evidence.append(
                {
                    "id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_name": chunk.document.title,
                    "chunk_index": chunk.chunk_index,
                    "page_number": result["page_number"],
                    "page_width": result.get(
                        "page_width"
                    ),
                    "page_height": result.get(
                        "page_height"
                    ),
                    "bboxes": result.get(
                        "bboxes",
                        [],
                    ),
                    "score": result["score"],
                    "preview": chunk.content,
                }
            )

        print(
            f"Final evidence count: "
            f"{len(evidence)}"
        )

        print(
            "========== CHAT END ==========\n"
        )

        return (
            answer,
            evidence,
            None,
        )