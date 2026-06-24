from app.schemas.user import UserCreate, UserUpdate
from app.utils.security import hash_password


def list_users(db):
    db["cursor"].execute(
        "SELECT id, email, full_name, is_active, is_superuser FROM users"
    )
    return db["cursor"].fetchall()


def get_user(db, user_id: int):
    db["cursor"].execute(
        "SELECT id, email, full_name, is_active, is_superuser FROM users WHERE id = %s",
        (user_id,),
    )
    return db["cursor"].fetchone()


def get_user_by_email(db, email: str):
    db["cursor"].execute("SELECT * FROM users WHERE email = %s", (email,))
    return db["cursor"].fetchone()


def create_user(db, user_in):
    hashed_password_value = hash_password(user_in.password)

    db["cursor"].execute(
        "INSERT INTO users (email, hashed_password, full_name) VALUES (%s, %s, %s)",
        (user_in.email, hashed_password_value, user_in.full_name),
    )

    db["conn"].commit()

    user_id = db["cursor"].lastrowid
    print("Inserted user id =", user_id)

    user = get_user(db, user_id)
    print("Fetched user =", user)

    return user


def update_user(db, user_id: int, updates: UserUpdate):
    values = updates.dict(exclude_unset=True)
    if not values:
        return get_user(db, user_id)
    set_clause = ", ".join(f"{key} = %s" for key in values)
    db["cursor"].execute(
        f"UPDATE users SET {set_clause} WHERE id = %s",
        tuple(values.values()) + (user_id,),
    )
    db["conn"].commit()
    return get_user(db, user_id)


def delete_user(db, user_id: int):
    db["cursor"].execute("DELETE FROM users WHERE id = %s", (user_id,))
    db["conn"].commit()
