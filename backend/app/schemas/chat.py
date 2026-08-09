from pydantic import BaseModel


class ChatRequest(BaseModel):
    conversation_id: int
    query: str
    selected_document_id: int | None = None
    selection_continuation: bool = False


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


class PaperOptionResponse(BaseModel):
    id: int
    title: str


class PaperSelectionResponse(BaseModel):
    required: bool
    documents: list[PaperOptionResponse]


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceResponse]
    paper_selection: (
        PaperSelectionResponse | None
    ) = None
