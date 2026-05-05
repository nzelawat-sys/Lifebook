"""Atlas — Personal Lifebook backend tests."""
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://learn-words-77.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

EXISTING_EMAIL = "test@atlas.com"
EXISTING_PASSWORD = "password123"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _register(session, email, password="password123", name="Test User"):
    return session.post(f"{API}/auth/register", json={"email": email, "password": password, "name": name})


@pytest.fixture(scope="session")
def fresh_user(session):
    """Register a new test user (fresh, isolated)."""
    email = f"test_{uuid.uuid4().hex[:10]}@atlas.com"
    r = _register(session, email)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"email": email, "password": "password123", "token": data["token"], "user": data["user"]}


@pytest.fixture(scope="session")
def auth_headers(fresh_user):
    return {"Authorization": f"Bearer {fresh_user['token']}", "Content-Type": "application/json"}


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
def test_health_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class TestAuth:
    def test_register_returns_token_and_user(self, session, fresh_user):
        assert fresh_user["token"]
        assert isinstance(fresh_user["token"], str)
        assert fresh_user["user"]["email"] == fresh_user["email"]
        assert "id" in fresh_user["user"]

    def test_register_duplicate_returns_400(self, session, fresh_user):
        r = _register(session, fresh_user["email"])
        assert r.status_code == 400

    def test_login_correct_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": EXISTING_EMAIL, "password": EXISTING_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data
        assert data["user"]["email"] == EXISTING_EMAIL

    def test_login_wrong_password_returns_401(self, session):
        r = session.post(f"{API}/auth/login", json={"email": EXISTING_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_login_unknown_email_returns_401(self, session):
        r = session.post(f"{API}/auth/login", json={"email": f"nope_{uuid.uuid4().hex[:6]}@x.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, session, auth_headers, fresh_user):
        r = session.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == fresh_user["email"]
        assert "password_hash" not in data
        assert "_id" not in data

    def test_me_without_token_returns_401(self, session):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Categories & seed
# ---------------------------------------------------------------------------
class TestCategories:
    def test_list_categories_returns_12_with_seed(self, session, auth_headers):
        r = session.get(f"{API}/categories", headers=auth_headers)
        assert r.status_code == 200, r.text
        cats = r.json()
        assert len(cats) == 12
        for c in cats:
            assert "_id" not in c
            assert c["entries_count"] > 0, f"Category {c['slug']} has no seeded entries"
            assert c["entries_count"] >= 10, f"{c['slug']} has only {c['entries_count']} entries"
            assert c["progress"] == 0.0

    def test_get_health_fitness_has_all_sections(self, session, auth_headers):
        r = session.get(f"{API}/categories/health-fitness", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["category"]["slug"] == "health-fitness"
        sections = data["sections"]
        for sec in ["premise", "purpose", "vision", "strategy"]:
            assert sec in sections, f"Missing section {sec}"
            assert len(sections[sec]) > 0, f"Section {sec} is empty"
            for e in sections[sec]:
                assert "_id" not in e
                assert "question" in e
                assert "id" in e

    def test_get_unknown_category_returns_404(self, session, auth_headers):
        r = session.get(f"{API}/categories/no-such-cat", headers=auth_headers)
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Entries
# ---------------------------------------------------------------------------
class TestEntries:
    def test_update_entry_increments_version_and_history(self, session, auth_headers):
        # find an entry
        r = session.get(f"{API}/categories/health-fitness", headers=auth_headers)
        entry = r.json()["sections"]["premise"][0]
        eid = entry["id"]
        original_version = entry["version"]

        # First update
        r1 = session.put(f"{API}/entries/{eid}", headers=auth_headers, json={"answer": "First answer"})
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["answer"] == "First answer"
        assert d1["version"] == original_version + 1

        # Same content again -> version should NOT increment, no history
        r2 = session.put(f"{API}/entries/{eid}", headers=auth_headers, json={"answer": "First answer"})
        assert r2.status_code == 200
        assert r2.json()["version"] == original_version + 1

        # Change again
        r3 = session.put(f"{API}/entries/{eid}", headers=auth_headers, json={"answer": "Second answer"})
        assert r3.status_code == 200
        assert r3.json()["version"] == original_version + 2

        # History
        rh = session.get(f"{API}/entries/{eid}/history", headers=auth_headers)
        assert rh.status_code == 200
        hist = rh.json()
        assert len(hist) >= 2
        # Newest first
        assert hist[0]["changed_at"] >= hist[-1]["changed_at"]
        for h in hist:
            assert "_id" not in h

    def test_update_entry_unknown_returns_404(self, session, auth_headers):
        r = session.put(f"{API}/entries/{uuid.uuid4().hex}", headers=auth_headers, json={"answer": "x"})
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Goals CRUD
# ---------------------------------------------------------------------------
class TestGoals:
    def test_goal_full_crud(self, session, auth_headers):
        # Create
        payload = {"category_slug": "career", "title": "TEST_Goal_X", "notes": "n", "status": "active"}
        r = session.post(f"{API}/goals", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        goal = r.json()
        gid = goal["id"]
        assert goal["title"] == "TEST_Goal_X"
        assert "_id" not in goal

        # List filtered
        r = session.get(f"{API}/goals?category_slug=career", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert any(g["id"] == gid for g in items)

        # Patch
        r = session.patch(f"{API}/goals/{gid}", headers=auth_headers, json={"status": "achieved"})
        assert r.status_code == 200
        assert r.json()["status"] == "achieved"

        # GET to verify
        r = session.get(f"{API}/goals", headers=auth_headers)
        assert any(g["id"] == gid and g["status"] == "achieved" for g in r.json())

        # Delete
        r = session.delete(f"{API}/goals/{gid}", headers=auth_headers)
        assert r.status_code == 200

        # Not found
        r = session.delete(f"{API}/goals/{gid}", headers=auth_headers)
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Commitments CRUD
# ---------------------------------------------------------------------------
class TestCommitments:
    def test_commitment_full_crud(self, session, auth_headers):
        payload = {"category_slug": "spiritual", "text": "TEST_meditate daily", "status": "open"}
        r = session.post(f"{API}/commitments", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        cid = r.json()["id"]

        r = session.get(f"{API}/commitments?category_slug=spiritual", headers=auth_headers)
        assert any(c["id"] == cid for c in r.json())

        r = session.patch(f"{API}/commitments/{cid}", headers=auth_headers, json={"status": "kept"})
        assert r.status_code == 200
        assert r.json()["status"] == "kept"

        r = session.delete(f"{API}/commitments/{cid}", headers=auth_headers)
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Quotes CRUD
# ---------------------------------------------------------------------------
class TestQuotes:
    def test_quote_create_list_delete(self, session, auth_headers):
        r = session.post(
            f"{API}/quotes",
            headers=auth_headers,
            json={"category_slug": "intellectual", "text": "TEST quote", "author": "X"},
        )
        assert r.status_code == 200, r.text
        qid = r.json()["id"]

        r = session.get(f"{API}/quotes?category_slug=intellectual", headers=auth_headers)
        assert any(q["id"] == qid for q in r.json())

        r = session.delete(f"{API}/quotes/{qid}", headers=auth_headers)
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Images CRUD
# ---------------------------------------------------------------------------
class TestImages:
    def test_image_create_list_delete(self, session, auth_headers):
        r = session.post(
            f"{API}/images",
            headers=auth_headers,
            json={"category_slug": "quality-of-life", "url": "https://example.com/x.jpg", "caption": "TEST img"},
        )
        assert r.status_code == 200, r.text
        iid = r.json()["id"]

        r = session.get(f"{API}/images?category_slug=quality-of-life", headers=auth_headers)
        assert any(i["id"] == iid for i in r.json())

        r = session.delete(f"{API}/images/{iid}", headers=auth_headers)
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------
class TestSearch:
    def test_search_returns_matching(self, session, auth_headers):
        # Seed a goal/quote with searchable token
        token = f"ZZUNIQ{uuid.uuid4().hex[:6].upper()}"
        session.post(
            f"{API}/goals",
            headers=auth_headers,
            json={"category_slug": "career", "title": f"TEST {token}", "notes": ""},
        )
        session.post(
            f"{API}/quotes",
            headers=auth_headers,
            json={"category_slug": "career", "text": f"q {token}", "author": ""},
        )
        r = session.get(f"{API}/search?q={token}", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert any(token in g["title"] for g in data["goals"])
        assert any(token in q["text"] for q in data["quotes"])
        for k in ("entries", "quotes", "goals"):
            for it in data[k]:
                assert "_id" not in it


# ---------------------------------------------------------------------------
# Data isolation
# ---------------------------------------------------------------------------
class TestIsolation:
    def test_user_b_cannot_see_user_a_goals(self, session, auth_headers, fresh_user):
        # Create goal as user A (fresh_user)
        r = session.post(
            f"{API}/goals",
            headers=auth_headers,
            json={"category_slug": "career", "title": "TEST_isolation_A", "notes": ""},
        )
        assert r.status_code == 200
        a_goal_id = r.json()["id"]

        # Register user B
        b_email = f"test_{uuid.uuid4().hex[:10]}@atlas.com"
        rb = _register(session, b_email)
        assert rb.status_code == 200
        b_token = rb.json()["token"]
        b_headers = {"Authorization": f"Bearer {b_token}", "Content-Type": "application/json"}

        # User B lists goals — should NOT include A's goal
        r = session.get(f"{API}/goals", headers=b_headers)
        assert r.status_code == 200
        assert all(g["id"] != a_goal_id for g in r.json())

        # User B tries to update A's goal
        r = session.patch(f"{API}/goals/{a_goal_id}", headers=b_headers, json={"status": "achieved"})
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# AI endpoints (real Claude calls — slow)
# ---------------------------------------------------------------------------
class TestAI:
    def test_ai_suggest(self, session, auth_headers):
        r = session.post(
            f"{API}/ai/suggest",
            headers=auth_headers,
            json={
                "category_slug": "health-fitness",
                "section": "premise",
                "question": "What does health mean to me?",
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "suggestion" in data
        assert isinstance(data["suggestion"], str)
        assert len(data["suggestion"].strip()) > 10

    def test_ai_reflect_then_list(self, session, auth_headers):
        # Need at least one answered entry — use one we already updated above isn't visible in this user.
        # Quick: update an entry first.
        r = session.get(f"{API}/categories/spiritual", headers=auth_headers)
        entry = r.json()["sections"]["premise"][0]
        session.put(
            f"{API}/entries/{entry['id']}",
            headers=auth_headers,
            json={"answer": "Spirituality grounds me in service and presence."},
        )
        r = session.post(
            f"{API}/ai/reflect",
            headers=auth_headers,
            json={"category_slug": "spiritual", "period_label": "6-month"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["category_slug"] == "spiritual"
        assert isinstance(data["summary"], str) and len(data["summary"]) > 20
        assert "_id" not in data

        # List
        r = session.get(f"{API}/reflections", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert any(it["id"] == data["id"] for it in items)
        for it in items:
            assert "_id" not in it

    def test_ai_insights_then_list(self, session, auth_headers):
        r = session.post(f"{API}/ai/insights", headers=auth_headers, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data["content"], str) and len(data["content"]) > 20
        assert "_id" not in data

        r = session.get(f"{API}/insights", headers=auth_headers)
        assert r.status_code == 200
        assert any(it["id"] == data["id"] for it in r.json())
