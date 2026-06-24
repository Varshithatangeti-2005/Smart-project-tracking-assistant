import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import google.generativeai as genai
from fastapi import HTTPException
from app.config import settings
from app.schemas.ai import (
    SprintPlanningRequest,
    SprintPlanningResponse,
    SprintOutline,
    TaskEstimationRequest,
    TaskEstimationResponse,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    WorkloadDistributionRequest,
    WorkloadDistributionResponse,
    WorkloadAssignment,
)
from app.schemas.sprint import (
    SprintCreate,
    SprintUpdate,
    SprintResponse,
)

logger = logging.getLogger(__name__)


# -----------------------------
# GEMINI CALLER (ONLY ONE)
# -----------------------------
def _call_gemini(prompt: str) -> str:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    try:
        genai.configure(api_key=settings.gemini_api_key)

        model = genai.GenerativeModel(model_name=settings.gemini_model)

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": settings.temperature,
                "top_p": settings.top_p,
                "top_k": settings.top_k,
                "max_output_tokens": settings.max_output_tokens,
            }
        )

        return response.text

    except Exception as exc:
        exc_str = str(exc)
        # Check for quota exceeded error
        if "429" in exc_str or "quota" in exc_str.lower() or "exceeded" in exc_str.lower():
            raise HTTPException(
                status_code=429, 
                detail="API quota exceeded. Free tier limited to 20 requests/day. Please upgrade your plan or try again tomorrow. https://aistudio.google.com/app/apikey"
            )
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {str(exc)}")


# -----------------------------
# JSON PARSER HELPERS
# -----------------------------
def _extract_json(text: str) -> Optional[str]:
    first = text.find("{")
    last = text.rfind("}")
    if first != -1 and last != -1:
        return text[first:last + 1]
    return None


def _parse_json_response(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except Exception:
        extracted = _extract_json(text)
        if extracted:
            return json.loads(extracted)
        raise HTTPException(status_code=502, detail="Invalid JSON from AI")


def _safe_int(value: Any, default: int) -> int:
    try:
        return int(value)
    except Exception:
        return default


# -----------------------------
# SPRINT GENERATION (IMPROVED)
# -----------------------------
def _suggest_sprints(task_name: str, description: str, difficulty: str, min_hours: int, max_hours: int) -> List[str]:
    sprints: List[str] = []

    difficulty = difficulty.lower()
    total_hours = (min_hours + max_hours) // 2

    sprints.append("Sprint 1: Requirement Analysis & Setup")

    if total_hours <= 16:
        sprints.append("Sprint 2: Implementation")
        sprints.append("Sprint 3: Testing & Bug Fixing")

    elif total_hours <= 40:
        sprints.append("Sprint 2: Core Development")
        sprints.append("Sprint 3: Feature Completion")
        sprints.append("Sprint 4: Integration & Testing")

    else:
        sprints.append("Sprint 2: Module-wise Development")
        sprints.append("Sprint 3: Integration")
        sprints.append("Sprint 4: Testing & Optimization")
        sprints.append("Sprint 5: Deployment")

    if difficulty == "high":
        sprints.append("Sprint 6: Performance Optimization & Documentation")

    return sprints


# -----------------------------
# TASK ESTIMATION (AI)
# -----------------------------


# -----------------------------
# SPRINT PLANNING (AI)
# --------------------------



def plan_sprint(request: SprintPlanningRequest) -> SprintPlanningResponse:
    try:
        # -----------------------------
        # AI PROMPT
        # -----------------------------
        prompt = f"""
You are a senior sprint planning assistant.

Return ONLY valid JSON:

{{
  "sprints": [
    {{
      "name": "Sprint 1",
      "tasks": ["task1", "task2"],
      "duration_days": 7
    }}
  ],
  "recommended_sprint_count": int,
  "summary": "string"
}}

Rules:
- Split tasks logically across sprints
- Each sprint must have realistic duration (5–10 days)

Project: {request.project_name}
Objectives: {request.objectives}
Team Capacity: {request.team_capacity_per_week}
Duration Weeks: {request.duration_weeks}
Tasks: {request.tasks}
"""

        # -----------------------------
        # CALL GEMINI
        # -----------------------------
        try:
            raw = _call_gemini(prompt)
            parsed = _parse_json_response(raw)
        except Exception as e:
            print("Gemini failed:", e)
            parsed = None

        if not parsed or "sprints" not in parsed:
            raise Exception("Invalid AI response")

        # -----------------------------
        # BUILD RESPONSE
        # -----------------------------
        base_date = datetime.now()
        current_day = 0

        sprint_list: List[SprintOutline] = []

        for s in parsed.get("sprints", []):
            duration = int(s.get("duration_days", 7))

            start_date = base_date + timedelta(days=current_day)
            end_date = start_date + timedelta(days=duration)

            sprint_list.append(
                SprintOutline(
                    name=s.get("name", "Sprint"),
                    tasks=s.get("tasks", []),
                    start_date=start_date.strftime("%Y-%m-%d"),
                    end_date=end_date.strftime("%Y-%m-%d"),
                    duration_days=duration
                )
            )

            current_day += duration

        if not parsed:
            return SprintPlanningResponse(
                sprint_outlines=[
                    SprintOutline(
                        name="Sprint 1",
                        tasks=["Fallback task"],
                        start_date=str(datetime.now().date()),
                        end_date=str(datetime.now().date()),
                        duration_days=5
                    )
                ],
                recommended_sprint_count=1,
                summary="Fallback used because AI is unavailable"
            )
    # -----------------------------
    # FALLBACK (NO CRASH EVER)
    # -----------------------------
    except Exception as e:
        print("AI FAILED:", str(e))

        tasks = request.tasks

        # Convert string → list if needed
        if isinstance(tasks, str):
            tasks = [t.strip() for t in tasks.split("\n") if t.strip()]

        if not tasks:
            tasks = ["Default task"]

        weeks = max(1, request.duration_weeks)

        base_date = datetime.now()
        current_day = 0

        sprint_list: List[SprintOutline] = []

        for i, task in enumerate(tasks):
            start_date = base_date + timedelta(days=current_day)
            end_date = start_date + timedelta(days=5)

            sprint_list.append(
                SprintOutline(
                    name=f"Sprint {(i // max(1, len(tasks)//weeks)) + 1}",
                    tasks=[task],
                    start_date=start_date.strftime("%Y-%m-%d"),
                    end_date=end_date.strftime("%Y-%m-%d"),
                    duration_days=5
                )
            )

            current_day += 5

        return SprintPlanningResponse(
            sprint_outlines=sprint_list,
            recommended_sprint_count=weeks,
            summary="Fallback sprint plan used (AI failed or quota exceeded)"
        )

def estimate_task(request: TaskEstimationRequest) -> TaskEstimationResponse:
    prompt = f"""You are a Senior Software Project Manager.

Analyze the following task and provide time estimation:

Return ONLY valid JSON:
{{
  "min_hours": int,
  "max_hours": int,
  "difficulty": "Low|Medium|High",
  "confidence": "string",
  "reasoning": "string",
  "notes": "string"
}}

Task: {request.task_name}
Description: {request.task_description}
Priority: {request.priority or 'Medium'}
Team Experience: {request.team_experience_level or 'Intermediate'}
Deadline: {request.deadline_days or 'No deadline'} days
Complexity Factors: {', '.join(request.complexity_factors) if request.complexity_factors else 'None specified'}

Provide realistic estimates based on industry standards."""

    try:
        raw = _call_gemini(prompt)
        parsed = _parse_json_response(raw)

        min_h = _safe_int(parsed.get("min_hours"), 8)
        max_h = _safe_int(parsed.get("max_hours"), 16)

        if min_h > max_h:
            min_h, max_h = max_h, min_h

        difficulty = str(parsed.get("difficulty", "Medium"))

        suggested_sprints = _suggest_sprints(
            request.task_name,
            request.task_description,
            difficulty,
            min_h,
            max_h
        )

        return TaskEstimationResponse(
            min_hours=min_h,
            max_hours=max_h,
            difficulty=difficulty,
            confidence=str(parsed.get("confidence", "75%")),
            reasoning=parsed.get("reasoning"),
            suggested_sprints=suggested_sprints,
            notes=parsed.get("notes"),
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like quota exceeded)
        raise
    except Exception as e:
        logger.warning(f"Task estimation AI failed: {str(e)}, using fallback")
        
        # Fallback estimation
        base_hours = 8
        complexity_multiplier = 1.0
        
        # Adjust based on priority
        if request.priority and request.priority.lower() == "high":
            complexity_multiplier += 0.2
        
        # Adjust based on complexity factors
        if request.complexity_factors:
            complexity_multiplier += 0.15 * len(request.complexity_factors)
        
        # Adjust based on deadline pressure
        if request.deadline_days and request.deadline_days < 3:
            complexity_multiplier += 0.1
        
        # Adjust based on team experience
        if request.team_experience_level:
            exp_level = request.team_experience_level.lower()
            if "junior" in exp_level or "beginner" in exp_level:
                complexity_multiplier += 0.3
            elif "expert" in exp_level or "senior" in exp_level:
                complexity_multiplier -= 0.1
        
        min_h = max(4, int(base_hours * complexity_multiplier * 0.8))
        max_h = max(8, int(base_hours * complexity_multiplier * 1.2))
        
        # Determine difficulty
        if complexity_multiplier > 1.4:
            difficulty = "High"
        elif complexity_multiplier > 1.1:
            difficulty = "Medium"
        else:
            difficulty = "Low"
        
        return TaskEstimationResponse(
            min_hours=min_h,
            max_hours=max_h,
            difficulty=difficulty,
            confidence="40%",  # Lower confidence for fallback
            reasoning="Fallback estimation used (AI unavailable)",
            suggested_sprints=_suggest_sprints(
                request.task_name,
                request.task_description,
                difficulty,
                min_h,
                max_h
            ),
            notes="Based on fallback algorithm; request AI estimation when available",
        )

# -----------------------------
# RISK ANALYSIS
# -----------------------------
def analyze_risk(request: RiskAnalysisRequest) -> RiskAnalysisResponse:
    prompt = f"""You are a project risk assessment expert.

Analyze the following project metrics and return a JSON response:

{{
  "risk_level": "Low|Medium|High",
  "top_risks": ["risk1", "risk2", "risk3"],
  "mitigation_actions": ["action1", "action2", "action3"],
  "confidence": "High|Medium|Low"
}}

Project: {request.project_name}
Deadline: {request.deadline_days} days
Pending Tasks: {request.pending_tasks}
Developers: {request.developers}
Current Phase: {request.current_phase or 'Unknown'}
Technical Debt: {request.technical_debt or 'None reported'}
Blockers: {request.blockers or 'None'}

Consider:
- Workload per developer
- Timeline tightness
- Team capacity
- Known blockers
- Technical debt impact
- Dependencies

Return ONLY valid JSON, no other text."""

    try:
        raw = _call_gemini(prompt)
        parsed = _parse_json_response(raw)

        return RiskAnalysisResponse(
            risk_level=parsed.get("risk_level", "Medium"),
            top_risks=parsed.get("top_risks", []),
            mitigation_actions=parsed.get("mitigation_actions", []),
            confidence=parsed.get("confidence", "Medium"),
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like quota exceeded)
        raise
    except Exception as e:
        logger.warning(f"Risk analysis AI failed: {str(e)}, using fallback")
        
        # Fallback risk calculation
        load_ratio = request.pending_tasks / max(1, request.developers)
        days_per_task = request.deadline_days / max(1, request.pending_tasks)
        
        risks = []
        actions = []

        # Workload assessment
        if load_ratio > 20:
            risks.append("Excessive workload per developer (>20 tasks/dev)")
            actions.append("Increase team capacity or reduce scope")
        elif load_ratio > 15:
            risks.append("High workload per developer (15-20 tasks/dev)")
            actions.append("Monitor team velocity closely")

        # Timeline assessment
        if days_per_task < 1:
            risks.append("Insufficient time per task (<1 day/task)")
            actions.append("Extend deadline or break tasks into subtasks")
        elif request.deadline_days < 7:
            risks.append("Very tight deadline (<7 days)")
            actions.append("Prioritize critical features")

        # Blocker assessment
        if request.blockers:
            num_blockers = len(request.blockers) if isinstance(request.blockers, list) else 1
            if num_blockers > 0:
                risks.append(f"{num_blockers} active blocker(s) impeding progress")
                actions.append("Resolve blockers as highest priority")

        # Technical debt assessment
        if request.technical_debt:
            risks.append("Accumulated technical debt may slow velocity")
            actions.append("Allocate sprint time for refactoring")

        # Determine risk level
        if load_ratio > 20 or request.deadline_days < 5 or (request.blockers and len(request.blockers) > 1):
            risk_level = "High"
        elif load_ratio > 12 or request.deadline_days < 10:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Ensure at least one risk/action
        if not risks:
            risks = ["Project parameters appear nominal"]
            actions = ["Continue with standard project practices"]

        return RiskAnalysisResponse(
            risk_level=risk_level,
            top_risks=risks,
            mitigation_actions=actions,
            confidence="Low",  # Lower confidence for fallback
        )


# -----------------------------
# WORKLOAD DISTRIBUTION
# -----------------------------
def distribute_workload(request: WorkloadDistributionRequest) -> WorkloadDistributionResponse:
    prompt = f"""You are an experienced project manager specializing in workload distribution.

Assign tasks to team members fairly, balancing workload and optimizing for task priority and developer expertise.

Return ONLY valid JSON:
{{
  "assignments": [
    {{
      "task": "task name",
      "assignee": "team member name",
      "estimated_hours": int
    }}
  ],
  "balance_score": "0-100"
}}

Team Members and Capacity:
{json.dumps(request.team, indent=2)}

Tasks to Assign:
{json.dumps([{"title": t.title, "priority": t.priority, "estimated_hours": t.estimated_hours} for t in request.tasks], indent=2)}

Considerations:
- Balance workload evenly across team
- Respect individual capacity limits
- Prioritize high-priority tasks
- Consider skill matches if available
- Aim for balance score 70+"""

    try:
        raw = _call_gemini(prompt)
        parsed = _parse_json_response(raw)

        assignments = [
            WorkloadAssignment(
                task=a.get("task", ""),
                assignee=a.get("assignee", ""),
                estimated_hours=_safe_int(a.get("estimated_hours"), 4),
            )
            for a in parsed.get("assignments", [])
        ]

        return WorkloadDistributionResponse(
            assignments=assignments,
            balance_score=str(parsed.get("balance_score", "50")),
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like quota exceeded)
        raise
    except Exception as e:
        logger.warning(f"Workload distribution AI failed: {str(e)}, using fallback")
        
        # Fallback: smart workload balancing
        team = list(request.team.items())  # [(name, capacity), ...]
        if not team:
            return WorkloadDistributionResponse(
                assignments=[],
                balance_score="0",
            )
        
        # Initialize workload tracker for each team member
        workload: Dict[str, float] = {name: 0 for name, _ in team}
        result = []
        
        # Sort tasks by priority (high priority first), then by estimated hours
        sorted_tasks = sorted(
            request.tasks,
            key=lambda t: (
                0 if t.priority and t.priority.lower() == "high" else (
                    1 if t.priority and t.priority.lower() == "medium" else 2
                ),
                -(t.estimated_hours or 4)
            )
        )
        
        # Assign tasks to least loaded team member
        for task in sorted_tasks:
            hours = task.estimated_hours or 4
            
            # Find team member with lowest current workload
            assignee_name = min(workload, key=workload.get)
            assignee_capacity = dict(team)[assignee_name]
            
            # Check if assignment exceeds capacity
            if workload[assignee_name] + hours > assignee_capacity:
                # Try to find someone with capacity
                for name, capacity in team:
                    if workload[name] + hours <= capacity:
                        assignee_name = name
                        break
            
            workload[assignee_name] += hours
            result.append(
                WorkloadAssignment(
                    task=task.title,
                    assignee=assignee_name,
                    estimated_hours=hours,
                )
            )
        
        # Calculate balance score (0-100, higher is better)
        if workload:
            avg_load = sum(workload.values()) / len(workload)
            variance = sum((load - avg_load) ** 2 for load in workload.values()) / len(workload)
            balance_score = max(0, 100 - int(variance * 2))
        else:
            balance_score = 100
        
        return WorkloadDistributionResponse(
            assignments=result,
            balance_score=str(balance_score),
        )