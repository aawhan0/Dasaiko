from datetime import datetime, timezone

from sqlalchemy.orm import relationship

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)

    chunks = relationship(
    "Chunk",
    back_populates="document",
    cascade="all, delete-orphan",
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="manual",
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
    )

    file_path: Mapped[str] = mapped_column(
        Text(),
    )

    created_at: Mapped[str] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )