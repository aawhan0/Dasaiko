from urllib.parse import urlencode

import httpx

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.core.config import settings


class GoogleAuthService:

    GOOGLE_AUTHORIZATION_URL = (
        "https://accounts.google.com/o/oauth2/v2/auth"
    )

    GOOGLE_TOKEN_URL = (
        "https://oauth2.googleapis.com/token"
    )

    SCOPES = [
        "openid",
        "email",
        "profile",
    ]

    @staticmethod
    def get_authorization_url() -> str:

        params = {
            "client_id": (
                settings.google_client_id
            ),
            "redirect_uri": (
                settings.google_redirect_uri
            ),
            "response_type": "code",
            "scope": " ".join(
                GoogleAuthService.SCOPES
            ),
            "access_type": "offline",
            "prompt": "select_account",
        }

        return (
            GoogleAuthService.GOOGLE_AUTHORIZATION_URL
            + "?"
            + urlencode(params)
        )

    @staticmethod
    def exchange_code_for_tokens(
        code: str,
    ) -> dict:

        response = httpx.post(
            GoogleAuthService.GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": (
                    settings.google_client_id
                ),
                "client_secret": (
                    settings.google_client_secret
                ),
                "redirect_uri": (
                    settings.google_redirect_uri
                ),
                "grant_type": (
                    "authorization_code"
                ),
            },
            timeout=10.0,
        )

        if response.status_code != 200:

            raise ValueError(
                "Could not authenticate with Google."
            )

        return response.json()

    @staticmethod
    def verify_id_token(
        token: str,
    ) -> dict:

        try:

            payload = (
                id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    settings.google_client_id,
                )
            )

        except Exception:

            raise ValueError(
                "Invalid Google authentication."
            )

        if payload.get("iss") not in {
            "accounts.google.com",
            "https://accounts.google.com",
        }:

            raise ValueError(
                "Invalid Google authentication."
            )

        if not payload.get(
            "email_verified"
        ):

            raise ValueError(
                "Your Google email address "
                "has not been verified."
            )

        google_id = payload.get(
            "sub"
        )

        email = payload.get(
            "email"
        )

        if not google_id or not email:

            raise ValueError(
                "Google did not provide the "
                "required account information."
            )

        return {
            "google_id": google_id,
            "email": email.lower(),
            "email_verified": True,
            "name": payload.get(
                "name"
            ),
            "given_name": payload.get(
                "given_name"
            ),
            "family_name": payload.get(
                "family_name"
            ),
            "picture": payload.get(
                "picture"
            ),
        }

    @staticmethod
    def authenticate(
        code: str,
    ) -> dict:

        tokens = (
            GoogleAuthService.exchange_code_for_tokens(
                code
            )
        )

        id_token_value = tokens.get(
            "id_token"
        )

        if not id_token_value:

            raise ValueError(
                "Google did not return an "
                "identity token."
            )

        return (
            GoogleAuthService.verify_id_token(
                id_token_value
            )
        )