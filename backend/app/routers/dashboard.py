from fastapi import APIRouter, Depends
from app.services.dashboard_service import get_dashboard_summary
from app.database.connection import get_db

router = APIRouter()

@router.get("/", response_model=dict)
def dashboard(db = Depends(get_db)):
    return get_dashboard_summary(db)
