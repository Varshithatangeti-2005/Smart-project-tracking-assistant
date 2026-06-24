from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class User:
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    is_superuser: bool

@dataclass
class Project:
    id: int
    name: str
    description: Optional[str]
    owner_id: int

@dataclass
class Task:
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[datetime]
    project_id: int
    assignee_id: Optional[int]

@dataclass
class Sprint:
    id: int
    name: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    project_id: int

@dataclass
class Risk:
    id: int
    title: str
    description: Optional[str]
    severity: str
    project_id: int
