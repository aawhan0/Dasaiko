from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.models.research_profile import ResearchProfile
from app.models.research_activity import ResearchActivity
from app.schemas.recommendations import (
    StarterPaperRecommendation,
    StarterRecommendationsResponse,
)
from app.services.recommendation_service import RecommendationService


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.get(
    "/starter",
    response_model=StarterRecommendationsResponse,
)
def get_starter_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == current_user.id).first()
    activities = db.query(ResearchActivity).filter(ResearchActivity.user_id == current_user.id).all()

    ranked = RecommendationService.rank_starter_papers(
        current_user,
        limit=3,
        profile=profile,
        activities=activities,
    )

    return StarterRecommendationsResponse(
        recommendations=[
            StarterPaperRecommendation(
                paper_id=item.paper.id,
                title=item.paper.title,
                authors=item.paper.authors,
                year=item.paper.year,
                topics=list(item.paper.topics),
                difficulty=item.paper.difficulty,
                score=round(item.score, 4),
                reason=item.paper.reason,
                matched_interests=list(item.matched_interests),
                matched_goals=list(item.matched_goals),
                starter_question=item.paper.starter_question,
                tags=list(item.paper.tags),
            )
            for item in ranked
        ]
    )
