from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    gemini_api_key: str | None = None

    default_provider: str = "openai"
    default_openai_model: str = "gpt-4o-mini"
    default_anthropic_model: str = "claude-3-5-sonnet-20241022"
    default_gemini_model: str = "gemini-2.5-flash"

    session_ttl_seconds: int = 3600

    max_file_size_mb: int = 25
    max_chat_length: int = 8000
    max_document_length: int = 200_000
    rate_limit_per_minute: int = 60

    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
