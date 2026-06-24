from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user import UserResponse, UserUpdate
from app.database.connection import get_db
from app.services.user_service import delete_user, get_user as get_user_service, list_users as list_users_service, update_user as update_user_service

router = APIRouter()

@router.get("/", response_model=list[UserResponse])
def list_users(db = Depends(get_db)):
    return list_users_service(db)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db = Depends(get_db)):
    user = get_user_service(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, updates: UserUpdate, db = Depends(get_db)):
    user = update_user_service(db, user_id, updates)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}")
def delete_user_endpoint(user_id: int, db = Depends(get_db)):
    delete_user(db, user_id)
    return {"detail": "User deleted"}
