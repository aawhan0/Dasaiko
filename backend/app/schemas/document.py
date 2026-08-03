from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentCreate(BaseModel):
    title: str
    content: str


class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class UploadedDocumentResponse(BaseModel):
    id: int
    title: str
    source: str
    file_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)