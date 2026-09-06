from datetime import datetime

from pydantic import BaseModel, Field


class ResearchActivityCreate(BaseModel):
    paper_id: str = Field(min_length=1, max_length=255)
    event_type: str = Field(min_length=1, max_length=50)


class ResearchActivityResponse(BaseModel):
    id: int
    paper_id: str
    event_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
