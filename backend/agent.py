from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from backend.app.agents.root_agent import root_agent

session_service = InMemorySessionService()

runner = Runner(
    app_name="smart-project-assistant",
    agent=root_agent,
    session_service=session_service
)

print(runner)