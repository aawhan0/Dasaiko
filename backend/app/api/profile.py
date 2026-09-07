from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.auth import (
    ResearchProfileResponse,
    ResearchProfileUpdateRequest,
)
from app.services.research_profile_service import ResearchProfileService


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


@router.get(
    "/me",
    response_model=ResearchProfileResponse,
)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ResearchProfileService.update_from_activity(db, current_user)
    db.commit()
    return ResearchProfileResponse(
        onboarding_completed=current_user.onboarding_completed,
        role=current_user.onboarding_role,
        interests=current_user.onboarding_interests or [],
        goals=current_user.onboarding_goals or [],
        research_familiarity=current_user.research_familiarity,
    )


@router.put(
    "/me",
    response_model=ResearchProfileResponse,
)
def update_profile(
    request: ResearchProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.onboarding_completed = request.onboarding_completed
    current_user.onboarding_role = request.role
    current_user.onboarding_interests = request.interests
    current_user.onboarding_goals = request.goals
    current_user.research_familiarity = request.research_familiarity

    db.add(current_user)
    db.flush()

    ResearchProfileService.sync_from_onboarding(
        db=db,
        user=current_user,
    )

    # Persist onboarding completion so a fresh browser session
    # does not incorrectly send the user back to onboarding.
    db.commit()
    db.refresh(current_user)

    return ResearchProfileResponse(
        onboarding_completed=current_user.onboarding_completed,
        role=current_user.onboarding_role,
        interests=current_user.onboarding_interests or [],
        goals=current_user.onboarding_goals or [],
        research_familiarity=current_user.research_familiarity,
    )
