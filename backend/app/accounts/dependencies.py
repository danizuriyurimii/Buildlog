from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.accounts.models import User
from app.accounts.services import find_user_by_session
from app.db.session import get_db


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    session_token: str | None = Cookie(default=None, alias="buildlog_session"),
) -> User:
    settings = request.app.state.settings
    token = request.cookies.get(settings.session_cookie_name, session_token)
    user = find_user_by_session(db, token)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인이 필요합니다.")
    return user
