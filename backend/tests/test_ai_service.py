import asyncio
import pytest
from fastapi import HTTPException

from app.schemas.ai import SprintPlanningRequest, TaskEstimationRequest
from app.services import ai_service


class FakeSessionService:
    def create_session_sync(self, *args, **kwargs):
        return None


class FakeRunner:
    def __init__(self, *args, **kwargs):
        pass

    async def run_async(self, *args, **kwargs):
        raise Exception("429 RESOURCE_EXHAUSTED. Quota exceeded for free tier requests")
        if False:
            yield


def test_execute_agent_returns_429_for_quota_exhaustion(monkeypatch):
    monkeypatch.setattr(ai_service, "InMemorySessionService", FakeSessionService)
    monkeypatch.setattr(ai_service, "Runner", FakeRunner)

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(ai_service.execute_agent("test prompt"))

    assert exc_info.value.status_code == 429
    assert "quota" in str(exc_info.value.detail).lower()


def test_plan_sprint_stores_workflow_context_for_follow_up_steps(monkeypatch):
    async def fake_execute_agent(prompt, context=None, agent=None):
        return {
            "sprints": [
                {"name": "Sprint 1", "tasks": ["Task A"], "duration_days": 7}
            ],
            "recommended_sprint_count": 1,
            "summary": "Plan created",
        }

    monkeypatch.setattr(ai_service, "execute_agent", fake_execute_agent)

    request = SprintPlanningRequest(
        project_name="Demo",
        tasks=["Task A"],
        duration_weeks=2,
        team_capacity_per_week=20,
    )

    response = asyncio.run(ai_service.plan_sprint(request))

    assert response.recommended_sprint_count == 1
    stored = ai_service._get_workflow_context("Demo")
    assert stored is not None
    assert stored["sprint_plan"]["recommended_sprint_count"] == 1


def test_parse_json_extracts_json_from_mixed_text():
    payload = ai_service._parse_json(
        'Here is the result: {"sprints": [{"name": "Sprint 1", "tasks": ["Task A"], "duration_days": 7}], "recommended_sprint_count": 1, "summary": "Created"} Thanks!'
    )

    assert payload["recommended_sprint_count"] == 1
    assert payload["sprints"][0]["name"] == "Sprint 1"


def test_estimate_task_returns_fallback_when_agent_fails(monkeypatch):
    async def raise_failure(*args, **kwargs):
        raise HTTPException(status_code=500, detail="Invalid JSON returned by agent")

    monkeypatch.setattr(ai_service, "execute_agent", raise_failure)

    request = TaskEstimationRequest(
        task_name="Implement login",
        task_description="Add login UI",
        priority="High",
        deadline_days=5,
        team_experience_level="Intermediate",
        complexity_factors=["OAuth setup"],
    )

    response = asyncio.run(ai_service.estimate_task(request))

    assert response.min_hours >= 1
    assert response.max_hours >= response.min_hours
    assert response.difficulty in {"Low", "Medium", "High"}


def test_estimate_task_propagates_quota_error(monkeypatch):
    async def raise_quota(*args, **kwargs):
        raise HTTPException(status_code=429, detail="Quota exceeded")

    monkeypatch.setattr(ai_service, "execute_agent", raise_quota)

    request = TaskEstimationRequest(
        task_name="Implement login",
        task_description="Add login UI",
        priority="High",
        deadline_days=5,
        team_experience_level="Intermediate",
        complexity_factors=["OAuth setup"],
    )

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(ai_service.estimate_task(request))

    assert exc_info.value.status_code == 429
    assert "quota" in str(exc_info.value.detail).lower()
