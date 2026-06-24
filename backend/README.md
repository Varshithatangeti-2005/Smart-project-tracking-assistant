# Smart Task Backend

This backend is a FastAPI application for managing users, projects, tasks, sprints, risks, and AI endpoints.

## Structure

- `app/main.py` — entry point
- `app/config.py` — environment and settings
- `app/database/` — mysql connector  and models
- `app/schemas/` — Pydantic request/response schemas
- `app/routers/` — FastAPI route definitions
- `app/services/` — business logic
- `app/utils/` — security and helpers
- `app/middleware/` — authentication middleware

## Setup

1. Create a virtual environment
2. Install dependencies with `pip install -r requirements.txt`
3. Set your Gemini model in `backend/.env` if you want to override the default. For example:

   ```env
gemini_model=gemini-1.5-pro
   ```

   If your API key supports a stronger model, replace it with that model name.
4. Run the app with `uvicorn app.main:app --reload`
