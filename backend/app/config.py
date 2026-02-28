from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./hackplate.db"

    # Auth (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: str
    CLERK_SECRET_KEY: str

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # Email (SMTP)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    # Geocoding
    NOMINATIM_USER_AGENT: str = "hackplate-ai/3.0"

    # Scraping
    SCRAPE_LIMIT: int = 10

    class Config:
        env_file = (".env", "../.env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
