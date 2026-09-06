from dataclasses import dataclass

from app.data.paper_catalog import PAPER_CATALOG, PaperCatalogEntry
from app.models.user import User
from app.models.research_profile import ResearchProfile
from app.models.research_activity import ResearchActivity


@dataclass(frozen=True)
class RankedPaper:
    paper: PaperCatalogEntry
    score: float
    matched_interests: tuple[str, ...]
    matched_goals: tuple[str, ...]


class RecommendationService:
    """Deterministic profile-aware ranking engine."""

    ROLE_WEIGHTS = {
        "student": 1.00,
        "educator": 0.90,
        "curious": 0.85,
    }

    FAMILIARITY_MAX_DIFFICULTY = {
        "new": 0,
        "few": 1,
        "comfortable": 2,
    }

    GOAL_TAGS = {
        "understand-papers": {"foundation", "pretraining", "attention"},
        "discover-papers": {"foundation", "scaling", "retrieval"},
        "project-research": {"rag", "retrieval", "cnn", "vision", "scaling", "transformer"},
    }

    @classmethod
    def rank_starter_papers(cls, user: User, limit: int = 3, profile: ResearchProfile | None = None, activities: list[ResearchActivity] | None = None) -> list[RankedPaper]:
        interests = {
            value.strip().casefold()
            for value in (user.onboarding_interests or [])
            if isinstance(value, str) and value.strip()
        }
        goals = {
            value.strip().casefold()
            for value in (user.onboarding_goals or [])
            if isinstance(value, str) and value.strip()
        }
        familiarity = user.research_familiarity or "new"
        profile_topics = {str(k).casefold(): float(v) for k, v in (profile.topic_affinity or {}).items()} if profile else {}
        skipped_ids = {item.paper_id for item in (activities or []) if item.event_type == "paper_skipped"}
        completed_ids = {item.paper_id for item in (activities or []) if item.event_type == "paper_completed"}
        profile_topics = {str(k).casefold(): float(v) for k, v in (profile.topic_affinity or {}).items()} if profile else {}
        role = (user.onboarding_role or "curious").casefold()
        role_multiplier = cls.ROLE_WEIGHTS.get(role, 0.85)

        ranked: list[RankedPaper] = []
        for paper in PAPER_CATALOG:
            topic_matches = tuple(
                topic for topic in paper.topics if topic.casefold() in interests
            )
            matched_goals = tuple(
                goal
                for goal in goals
                if cls.GOAL_TAGS.get(goal, set()).intersection(paper.tags)
            )

            behavioral_score = sum(profile_topics.get(topic.casefold(), 0.0) for topic in paper.topics) if profile_topics else 0.0
            topic_score = min(len(topic_matches), 3) * 3.0 + min(behavioral_score, 6.0)
            exploration_score = 1.5 if paper.id not in completed_ids and not topic_matches else 0.0
            history_adjustment = -8.0 if paper.id in skipped_ids else (-2.0 if paper.id in completed_ids else 0.0)
            goal_score = len(matched_goals) * 2.0 * role_multiplier
            importance_score = paper.importance * 2.0
            difficulty_score = cls._difficulty_fit(paper.difficulty, familiarity)
            known_topics = set(profile_topics)
            prerequisite_score = sum(1.0 for prerequisite in paper.prerequisites if prerequisite.casefold() in known_topics)
            if paper.prerequisites and familiarity == "new" and prerequisite_score == 0:
                prerequisite_score -= 1.0

            ranked.append(
                RankedPaper(
                    paper=paper,
                    score=topic_score + goal_score + importance_score + difficulty_score + prerequisite_score + exploration_score + history_adjustment,
                    matched_interests=topic_matches,
                    matched_goals=matched_goals,
                )
            )

        ranked.sort(key=lambda item: (-item.score, -item.paper.importance, item.paper.id))
        return cls._diversify(ranked, limit, interests)

    @classmethod
    def _difficulty_fit(cls, difficulty: str, familiarity: str) -> float:
        max_level = cls.FAMILIARITY_MAX_DIFFICULTY.get(familiarity, 0)
        level = {"Foundational": 0, "Accessible": 1, "Intermediate": 2}.get(difficulty, 1)
        if level <= max_level:
            return 2.0
        if level == max_level + 1:
            return 0.5
        return -1.0

    @staticmethod
    def _diversify(
        ranked: list[RankedPaper],
        limit: int,
        interests: set[str],
    ) -> list[RankedPaper]:
        if limit <= 0:
            return []

        picked: list[RankedPaper] = []
        covered: set[str] = set()

        for candidate in ranked:
            matching_topics = {
                topic.casefold()
                for topic in candidate.paper.topics
                if topic.casefold() in interests
            }
            adds_new_interest = bool(matching_topics - covered)
            if not picked or adds_new_interest:
                picked.append(candidate)
                covered.update(matching_topics)
            if len(picked) == limit:
                return picked

        seen = {item.paper.id for item in picked}
        for candidate in ranked:
            if candidate.paper.id in seen:
                continue
            picked.append(candidate)
            seen.add(candidate.paper.id)
            if len(picked) == limit:
                break
        return picked


    @staticmethod
    def build_reason(item: RankedPaper) -> str:
        if item.matched_interests:
            interests = ", ".join(item.matched_interests[:2])
            return f"Good starting point because it connects with your interest in {interests}."
        if item.matched_goals:
            return "Good starting point because it matches one of your research goals."
        return item.paper.reason
