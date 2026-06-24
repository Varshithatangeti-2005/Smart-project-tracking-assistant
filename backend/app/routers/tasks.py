from fastapi import APIRouter, Depends, HTTPException
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.database.connection import get_db
from app.services.task_service import create_task, get_task, get_tasks, update_task, delete_task

router = APIRouter()

@router.post("/", response_model=TaskResponse)
def create(task_in: TaskCreate, db = Depends(get_db)):
    return create_task(db, task_in)

@router.get("/", response_model=list[TaskResponse])
def list_tasks(db = Depends(get_db)):
    return get_tasks(db)

@router.get("/{task_id}", response_model=TaskResponse)
def read_task(task_id: int, db = Depends(get_db)):
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update(task_id: int, updates: TaskUpdate, db = Depends(get_db)):
    task = update_task(db, task_id, updates)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}")
def remove(task_id: int, db = Depends(get_db)):
    delete_task(db, task_id)
    return {"detail": "Task deleted"}
