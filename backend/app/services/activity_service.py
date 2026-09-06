from sqlalchemy.orm import Session

from app.models.research_activity import ResearchActivity


class ResearchActivityService:
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
        event = event_type.strip().casefold()
        if event not in cls.ALLOWED_EVENTS:
            raise ValueError(f"Unsupported research activity: {event_type}")

        activity = ResearchActivity(
            user_id=user_id,
            paper_id=paper_id.strip(),
            event_type=event,
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity
