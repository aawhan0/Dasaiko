from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConversationNotFoundException,
)
from app.models.conversation import Conversation

class ConversationService:

    @staticmethod
    def create_conversation(
        db: Session,
        title: str | None,
        user_id: int,
    ) -> Conversation:

        conversation = Conversation(
            title=title or "New Workspace",
            is_pinned=False,
            selected_document_id=None,
            user_id=user_id,
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def get_conversation(
        db: Session,
        conversation_id: int,
        user_id: int,
    ) -> Conversation | None:

        return (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def rename_conversation(
        db: Session,
        conversation_id: int,
        title: str,
        user_id: int,
    ) -> Conversation:

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

        conversation.title = title

        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def get_conversations(
        db: Session,
        user_id: int,
    ) -> list[Conversation]:

        return (
            db.query(Conversation)
            .filter(
                Conversation.user_id == user_id
            )
            .order_by(
                Conversation.id.desc()
            )
            .all()
        )

    @staticmethod
    def delete_conversation(
        db: Session,
        conversation_id: int,
        user_id: int,
    ) -> bool:

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
            .first()
        )

        if conversation is None:
            return False

        db.delete(conversation)
        db.commit()

        return True

    @staticmethod
    def toggle_pin(
        db: Session,
        conversation_id: int,
        user_id: int,
    ) -> Conversation:

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

        conversation.is_pinned = (
            not conversation.is_pinned
        )

        db.commit()
        db.refresh(conversation)

        return conversation