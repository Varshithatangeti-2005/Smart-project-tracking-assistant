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


# -------------------------
# Lifespan (Startup/Shutdown)
# -------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting application...")

    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print("❌ DB init failed:", e)

    yield

    print("🛑 Application shutting down...")


# -------------------------
# App Initialization
# -------------------------
app = FastAPI(
    title="Smart Task Backend",
    lifespan=lifespan,
)

# -------------------------
# CORS Middleware (FIXED & SIMPLIFIED)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Routers
# -------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(sprints.router, prefix="/api/sprints", tags=["sprints"])
app.include_router(risks.router, prefix="/api/risks", tags=["risks"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


# -------------------------
# Run Server
# -------------------------
def main():
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug",
    )


if __name__ == "__main__":
    main()