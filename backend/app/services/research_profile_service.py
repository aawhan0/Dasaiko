from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.research_profile import ResearchProfile
from app.models.user import User


class ResearchProfileService:
    @staticmethod
    def sync_from_onboarding(
        db: Session,
        user: User,
    ) -> ResearchProfile:
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

        db.commit()
        db.refresh(profile)
        return profile
