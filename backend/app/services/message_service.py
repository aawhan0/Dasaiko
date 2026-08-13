from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConversationNotFoundException,
)

from app.models.conversation import Conversation
from app.models.message import Message


class MessageService:

    @staticmethod
    def create_message(
        db: Session,
        conversation_id: int,
        role: str,
        content: str,
        user_id: int,
    ) -> Message:

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
            .first()
        )

        if conversation is None:
            raise ConversationNotFoundException()

        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def get_messages(
        db: Session,
        conversation_id: int,
        user_id: int,
    ) -> list[Message]:

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
            .first()
        )

        if conversation is None:
            raise ConversationNotFoundException()

        return (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .order_by(Message.id)
            .all()
        )