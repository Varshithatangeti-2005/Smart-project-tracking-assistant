import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # -------------------------
    # Database
    # -------------------------
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str
    db_password: str
    db_name: str

    # -------------------------
    # JWT
    # -------------------------
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # -------------------------
    # Gemini
    # -------------------------
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.0-flash"

    # -------------------------
    # Model settings
    # -------------------------
    temperature: float = 0.2
    top_p: float = 0.9
    top_k: int = 20
    max_output_tokens: int = 4096

    class Config:
        env_file = Path(__file__).resolve().parent.parent / ".env"
        case_sensitive = False


# Create settings object
settings = Settings()

# IMPORTANT: Export key for Google ADK
if settings.gemini_api_key:
    os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key

# Debug logs
print("Gemini Model:", settings.gemini_model)
print("Gemini Key Loaded:", bool(settings.gemini_api_key))
print("GOOGLE_API_KEY Available:", bool(os.getenv("GOOGLE_API_KEY")))