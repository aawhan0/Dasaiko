from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(
        Integer,
        primary_key=True,
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

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )