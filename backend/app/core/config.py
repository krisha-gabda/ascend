from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = 'ASCEND'
    DEBUG: bool = False

    # Database
    SUPABASE_URL: str
    SUPABASE_SECRET_KEY: str

    # JWT Auth
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = 'HS256'

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        'http://localhost:8081',
    ]

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


@lru_cache
def get_settings() -> Settings:
    return Settings()