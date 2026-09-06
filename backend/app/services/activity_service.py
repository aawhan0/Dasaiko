from sqlalchemy.orm import Session

from app.models.research_activity import ResearchActivity


class ResearchActivityService:
    @classmethod
    def recent_for_user(cls, db: Session, user_id: int, limit: int = 100):
        return (db.query(ResearchActivity)
                .filter(ResearchActivity.user_id == user_id)
                .order_by(ResearchActivity.created_at.desc())
                .limit(max(1, min(limit, 500))).all())

    ALLOWED_EVENTS = {
        "paper_opened",
        "paper_completed",
        "paper_saved",
        "paper_skipped",
        "paper_revisited",
    }

    @classmethod
    def record(
        cls,
        db: Session,
        *,
        user_id: int,
        paper_id: str,
        event_type: str,
    ) -> ResearchActivity:
        normalized_paper_id = paper_id.strip()
        event = event_type.strip().casefold()

        if not normalized_paper_id:
            raise ValueError("Paper ID cannot be empty")
        if event not in cls.ALLOWED_EVENTS:
            raise ValueError(f"Unsupported research activity: {event_type}")

        activity = ResearchActivity(
            user_id=user_id,
            paper_id=normalized_paper_id,
            event_type=event,
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity
