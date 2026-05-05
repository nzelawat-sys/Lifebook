"""Object storage helper using Emergent Object Storage."""
import os
import uuid
from typing import Optional, Tuple

import requests

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "atlas"

_storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    """Call once at startup; returns a session-scoped key."""
    global _storage_key
    if _storage_key:
        return _storage_key
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        return None
    resp = requests.post(
        f"{STORAGE_URL}/init", json={"emergent_key": key}, timeout=30
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _ensure_key() -> str:
    k = init_storage()
    if not k:
        raise RuntimeError("Object storage not configured")
    return k


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = _ensure_key()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> Tuple[bytes, str]:
    key = _ensure_key()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get(
        "Content-Type", "application/octet-stream"
    )


def make_path(user_id: str, original_filename: str) -> str:
    ext = (
        original_filename.rsplit(".", 1)[-1].lower()
        if "." in original_filename
        else "bin"
    )
    safe_ext = "".join(c for c in ext if c.isalnum())[:6] or "bin"
    return f"{APP_NAME}/uploads/{user_id}/{uuid.uuid4()}.{safe_ext}"
