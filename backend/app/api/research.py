from fastapi import APIRouter, Depends, Query
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.research import ResearchPathItem, ResearchPathResponse
from app.services.research_path_service import ResearchPathService

router = APIRouter(prefix="/research", tags=["Research"])

@router.get("/path", response_model=ResearchPathResponse)
def get_research_path(topic: str = Query(min_length=1, max_length=100), current_user: User = Depends(get_current_user)):
    items = ResearchPathService.build(topic)
    return ResearchPathResponse(topic=topic, items=[ResearchPathItem(paper_id=p.id, title=p.title, difficulty=p.difficulty, stage=stage, rationale=p.reason, prerequisites=list(p.prerequisites)) for p, stage in items])
