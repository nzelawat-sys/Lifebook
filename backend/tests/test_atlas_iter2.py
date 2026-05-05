"""Atlas iteration-2 backend tests.

Covers new features added in iteration 2:
- POST /api/upload (multipart image, content-type + size validation, auth)
- GET /api/files/{path:path}?auth=TOKEN (auth + isolation + 404)
- POST /api/images accepts storage_path (without url) AND url (without storage_path)
- GET /api/categories/financial returns rich seed_quotes + seed_images and >=9 premise prompts
- Idempotent additive seeding: existing users gain new prompts without losing answers;
  re-seed does not duplicate already-seeded prompts
"""
import io
import os
import struct
import uuid
import zlib

import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://learn-words-77.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _minimal_png() -> bytes:
    """Return bytes of a tiny valid 1x1 PNG."""
    sig = b"\x89PNG\r\n\x1a\n"

    def _chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    idat = zlib.compress(b"\x00\xff\x00\x00", 9)
    return sig + _chunk(b"IHDR", ihdr) + _chunk(b"IDAT", idat) + _chunk(b"IEND", b"")


def _register():
    email = f"test_{uuid.uuid4().hex[:10]}@atlas.com"
    r = requests.post(
        f"{API}/auth/register",
        json={"email": email, "password": "password123", "name": "Test U"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    return email, r.json()["token"]


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="module")
def user_a():
    email, token = _register()
    return {"email": email, "token": token, "h": {"Authorization": f"Bearer {token}"}}


@pytest.fixture(scope="module")
def user_b():
    email, token = _register()
    return {"email": email, "token": token, "h": {"Authorization": f"Bearer {token}"}}


@pytest.fixture(scope="module")
def png_bytes():
    return _minimal_png()


# ---------------------------------------------------------------------------
# Upload — happy path
# ---------------------------------------------------------------------------
class TestUpload:
    def test_upload_png_returns_storage_path_and_url(self, user_a, png_bytes):
        files = {"file": ("tiny.png", png_bytes, "image/png")}
        r = requests.post(f"{API}/upload", headers=user_a["h"], files=files, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "storage_path" in data and data["storage_path"].startswith("atlas/uploads/")
        assert data["url"].startswith("/api/files/")
        assert data["content_type"] == "image/png"
        assert data["size"] == len(png_bytes)
        # stash for the download test
        user_a["uploaded"] = data

    def test_upload_rejects_non_image(self, user_a):
        files = {"file": ("note.txt", b"hello world", "text/plain")}
        r = requests.post(f"{API}/upload", headers=user_a["h"], files=files, timeout=30)
        assert r.status_code == 400

    def test_upload_rejects_oversize(self, user_a):
        big = b"\x00" * (8 * 1024 * 1024 + 10)
        files = {"file": ("big.png", big, "image/png")}
        r = requests.post(f"{API}/upload", headers=user_a["h"], files=files, timeout=60)
        assert r.status_code == 400

    def test_upload_requires_auth(self, png_bytes):
        files = {"file": ("tiny.png", png_bytes, "image/png")}
        r = requests.post(f"{API}/upload", files=files, timeout=30)
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Files — download + auth + isolation
# ---------------------------------------------------------------------------
class TestFiles:
    def test_download_with_query_token_returns_bytes(self, user_a, png_bytes):
        up = user_a.get("uploaded")
        assert up, "upload test must have run"
        url = f"{API}/files/{up['storage_path']}?auth={user_a['token']}"
        r = requests.get(url, timeout=60)
        assert r.status_code == 200, r.text
        assert r.headers.get("content-type", "").startswith("image/")
        assert r.content == png_bytes

    def test_download_without_auth_returns_401(self, user_a):
        up = user_a["uploaded"]
        r = requests.get(f"{API}/files/{up['storage_path']}", timeout=30)
        assert r.status_code == 401

    def test_download_invalid_token_returns_401(self, user_a):
        up = user_a["uploaded"]
        r = requests.get(
            f"{API}/files/{up['storage_path']}?auth=not-a-real-token", timeout=30
        )
        assert r.status_code == 401

    def test_other_user_cannot_read_file_returns_404(self, user_a, user_b):
        up = user_a["uploaded"]
        r = requests.get(
            f"{API}/files/{up['storage_path']}?auth={user_b['token']}", timeout=30
        )
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# POST /api/images — accepts storage_path OR url
# ---------------------------------------------------------------------------
class TestImagesInput:
    def test_create_image_with_storage_path_only(self, user_a):
        up = user_a["uploaded"]
        r = requests.post(
            f"{API}/images",
            headers={**user_a["h"], "Content-Type": "application/json"},
            json={
                "category_slug": "financial",
                "storage_path": up["storage_path"],
                "caption": "TEST storage-only",
            },
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["storage_path"] == up["storage_path"]
        assert data["url"] == ""
        assert "_id" not in data

    def test_create_image_with_url_only(self, user_a):
        r = requests.post(
            f"{API}/images",
            headers={**user_a["h"], "Content-Type": "application/json"},
            json={
                "category_slug": "financial",
                "url": "https://example.com/pic.jpg",
                "caption": "TEST url-only",
            },
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"] == "https://example.com/pic.jpg"
        assert data["storage_path"] == ""


# ---------------------------------------------------------------------------
# Financial seed data enrichment
# ---------------------------------------------------------------------------
class TestFinancialSeed:
    def test_financial_seed_quotes_and_images(self, user_a):
        r = requests.get(
            f"{API}/categories/financial", headers=user_a["h"], timeout=30
        )
        assert r.status_code == 200, r.text
        data = r.json()
        quotes = data.get("seed_quotes", [])
        images = data.get("seed_images", [])
        assert len(quotes) == 8, f"expected 8 seed quotes, got {len(quotes)}"
        authors = [q["author"] for q in quotes]
        # Franklin appears twice
        assert authors.count("Benjamin Franklin") == 2
        for expected in [
            "James Russell Lowell",
            "Sophie Tucker",
            "Margaret Thatcher",
            "Oscar Wilde",
            "Seneca",
            "Robert Kiyosaki",
        ]:
            assert expected in authors, f"missing author {expected}"
        assert len(images) == 4

    def test_financial_premise_has_rich_prompts(self, user_a):
        r = requests.get(
            f"{API}/categories/financial", headers=user_a["h"], timeout=30
        )
        assert r.status_code == 200
        premise = r.json()["sections"]["premise"]
        assert len(premise) >= 9, f"expected >=9 premise prompts, got {len(premise)}"
        questions = [e["question"] for e in premise]
        assert any(
            "philosophy about money" in q.lower() for q in questions
        ), "missing philosophy-about-money prompt"


# ---------------------------------------------------------------------------
# Idempotent additive seeding
# ---------------------------------------------------------------------------
class TestIdempotentSeeding:
    def test_existing_answers_preserved_and_no_duplicates(self, user_a):
        # 1. Fetch an entry, answer it
        r = requests.get(
            f"{API}/categories/financial", headers=user_a["h"], timeout=30
        )
        premise = r.json()["sections"]["premise"]
        entry = premise[0]
        eid = entry["id"]
        q_text = entry["question"]

        r = requests.put(
            f"{API}/entries/{eid}",
            headers={**user_a["h"], "Content-Type": "application/json"},
            json={"answer": "Money is stored energy."},
            timeout=30,
        )
        assert r.status_code == 200
        orig_version = r.json()["version"]

        # 2. Re-trigger seeding by hitting categories list multiple times
        for _ in range(3):
            r = requests.get(f"{API}/categories", headers=user_a["h"], timeout=30)
            assert r.status_code == 200

        # 3. Re-fetch financial; verify no duplicates and answer preserved
        r = requests.get(
            f"{API}/categories/financial", headers=user_a["h"], timeout=30
        )
        premise = r.json()["sections"]["premise"]
        questions = [e["question"] for e in premise]
        # no dup question text
        assert len(questions) == len(set(questions)), f"duplicate prompts: {questions}"
        # original entry (same id) still present with same answer & version
        same = [e for e in premise if e["id"] == eid]
        assert len(same) == 1, "original entry lost after re-seed"
        assert same[0]["answer"] == "Money is stored energy."
        assert same[0]["version"] == orig_version
        assert same[0]["question"] == q_text
