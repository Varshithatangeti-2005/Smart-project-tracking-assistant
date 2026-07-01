from fastapi import APIRouter
from app.schemas.ai import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    SprintPlanningRequest,
    SprintPlanningResponse,
    TaskEstimationRequest,
    TaskEstimationResponse,
    WorkloadDistributionRequest,
    WorkloadDistributionResponse,
)
from app.services.ai_service import (
    analyze_risk,
    distribute_workload,
    estimate_task,
    plan_sprint,
)
from fastapi import HTTPException
router = APIRouter()

@router.post("/task-estimation", response_model=TaskEstimationResponse)
async def task_estimation(request: TaskEstimationRequest):
    try:
        return await estimate_task(request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/sprint-planning",
    response_model=SprintPlanningResponse
)
async def sprint_planning(request: SprintPlanningRequest):
    try:
        print("Sprint request received")
        result = await plan_sprint(request)
        print("Sprint result:", result)
        return result

    except Exception as e:
        print("ROUTE ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/risk-analysis", response_model=RiskAnalysisResponse)
async def risk_analysis(request: RiskAnalysisRequest):
    try:
        return await analyze_risk(request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workload-distribution", response_model=WorkloadDistributionResponse)
async def workload_distribution(request: WorkloadDistributionRequest):
    try:
        return await distribute_workload(request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
