from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    api_title: str = "SmartTransit API"
    api_version: str = "0.1.0"
    debug: bool = True
    oracle_user: str = "smart_transit"
    oracle_password: str = "change_me"
    oracle_dsn: str = "localhost/XEPDB1"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
