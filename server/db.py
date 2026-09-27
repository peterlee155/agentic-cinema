"""
Unified Database Layer for Agentic Cinema.
Supports PostgreSQL (via DATABASE_URL) with seamless local SQLite fallback.
Enforces logical multi-tenant isolation via userId and strict relational constraints.
"""

import os
import json
import sqlite3
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

logger = logging.getLogger("Database")

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Determine database engine
USE_POSTGRES = False
pg_pool = None

if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        from psycopg2.pool import ThreadedConnectionPool
        pg_pool = ThreadedConnectionPool(minconn=1, maxconn=10, dsn=DATABASE_URL)
        USE_POSTGRES = True
        logger.info("Connected to PostgreSQL database.")
    except Exception as e:
        logger.warning(f"Failed to connect to PostgreSQL ({e}). Falling back to SQLite.")
        USE_POSTGRES = False

SQLITE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "cinema.db")
os.makedirs(os.path.dirname(SQLITE_PATH), exist_ok=True)


def get_connection():
    """Returns a database connection."""
    if USE_POSTGRES and pg_pool:
        return pg_pool.getconn()
    else:
        conn = sqlite3.connect(SQLITE_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn


def release_connection(conn):
    """Releases a connection back to the pool or closes it."""
    if USE_POSTGRES and pg_pool:
        pg_pool.putconn(conn)
    else:
        conn.close()


def query_db(query: str, args: tuple = (), one: bool = False) -> Any:
    """Executes a parameterized query and returns dict results."""
    conn = get_connection()
    try:
        if USE_POSTGRES:
            # PostgreSQL uses %s placeholders
            pg_query = query.replace("?", "%s")
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(pg_query, args)
                if query.strip().upper().startswith("SELECT"):
                    rv = cur.fetchall()
                    return (rv[0] if rv else None) if one else rv
                else:
                    conn.commit()
                    return None
        else:
            cur = conn.cursor()
            cur.execute(query, args)
            if query.strip().upper().startswith("SELECT"):
                rv = [dict(row) for row in cur.fetchall()]
                return (rv[0] if rv else None) if one else rv
            else:
                conn.commit()
                return None
    finally:
        release_connection(conn)


def init_db():
    """Initializes all database tables with proper foreign keys, constraints, and indexes."""
    conn = get_connection()
    try:
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                image TEXT,
                plan VARCHAR(50) DEFAULT 'STUDIO',
                credits INTEGER DEFAULT 2500,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

            CREATE TABLE IF NOT EXISTS accounts (
                id VARCHAR(64) PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                provider VARCHAR(50) NOT NULL,
                provider_account_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT uq_provider_account UNIQUE (provider, provider_account_id)
            );
            CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(64) PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
            CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

            CREATE TABLE IF NOT EXISTS projects (
                id VARCHAR(64) PRIMARY KEY,
                owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                genre VARCHAR(100) DEFAULT 'Sci-Fi',
                format VARCHAR(100) DEFAULT 'Theatrical Feature',
                status VARCHAR(50) DEFAULT 'IN_PRODUCTION',
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);

            CREATE TABLE IF NOT EXISTS project_data (
                id VARCHAR(64) PRIMARY KEY,
                project_id VARCHAR(64) UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                screenplay TEXT,
                characters TEXT,
                scenes TEXT,
                production_data TEXT,
                settings TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_project_data_project ON project_data(project_id);

            CREATE TABLE IF NOT EXISTS assets (
                id VARCHAR(64) PRIMARY KEY,
                project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                url TEXT NOT NULL,
                metadata TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_assets_project ON assets(project_id);

            CREATE TABLE IF NOT EXISTS password_resets (
                id VARCHAR(64) PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
            """)
            conn.commit()
        else:
            conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                image TEXT,
                plan TEXT DEFAULT 'STUDIO',
                credits INTEGER DEFAULT 2500,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

            CREATE TABLE IF NOT EXISTS accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                provider TEXT NOT NULL,
                provider_account_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(provider, provider_account_id)
            );
            CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_token TEXT UNIQUE NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
            CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                genre TEXT DEFAULT 'Sci-Fi',
                format TEXT DEFAULT 'Theatrical Feature',
                status TEXT DEFAULT 'IN_PRODUCTION',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);

            CREATE TABLE IF NOT EXISTS project_data (
                id TEXT PRIMARY KEY,
                project_id TEXT UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                screenplay TEXT,
                characters TEXT,
                scenes TEXT,
                production_data TEXT,
                settings TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_project_data_project ON project_data(project_id);

            CREATE TABLE IF NOT EXISTS assets (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                url TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_assets_project ON assets(project_id);

            CREATE TABLE IF NOT EXISTS password_resets (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token TEXT UNIQUE NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
            """)
            conn.commit()
        logger.info("Database schema initialized successfully.")
    finally:
        release_connection(conn)


# Initialize DB on module import
init_db()


# =========================================================================
# User CRUD
# =========================================================================

def create_user(user_id: str, name: str, email: str, password_hash: Optional[str] = None, image: Optional[str] = None) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    avatar = image or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}"
    query_db(
        "INSERT INTO users (id, name, email, password_hash, image, plan, credits, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, name, email.lower().strip(), password_hash, avatar, "STUDIO", 2500, now, now)
    )
    return get_user_by_id(user_id)


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return query_db("SELECT * FROM users WHERE email = ?", (email.lower().strip(),), one=True)


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    return query_db("SELECT * FROM users WHERE id = ?", (user_id,), one=True)


def update_user_password(user_id: str, password_hash: str) -> bool:
    now = datetime.now(timezone.utc).isoformat()
    query_db("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?", (password_hash, now, user_id))
    return True


# =========================================================================
# OAuth Accounts CRUD
# =========================================================================

def get_account(provider: str, provider_account_id: str) -> Optional[Dict[str, Any]]:
    return query_db(
        "SELECT * FROM accounts WHERE provider = ? AND provider_account_id = ?",
        (provider, str(provider_account_id)),
        one=True
    )


def create_account(account_id: str, user_id: str, provider: str, provider_account_id: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    query_db(
        "INSERT INTO accounts (id, user_id, provider, provider_account_id, created_at) VALUES (?, ?, ?, ?, ?)",
        (account_id, user_id, provider, str(provider_account_id), now)
    )
    return query_db("SELECT * FROM accounts WHERE id = ?", (account_id,), one=True)


# =========================================================================
# Sessions CRUD
# =========================================================================

def create_session(session_id: str, user_id: str, session_token: str, expires_at: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    query_db(
        "INSERT INTO sessions (id, user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
        (session_id, user_id, session_token, expires_at, now)
    )
    return query_db("SELECT * FROM sessions WHERE id = ?", (session_id,), one=True)


def get_session_user(session_token: str) -> Optional[Dict[str, Any]]:
    """Fetches user joined with session, verifying that the session has not expired."""
    now = datetime.now(timezone.utc).isoformat()
    row = query_db(
        """
        SELECT u.id, u.name, u.email, u.image, u.plan, u.credits, s.expires_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ? AND s.expires_at > ?
        """,
        (session_token, now),
        one=True
    )
    return row


def delete_session(session_token: str) -> bool:
    query_db("DELETE FROM sessions WHERE session_token = ?", (session_token,))
    return True


def delete_user_sessions(user_id: str) -> bool:
    query_db("DELETE FROM sessions WHERE user_id = ?", (user_id,))
    return True


# =========================================================================
# Projects CRUD (Strictly Isolated by owner_id)
# =========================================================================

def list_user_projects(owner_id: str) -> List[Dict[str, Any]]:
    """Returns ONLY projects where owner_id = :owner_id."""
    rows = query_db(
        """
        SELECT p.*, 
               (SELECT COUNT(*) FROM assets a WHERE a.project_id = p.id) as asset_count
        FROM projects p
        WHERE p.owner_id = ?
        ORDER BY p.updated_at DESC
        """,
        (owner_id,)
    )
    projects = []
    for r in (rows or []):
        d = dict(r)
        # Parse data summary if present
        data_row = query_db("SELECT scenes, characters FROM project_data WHERE project_id = ?", (d["id"],), one=True)
        scenes = json.loads(data_row["scenes"]) if data_row and data_row.get("scenes") else []
        characters = json.loads(data_row["characters"]) if data_row and data_row.get("characters") else []
        d["scene_count"] = len(scenes)
        d["character_count"] = len(characters)
        d["title"] = d.get("name", "Untitled")
        d["logline"] = d.get("description", "")
        d["stage"] = d.get("status", "IN_PRODUCTION")
        projects.append(d)
    return projects


def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    """Fetches raw project record without user filter for internal permission checking."""
    return query_db("SELECT * FROM projects WHERE id = ?", (project_id,), one=True)


def get_full_project(project_id: str, owner_id: str) -> Optional[Dict[str, Any]]:
    """Fetches full project bible ONLY if project.owner_id = :owner_id."""
    proj = query_db("SELECT * FROM projects WHERE id = ? AND owner_id = ?", (project_id, owner_id), one=True)
    if not proj:
        return None
    
    data_row = query_db("SELECT * FROM project_data WHERE project_id = ?", (project_id,), one=True)
    
    screenplay = json.loads(data_row["screenplay"]) if data_row and data_row.get("screenplay") else {}
    characters = json.loads(data_row["characters"]) if data_row and data_row.get("characters") else []
    scenes = json.loads(data_row["scenes"]) if data_row and data_row.get("scenes") else []
    production_data = json.loads(data_row["production_data"]) if data_row and data_row.get("production_data") else {}
    settings = json.loads(data_row["settings"]) if data_row and data_row.get("settings") else {}

    return {
        "id": proj["id"],
        "project_id": proj["id"],
        "owner_id": proj["owner_id"],
        "title": proj["name"],
        "name": proj["name"],
        "logline": proj["description"] or "",
        "genre": proj["genre"],
        "format": proj["format"],
        "stage": proj["status"],
        "project": {
            "id": proj["id"],
            "title": proj["name"],
            "logline": proj["description"] or "",
            "genre": proj["genre"],
            "format": proj["format"],
            "stage": proj["status"],
        },
        "screenplay": screenplay,
        "characters": characters,
        "scenes": scenes,
        "productionData": production_data,
        "settings": settings,
        "createdAt": proj["created_at"],
        "updatedAt": proj["updated_at"]
    }


def create_user_project(
    project_id: str,
    owner_id: str,
    name: str,
    description: Optional[str] = "",
    genre: str = "Sci-Fi",
    format: str = "Theatrical Feature",
    status: str = "IN_PRODUCTION",
    initial_bible: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    query_db(
        """
        INSERT INTO projects (id, owner_id, name, description, genre, format, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (project_id, owner_id, name, description or "", genre, format, status, now, now)
    )
    
    bible = initial_bible or {}
    pdata_id = f"pdata_{project_id}"
    screenplay_str = json.dumps(bible.get("screenplay") or {})
    characters_str = json.dumps(bible.get("characters") or [])
    scenes_str = json.dumps(bible.get("scenes") or [])
    prod_str = json.dumps(bible.get("productionData") or bible.get("production_data") or {})
    settings_str = json.dumps(bible.get("settings") or {})
    
    query_db(
        """
        INSERT INTO project_data (id, project_id, screenplay, characters, scenes, production_data, settings, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (pdata_id, project_id, screenplay_str, characters_str, scenes_str, prod_str, settings_str, now, now)
    )
    
    return get_full_project(project_id, owner_id)


def update_user_project(
    project_id: str,
    owner_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    genre: Optional[str] = None,
    format: Optional[str] = None,
    status: Optional[str] = None,
    bible_data: Optional[Dict[str, Any]] = None
) -> Optional[Dict[str, Any]]:
    """Updates a project after verifying ownership."""
    proj = query_db("SELECT * FROM projects WHERE id = ? AND owner_id = ?", (project_id, owner_id), one=True)
    if not proj:
        return None
    
    now = datetime.now(timezone.utc).isoformat()
    new_name = name if name is not None else proj["name"]
    new_desc = description if description is not None else proj["description"]
    new_genre = genre if genre is not None else proj["genre"]
    new_format = format if format is not None else proj["format"]
    new_status = status if status is not None else proj["status"]

    query_db(
        """
        UPDATE projects
        SET name = ?, description = ?, genre = ?, format = ?, status = ?, updated_at = ?
        WHERE id = ? AND owner_id = ?
        """,
        (new_name, new_desc, new_genre, new_format, new_status, now, project_id, owner_id)
    )

    if bible_data:
        data_row = query_db("SELECT * FROM project_data WHERE project_id = ?", (project_id,), one=True)
        cur_sc = json.loads(data_row["screenplay"]) if data_row and data_row.get("screenplay") else {}
        cur_ch = json.loads(data_row["characters"]) if data_row and data_row.get("characters") else []
        cur_sn = json.loads(data_row["scenes"]) if data_row and data_row.get("scenes") else []
        cur_pd = json.loads(data_row["production_data"]) if data_row and data_row.get("production_data") else {}
        cur_st = json.loads(data_row["settings"]) if data_row and data_row.get("settings") else {}

        if "screenplay" in bible_data: cur_sc = bible_data["screenplay"]
        if "characters" in bible_data: cur_ch = bible_data["characters"]
        if "scenes" in bible_data: cur_sn = bible_data["scenes"]
        if "productionData" in bible_data: cur_pd = bible_data["productionData"]
        elif "production_data" in bible_data: cur_pd = bible_data["production_data"]
        if "settings" in bible_data: cur_st = bible_data["settings"]

        query_db(
            """
            UPDATE project_data
            SET screenplay = ?, characters = ?, scenes = ?, production_data = ?, settings = ?, updated_at = ?
            WHERE project_id = ?
            """,
            (json.dumps(cur_sc), json.dumps(cur_ch), json.dumps(cur_sn), json.dumps(cur_pd), json.dumps(cur_st), now, project_id)
        )

    return get_full_project(project_id, owner_id)


def delete_user_project(project_id: str, owner_id: str) -> bool:
    """Deletes a project ONLY if owner_id matches."""
    proj = query_db("SELECT id FROM projects WHERE id = ? AND owner_id = ?", (project_id, owner_id), one=True)
    if not proj:
        return False
    query_db("DELETE FROM projects WHERE id = ? AND owner_id = ?", (project_id, owner_id))
    return True


# =========================================================================
# Password Resets CRUD
# =========================================================================

def create_password_reset(reset_id: str, user_id: str, token: str, expires_at: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    query_db(
        "INSERT INTO password_resets (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
        (reset_id, user_id, token, expires_at, now)
    )
    return query_db("SELECT * FROM password_resets WHERE id = ?", (reset_id,), one=True)


def get_password_reset(token: str) -> Optional[Dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    return query_db("SELECT * FROM password_resets WHERE token = ? AND expires_at > ?", (token, now), one=True)


def delete_password_reset(token: str) -> bool:
    query_db("DELETE FROM password_resets WHERE token = ?", (token,))
    return True
