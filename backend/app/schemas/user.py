import re
from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

    @validator('password')
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError('Password must be at least 8 characters long.')
        if not re.search(r'[A-Z]', value):
            raise ValueError('Password must include at least one uppercase letter.')
        if not re.search(r'[a-z]', value):
            raise ValueError('Password must include at least one lowercase letter.')
        if not re.search(r'[0-9]', value):
            raise ValueError('Password must include at least one number.')
        if not re.search(r'[^A-Za-z0-9]', value):
            raise ValueError('Password must include at least one special character.')
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True
