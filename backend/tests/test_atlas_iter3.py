"""Atlas iteration-3 backend tests — Smart Import + Reorder.

Covers:
- POST /api/import/analyze: classification quality, auth, empty body, malformed-JSON fallback
- POST /api/import/upload-text: txt + md extraction, oversize rejection
- POST /api/import/commit: mixed-type creates entries/goals/commitments/quotes,
  HTML wrap on entries, em-dash auto-split for quote
- POST /api/quotes/reorder + /api/images/reorder: ordering persists, isolation between users
"""
import os
import time
import uuid

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
def _register():
    email = f"test_{uuid.uuid4().hex[:10]}@atlas.com"
    r = requests.post(
        f"{API}/auth/register",
        json={"email": email, "password": "password123", "name": "Iter3 U"},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    return email, r.json()["token"]


@pytest.fixture(scope="module")
def user_a():
    email, token = _register()
    return {"email": email, "token": token, "h": {"Authorization": f"Bearer {token}"}}


@pytest.fixture(scope="module")
def user_b():
    email, token = _register()
    return {"email": email, "token": token, "h": {"Authorization": f"Bearer {token}"}}


# ---------------------------------------------------------------------------
# /api/import/analyze
# ---------------------------------------------------------------------------
SAMPLE_MIXED_TEXT = """
PREMISE: Money is stored energy from the value I create for others.
STRATEGY: I will save and invest at least 25% of my net income every month.
QUOTE: "A penny saved is a penny earned." - Benjamin Franklin
GOAL: Reach a net worth of $1,000,000 by December 2030.
COMMITMENT: I will track every expense weekly without exception.
VISION: I see myself debt-free, financially independent, generously giving.
"""


class TestImportAnalyze:
    def test_analyze_classifies_mixed_text(self, user_a):
        r = requests.post(
            f"{API}/import/analyze",
            headers={**user_a["h"], "Content-Type": "application/json"},
            json={"category_slug": "financial", "text": SAMPLE_MIXED_TEXT},
            timeout=120,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        items = data.get("items", [])
        assert len(items) >= 4, f"expected >=4 items, got {len(items)}: {items}"
        valid_types = {
            "premise", "purpose", "vision", "strategy",
            "goal", "commitment", "quote",
        }
        for it in items:
            assert it["type"] in valid_types, f"bad type {it['type']}"
            assert isinstance(it["text"], str) and it["text"].strip(), "empty text"
            c = it.get("confidence", 0)
            assert 0.0 <= float(c) <= 1.0, f"bad confidence {c}"
            assert "id" in it
        # store for commit test
        user_a["analyzed_items"] = items

    def test_analyze_empty_text_returns_400(self, user_a):
        r = requests.post(
            f"{API}/import/analyze",
            headers={**user_a["h"], "Content-Type": "application/json"},
            json={"category_slug": "financial", "text": "   "},
            timeout=30,
        )
        assert r.status_code == 400

    def test_analyze_requires_auth(self):
        r = requests.post(
            f"{API}/import/analyze",
            json={"category_slug": "financial", "text": "hi"},
            timeout=30,
        )
        assert r.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Lenient JSON parser unit test (does NOT call Claude — exercises fallback)
# ---------------------------------------------------------------------------
class TestLenientParser:
    def test_lenient_parser_recovers_unescaped_quotes(self):
        # Importing locally so backend path is on sys.path via pytest rootdir
        import sys
        sys.path.insert(0, "/app/backend")
        from import_service import _parse_items  # type: ignore

        # Simulate Claude output with raw double-quote inside text -> strict
        # json.loads will fail; lenient parser must still return items.
        raw = '''[
          {"type": "premise", "text": "Money is "stored energy" for me.", "author": "", "confidence": 0.8},
          {"type": "quote", "text": "A penny saved is a penny earned.", "author": "Franklin", "confidence": 0.9}
        ]'''
        items = _parse_items(raw)
        assert len(items) >= 2, f"lenient parser returned {items}"
        types = [i["type"] for i in items]
        assert "premise" in types and "quote" in types
        # confidence parsed
        assert all(0.0 <= i["confidence"] <= 1.0 for i in items)


# ---------------------------------------------------------------------------
# /api/import/upload-text
# ---------------------------------------------------------------------------
class TestImportUploadText:
    def test_upload_txt_extracts_text(self, user_a):
        body = b"Hello from Atlas\nLine two."
        files = {"file": ("notes.txt", body, "text/plain")}
        r = requests.post(
            f"{API}/import/upload-text",
            headers=user_a["h"],
            files=files,
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "Hello from Atlas" in data["text"]
        assert data["filename"] == "notes.txt"

    def test_upload_md_extracts_text(self, user_a):
        body = b"# Heading\n\nSome **markdown** body text."
        files = {"file": ("notes.md", body, "text/markdown")}
        r = requests.post(
            f"{API}/import/upload-text",
            headers=user_a["h"],
            files=files,
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert "markdown" in r.json()["text"]

    def test_upload_oversize_rejected(self, user_a):
        big = b"x" * (4 * 1024 * 1024 + 100)
        files = {"file": ("big.txt", big, "text/plain")}
        r = requests.post(
            f"{API}/import/upload-text",
            headers=user_a["h"],
            files=files,
            timeout=60,
        )
        assert r.status_code == 400


# ---------------------------------------------------------------------------
# /api/import/commit
# ---------------------------------------------------------------------------
class TestImportCommit:
    def _list_entries(self, h):
        """Flatten entries across all sections of the financial category."""
        cat = requests.get(
            f"{API}/categories/financial", headers=h, timeout=30
        ).json()
        out = []
        for section, entries in cat.get("sections", {}).items():
            for e in entries:
                e["_section"] = section
                out.append(e)
        return out

    def test_commit_mixed_items_creates_resources(self, user_a):
        # Snapshot baseline counts BEFORE commit
        h = user_a["h"]
        before_entries = self._list_entries(h)
        before_goals = requests.get(
            f"{API}/goals", headers=h, params={"category_slug": "financial"}, timeout=30
        ).json()
        before_commits = requests.get(
            f"{API}/commitments", headers=h, params={"category_slug": "financial"}, timeout=30
        ).json()
        before_quotes = requests.get(
            f"{API}/quotes", headers=h, params={"category_slug": "financial"}, timeout=30
        ).json()

        items = [
            {
                "id": str(uuid.uuid4()),
                "type": "premise",
                "text": "Money is stored energy from value created.",
                "section": "premise",
                "question": "Imported reflection",
                "confidence": 0.9,
            },
            {
                "id": str(uuid.uuid4()),
                "type": "strategy",
                "text": "Save and invest 25% monthly.",
                "section": "strategy",
                "question": "Imported reflection",
                "confidence": 0.9,
            },
            {
                "id": str(uuid.uuid4()),
                "type": "goal",
                "text": "Net worth of $1M by 2030",
                "confidence": 0.9,
            },
            {
                "id": str(uuid.uuid4()),
                "type": "commitment",
                "text": "Track every expense weekly",
                "confidence": 0.9,
            },
            {
                "id": str(uuid.uuid4()),
                "type": "quote",
                "text": '"A penny saved is a penny earned." — Benjamin Franklin',
                "confidence": 0.9,
            },
        ]
        r = requests.post(
            f"{API}/import/commit",
            headers={**h, "Content-Type": "application/json"},
            json={"category_slug": "financial", "items": items},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        summary = r.json()
        assert summary == {"entries": 2, "goals": 1, "commitments": 1, "quotes": 1}, summary

        # After counts must reflect deltas
        after_entries = self._list_entries(h)
        after_goals = requests.get(
            f"{API}/goals", headers=h, params={"category_slug": "financial"}, timeout=30
        ).json()
        after_commits = requests.get(
            f"{API}/commitments", headers=h, params={"category_slug": "financial"}, timeout=30
        ).json()
        after_quotes = requests.get(
            f"{API}/quotes", headers=h, params={"category_slug": "financial"}, timeout=30
        ).json()
        assert len(after_entries) - len(before_entries) == 2
        assert len(after_goals) - len(before_goals) == 1
        assert len(after_commits) - len(before_commits) == 1
        assert len(after_quotes) - len(before_quotes) == 1

        # HTML wrapping on entries
        new_entries = [
            e for e in after_entries
            if e["id"] not in {b["id"] for b in before_entries}
        ]
        assert len(new_entries) == 2
        for e in new_entries:
            assert e["answer"].startswith("<p>") and e["answer"].endswith("</p>"), e["answer"]

        # Em-dash auto-split: locate the new quote and verify author extracted
        new_quotes = [
            q for q in after_quotes
            if q["id"] not in {b["id"] for b in before_quotes}
        ]
        assert len(new_quotes) == 1
        q = new_quotes[0]
        assert q["author"] == "Benjamin Franklin", q
        assert "penny saved" in q["text"].lower()
        # leading/trailing quote chars stripped
        assert not q["text"].startswith('"')


# ---------------------------------------------------------------------------
# Reorder — quotes & images
# ---------------------------------------------------------------------------
class TestReorder:
    @pytest.fixture(scope="class")
    def quote_ids(self, user_a):
        h = user_a["h"]
        ids = []
        for txt in ("ZZZ first reorder quote", "ZZZ second reorder quote", "ZZZ third reorder quote"):
            r = requests.post(
                f"{API}/quotes",
                headers={**h, "Content-Type": "application/json"},
                json={"category_slug": "financial", "text": txt, "author": "Tester"},
                timeout=30,
            )
            assert r.status_code == 200, r.text
            ids.append(r.json()["id"])
        return ids

    @pytest.fixture(scope="class")
    def image_ids(self, user_a):
        h = user_a["h"]
        ids = []
        for cap in ("ZZZ img1", "ZZZ img2", "ZZZ img3"):
            r = requests.post(
                f"{API}/images",
                headers={**h, "Content-Type": "application/json"},
                json={
                    "category_slug": "financial",
                    "url": f"https://example.com/{cap}.jpg",
                    "caption": cap,
                },
                timeout=30,
            )
            assert r.status_code == 200, r.text
            ids.append(r.json()["id"])
        return ids

    def test_reorder_quotes_persists(self, user_a, quote_ids):
        h = user_a["h"]
        # Reverse the order of just our 3 created quotes
        new_order = list(reversed(quote_ids))
        r = requests.post(
            f"{API}/quotes/reorder",
            headers={**h, "Content-Type": "application/json"},
            json={"ids": new_order},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        # Sleep a moment for write commit
        time.sleep(0.2)
        # Fetch list — items with display_order should sort first in given order
        listing = requests.get(
            f"{API}/quotes",
            headers=h,
            params={"category_slug": "financial"},
            timeout=30,
        ).json()
        # Filter to only our created ids preserving listing order
        seen = [q["id"] for q in listing if q["id"] in set(quote_ids)]
        assert seen == new_order, f"expected {new_order}, got {seen}"

    def test_reorder_images_persists(self, user_a, image_ids):
        h = user_a["h"]
        new_order = list(reversed(image_ids))
        r = requests.post(
            f"{API}/images/reorder",
            headers={**h, "Content-Type": "application/json"},
            json={"ids": new_order},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        time.sleep(0.2)
        listing = requests.get(
            f"{API}/images",
            headers=h,
            params={"category_slug": "financial"},
            timeout=30,
        ).json()
        seen = [i["id"] for i in listing if i["id"] in set(image_ids)]
        assert seen == new_order, f"expected {new_order}, got {seen}"

    def test_reorder_isolation_quotes(self, user_a, user_b, quote_ids):
        """User B reordering user A's ids must not change A's order."""
        # Capture A's current order
        a_listing = requests.get(
            f"{API}/quotes", headers=user_a["h"],
            params={"category_slug": "financial"}, timeout=30,
        ).json()
        a_ids_before = [q["id"] for q in a_listing if q["id"] in set(quote_ids)]

        # B sends a reorder of A's ids
        scrambled = [quote_ids[1], quote_ids[2], quote_ids[0]]
        r = requests.post(
            f"{API}/quotes/reorder",
            headers={**user_b["h"], "Content-Type": "application/json"},
            json={"ids": scrambled},
            timeout=30,
        )
        # Endpoint should accept (silent no-op) per spec
        assert r.status_code == 200, r.text

        time.sleep(0.2)
        a_listing_after = requests.get(
            f"{API}/quotes", headers=user_a["h"],
            params={"category_slug": "financial"}, timeout=30,
        ).json()
        a_ids_after = [q["id"] for q in a_listing_after if q["id"] in set(quote_ids)]
        assert a_ids_after == a_ids_before, "user B's reorder leaked into user A's data"

    def test_reorder_isolation_images(self, user_a, user_b, image_ids):
        a_listing = requests.get(
            f"{API}/images", headers=user_a["h"],
            params={"category_slug": "financial"}, timeout=30,
        ).json()
        a_ids_before = [i["id"] for i in a_listing if i["id"] in set(image_ids)]

        scrambled = [image_ids[1], image_ids[2], image_ids[0]]
        r = requests.post(
            f"{API}/images/reorder",
            headers={**user_b["h"], "Content-Type": "application/json"},
            json={"ids": scrambled},
            timeout=30,
        )
        assert r.status_code == 200, r.text

        time.sleep(0.2)
        a_listing_after = requests.get(
            f"{API}/images", headers=user_a["h"],
            params={"category_slug": "financial"}, timeout=30,
        ).json()
        a_ids_after = [i["id"] for i in a_listing_after if i["id"] in set(image_ids)]
        assert a_ids_after == a_ids_before
