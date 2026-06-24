from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SprintBase(BaseModel):
    name: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    project_id: int


class SprintCreate(SprintBase):
    pass


class SprintUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class SprintResponse(SprintBase):
    id: int

    class Config:
        from_attributes = True
