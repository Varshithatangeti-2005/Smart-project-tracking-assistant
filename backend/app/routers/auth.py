from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user import LoginRequest, UserCreate, UserResponse
from app.database.connection import get_db
from app.services.auth_service import authenticate_user, create_user_account, create_token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db = Depends(get_db)):
    user = create_user_account(db, user_in)
    return user

@router.post("/login")
def login(user_in: LoginRequest, db = Depends(get_db)):
    user = authenticate_user(db, email=user_in.email, password=user_in.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    safe_user = {
        "id": user["id"],
        "email": user["email"],
        "full_name": user.get("full_name"),
        "is_active": user.get("is_active", True),
        "is_superuser": user.get("is_superuser", False),
    }

    return {
        "access_token": create_token(user),
        "token_type": "bearer",
        "user": safe_user,
    }
