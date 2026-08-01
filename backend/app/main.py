from fastapi import FastAPI

from app.core.config import settings

from app.api.documents import router as document_router

app = FastAPI(
    title = settings.app_name,
    version = settings.app_version,
)

app.include_router(document_router)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "environment": settings.environment,
    }