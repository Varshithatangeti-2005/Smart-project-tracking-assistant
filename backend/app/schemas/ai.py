from typing import Dict, List, Optional
from pydantic import BaseModel


class TaskEstimationRequest(BaseModel):
    task_name: str
    task_description: str
    priority: Optional[str] = "Normal"
    deadline_days: Optional[int] = None
    team_experience_level: Optional[str] = "Intermediate"
    complexity_factors: Optional[List[str]] = []


class TaskEstimationResponse(BaseModel):
    min_hours: int
    max_hours: int
    difficulty: str
    confidence: Optional[str] = None
    reasoning: Optional[str] = None
    suggested_sprints: Optional[List[str]] = None
    notes: Optional[str] = None


class SprintPlanningRequest(BaseModel):
    project_name: str
    tasks: List[str]
    duration_weeks: int
    team_capacity_per_week: int
    objectives: Optional[str] = None

class SprintOutline(BaseModel):
    name: str
    tasks: List[str]
    start_date: str
    end_date: str
    duration_days: int

class SprintPlanningResponse(BaseModel):
    sprint_outlines: List[SprintOutline]   # ✅
    recommended_sprint_count: int
    summary: str


class RiskAnalysisRequest(BaseModel):
    project_name: str
    deadline_days: int
    pending_tasks: int
    developers: int
    blockers: Optional[List[str]] = []
    technical_debt: Optional[str] = None
    current_phase: Optional[str] = None


class RiskAnalysisResponse(BaseModel):
    risk_level: str
    top_risks: List[str]
    mitigation_actions: List[str]
    confidence: Optional[str] = None


class TaskItem(BaseModel):
    title: str
    priority: Optional[str] = "Medium"
    estimated_hours: Optional[int] = None


class WorkloadDistributionRequest(BaseModel):
    team: Dict[str, int]
    tasks: List[TaskItem]


class WorkloadAssignment(BaseModel):
    task: str
    assignee: str
    estimated_hours: int


class WorkloadDistributionResponse(BaseModel):
    assignments: List[WorkloadAssignment]
    balance_score: Optional[int] = None
