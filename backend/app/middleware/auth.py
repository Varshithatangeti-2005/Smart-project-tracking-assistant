from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.security import verify_token

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        authorization: HTTPAuthorizationCredentials = HTTPBearer(auto_error=False)(request)
        if authorization and authorization.scheme.lower() == "bearer":
            token = authorization.credentials
            try:
                request.state.user = verify_token(token)
            except Exception:
                raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return await call_next(request)
