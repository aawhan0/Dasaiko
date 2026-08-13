from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User

from app.schemas.search import (
    SearchRequest,
    SearchResponse,
    SearchResult,
)

from app.services.search_service import SearchService


router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


@router.post(
    "",
    response_model=SearchResponse,
)
def semantic_search(
    request: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = SearchService.search(
        db=db,
        query=request.query,
        user_id=current_user.id,
    )

    return SearchResponse(
        results=[
            SearchResult(
                document=result["document_name"],
                chunk=result["preview"],
                score=float(result["score"]),
            )
            for result in results
        ]
    )