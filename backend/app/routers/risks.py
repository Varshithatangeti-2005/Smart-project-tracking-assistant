from fastapi import APIRouter, Depends, HTTPException
from app.schemas.risk import RiskCreate, RiskUpdate, RiskResponse
from app.database.connection import get_db
from app.services.risk_service import create_risk, get_risk, get_risks, update_risk, delete_risk

router = APIRouter()

@router.post("/", response_model=RiskResponse)
def create(risk_in: RiskCreate, db = Depends(get_db)):
    return create_risk(db, risk_in)

@router.get("/", response_model=list[RiskResponse])
def list_risks(db = Depends(get_db)):
    return get_risks(db)

@router.get("/{risk_id}", response_model=RiskResponse)
def read_risk(risk_id: int, db = Depends(get_db)):
    risk = get_risk(db, risk_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk

@router.put("/{risk_id}", response_model=RiskResponse)
def update(risk_id: int, updates: RiskUpdate, db = Depends(get_db)):
    risk = update_risk(db, risk_id, updates)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk

@router.delete("/{risk_id}")
def remove(risk_id: int, db = Depends(get_db)):
    delete_risk(db, risk_id)
    return {"detail": "Risk deleted"}
