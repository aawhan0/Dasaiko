from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.activity import ResearchActivityCreate, ResearchActivityResponse
from app.services.activity_service import ResearchActivityService
from app.services.research_profile_service import ResearchProfileService

router = APIRouter(prefix="/activity", tags=["Research Activity"])


@router.get("", response_model=list[ResearchActivityResponse])
def list_activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ResearchActivityService.recent_for_user(db, current_user.id)


@router.post(
    "",
    response_model=ResearchActivityResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_activity(
    request: ResearchActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        activity = ResearchActivityService.record(
            db=db,
            user_id=current_user.id,
            paper_id=request.paper_id,
            event_type=request.event_type,
        )
        ResearchProfileService.update_from_activity(
            db=db,
            user=current_user,
        )
        db.commit()
        return activity
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )
