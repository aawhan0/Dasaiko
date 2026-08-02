from fastapi import FastAPI

from app.api.search import router as search_router

from app.api.chat import router as chat_router

from app.core.config import settings

from app.core.error_handlers import register_exception_handlers


from app.api.conversations import router as conversation_router
from app.api.messages import router as message_router



from app.api.documents import router as document_router

app = FastAPI(
    title = settings.app_name,
    version = settings.app_version,
)

register_exception_handlers(app)

app.include_router(document_router)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "environment": settings.environment,
    }

app.include_router(search_router)

app.include_router(chat_router)

app.include_router(conversation_router)
app.include_router(message_router)