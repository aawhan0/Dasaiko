from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Dasaiko API"
    app_version: str = "0.1.0"
    environment: str = "development"

    database_url: str = ""
    openai_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
    )

settings = Settings()