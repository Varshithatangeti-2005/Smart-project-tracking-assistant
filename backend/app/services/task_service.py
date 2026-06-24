from app.schemas.task import TaskCreate, TaskUpdate


def create_task(db, task_in: TaskCreate):
    db["cursor"].execute(
        "INSERT INTO tasks (title, description, status, priority, due_date, project_id, assignee_id) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (
            task_in.title,
            task_in.description,
            task_in.status,
            task_in.priority,
            task_in.due_date,
            task_in.project_id,
            task_in.assignee_id,
        ),
    )
    db["conn"].commit()
    task_id = db["cursor"].lastrowid
    return get_task(db, task_id)


def get_tasks(db):
    db["cursor"].execute("SELECT * FROM tasks")
    return db["cursor"].fetchall()


def get_task(db, task_id: int):
    db["cursor"].execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
    return db["cursor"].fetchone()


def update_task(db, task_id: int, updates: TaskUpdate):
    values = updates.dict(exclude_unset=True)
    if not values:
        return get_task(db, task_id)
    set_clause = ", ".join(f"{key} = %s" for key in values)
    db["cursor"].execute(
        f"UPDATE tasks SET {set_clause} WHERE id = %s",
        tuple(values.values()) + (task_id,),
    )
    db["conn"].commit()
    return get_task(db, task_id)


def delete_task(db, task_id: int):
    db["cursor"].execute("DELETE FROM tasks WHERE id = %s", (task_id,))
    db["conn"].commit()
