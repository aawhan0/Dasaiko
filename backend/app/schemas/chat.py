from pydantic import BaseModel


class ChatRequest(BaseModel):
    conversation_id: int
    query: str


class SourceResponse(BaseModel):
    paper_title: str
    chunk_number: int
    confidence: float
    preview: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceResponse]