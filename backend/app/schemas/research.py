from pydantic import BaseModel, Field

class ResearchPathItem(BaseModel):
    paper_id: str
    title: str
    difficulty: str
    stage: str
    rationale: str
    prerequisites: list[str] = Field(default_factory=list)

class ResearchPathResponse(BaseModel):
    topic: str
    items: list[ResearchPathItem]
