import pytest
from fastapi import HTTPException

from app.services import ai_service


class FakeSessionService:
    def create_session_sync(self, *args, **kwargs):
        return None


class FakeRunner:
    def __init__(self, *args, **kwargs):
        pass

    def run(self, *args, **kwargs):
        raise Exception("429 RESOURCE_EXHAUSTED. Quota exceeded for free tier requests")


def test_execute_agent_returns_429_for_quota_exhaustion(monkeypatch):
    monkeypatch.setattr(ai_service, "InMemorySessionService", FakeSessionService)
    monkeypatch.setattr(ai_service, "Runner", FakeRunner)

    with pytest.raises(HTTPException) as exc_info:
        ai_service.execute_agent("test prompt")

    assert exc_info.value.status_code == 429
    assert "quota" in str(exc_info.value.detail).lower()
