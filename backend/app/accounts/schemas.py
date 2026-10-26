import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

NICKNAME_PATTERN = re.compile(r"^[가-힣A-Za-z0-9_]+$")


def validate_nickname(value: str) -> str:
    value = value.strip()
    if not 2 <= len(value) <= 20:
        raise ValueError("닉네임은 2~20자로 입력해주세요.")
    if not NICKNAME_PATTERN.fullmatch(value):
        raise ValueError("닉네임은 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.")
    return value


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    nickname: str

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("nickname")
    @classmethod
    def clean_nickname(cls, value: str) -> str:
        return validate_nickname(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=64)

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class NicknameUpdateRequest(BaseModel):
    nickname: str

    @field_validator("nickname")
    @classmethod
    def clean_nickname(cls, value: str) -> str:
        return validate_nickname(value)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    nickname: str
