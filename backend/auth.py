"""
auth.py — Supabase JWT authentication dependency for FastAPI.

Verifies Bearer tokens from the Authorization header by calling
Supabase's /auth/v1/user endpoint. Returns the authenticated user's ID.
"""

import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


def get_current_user(authorization: str = Header(...)) -> str:
    """
    FastAPI dependency that extracts and verifies a Supabase access token.

    Returns the authenticated user's UUID (from Supabase Auth).
    Raises 401 if the token is missing, malformed, or invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header. Expected: Bearer <token>",
        )

    token = authorization.removeprefix("Bearer ").strip()

    req = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": SUPABASE_ANON_KEY,
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            user_data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception:
        raise HTTPException(status_code=503, detail="Could not reach auth service")

    user_id = user_data.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token did not return a user ID")

    return user_id