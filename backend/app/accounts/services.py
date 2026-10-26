import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.accounts.models import LoginSession, User

password_hash = PasswordHash.recommended()


def normalize_email(email: str) -> str:
    return email.strip().casefold()


def normalize_nickname(nickname: str) -> str:
    return nickname.strip().casefold()


def find_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == normalize_email(email)))


def find_user_by_nickname(db: Session, nickname: str) -> User | None:
    normalized = normalize_nickname(nickname)
    return db.scalar(select(User).where(User.nickname_normalized == normalized))


def create_user(db: Session, email: str, password: str, nickname: str) -> User:
    user = User(
        email=normalize_email(email),
        password_hash=password_hash.hash(password),
        nickname=nickname.strip(),
        nickname_normalized=normalize_nickname(nickname),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = find_user_by_email(db, email)
    if user is None or not password_hash.verify(password, user.password_hash):
        return None
    return user


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_login_session(db: Session, user: User, session_days: int) -> str:
    token = secrets.token_urlsafe(32)
    db.add(
        LoginSession(
            token_hash=hash_session_token(token),
            user_id=user.id,
            expires_at=datetime.now(UTC) + timedelta(days=session_days),
        )
    )
    db.commit()
    return token


def find_user_by_session(db: Session, token: str | None) -> User | None:
    if not token:
        return None
    login_session = db.get(LoginSession, hash_session_token(token))
    if login_session is None:
        return None
    expires_at = login_session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at <= datetime.now(UTC):
        db.delete(login_session)
        db.commit()
        return None
    return login_session.user


def update_nickname(db: Session, user: User, nickname: str) -> User:
    user.nickname = nickname.strip()
    user.nickname_normalized = normalize_nickname(nickname)
    db.commit()
    db.refresh(user)
    return user
