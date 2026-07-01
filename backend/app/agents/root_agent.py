from google.adk.agents import SequentialAgent

from app.agents.risk_agent import risk_agent
from app.agents.task_agent import task_agent
from app.agents.sprint_agent import sprint_agent
from app.agents.workload_agent import workload_agent

root_agent = SequentialAgent(
    name="project_manager_agent",
    description="Runs project planning workflow sequentially",

    sub_agents=[
        sprint_agent,
        task_agent,
        risk_agent,
        workload_agent
    ]
)