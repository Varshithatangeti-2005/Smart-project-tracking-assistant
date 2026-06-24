from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import init_db
from app.routers import (
    auth,
    users,
    projects,
    tasks,
    sprints,
    risks,
    ai,
    dashboard,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()

    yield

    # Shutdown
    # Add cleanup logic here if needed
    pass


app = FastAPI(
    title="Smart Task Backend",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(sprints.router, prefix="/api/sprints", tags=["sprints"])
app.include_router(risks.router, prefix="/api/risks", tags=["risks"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


def main() -> None:
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    main()