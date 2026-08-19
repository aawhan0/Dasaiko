from fastapi import APIRouter, Depends

from groq import Groq

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/diagnostics",
    tags=["Diagnostics"],
)


@router.get("/groq")
def groq_diagnostic(
    current_user: User = Depends(get_current_user),
):
    """Check which Groq models the production API key can access.

    This endpoint intentionally never exposes the API key itself.
    """
    client = Groq(api_key=settings.groq_api_key)

    try:
        models = client.models.list()
        model_ids = sorted(model.id for model in models.data)

        return {
            "groq_connected": True,
            "configured_model": settings.groq_model,
            "configured_model_available": settings.groq_model in model_ids,
            "available_model_count": len(model_ids),
            "available_models": model_ids,
        }

    except Exception as exc:
        return {
            "groq_connected": False,
            "configured_model": settings.groq_model,
            "configured_model_available": False,
            "error_type": type(exc).__name__,
            "error": str(exc),
        }
