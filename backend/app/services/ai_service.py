import uuid
import json
import logging
from fastapi import HTTPException
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.schemas.ai import (
    TaskEstimationRequest,
    TaskEstimationResponse,
    SprintPlanningRequest,
    SprintPlanningResponse,
    SprintOutline,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    WorkloadDistributionRequest,
    WorkloadDistributionResponse,
    WorkloadAssignment,
)

# Import ONLY root sequential agent
from app.agents.root_agent import root_agent

logger = logging.getLogger(__name__)


# -----------------------------------
# JSON Helpers
# -----------------------------------
def _parse_json(text: str):
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")

        if start != -1 and end != -1:
            try:
                return json.loads(text[start:end + 1])
            except Exception:
                pass

        raise HTTPException(
            status_code=500,
            detail="Invalid JSON returned by agent"
        )


def _is_quota_error(exc: Exception) -> bool:
    candidates = [str(exc)]
    cause = getattr(exc, "__cause__", None)

    while cause is not None:
        candidates.append(str(cause))
        cause = getattr(cause, "__cause__", None)

    combined = " ".join(candidates).lower()
    status_code = getattr(exc, "status_code", None)

    return (
        status_code == 429
        or "resource_exhausted" in combined
        or "quota exceeded" in combined
        or "rate limit" in combined
    )


# -----------------------------------
# Generic Agent Executor
# -----------------------------------
def execute_agent(prompt: str):
    try:
        session_service = InMemorySessionService()

        runner = Runner(
            app_name="smart-project-assistant",
            agent=root_agent,
            session_service=session_service
        )

        user_id = "user_1"
        session_id = str(uuid.uuid4())

        session_service.create_session_sync(
            app_name="smart-project-assistant",
            user_id=user_id,
            session_id=session_id
        )

        message = types.Content(
            role="user",
            parts=[types.Part(text=prompt)]
        )

        events = runner.run(
            user_id=user_id,
            session_id=session_id,
            new_message=message
        )

        final_text = ""

        for event in events:
            if hasattr(event, "content") and event.content:
                if event.content.parts:
                    for part in event.content.parts:
                        if hasattr(part, "text") and part.text:
                            final_text += part.text

        if not final_text:
            raise Exception("Empty response from agent")

        return _parse_json(final_text)

    except Exception as e:
        if _is_quota_error(e):
            logger.warning("Agent request hit AI quota limits: %s", str(e))
            raise HTTPException(
                status_code=429,
                detail="The AI service is temporarily rate-limited due to quota limits. Please wait a moment and try again."
            ) from e

        logger.exception("Agent execution failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


# -----------------------------------
# TASK ESTIMATION
# -----------------------------------
def estimate_task(
    request: TaskEstimationRequest
) -> TaskEstimationResponse:

    prompt = f"""
Estimate software task effort.

Task Name: {request.task_name}
Task Description: {request.task_description}
Priority: {request.priority}
Deadline Days: {request.deadline_days}
Team Experience: {request.team_experience_level}
Complexity Factors: {request.complexity_factors}
"""

    result = execute_agent(prompt)

    return TaskEstimationResponse(
        min_hours=result["min_hours"],
        max_hours=result["max_hours"],
        difficulty=result["difficulty"],
        confidence=result.get("confidence"),
        reasoning=result.get("reasoning"),
        suggested_sprints=result.get("suggested_sprints"),
        notes=result.get("notes")
    )


# -----------------------------------
# SPRINT PLANNING
# -----------------------------------
def plan_sprint(
    request: SprintPlanningRequest
) -> SprintPlanningResponse:

    prompt = f"""
Create sprint plan.

Project Name: {request.project_name}
Tasks: {request.tasks}
Duration Weeks: {request.duration_weeks}
Team Capacity Per Week: {request.team_capacity_per_week}
Objectives: {request.objectives}
"""

    result = execute_agent(prompt)

    sprint_outlines = []
    sprints = result.get("sprints", [])

    for sprint in sprints:
        sprint_outlines.append(
            SprintOutline(
                name=sprint["name"],
                tasks=sprint["tasks"],
                start_date=sprint.get("start_date", ""),
                end_date=sprint.get("end_date", ""),
                duration_days=sprint["duration_days"]
            )
        )

    return SprintPlanningResponse(
        sprint_outlines=sprint_outlines,
        recommended_sprint_count=result["recommended_sprint_count"],
        summary=result["summary"]
    )


# -----------------------------------
# RISK ANALYSIS
# -----------------------------------
def analyze_risk(
    request: RiskAnalysisRequest
) -> RiskAnalysisResponse:

    prompt = f"""
Analyze project risk.

Project Name: {request.project_name}
Deadline Days: {request.deadline_days}
Pending Tasks: {request.pending_tasks}
Developers: {request.developers}
Blockers: {request.blockers}
Technical Debt: {request.technical_debt}
Current Phase: {request.current_phase}
"""

    result = execute_agent(prompt)

    return RiskAnalysisResponse(
        risk_level=result["risk_level"],
        top_risks=result["top_risks"],
        mitigation_actions=result["mitigation_actions"],
        confidence=result.get("confidence")
    )


# -----------------------------------
# WORKLOAD DISTRIBUTION
# -----------------------------------
def distribute_workload(
    request: WorkloadDistributionRequest
) -> WorkloadDistributionResponse:

    task_payload = [
        {
            "title": task.title,
            "priority": task.priority,
            "estimated_hours": task.estimated_hours
        }
        for task in request.tasks
    ]

    prompt = f"""
Distribute workload.

Team:
{json.dumps(request.team, indent=2)}

Tasks:
{json.dumps(task_payload, indent=2)}
"""

    result = execute_agent(prompt)

    assignments = []

    for item in result["assignments"]:
        assignments.append(
            WorkloadAssignment(
                task=item["task"],
                assignee=item["assignee"],
                estimated_hours=item["estimated_hours"]
            )
        )

    return WorkloadDistributionResponse(
        assignments=assignments,
        balance_score=result.get("balance_score")
    )