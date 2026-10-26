from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.accounts.routes import router as accounts_router
from app.core.config import Settings
from app.db.session import build_session_factory, create_database_engine


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    app = FastAPI(title="BuildLog API", version="0.1.0")
    app.state.settings = settings
    app.state.engine = create_database_engine(settings.database_url)
    app.state.session_factory = build_session_factory(app.state.engine)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH"],
        allow_headers=["Content-Type"],
    )
    app.include_router(accounts_router)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "BuildLog API"}

    return app


app = create_app()
