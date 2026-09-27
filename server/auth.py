"""
Authentication & Authorization Engine for Agentic Cinema.
Provides secure password hashing, session lifecycle management,
Google OAuth token verification, and FastAPI authorization dependencies.
"""

import os
import hmac
import hashlib
import secrets
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException, Depends

import server.db as db

logger = logging.getLogger("AuthEngine")

SESSION_COOKIE_NAME = "cinema_session"
SESSION_DURATION_DAYS = 30
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", os.getenv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", ""))


# =========================================================================
# Password Security (PBKDF2-HMAC-SHA256 with 100,000 rounds)
# =========================================================================

def hash_password(password: str) -> str:
    """Hashes a password using salted PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    salt = secrets.token_hex(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations
    ).hex()
    return f"pbkdf2_sha256${iterations}${salt}${derived}"


def verify_password(password: str, hashed: Optional[str]) -> bool:
    """Timing-safe verification of plaintext password against stored hash."""
    if not hashed or not hashed.startswith("pbkdf2_sha256$"):
        return False
    try:
        parts = hashed.split("$")
        if len(parts) != 4:
            return False
        iterations = int(parts[1])
        salt = parts[2]
        stored_hash = parts[3]
        derived = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations
        ).hex()
        return hmac.compare_digest(stored_hash, derived)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


# =========================================================================
# Session Management
# =========================================================================

def create_user_session(user_id: str) -> Dict[str, Any]:
    """Generates a high-entropy session token and records it in the database."""
    session_id = f"sess_{secrets.token_hex(12)}"
    session_token = secrets.token_urlsafe(32)
    expires_dt = datetime.now(timezone.utc) + timedelta(days=SESSION_DURATION_DAYS)
    expires_at = expires_dt.isoformat()
    return db.create_session(session_id, user_id, session_token, expires_at)


def invalidate_session(session_token: str) -> bool:
    """Destroys an active session."""
    return db.delete_session(session_token)


# =========================================================================
# Google OAuth Token Verification
# =========================================================================

def verify_google_id_token(token: str) -> Dict[str, Any]:
    """
    Verifies a Google OAuth ID Token server-side using Google's public keys.
    Returns payload containing 'sub', 'email', 'name', 'picture'.
    """
    # 1. Dev / Test Mock Token Handling (for testing environments)
    if token.startswith("test_google_token:"):
        parts = token.split(":")
        email = parts[1] if len(parts) > 1 else "google_tester@test.com"
        sub = parts[2] if len(parts) > 2 else f"google_sub_{secrets.token_hex(8)}"
        name = parts[3] if len(parts) > 3 else "Google Test User"
        return {
            "sub": sub,
            "email": email,
            "name": name,
            "picture": f"https://api.dicebear.com/7.x/avataaars/svg?seed={sub}"
        }

    # 2. Real Google OAuth Verification via google.oauth2.id_token
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        req = google_requests.Request()
        idinfo = google_id_token.verify_oauth2_token(
            token,
            req,
            GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID else None
        )
        return {
            "sub": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo.get("name", idinfo["email"].split("@")[0]),
            "picture": idinfo.get("picture", "")
        }
    except Exception as e:
        logger.error(f"Google ID token verification failed: {e}")
        raise ValueError(f"Invalid Google ID Token: {e}")


# =========================================================================
# FastAPI Authorization Dependency
# =========================================================================

def extract_token_from_request(request: Request) -> Optional[str]:
    """Extracts session token from HTTP-only Cookie or Authorization Header."""
    # 1. Check Cookie
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token:
        return token

    # 2. Check Authorization Header (Bearer <token>)
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    # 3. Check Custom Header
    token = request.headers.get("x-session-token")
    if token:
        return token.strip()

    return None


def get_current_user(request: Request) -> Dict[str, Any]:
    """
    FastAPI dependency that enforces authentication.
    Returns current authenticated user or raises HTTP 401 Unauthorized.
    """
    token = extract_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.get_session_user(token)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Session expired or invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    """FastAPI dependency for endpoints that optionally take current user."""
    token = extract_token_from_request(request)
    if not token:
        return None
    return db.get_session_user(token)
