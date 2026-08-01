from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
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
):
    results = SearchService.search(
        db,
        request.query,
    )

    return SearchResponse(
        results=[
            SearchResult(
                document=chunk.document.title,
                chunk=chunk.content,
                score=float(distance),
            )
            for chunk, distance in results
        ]
    )