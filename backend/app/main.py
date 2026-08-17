from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.error_handlers import register_exception_handlers

from app.api.auth import router as auth_router
from app.api.documents import router as document_router
from app.api.search import router as search_router
from app.api.chat import router as chat_router
from app.api.conversations import router as conversation_router
from app.api.messages import router as message_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)


register_exception_handlers(app)


# -----------------------------
# CORS
# -----------------------------

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if settings.frontend_base_url:
    allowed_origins.append(
        settings.frontend_base_url.rstrip("/")
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Static PDF Files
# -----------------------------

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)


# -----------------------------
# Routes
# -----------------------------

app.include_router(auth_router)
app.include_router(document_router)
app.include_router(search_router)
app.include_router(chat_router)
app.include_router(conversation_router)
app.include_router(message_router)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "environment": settings.environment,
    }