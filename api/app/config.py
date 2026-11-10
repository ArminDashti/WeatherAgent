from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    sqlite_path: str = "data/weather.db"
    sync_interval_minutes: int = 30
    extras_ttl_minutes: int = 60
    cors_origins: str = "http://localhost:8781,http://127.0.0.1:8781"
    openweathermap_api_key: str = ""
    tomorrow_api_key: str = ""
    visualcrossing_api_key: str = ""


settings = Settings()