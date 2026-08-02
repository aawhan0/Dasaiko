from sqlalchemy.orm import Session

from app.models.conversation import Conversation


class ConversationService:

    @staticmethod
    def create_conversation(
        db: Session,
        title: str,
    ) -> Conversation:

        conversation = Conversation(
            title=title,
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def get_conversation(
        db: Session,
        conversation_id: int,
    ) -> Conversation | None:

        return (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )




    @staticmethod
    def get_conversations(
    db: Session,

    ) -> list[Conversation]:

        return (
            db.query(Conversation)
            .order_by(Conversation.id.desc())
            .all()
        )