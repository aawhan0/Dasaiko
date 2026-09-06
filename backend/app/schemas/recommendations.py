from pydantic import BaseModel, Field


class StarterPaperRecommendation(BaseModel):
    paper_id: str
    title: str
    authors: str
    year: int
    topics: list[str]
    difficulty: str
    score: float
    reason: str
    matched_interests: list[str] = Field(default_factory=list)
    matched_goals: list[str] = Field(default_factory=list)
    starter_question: str
    tags: list[str] = Field(default_factory=list)


class StarterRecommendationsResponse(BaseModel):
    recommendations: list[StarterPaperRecommendation]
