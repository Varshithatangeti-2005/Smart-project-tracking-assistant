from app.schemas.project import ProjectCreate, ProjectUpdate


def create_project(db, project_in: ProjectCreate, owner_id: int):
    db["cursor"].execute(
        "INSERT INTO projects (name, description, owner_id) VALUES (%s, %s, %s)",
        (project_in.name, project_in.description, owner_id),
    )
    db["conn"].commit()
    project_id = db["cursor"].lastrowid
    return get_project(db, project_id)


def get_projects(db):
    db["cursor"].execute("SELECT * FROM projects")
    return db["cursor"].fetchall()


def get_project(db, project_id: int):
    db["cursor"].execute("SELECT * FROM projects WHERE id = %s", (project_id,))
    return db["cursor"].fetchone()


def update_project(db, project_id: int, updates: ProjectUpdate):
    values = updates.dict(exclude_unset=True)
    if not values:
        return get_project(db, project_id)
    set_clause = ", ".join(f"{key} = %s" for key in values)
    db["cursor"].execute(
        f"UPDATE projects SET {set_clause} WHERE id = %s",
        tuple(values.values()) + (project_id,),
    )
    db["conn"].commit()
    return get_project(db, project_id)


def delete_project(db, project_id: int):
    db["cursor"].execute("DELETE FROM projects WHERE id = %s", (project_id,))
    db["conn"].commit()
