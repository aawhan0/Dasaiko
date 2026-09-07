from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ResearchActivityType = Literal[
    "paper_opened",
    "paper_completed",
    "paper_saved",
    "paper_skipped",
    "paper_revisited",
]


class ResearchActivityCreate(BaseModel):
    paper_id: str = Field(min_length=1, max_length=255)
    event_type: ResearchActivityType


class ResearchActivityResponse(BaseModel):
    id: int
    paper_id: str
    event_type: ResearchActivityType
    created_at: datetime

    model_config = {"from_attributes": True}
