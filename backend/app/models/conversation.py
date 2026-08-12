from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    is_pinned = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    selected_document_id = Column(
        Integer,
        ForeignKey(
            "documents.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="conversations",
    )

    selected_document = relationship(
        "Document",
        foreign_keys=[
            selected_document_id
        ],
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )