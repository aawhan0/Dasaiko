from pydantic import BaseModel


class ConversationCreate(BaseModel):
    title: str | None = None


class ConversationResponse(BaseModel):
    id: int
    title: str
    is_pinned: bool
    selected_document_id: int | None = None

    model_config = {
        "from_attributes": True,
    }


class ConversationRename(BaseModel):
    title: str
