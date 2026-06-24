from fastapi import APIRouter, Depends, HTTPException
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.database.connection import get_db
from app.services.project_service import create_project, get_project, get_projects, update_project, delete_project

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
def create(project_in: ProjectCreate, db = Depends(get_db)):
    return create_project(db, project_in, owner_id=1)

@router.get("/", response_model=list[ProjectResponse])
def list_projects(db = Depends(get_db)):
    return get_projects(db)

@router.get("/{project_id}", response_model=ProjectResponse)
def read_project(project_id: int, db = Depends(get_db)):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update(project_id: int, updates: ProjectUpdate, db = Depends(get_db)):
    project = update_project(db, project_id, updates)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}")
def remove(project_id: int, db = Depends(get_db)):
    delete_project(db, project_id)
    return {"detail": "Project deleted"}
