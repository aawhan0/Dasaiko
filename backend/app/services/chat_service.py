from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings

from app.services.search_service import SearchService
from app.services.query_rewriter_service import QueryRewriterService

from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
from app.services.prompt_service import PromptService

client = Groq(
    api_key=settings.groq_api_key,
)


class ChatService:

    @staticmethod
    def chat(
        db: Session,
        conversation_id: int,
        query: str,
    ) -> tuple[str, list]:

        print("\n========== CHAT START ==========")

        conversation = ConversationService.get_conversation(
            db,
            conversation_id,
        )

        if conversation is None:
            raise ValueError("Conversation not found")

        print("✓ Conversation found")

        messages = MessageService.get_messages(
            db=db,
            conversation_id=conversation_id,
        )

        # Keep only recent history
        messages = messages[-4:]

        conversation_history = "\n".join(
            f"{message.role.upper()}: {message.content}"
            for message in messages
        )

        print(f"✓ Loaded {len(messages)} previous messages")

        # -----------------------------------------
        # Save user message
        # -----------------------------------------
        MessageService.create_message(
            db=db,
            conversation_id=conversation_id,
            role="user",
            content=query,
        )

        print("✓ User message saved")

        # -----------------------------------------
        # Query Rewriting
        # -----------------------------------------
        rewritten_query = query

        if len(messages) > 0:
            try:
                rewritten_query = QueryRewriterService.rewrite(
                    conversation_history=conversation_history,
                    query=query,
                )

                print("\n========== QUERY REWRITE ==========")
                print("Original :", query)
                print("Rewritten:", rewritten_query)
                print("===================================\n")

            except Exception as e:
                print("⚠ Query rewriting failed.")
                print(e)
                rewritten_query = query

        # -----------------------------------------
        # Search
        # -----------------------------------------
        print("Searching...")

        results = SearchService.search(
            db=db,
            query=rewritten_query,
            limit=5,
        )

        print("✓ Search returned")
        print(f"Retrieved {len(results)} results")

        # -----------------------------------------
        # Build Context
        # -----------------------------------------
        context_parts = []

        for index, result in enumerate(results, start=1):

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

        context = "\n".join(context_parts)

        print("✓ Context built")

        print("\n" + "=" * 100)
        print("QUESTION:")
        print(query)
        print("=" * 100)
        print("REWRITTEN QUERY:")
        print(rewritten_query)
        print("=" * 100)
        print("CONTEXT SENT TO LLM:")
        print(context)
        print("=" * 100 + "\n")

        prompt = PromptService.build_prompt(
            conversation_history=conversation_history,
            context=context,
            query=query,
        )

        print("Calling Groq...")

        try:

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are Dasaiko, an AI research assistant."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.2,
            )

            answer = response.choices[0].message.content

        except Exception as e:

            print("Groq Error:", e)

            answer = (
                "The language model took too long to respond. "
                "Please try asking again."
            )

        print("✓ Groq returned")

        # -----------------------------------------
        # Save Assistant Message
        # -----------------------------------------
        MessageService.create_message(
            db=db,
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
        )

        print("✓ Assistant message saved")

        print("\n" + "=" * 100)
        print("LLM ANSWER:")
        print(answer)
        print("=" * 100 + "\n")

        print("\n===== RESULTS =====")

        for result in results:

            chunk = result["chunk"]

            print(
                f"Chunk ID: {chunk.id}",
                f"Document ID: {chunk.document_id}",
                f"Document: {chunk.document.title}",
                f"Page: {result['page_number']}",
                f"Chunk Index: {chunk.chunk_index}",
                f"Score: {result['score']}",
            )

        print("===================\n")
        print("========== CHAT END ==========\n")

        return answer, results
