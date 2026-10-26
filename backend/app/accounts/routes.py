from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.accounts.dependencies import get_current_user
from app.accounts.models import User
from app.accounts.schemas import LoginRequest, NicknameUpdateRequest, SignupRequest, UserResponse
from app.accounts.services import (
    authenticate_user,
    create_login_session,
    create_user,
    find_user_by_email,
    find_user_by_nickname,
    normalize_nickname,
    update_nickname,
)
from app.db.session import get_db

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


def conflict(field: str, message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"field": field, "message": message})


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> User:
    if find_user_by_email(db, str(payload.email)):
        raise conflict("email", "이미 사용 중인 이메일입니다.")
    if find_user_by_nickname(db, payload.nickname):
        raise conflict("nickname", "이미 사용 중인 닉네임입니다.")
    try:
        return create_user(db, str(payload.email), payload.password, payload.nickname)
    except IntegrityError:
        db.rollback()
        raise conflict("account", "이미 사용 중인 이메일 또는 닉네임입니다.") from None


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> User:
    user = authenticate_user(db, str(payload.email), payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인 정보가 맞지 않습니다.")

    settings = request.app.state.settings
    token = create_login_session(db, user, settings.session_days)
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )
    return user


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me/nickname", response_model=UserResponse)
def change_nickname(
    payload: NicknameUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    existing = find_user_by_nickname(db, payload.nickname)
    if existing is not None and existing.id != user.id:
        raise conflict("nickname", "이미 사용 중인 닉네임입니다.")
    if normalize_nickname(payload.nickname) == user.nickname_normalized:
        user.nickname = payload.nickname.strip()
        db.commit()
        db.refresh(user)
        return user
    try:
        return update_nickname(db, user, payload.nickname)
    except IntegrityError:
        db.rollback()
        raise conflict("nickname", "이미 사용 중인 닉네임입니다.") from None
