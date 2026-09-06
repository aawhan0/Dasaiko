from types import SimpleNamespace

from app.data.paper_catalog import PAPER_CATALOG
from app.services.recommendation_service import RecommendationService


def make_user(**overrides):
    values = {
        "onboarding_interests": ["transformers"],
        "onboarding_goals": ["understand-papers"],
        "research_familiarity": "new",
        "onboarding_role": "student",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def test_starter_recommendations_are_limited_and_unique():
    results = RecommendationService.rank_starter_papers(make_user(), limit=3)
    assert len(results) == 3
    assert len({item.paper.id for item in results}) == 3


def test_skipped_paper_is_penalized():
    paper_id = PAPER_CATALOG[0].id
    activities = [SimpleNamespace(paper_id=paper_id, event_type="paper_skipped")]
    baseline = RecommendationService.rank_starter_papers(make_user(), limit=len(PAPER_CATALOG))
    adjusted = RecommendationService.rank_starter_papers(
        make_user(),
        limit=len(PAPER_CATALOG),
        activities=activities,
    )
    baseline_score = next(item.score for item in baseline if item.paper.id == paper_id)
    adjusted_score = next(item.score for item in adjusted if item.paper.id == paper_id)
    assert adjusted_score < baseline_score


def test_personalized_reason_mentions_matching_interest():
    results = RecommendationService.rank_starter_papers(make_user(), limit=3)
    matching = next((item for item in results if item.matched_interests), None)
    assert matching is not None
    reason = RecommendationService.build_reason(matching)
    assert "interest" in reason.lower()
