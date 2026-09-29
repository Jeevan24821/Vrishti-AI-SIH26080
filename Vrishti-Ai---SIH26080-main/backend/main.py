import os
import sys
import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Ensure path resolution
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_backend_dir)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Auto-load .env configuration file if present
env_file = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip("'\"")

try:
    from backend.app.api.routes import router as api_router
except ModuleNotFoundError:
    from app.api.routes import router as api_router

app = FastAPI(
    title="Vrishti AI — Regime-Aware AI/ML Rainfall Post-Processing System",
    description="Scientific API serving regime-aware rainfall corrections, exceedance probabilities, and verification metrics over Goa & Western Ghats.",
    version="1.0.0-SIH26080"
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print(f"❌ [422 Validation Error] Path: {request.url.path} | Errors: {exc.errors()} | Raw Body: {body.decode('utf-8', errors='ignore')}")
    return JSONResponse(
        status_code=422,
        content={
            "status_code": "VALIDATION_ERROR",
            "message": "Invalid request payload format",
            "detail": exc.errors(),
            "raw_body": body.decode('utf-8', errors='ignore')
        }
    )

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to Vrishti AI — SIH26080 Scientific API Server",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
