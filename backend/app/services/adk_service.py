# from google.adk.runners import Runner
# from google.adk.sessions import InMemorySessionService
# from google.genai import types
# from fastapi import HTTPException
# import uuid

# from app.agents.root_agent import root_agent

# session_service = InMemorySessionService()

# runner = Runner(
#     app_name="smart-project-assistant",
#     agent=root_agent,
#     session_service=session_service
# )


# def execute_agent(prompt: str):
#     try:
#         user_id = "user_1"
#         session_id = str(uuid.uuid4())

#         message = types.Content(
#             role="user",
#             parts=[types.Part(text=prompt)]
#         )

#         events = runner.run(
#             user_id=user_id,
#             session_id=session_id,
#             new_message=message
#         )

#         final_response = None

#         for event in events:
#             print("EVENT DIR:", dir(event))
#             print("EVENT:", event)
#             final_response = event

#         return final_response

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# def analyze_risk(request):
#     prompt = f"Analyze project risk: {request.model_dump()}"
#     return execute_agent(prompt)


# def estimate_task(request):
#     prompt = f"Estimate task: {request.model_dump()}"
#     return execute_agent(prompt)


# def plan_sprint(request):
#     prompt = f"Plan sprint: {request.model_dump()}"
#     return execute_agent(prompt)


# def distribute_workload(request):
#     prompt = f"Distribute workload: {request.model_dump()}"
#     return execute_agent(prompt)

# print(dir(session_service))

