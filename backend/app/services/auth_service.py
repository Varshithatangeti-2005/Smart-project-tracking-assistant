from datetime import timedelta
from app.services.user_service import create_user, get_user_by_email
from app.utils.security import verify_password, create_access_token


def authenticate_user(db, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user


def create_user_account(db, user_in):
    return create_user(db, user_in)


def create_token(user):
    access_token_expires = timedelta(minutes=30)
    return create_access_token(data={"sub": str(user["id"]), "email": user["email"]}, expires_delta=access_token_expires)
