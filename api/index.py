"""
api/index.py — Vercel serverless function entry point.

Imports the FastAPI app from the backend package so Vercel's Python
runtime can serve it as an ASGI application at /api/*.
"""

import sys
from pathlib import Path

# Add the project root to sys.path so `backend.main` is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app  # noqa: E402, F401