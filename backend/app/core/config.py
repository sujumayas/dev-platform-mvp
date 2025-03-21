from pydantic_settings import BaseSettings
from typing import Optional
import secrets
import os


class Settings(BaseSettings):
    # Base settings
    PROJECT_NAME: str = "Developer Platform MVP"
    API_V1_STR: str = "/api/v1"
    
    # Security settings
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # External API settings
    CLAUDE_API_KEY: Optional[str] = None
    
    # Database settings
    POSTGRES_USER: str = os.environ.get("POSTGRES_USER", "esennahelespinosa")  # Your username
    POSTGRES_PASSWORD: str = os.environ.get("POSTGRES_PASSWORD", "")
    POSTGRES_HOST: str = os.environ.get("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.environ.get("POSTGRES_PORT", "5433")  # Custom port 5433
    POSTGRES_DB: str = os.environ.get("POSTGRES_DB", "dev_platform")  # Using dev_platform database
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL from settings."""
        # If password is empty, don't include it in the URL
        if self.POSTGRES_PASSWORD:
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        else:
            return f"postgresql://{self.POSTGRES_USER}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # CORS settings
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
