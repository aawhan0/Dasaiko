from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService


SessionLocal = sessionmaker(bind=engine)

db = SessionLocal()

try:

    conversation = (
        ConversationService.create_conversation(
            db=db,
            user_id=1,
            title="RAG Evaluation",
        )
    )

    print(
        "CONVERSATION:",
        conversation.id,
    )

    answer, evidence, extra = (
        ChatService.chat(
            db=db,
            conversation_id=conversation.id,
            user_id=1,
            query=(
                "How does the Skip-gram model "
                "learn word representations?"
            ),
        )
    )

    print()
    print("=" * 100)
    print("FINAL ANSWER")
    print("=" * 100)

    print(answer)

    print()
    print("=" * 100)
    print("EVIDENCE")
    print("=" * 100)

    for index, item in enumerate(
        evidence,
        start=1,
    ):

        print(
            f"{index}. "
            f"Chunk={item['id']} | "
            f"Doc={item['document_name']} | "
            f"Page={item['page_number']} | "
            f"Score={item['score']}"
        )

    print("=" * 100)

finally:

    db.close()
