from pydantic import BaseModel
from typing import Optional

class RiskBase(BaseModel):
    title: str
    description: Optional[str] = None
    severity: Optional[str] = "medium"
    project_id: int

class RiskCreate(RiskBase):
    pass

class RiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None

class RiskResponse(RiskBase):
    id: int

    class Config:
        from_attributes = True
