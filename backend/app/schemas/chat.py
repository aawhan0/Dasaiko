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

    page_width: float | None = None

    page_height: float | None = None

    bboxes: list

    confidence: float

    preview: str


class ChatResponse(BaseModel):
    answer: str

    sources: list[SourceResponse]