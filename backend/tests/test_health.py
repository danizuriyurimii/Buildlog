from fastapi.testclient import TestClient
from app.main import create_app
from app.core.config import Settings


def client():
    return TestClient(create_app(Settings(_env_file=None)))


def test_health_response_contains_only_public_status():
    response = client().get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "BuildLog API"}


def test_allowed_origin_preflight():
    response = client().options("/api/health", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
    })
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_unknown_origin_cannot_read_cross_origin_response():
    response = client().get("/api/health", headers={"Origin": "https://untrusted.example"})
    assert "access-control-allow-origin" not in response.headers
