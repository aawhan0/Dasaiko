from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.search_service import SearchService

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

        messages = messages[-10:]

        conversation_history = "\n".join(
            f"{message.role.upper()}: {message.content}"
            for message in messages
        )

        print(f"✓ Loaded {len(messages)} previous messages")

        MessageService.create_message(
            db=db,
            conversation_id=conversation_id,
            role="user",
            content=query,
        )

        print("✓ User message saved")

        print("Searching...")

        results = SearchService.search(
            db=db,
            query=query,
            limit=5,
        )

        print("✓ Search returned")
        print(f"Retrieved {len(results)} results")

        context = "\n\n".join(
            chunk.content
            for chunk, _ in results
        )

        print("✓ Context built")

        print("\n" + "=" * 100)
        print("QUESTION:")
        print(query)
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

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You answer questions strictly from the provided context. "
                        "If the answer exists in the context, summarize it in your own words."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
        )

        print("✓ Groq returned")

        answer = response.choices[0].message.content

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

        for chunk, score in results:
            print(
                f"Chunk ID: {chunk.id}",
                f"Document ID: {chunk.document_id}",
                f"Document: {chunk.document.title}",
                f"Chunk Index: {chunk.chunk_index}",
                f"Score: {score}",
            )

        print("===================\n")
        print("========== CHAT END ==========\n")

        return answer, results