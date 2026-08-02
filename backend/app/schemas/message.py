from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str

    model_config = {
        "from_attributes": True,
    }