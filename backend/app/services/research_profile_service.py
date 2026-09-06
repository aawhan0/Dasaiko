from collections import defaultdict
from datetime import datetime
import math

from sqlalchemy.orm import Session

from app.data.paper_catalog import PAPER_CATALOG
from app.models.research_activity import ResearchActivity
from app.models.research_profile import ResearchProfile
from app.models.user import User


class ResearchProfileService:
    EVENT_WEIGHTS = {
        "paper_opened": 1.0,
        "paper_revisited": 1.5,
        "paper_completed": 2.0,
        "paper_saved": 2.5,
        "paper_skipped": -1.0,
    }

    @classmethod
    def sync_from_onboarding(cls, db: Session, user: User) -> ResearchProfile:
        profile = (
            db.query(ResearchProfile)
            .filter(ResearchProfile.user_id == user.id)
            .first()
        )
        if profile is None:
            profile = ResearchProfile(user_id=user.id)
            db.add(profile)

        topic_affinity: dict[str, float] = defaultdict(float)
        for interest in user.onboarding_interests or []:
            if isinstance(interest, str) and interest.strip():
                topic_affinity[interest.strip()] = 1.0

        goal_affinity: dict[str, float] = defaultdict(float)
        for goal in user.onboarding_goals or []:
            if isinstance(goal, str) and goal.strip():
                goal_affinity[goal.strip()] = 1.0

        familiarity = user.research_familiarity or "new"
        difficulty_affinity = {
            "Foundational": 1.0,
            "Accessible": 0.7 if familiarity != "new" else 0.45,
            "Intermediate": 0.25 if familiarity == "comfortable" else 0.05,
        }

        profile.topic_affinity = dict(topic_affinity)
        profile.goal_affinity = dict(goal_affinity)
        profile.difficulty_affinity = difficulty_affinity
        profile.exploration_weight = 0.2
        db.flush()
        return profile

    @staticmethod
    def _aggregate_goals(user, activities, catalog_by_id):
        scores = defaultdict(float)
        for goal in user.onboarding_goals or []:
            if isinstance(goal, str) and goal.strip(): scores[goal.strip()] += 1.0
        for activity in activities:
            if catalog_by_id.get(activity.paper_id) is None: continue
            weight = max(ResearchProfileService.EVENT_WEIGHTS.get(activity.event_type, 0.0), 0.0)
            for goal in user.onboarding_goals or []:
                if isinstance(goal, str) and goal.strip(): scores[goal.strip()] += weight * 0.1
        return scores

    @classmethod
    def update_from_activity(cls, db: Session, user: User) -> ResearchProfile:
        profile = cls.sync_from_onboarding(db, user)
        activities = (
            db.query(ResearchActivity)
            .filter(ResearchActivity.user_id == user.id)
            .all()
        )

        profile.papers_opened = sum(
            1 for item in activities if item.event_type in {"paper_opened", "paper_revisited"}
        )
        profile.papers_completed = sum(
            1 for item in activities if item.event_type == "paper_completed"
        )
        profile.papers_saved = sum(
            1 for item in activities if item.event_type == "paper_saved"
        )
        profile.goal_affinity = dict(cls._aggregate_goals(user, activities, catalog_by_id))

        catalog_by_id = {paper.id: paper for paper in PAPER_CATALOG}
        topic_affinity: dict[str, float] = defaultdict(float)

        for interest in user.onboarding_interests or []:
            if isinstance(interest, str) and interest.strip():
                topic_affinity[interest.strip()] = 1.0

        now = datetime.utcnow()
        for activity in activities:
            paper = catalog_by_id.get(activity.paper_id)
            weight = cls.EVENT_WEIGHTS.get(activity.event_type, 0.0)
            age_days = max((now - activity.created_at).total_seconds() / 86400.0, 0.0)
            weight *= math.exp(-0.035 * age_days)
            if paper is None or weight == 0.0:
                continue

            for topic in paper.topics:
                topic_affinity[topic] += weight

        profile.topic_affinity = dict(topic_affinity)
        db.flush()
        return profile
