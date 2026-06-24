from app.schemas.sprint import SprintCreate, SprintUpdate


def create_sprint(db, sprint_in: SprintCreate):
    db["cursor"].execute(
        "INSERT INTO sprints (name, start_date, end_date, project_id) VALUES (%s, %s, %s, %s)",
        (
            sprint_in.name,
            sprint_in.start_date,
            sprint_in.end_date,
            sprint_in.project_id,
        ),
    )
    db["conn"].commit()
    sprint_id = db["cursor"].lastrowid
    return get_sprint(db, sprint_id)


def get_sprints(db):
    db["cursor"].execute("SELECT * FROM sprints")
    return db["cursor"].fetchall()


def get_sprint(db, sprint_id: int):
    db["cursor"].execute("SELECT * FROM sprints WHERE id = %s", (sprint_id,))
    return db["cursor"].fetchone()


def update_sprint(db, sprint_id: int, updates: SprintUpdate):
    values = updates.dict(exclude_unset=True)
    if not values:
        return get_sprint(db, sprint_id)
    set_clause = ", ".join(f"{key} = %s" for key in values)
    db["cursor"].execute(
        f"UPDATE sprints SET {set_clause} WHERE id = %s",
        tuple(values.values()) + (sprint_id,),
    )
    db["conn"].commit()
    return get_sprint(db, sprint_id)


def delete_sprint(db, sprint_id: int):
    db["cursor"].execute("DELETE FROM sprints WHERE id = %s", (sprint_id,))
    db["conn"].commit()
