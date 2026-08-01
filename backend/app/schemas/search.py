from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str


class SearchResult(BaseModel):
    document: str
    chunk: str
    score: float


class SearchResponse(BaseModel):
    results: list[SearchResult]