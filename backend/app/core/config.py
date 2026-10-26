from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BACKEND_DIR.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore")
    database_url: str = "sqlite:///" + str(PROJECT_DIR / "database" / "buildlog.sqlite3")
    test_database_url: str = "sqlite:///:memory:"
    cors_origins: list[str] = ["http://localhost:5173"]
