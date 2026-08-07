from pydantic import BaseModel


class ChatRequest(BaseModel):
    conversation_id: int
    query: str


class SourceResponse(BaseModel):
    id: int

    document_id: int

    document_name: str

    chunk_index: int

    page_number: int

    bboxes: list

    confidence: float

    preview: str


class ChatResponse(BaseModel):
    answer: str

    sources: list[SourceResponse]