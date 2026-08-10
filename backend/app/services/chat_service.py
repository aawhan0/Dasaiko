from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings

from app.models.document import Document

from app.services.search_service import SearchService
from app.services.query_rewriter_service import QueryRewriterService

from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
from app.services.prompt_service import PromptService


client = Groq(
    api_key=settings.groq_api_key,
)


class ChatService:

    # -----------------------------------------
    # Minimum reranker score required for
    # general/unrestricted evidence.
    #
    # Cross-encoder scores are ranking scores,
    # NOT probabilities.
    # -----------------------------------------

    MIN_EVIDENCE_SCORE = -2.0

    # -----------------------------------------
    # When a user explicitly selects a paper,
    # evidence is already restricted to that
    # document.
    #
    # Instead of requiring an absolute score,
    # we allow results within this score margin
    # of the best result.
    # -----------------------------------------

    SELECTED_PAPER_SCORE_MARGIN = 3.0

    # -----------------------------------------
    # Casual / conversational messages
    # -----------------------------------------

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

        return (
            normalized
            in casual_messages
        )

    # -----------------------------------------
    # Paper-context query detection
    # -----------------------------------------
    #
    # These are questions that cannot be answered
    # reliably without knowing which uploaded paper
    # the user means.
    #
    # IMPORTANT:
    # This does NOT contain any paper titles or IDs.
    # It is intentionally generic.
    # -----------------------------------------

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

    @staticmethod
    def _needs_paper_selection(
        query: str,
        conversation_history: str,
    ) -> bool:
        """
        Return True when the user is asking a
        paper-dependent question but no paper has
        been selected by the frontend.

        IMPORTANT:
        Conversation history must NOT suppress paper
        selection. A conversation can contain casual
        messages such as "hi" before the user asks a
        paper-dependent question.

        The frontend selection UI owns the actual
        paper list. This method only decides whether
        selection is required.
        """

        return ChatService._is_paper_context_query(
            query
        )

    # -----------------------------------------
    # Get paper-selection options
    # -----------------------------------------

    @staticmethod
    def _get_paper_selection_options(
        db: Session,
    ) -> list[dict]:

        documents = (
            db.query(Document)
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

            if (
                normalized_title
                in seen_titles
            ):
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

    # -----------------------------------------
    # Build paper-selection response
    # -----------------------------------------
    #
    # IMPORTANT:
    # The actual paper names are returned separately
    # through paper_selection and rendered by the
    # frontend selection component.
    #
    # Do NOT list the papers in this text response.
    # -----------------------------------------

    @staticmethod
    def _build_paper_selection_response(
        db: Session,
    ) -> str:

        documents = (
            ChatService
            ._get_paper_selection_options(
                db
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

    # -----------------------------------------
    # Main Chat
    # -----------------------------------------

    @staticmethod
    def chat(
        db: Session,
        conversation_id: int,
        query: str,
        selected_document_id: int | None = None,
        selection_continuation: bool = False,
    ) -> tuple[
        str,
        list,
        list[dict] | None,
    ]:

        print(
            "\n========== CHAT START =========="
        )

        # -----------------------------------------
        # Conversation
        # -----------------------------------------

        conversation = (
            ConversationService.get_conversation(
                db,
                conversation_id,
            )
        )

        if conversation is None:

            raise ValueError(
                "Conversation not found"
            )

        print(
            "✓ Conversation found"
        )

        # -----------------------------------------
        # Determine whether this request is the
        # one-time paper-selection continuation.
        #
        # Normal follow-up questions may also carry
        # selected_document_id, but they must NOT
        # create another "Research Context Set"
        # event. Only the explicit picker action
        # creates that historical event.
        # -----------------------------------------

        is_new_research_context_selection = (
            selection_continuation
            and selected_document_id is not None
        )

        # -----------------------------------------
        # Restore conversation research context
        #
        # The frontend also keeps a browser-local
        # per-conversation cache so switching and
        # reloading feel instant. The database is
        # the durable source of truth once the
        # migration has been applied.
        # -----------------------------------------

        if selected_document_id is None:

            persisted_document_id = getattr(
                conversation,
                "selected_document_id",
                None,
            )

            if (
                persisted_document_id
                is not None
            ):

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

        # -----------------------------------------
        # Load recent messages
        # -----------------------------------------

        messages = (
            MessageService.get_messages(
                db=db,
                conversation_id=conversation_id,
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

        # -----------------------------------------
        # Save user message
        #
        # When a user selects a paper from the
        # paper picker, the original question has
        # already been saved. The frontend sends
        # selection_continuation=True so we can
        # answer that original question without
        # creating a duplicate user message.
        # -----------------------------------------

        if not selection_continuation:

            MessageService.create_message(
                db=db,
                conversation_id=conversation_id,
                role="user",
                content=query,
            )

            print(
                "✓ User message saved"
            )

        else:

            print(
                "✓ Continuing original question "
                "after paper selection"
            )

        # -----------------------------------------
        # Casual Message Detection
        # -----------------------------------------

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

            MessageService.create_message(
                db=db,
                conversation_id=conversation_id,
                role="assistant",
                content=answer,
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

        # -----------------------------------------
        # Ambiguous Paper Reference Detection
        # -----------------------------------------

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
                    db
                )
            )

            answer = (
                ChatService
                ._build_paper_selection_response(
                    db=db,
                )
            )

            MessageService.create_message(
                db=db,
                conversation_id=conversation_id,
                role="assistant",
                content=answer,
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

        # -----------------------------------------
        # Explicit Paper Selection
        # -----------------------------------------

        if selected_document_id is not None:

            selected_document = (
                db.query(Document)
                .filter(
                    Document.id
                    == selected_document_id
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

                # ---------------------------------
                # Persist the selected paper to the
                # conversation when the database
                # migration/model are active.
                # ---------------------------------

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

                # ---------------------------------
                # Persist the context-selection event
                # exactly once, at the moment the user
                # selects the paper.
                #
                # This is a real message in the
                # conversation history, so it survives
                # reloads and is not re-created for
                # subsequent questions.
                # ---------------------------------

                if (
                    is_new_research_context_selection
                ):

                    MessageService.create_message(
                        db=db,
                        conversation_id=conversation_id,
                        role="research_context",
                        content=(
                            selected_document.title
                            or "Selected research paper"
                        ),
                    )

                    print(
                        "✓ Research context event saved"
                    )

        # -----------------------------------------
        # Query Rewriting
        # -----------------------------------------
        #
        # When a research paper has explicitly been
        # selected, preserve the user's query.
        #
        # The selected document already provides the
        # missing research context, and rewriting can
        # accidentally change a short question such as:
        #
        #     "who is the author?"
        #
        # into something unrelated to the selected
        # paper.
        #
        # For global search, conversation-aware query
        # rewriting remains enabled.
        # -----------------------------------------

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
                    "Original :",
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

                print(e)

                rewritten_query = query

        # -----------------------------------------
        # Search
        # -----------------------------------------

        print(
            "Searching..."
        )

        results = SearchService.search(
            db=db,
            query=rewritten_query,
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

        # -----------------------------------------
        # Filter Weak Evidence
        # -----------------------------------------
        #
        # IMPORTANT:
        #
        # CrossEncoder scores are ranking scores.
        #
        # They are NOT:
        #
        #     0 → 100 confidence
        #
        # A selected paper can legitimately have
        # scores such as:
        #
        #     -5.03
        #     -8.69
        #     -8.95
        #
        # If the user selected a paper, we already
        # know the correct document scope.
        #
        # Therefore we use a relative threshold:
        #
        # best score
        #      ↓
        # best score - margin
        #
        # This prevents us from throwing away all
        # evidence simply because the absolute
        # reranker scores are negative.
        # -----------------------------------------

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

            # -------------------------------------
            # Safety:
            # Always keep the strongest result
            # when a selected paper produced
            # retrieval results.
            # -------------------------------------

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

        # -----------------------------------------
        # No Usable Evidence
        # -----------------------------------------

        if not usable_results:

            print(
                "\n⚠ No sufficiently "
                "relevant evidence."
            )

            context = ""

            evidence = []

        else:

            # -------------------------------------
            # Build Context
            # -------------------------------------

            context_parts = []

            for index, result in enumerate(
                usable_results,
                start=1,
            ):

                chunk = result["chunk"]

                context_parts.append(
                    f"""
Document: {chunk.document.title}
Page: {result["page_number"]}
Chunk {index}
----------------------------------------
{chunk.content}
"""
                )

            context = "\n".join(
                context_parts
            )

            print(
                "✓ Context built"
            )

        # -----------------------------------------
        # Debug Context
        # -----------------------------------------

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

        # -----------------------------------------
        # Build Prompt
        # -----------------------------------------

        prompt = PromptService.build_prompt(
            conversation_history=(
                conversation_history
            ),
            context=context,
            query=query,
        )

        # -----------------------------------------
        # Call Groq
        # -----------------------------------------

        print(
            "Calling Groq..."
        )

        try:

            response = (
                client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
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
                    temperature=0.2,
                )
            )

            answer = (
                response
                .choices[0]
                .message
                .content
            )

        except Exception as e:

            print(
                "Groq Error:",
                e,
            )

            answer = (
                "The language model took too "
                "long to respond. Please try "
                "asking again."
            )

        print(
            "✓ Groq returned"
        )

        # -----------------------------------------
        # Save Assistant Message
        # -----------------------------------------

        MessageService.create_message(
            db=db,
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
        )

        print(
            "✓ Assistant message saved"
        )

        # -----------------------------------------
        # Debug Answer
        # -----------------------------------------

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

        # -----------------------------------------
        # Debug Evidence
        # -----------------------------------------

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

        # -----------------------------------------
        # Build Evidence Response
        # -----------------------------------------
        #
        # Evidence is built ONLY from
        # usable_results.
        #
        # Therefore:
        #
        # weak retrieval
        #       ↓
        # usable_results = []
        #       ↓
        # evidence = []
        #       ↓
        # Evidence Vault stays empty.
        # -----------------------------------------

        evidence = []

        for result in usable_results:

            chunk = result["chunk"]

            evidence.append(
                {
                    "id":
                        chunk.id,

                    "document_id":
                        chunk.document_id,

                    "document_name":
                        chunk.document.title,

                    "chunk_index":
                        chunk.chunk_index,

                    "page_number":
                        result["page_number"],

                    "page_width":
                        result.get(
                            "page_width"
                        ),

                    "page_height":
                        result.get(
                            "page_height"
                        ),

                    "bboxes":
                        result.get(
                            "bboxes",
                            [],
                        ),

                    "score":
                        result["score"],

                    "preview":
                        chunk.content,
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