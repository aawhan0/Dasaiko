from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    topic_affinity: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    goal_affinity: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    difficulty_affinity: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    exploration_weight: Mapped[float] = mapped_column(nullable=False, default=0.2)
    papers_opened: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    papers_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    papers_saved: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User", back_populates="research_profile")
