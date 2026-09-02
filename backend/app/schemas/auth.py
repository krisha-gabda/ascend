from pydantic import BaseModel, EmailStr, field_validator
from uuid import UUID
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Length must be at least 8 characters')
        if len(v) > 72:
            raise ValueError('Lenght must be less than 72 characters')

        return v


class UserResponse(BaseModel):
    id: UUID
    email:str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: UserResponse