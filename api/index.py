"""
api/index.py — Vercel serverless function entry point.

Imports the FastAPI app from the backend package and strips the
"/api" prefix from incoming request paths before handing off to
FastAPI, since the app's own routes (e.g. /docs, /health) are
defined without that prefix.
"""

import sys
from pathlib import Path

# Add the project root to sys.path so `backend.main` is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app as fastapi_app  # noqa: E402


async def app(scope, receive, send):
    if scope["type"] == "http" and scope["path"].startswith("/api"):
        scope = dict(scope)
        scope["path"] = scope["path"][4:] or "/"
        if "raw_path" in scope:
            scope["raw_path"] = scope["raw_path"][4:] or b"/"
    await fastapi_app(scope, receive, send)