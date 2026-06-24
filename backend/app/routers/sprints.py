from fastapi import APIRouter, Depends, HTTPException
from app.schemas.sprint import SprintCreate, SprintUpdate, SprintResponse
from app.database.connection import get_db
from app.services.sprint_service import create_sprint, get_sprint, get_sprints, update_sprint, delete_sprint

router = APIRouter()

@router.post("/", response_model=SprintResponse)
def create(sprint_in: SprintCreate, db = Depends(get_db)):
    return create_sprint(db, sprint_in)

@router.get("/", response_model=list[SprintResponse])
def list_sprints(db = Depends(get_db)):
    return get_sprints(db)

@router.get("/{sprint_id}", response_model=SprintResponse)
def read_sprint(sprint_id: int, db = Depends(get_db)):
    sprint = get_sprint(db, sprint_id)
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return sprint

@router.put("/{sprint_id}", response_model=SprintResponse)
def update(sprint_id: int, updates: SprintUpdate, db = Depends(get_db)):
    sprint = update_sprint(db, sprint_id, updates)
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return sprint

@router.delete("/{sprint_id}")
def remove(sprint_id: int, db = Depends(get_db)):
    delete_sprint(db, sprint_id)
    return {"detail": "Sprint deleted"}
