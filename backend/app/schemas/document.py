from pydantic import BaseModel, ConfigDict



#Schema 1
class DocumentCreate(BaseModel):
    title: str
    content: str

#Schema 2    
class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str

    model_config = ConfigDict(from_attributes=True)

#Schema 3
class DocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


#Schema 4
class UploadedDocumentResponse(BaseModel):
    id: int
    title: str
    source: str
    file_name: str

    model_config = ConfigDict(from_attributes=True)