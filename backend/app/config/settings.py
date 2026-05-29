# app/config/settings.py

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 🔌 Database
    DATABASE_URL: str

    # 🔐 JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # ☁️ Cloudinary
    CLOUD_NAME: str
    API_KEY: str
    API_SECRET: str

    class Config:
        env_file = ".env"


# 🔥 Create instance
settings = Settings()