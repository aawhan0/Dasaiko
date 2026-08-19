from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Dasaiko API"
    app_version: str = "0.1.0"

    environment: str = "development"

    database_url: str
    groq_api_key: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"

    resend_api_key: str
    resend_from_email: str

    frontend_base_url: str = "http://localhost:5173"

    # Embeddings
    embedding_provider: str = "local"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    hf_token: str | None = None

    # Google OAuth
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
