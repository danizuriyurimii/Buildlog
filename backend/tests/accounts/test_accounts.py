from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.accounts.models import User
from app.core.config import Settings
from app.db.base import Base
from app.main import create_app


@pytest.fixture
def app_and_db(tmp_path: Path):
    database_url = f"sqlite:///{tmp_path / 'accounts.sqlite3'}"
    settings = Settings(_env_file=None, database_url=database_url)
    app = create_app(settings)
    Base.metadata.create_all(app.state.engine)
    yield app, database_url
    app.state.engine.dispose()


@pytest.fixture
def client(app_and_db):
    app, _ = app_and_db
    with TestClient(app) as test_client:
        yield test_client


def signup(client: TestClient, email="learner@example.com", password=None, nickname="학습자"):
    password = password or "a" * 12
    return client.post(
        "/api/accounts/signup",
        json={"email": email, "password": password, "nickname": nickname},
    )


def login(client: TestClient, email="learner@example.com", password=None):
    password = password or "a" * 12
    return client.post("/api/accounts/login", json={"email": email, "password": password})


def test_signup_trims_values_normalizes_email_and_hashes_password(client, app_and_db):
    response = signup(client, email="  Learner@Example.com  ", nickname="  학습자_1  ")
    assert response.status_code == 201
    assert response.json() == {"id": 1, "email": "learner@example.com", "nickname": "학습자_1"}

    app, _ = app_and_db
    with app.state.session_factory() as db:
        user = db.scalar(select(User))
        assert user is not None
        assert user.password_hash != "a" * 12
        assert "a" * 12 not in user.password_hash


@pytest.mark.parametrize(
    ("password", "expected_status"),
    [("a" * 7, 422), ("a" * 8, 201), ("a" * 64, 201), ("a" * 65, 422)],
)
def test_password_length_boundaries(app_and_db, password, expected_status):
    app, _ = app_and_db
    with TestClient(app) as test_client:
        response = signup(test_client, email=f"p{len(password)}@example.com", password=password, nickname=f"닉네임{len(password)}")
    assert response.status_code == expected_status


@pytest.mark.parametrize(
    ("nickname", "expected_status"),
    [("가", 422), ("가나", 201), ("가" * 20, 201), ("가" * 21, 422), ("name-with-dash", 422)],
)
def test_nickname_rules(app_and_db, nickname, expected_status):
    app, _ = app_and_db
    with TestClient(app) as test_client:
        response = signup(test_client, email=f"n{len(nickname)}{expected_status}@example.com", nickname=nickname)
    assert response.status_code == expected_status


def test_duplicate_email_and_nickname_are_rejected_case_insensitively(client):
    assert signup(client, nickname="BuildUser").status_code == 201
    email_duplicate = signup(client, email="LEARNER@example.com", nickname="다른이름")
    nickname_duplicate = signup(client, email="other@example.com", nickname="builduser")
    assert email_duplicate.status_code == 409
    assert email_duplicate.json()["detail"]["field"] == "email"
    assert nickname_duplicate.status_code == 409
    assert nickname_duplicate.json()["detail"]["field"] == "nickname"


def test_login_sets_httponly_session_and_me_requires_it(client):
    assert signup(client).status_code == 201
    anonymous = TestClient(client.app)
    assert anonymous.get("/api/accounts/me").status_code == 401

    response = login(client)
    assert response.status_code == 200
    assert "HttpOnly" in response.headers["set-cookie"]
    assert "buildlog_session" in response.headers["set-cookie"]
    assert client.get("/api/accounts/me").json()["nickname"] == "학습자"


def test_wrong_login_does_not_create_session(client):
    signup(client)
    response = login(client, password="b" * 12)
    assert response.status_code == 401
    assert "buildlog_session" not in response.headers.get("set-cookie", "")


def test_user_can_change_only_their_own_nickname(client):
    signup(client)
    login(client)
    response = client.patch("/api/accounts/me/nickname", json={"nickname": "새닉네임"})
    assert response.status_code == 200
    assert response.json()["nickname"] == "새닉네임"

    other = TestClient(client.app)
    signup(other, email="other@example.com", nickname="다른사용자")
    login(other, email="other@example.com")
    conflict = other.patch("/api/accounts/me/nickname", json={"nickname": "새닉네임"})
    assert conflict.status_code == 409
    assert other.get("/api/accounts/me").json()["nickname"] == "다른사용자"


def test_user_persists_after_app_restart(app_and_db):
    app, database_url = app_and_db
    with TestClient(app) as first_client:
        assert signup(first_client).status_code == 201

    restarted_app = create_app(Settings(_env_file=None, database_url=database_url))
    with TestClient(restarted_app) as restarted_client:
        assert login(restarted_client).status_code == 200
        assert restarted_client.get("/api/accounts/me").json()["email"] == "learner@example.com"
    restarted_app.state.engine.dispose()
