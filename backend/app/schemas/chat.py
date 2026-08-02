from pydantic import BaseModel


class ChatRequest(BaseModel):
    conversation_id: int
    query: str


class SourceResponse(BaseModel):
    document: str
    chunk_index: int
    score: float

class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceResponse]