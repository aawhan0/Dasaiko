from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import traceback
from app.core.exceptions import (
    ConversationNotFoundException,
    DocumentNotFoundException,
)

def register_exception_handlers(app: FastAPI):

    @app.exception_handler(DocumentNotFoundException)
    async def document_not_found_handler(
        request: Request,
        exc: DocumentNotFoundException,
    ):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "Document not found.",
                "data": None,
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_handler(
        request: Request,
        exc: SQLAlchemyError,
    ):
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Database error.",
                "data": None,
            },
        )


    @app.exception_handler(Exception)
    async def generic_handler(
        request: Request,
        exc: Exception,
    ):
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error.",
                "data": None,
            },
        )


    @app.exception_handler(ConversationNotFoundException)
    async def conversation_not_found_handler(
        request: Request,
        exc: ConversationNotFoundException,
    ):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "Conversation not found.",
                "data": None,
            },
        )