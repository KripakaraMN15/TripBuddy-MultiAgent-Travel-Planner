from pathlib import Path
import traceback
from typing import Optional

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from backend import run_travel_agent, resume_travel_agent

# This is kept from the original project to allow the existing synchronous
# agent functions to call async MCP helpers inside FastAPI.
import nest_asyncio

nest_asyncio.apply()

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="TripBuddy AI",
    description=(
        "LangGraph Multi-Agent Travel Planner with Supervisor, Guardrails, "
        "Human-in-the-Loop, and FastAPI Frontend"
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


class TravelRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000, description="Travel request message")
    thread_id: Optional[str] = None


class ApprovalRequest(BaseModel):
    thread_id: str = Field(min_length=1, description="Thread ID")
    approved: bool
    feedback: str = Field(max_length=2000, description="Revision feedback")


@app.get("/static/{file_path:path}")
async def serve_static(file_path: str):
    """Serve static files from the static directory."""
    file_full_path = BASE_DIR / "static" / file_path
    
    # Security check: ensure file is within static directory
    try:
        file_full_path = file_full_path.resolve()
        static_dir = (BASE_DIR / "static").resolve()
        if not str(file_full_path).startswith(str(static_dir)):
            return JSONResponse(status_code=403, content={"error": "Access denied"})
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid path"})
    
    if not file_full_path.exists() or not file_full_path.is_file():
        return JSONResponse(status_code=404, content={"error": "File not found"})
    
    # Determine MIME type based on file extension
    mime_types = {
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
    }
    
    file_ext = file_full_path.suffix.lower()
    media_type = mime_types.get(file_ext, "application/octet-stream")
    
    # Read file content synchronously
    try:
        with open(file_full_path, "rb") as f:
            content = f.read()
        return Response(content=content, media_type=media_type, status_code=200)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={},
    )


@app.post("/api/travel")
async def travel_planner(request_data: TravelRequest):
    try:
        user_message = request_data.message.strip()

        if not user_message:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Message cannot be empty.",
                },
            )

        thread_id = None
        if request_data.thread_id:
            thread_id = request_data.thread_id.strip()
            if not thread_id:
                return JSONResponse(
                    status_code=400,
                    content={
                        "success": False,
                        "error": "thread_id cannot be empty if provided.",
                    },
                )

        result = run_travel_agent(
            user_input=user_message,
            thread_id=thread_id,
        )

        return JSONResponse(
            content={
                "success": True,
                **result,
            }
        )

    except Exception as exc:
        print("ERROR:", exc)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(exc),
            },
        )


@app.post("/api/travel/approve")
async def approve_travel_plan(request_data: ApprovalRequest):
    try:
        if not request_data.approved and not request_data.feedback.strip():
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Please provide revision feedback when rejecting the draft.",
                },
            )

        result = resume_travel_agent(
            thread_id=request_data.thread_id,
            approved=request_data.approved,
            feedback=request_data.feedback,
        )

        return JSONResponse(
            content={
                "success": True,
                **result,
            }
        )

    except Exception as exc:
        print("APPROVAL ERROR:", exc)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(exc),
            },
        )


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "TripMate AI API is running",
        "features": [
            "supervisor_agent",
            "input_guardrail",
            "human_in_the_loop",
        ],
    }


@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={})


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
    )