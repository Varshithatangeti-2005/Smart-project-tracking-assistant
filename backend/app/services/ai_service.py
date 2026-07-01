import re
import uuid
import json
import logging
import asyncio
from typing import Any, Dict, List
from fastapi import HTTPException
from google.adk.agents import LlmAgent
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

from app.agents.root_agent import root_agent
from app.agents.sprint_agent import sprint_agent
from app.agents.task_agent import task_agent
from app.agents.risk_agent import risk_agent
from app.agents.workload_agent import workload_agent

logger = logging.getLogger(__name__)

_WORKFLOW_CONTEXT: Dict[str, Dict[str, Any]] = {}


# -----------------------------------
# Workflow Context Helpers
# -----------------------------------
def _set_workflow_context(project_name: str, context: Dict[str, Any]) -> None:
    _WORKFLOW_CONTEXT[project_name] = context


def _get_workflow_context(project_name: str) -> Dict[str, Any] | None:
    return _WORKFLOW_CONTEXT.get(project_name)


def _build_workflow_context(project_name: str, step: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    existing = _get_workflow_context(project_name) or {}
    existing[step] = payload
    return existing


# -----------------------------------
# JSON Helpers
# -----------------------------------
def _parse_json(text: str):
    cleaned = text or ""
    cleaned = cleaned.strip()

    logger.debug("Parsing JSON from agent output; length=%d", len(cleaned))

    # 1) Try direct parse
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, (dict, list)):
            return parsed
    except Exception as e:
        logger.debug("Direct json.loads failed: %s", e)

    # 2) Try fenced code blocks (```json ... ```)
    fence_matches = re.findall(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    for block in fence_matches:
        candidate = block.strip()
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, (dict, list)):
                logger.debug("Parsed JSON from fenced block")
                return parsed
        except Exception as e:
            logger.debug("Failed to parse fenced JSON block: %s", e)

    # 3) Extract all balanced JSON-like substrings and try the largest first
    candidates = []
    for open_char, close_char in (("{", "}"), ("[", "]")):
        idx = 0
        while True:
            try:
                start = cleaned.index(open_char, idx)
            except ValueError:
                break

            depth = 0
            in_string = False
            escape = False
            found = False

            for i in range(start, len(cleaned)):
                ch = cleaned[i]
                if in_string:
                    if escape:
                        escape = False
                    elif ch == "\\":
                        escape = True
                    elif ch == '"':
                        in_string = False
                    continue

                if ch == '"':
                    in_string = True
                elif ch == open_char:
                    depth += 1
                elif ch == close_char:
                    depth -= 1
                    if depth == 0:
                        candidate = cleaned[start:i + 1]
                        candidates.append(candidate)
                        idx = i + 1
                        found = True
                        break

            if not found:
                # No closing match; stop searching for this open_char
                break

    # Try largest candidate first (often the JSON block)
    candidates = sorted(candidates, key=lambda s: len(s), reverse=True)
    for cand in candidates:
        try:
            parsed = json.loads(cand)
            if isinstance(parsed, (dict, list)):
                logger.debug("Parsed JSON from extracted candidate of length %d", len(cand))
                return parsed
        except Exception as e:
            logger.debug("Candidate JSON parse failed (len=%d): %s", len(cand), e)

    # If we get here, nothing parsed
    logger.error("Invalid JSON returned by agent. Raw output (truncated 2000 chars): %s", cleaned[:2000])
    raise ValueError("Invalid JSON returned by agent")


SUPPORTED_GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
]

FALLBACK_MODEL_ORDER = {
    "gemini-2.5-flash": "gemini-2.5-pro",
    "gemini-2.5-pro": "gemini-2.5-flash-lite",
    "gemini-2.5-flash-lite": None,
}


def _get_fallback_model(model: str | None) -> str | None:
    if not model:
        return None

    if model not in SUPPORTED_GEMINI_MODELS:
        logger.warning("Model %s is not in supported Gemini model list and cannot be retried.", model)
        return None

    return FALLBACK_MODEL_ORDER.get(model)


def _build_fallback_agent(agent: Any) -> LlmAgent | None:
    fallback_model = _get_fallback_model(getattr(agent, "model", None))
    if not fallback_model:
        return None

    try:
        return LlmAgent(
            name=f"{getattr(agent, 'name', 'fallback_agent')}_fallback",
            model=fallback_model,
            description=getattr(agent, "description", "Fallback agent"),
            instruction=getattr(agent, "instruction", ""),
        )
    except Exception:
        return None


def _is_retryable_error(exc: Exception) -> bool:
    candidates = [str(exc)]
    cause = getattr(exc, "__cause__", None)

    while cause is not None:
        candidates.append(str(cause))
        cause = getattr(cause, "__cause__", None)

    combined = " ".join(candidates).lower()
    status_code = getattr(exc, "status_code", None)

    return (
        status_code == 429
        or status_code == 503
        or "resource_exhausted" in combined
        or "quota exceeded" in combined
        or "rate limit" in combined
        or "unavailable" in combined
        or "high demand" in combined
        or "temporarily unavailable" in combined
    )


def _is_service_unavailable_error(exc: Exception) -> bool:
    status_code = getattr(exc, "status_code", None)
    combined = str(exc).lower()
    return status_code == 503 or "unavailable" in combined or "high demand" in combined


# -----------------------------------
# Generic Agent Executor
# -----------------------------------
def _build_context_prompt(base_prompt: str, context: Dict[str, Any] | None = None) -> str:
    if not context:
        return base_prompt

    context_block = json.dumps(context, indent=2, ensure_ascii=False)
    return f"{base_prompt}\n\nWorkflow context:\n{context_block}"


async def execute_agent(
    prompt: str,
    context: Dict[str, Any] | None = None,
    agent=None,
    retry_attempt: int = 0,
):
    final_text = ""
    try:
        if agent is None:
            agent = root_agent
        agent_name = getattr(agent, "name", repr(agent))

        session_service = InMemorySessionService()

        runner = Runner(
            app_name="smart-project-assistant",
            agent=agent,
            session_service=session_service
        )

        agent_name = getattr(agent, "name", repr(agent))
        user_id = "user_1"
        session_id = str(uuid.uuid4())

        logger.debug(
            "Executing agent=%s user_id=%s session_id=%s context=%s",
            agent_name,
            user_id,
            session_id,
            context,
        )

        logger.debug("Prompt length=%d prompt=%s", len(prompt or ""), prompt)

        session_service.create_session_sync(
            app_name="smart-project-assistant",
            user_id=user_id,
            session_id=session_id
        )

        enriched_prompt = _build_context_prompt(prompt, context)

        message = types.Content(
            role="user",
            parts=[types.Part(text=enriched_prompt)]
        )

        events = runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=message
        )

        final_text = ""

        async for event in events:
            logger.debug(
                "Received event type=%s content=%s",
                type(event).__name__,
                getattr(event, "content", None),
            )
            if hasattr(event, "content") and event.content:
                if getattr(event.content, "parts", None):
                    for part in event.content.parts:
                        if hasattr(part, "text") and part.text:
                            final_text += part.text

        logger.debug(
            "Agent %s final_text=%s",
            getattr(agent, "name", repr(agent)),
            final_text,
        )

        # Print raw Gemini/agent output (truncated) for diagnostics
        logger.info("Agent %s raw_output (truncated 2000 chars): %s",
                    getattr(agent, "name", repr(agent)),
                    (final_text or "")[:2000])

        if not final_text or not final_text.strip():
            logger.error("Empty response from agent (session_id=%s user_id=%s)", session_id, user_id)
            raise Exception("Empty response from agent")

        try:
            parsed = _parse_json(final_text)
        except Exception as pe:
            # Log parsing failure with raw text and re-raise for outer handler
            logger.error("Failed to parse agent output into JSON: %s", str(pe))
            logger.debug("Agent raw output for parsing failure (truncated 5000 chars): %s", final_text[:5000])
            raise

        return parsed

    except Exception as e:
        if _is_retryable_error(e):
            current_model = getattr(agent, "model", None)
            logger.warning("Agent request hit retryable service error for model %s: %s", current_model, str(e))

            if _is_service_unavailable_error(e) and retry_attempt == 0:
                logger.info("Retrying same model once for transient service unavailability: %s", current_model)
                await asyncio.sleep(1)
                return await execute_agent(prompt, context=context, agent=agent, retry_attempt=1)

            fallback_agent = _build_fallback_agent(agent)
            fallback_model = getattr(fallback_agent, "model", None) if fallback_agent else None

            if fallback_agent is not None and fallback_model != current_model:
                logger.info(
                    "Using fallback model for retryable error: %s -> %s",
                    current_model,
                    fallback_model,
                )
                return await execute_agent(prompt, context=context, agent=fallback_agent, retry_attempt=0)

            logger.error("No valid fallback model available for %s; stopping retry.", current_model)
            fallback_status = getattr(e, "status_code", 503) or 503
            if fallback_status not in (429, 503):
                fallback_status = 503
            raise HTTPException(
                status_code=fallback_status,
                detail="The AI service is temporarily unavailable and no fallback model is available."
            ) from e

        # Log the raw output when available to aid diagnostics
        logger.error("Agent %s raw_output on error (truncated 2000 chars): %s",
                     agent_name,
                     final_text[:2000] if final_text else "<empty>")
        logger.exception("Agent execution failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


# -----------------------------------
# TASK ESTIMATION
# -----------------------------------
async def estimate_task(
    request: TaskEstimationRequest
) -> TaskEstimationResponse:

    project_name = "default-project"
    workflow_context = _get_workflow_context(project_name)

    prompt = f"""
Estimate software task effort for a single task.

Task Name: {request.task_name}
Task Description: {request.task_description}
Priority: {request.priority}
Deadline Days: {request.deadline_days}
Team Experience: {request.team_experience_level}
Complexity Factors: {request.complexity_factors}

Use the workflow context if provided to assign this task to an appropriate sprint bucket.
"""

    result = await execute_agent(prompt, context=workflow_context, agent=task_agent)

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
async def plan_sprint(
    request: SprintPlanningRequest
) -> SprintPlanningResponse:

    prompt = f"""
Create a sprint plan from the provided tasks.

Project Name: {request.project_name}
Tasks: {request.tasks}
Duration Weeks: {request.duration_weeks}
Team Capacity Per Week: {request.team_capacity_per_week}
Objectives: {request.objectives}

Return sprint-level JSON with task groups that can be used in later estimation and workload steps.
"""

    try:
        result = await execute_agent(prompt, agent=sprint_agent)
    except HTTPException as exc:
        if exc.status_code == 429:
            raise
        result = {
            "sprint_outlines": [
                {
                    "name": "Sprint 1",
                    "tasks": request.tasks[:5],
                    "duration_days": 7,
                    "start_date": "",
                    "end_date": "",
                }
            ],
            "recommended_sprint_count": 1,
            "summary": "Fallback sprint plan generated because the AI service could not produce a structured response.",
        }

    workflow_context = _build_workflow_context(
        request.project_name,
        "sprint_plan",
        {
            "project_name": request.project_name,
            "recommended_sprint_count": result.get("recommended_sprint_count"),
            "sprint_outlines": result.get("sprint_outlines", []),
            "summary": result.get("summary"),
        },
    )
    _set_workflow_context(request.project_name, workflow_context)

    sprint_outlines = []
    sprints = result.get("sprint_outlines", [])

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
async def analyze_risk(
    request: RiskAnalysisRequest
) -> RiskAnalysisResponse:

    workflow_context = _get_workflow_context(request.project_name)

    prompt = f"""
Analyze project risk.

Project Name: {request.project_name}
Deadline Days: {request.deadline_days}
Pending Tasks: {request.pending_tasks}
Developers: {request.developers}
Blockers: {request.blockers}
Technical Debt: {request.technical_debt}
Current Phase: {request.current_phase}

Use the current sprint plan context if available to highlight risks affecting the planned sprints.
"""

    try:
        result = await execute_agent(prompt, context=workflow_context, agent=risk_agent)
    except HTTPException as exc:
        if exc.status_code == 429:
            raise
        result = {
            "risk_level": "Medium",
            "top_risks": ["AI response unavailable; review manual project status"],
            "mitigation_actions": ["Re-run the analysis when the service is available", "Review blockers and team capacity manually"],
            "confidence": "Low",
        }

    return RiskAnalysisResponse(
        risk_level=result["risk_level"],
        top_risks=result["top_risks"],
        mitigation_actions=result["mitigation_actions"],
        confidence=result.get("confidence")
    )


# -----------------------------------
# WORKLOAD DISTRIBUTION
# -----------------------------------
async def distribute_workload(
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

    workflow_context = _get_workflow_context("default-project")

    prompt = f"""
Distribute workload across the provided team.

Team:
{json.dumps(request.team, indent=2)}

Tasks:
{json.dumps(task_payload, indent=2)}

Use the sprint plan context if provided so that assignments align with sprint buckets and avoid overloaded sprints.
"""

    try:
        result = await execute_agent(prompt, context=workflow_context, agent=workload_agent)
    except HTTPException as exc:
        if exc.status_code == 429:
            raise
        result = {
            "assignments": [
                {
                    "task": task["title"],
                    "assignee": list(request.team.keys())[0] if request.team else "Unassigned",
                    "estimated_hours": task.get("estimated_hours") or 4,
                }
                for task in task_payload
            ],
            "balance_score": 50,
        }

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