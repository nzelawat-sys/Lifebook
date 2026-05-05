"""Atlas — Personal Lifebook backend."""
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv

# Load env BEFORE any local imports that may read env at module load time
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from auth import (
    create_token,
    get_current_user_id,
    hash_password,
    verify_password,
)
from ai_service import (
    cross_category_insights,
    reflect_summary,
    suggest_answer,
)
from seed_data import CATEGORIES, SECTION_LABELS, default_section_questions

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Atlas — Personal Lifebook")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("atlas")


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


class _Base(BaseModel):
    model_config = ConfigDict(extra="ignore")


class RegisterIn(_Base):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginIn(_Base):
    email: EmailStr
    password: str


class AuthOut(_Base):
    token: str
    user: dict


class CategoryOut(_Base):
    slug: str
    name: str
    order: int
    tagline: str
    image: str
    color: str
    description: str
    progress: float = 0.0
    entries_count: int = 0


class EntryIn(_Base):
    category_slug: str
    section: str  # premise|purpose|vision|strategy
    question: str
    answer: str = ""


class EntryOut(_Base):
    id: str
    category_slug: str
    section: str
    question: str
    answer: str
    version: int
    updated_at: str


class HistoryItem(_Base):
    id: str
    answer: str
    version: int
    changed_at: str


class GoalIn(_Base):
    category_slug: str
    title: str
    notes: str = ""
    status: str = "active"  # active|achieved|paused|changed


class GoalOut(GoalIn):
    id: str
    created_at: str
    updated_at: str


class GoalUpdate(_Base):
    title: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class CommitmentIn(_Base):
    category_slug: str
    text: str
    status: str = "open"  # open|kept|broken


class CommitmentOut(CommitmentIn):
    id: str
    created_at: str


class CommitmentUpdate(_Base):
    text: Optional[str] = None
    status: Optional[str] = None


class QuoteIn(_Base):
    category_slug: str
    text: str
    author: str = ""


class QuoteOut(QuoteIn):
    id: str
    created_at: str


class ImageIn(_Base):
    category_slug: str
    url: str
    caption: str = ""


class ImageOut(ImageIn):
    id: str
    created_at: str


class ReflectionIn(_Base):
    category_slug: str
    period_label: str = "6-month"


class ReflectionOut(_Base):
    id: str
    category_slug: str
    period_label: str
    summary: str
    created_at: str


class InsightOut(_Base):
    id: str
    content: str
    created_at: str


class SuggestIn(_Base):
    category_slug: str
    section: str
    question: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _category_meta(slug: str) -> dict:
    for c in CATEGORIES:
        if c["slug"] == slug:
            return c
    raise HTTPException(404, "Unknown category")


async def _ensure_user_seeded(user_id: str):
    """Ensure user has the default seed entries (questions only, blank answers)."""
    existing = await db.entries.count_documents({"user_id": user_id})
    if existing > 0:
        return
    docs = []
    for c in CATEGORIES:
        qs = default_section_questions(c["slug"])
        for section, questions in qs.items():
            for q in questions:
                docs.append(
                    {
                        "id": _new_id(),
                        "user_id": user_id,
                        "category_slug": c["slug"],
                        "section": section,
                        "question": q,
                        "answer": "",
                        "version": 1,
                        "updated_at": _now_iso(),
                    }
                )
    if docs:
        await db.entries.insert_many(docs)


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api.post("/auth/register", response_model=AuthOut)
async def register(body: RegisterIn):
    existing = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_id = _new_id()
    user_doc = {
        "id": user_id,
        "email": body.email.lower(),
        "name": body.name,
        "password_hash": hash_password(body.password),
        "created_at": _now_iso(),
    }
    await db.users.insert_one(user_doc)
    await _ensure_user_seeded(user_id)
    token = create_token(user_id, body.email.lower())
    return AuthOut(
        token=token,
        user={"id": user_id, "email": body.email.lower(), "name": body.name},
    )


@api.post("/auth/login", response_model=AuthOut)
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    await _ensure_user_seeded(user["id"])
    token = create_token(user["id"], user["email"])
    return AuthOut(
        token=token,
        user={"id": user["id"], "email": user["email"], "name": user["name"]},
    )


@api.get("/auth/me")
async def me(user_id: str = Depends(get_current_user_id)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(404, "User not found")
    return user


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------
@api.get("/categories", response_model=List[CategoryOut])
async def list_categories(user_id: str = Depends(get_current_user_id)):
    await _ensure_user_seeded(user_id)
    out: List[CategoryOut] = []
    for c in CATEGORIES:
        total = await db.entries.count_documents(
            {"user_id": user_id, "category_slug": c["slug"]}
        )
        answered = await db.entries.count_documents(
            {
                "user_id": user_id,
                "category_slug": c["slug"],
                "answer": {"$ne": ""},
            }
        )
        progress = (answered / total) if total else 0.0
        out.append(
            CategoryOut(
                slug=c["slug"],
                name=c["name"],
                order=c["order"],
                tagline=c["tagline"],
                image=c["image"],
                color=c["color"],
                description=c["description"],
                progress=round(progress, 3),
                entries_count=total,
            )
        )
    return out


@api.get("/categories/{slug}")
async def get_category(slug: str, user_id: str = Depends(get_current_user_id)):
    meta = _category_meta(slug)
    await _ensure_user_seeded(user_id)
    entries_cursor = db.entries.find(
        {"user_id": user_id, "category_slug": slug}, {"_id": 0}
    )
    entries = await entries_cursor.to_list(1000)
    sections = {k: [] for k in SECTION_LABELS.keys()}
    for e in entries:
        sections.setdefault(e["section"], []).append(e)
    # Stable order
    for s in sections:
        sections[s].sort(key=lambda x: x.get("question", ""))
    return {
        "category": meta,
        "section_labels": SECTION_LABELS,
        "sections": sections,
    }


# ---------------------------------------------------------------------------
# Entries (Q&A)
# ---------------------------------------------------------------------------
@api.put("/entries/{entry_id}")
async def update_entry(
    entry_id: str,
    body: dict,
    user_id: str = Depends(get_current_user_id),
):
    answer = body.get("answer", "")
    existing = await db.entries.find_one(
        {"id": entry_id, "user_id": user_id}, {"_id": 0}
    )
    if not existing:
        raise HTTPException(404, "Entry not found")

    # Save history if content actually changed
    if existing.get("answer", "") != answer:
        await db.entry_history.insert_one(
            {
                "id": _new_id(),
                "entry_id": entry_id,
                "user_id": user_id,
                "answer": existing.get("answer", ""),
                "version": existing.get("version", 1),
                "changed_at": _now_iso(),
            }
        )

    new_version = existing.get("version", 1) + (
        1 if existing.get("answer", "") != answer else 0
    )
    await db.entries.update_one(
        {"id": entry_id, "user_id": user_id},
        {
            "$set": {
                "answer": answer,
                "version": new_version,
                "updated_at": _now_iso(),
            }
        },
    )
    updated = await db.entries.find_one({"id": entry_id}, {"_id": 0})
    return updated


@api.post("/entries")
async def create_entry(body: EntryIn, user_id: str = Depends(get_current_user_id)):
    _category_meta(body.category_slug)
    if body.section not in SECTION_LABELS:
        raise HTTPException(400, "Invalid section")
    doc = {
        "id": _new_id(),
        "user_id": user_id,
        "category_slug": body.category_slug,
        "section": body.section,
        "question": body.question,
        "answer": body.answer,
        "version": 1,
        "updated_at": _now_iso(),
    }
    await db.entries.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/entries/{entry_id}")
async def delete_entry(entry_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.entries.delete_one({"id": entry_id, "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Entry not found")
    await db.entry_history.delete_many({"entry_id": entry_id, "user_id": user_id})
    return {"ok": True}


@api.get("/entries/{entry_id}/history", response_model=List[HistoryItem])
async def entry_history(entry_id: str, user_id: str = Depends(get_current_user_id)):
    items = await db.entry_history.find(
        {"entry_id": entry_id, "user_id": user_id}, {"_id": 0}
    ).sort("changed_at", -1).to_list(500)
    return items


# ---------------------------------------------------------------------------
# Goals
# ---------------------------------------------------------------------------
@api.get("/goals", response_model=List[GoalOut])
async def list_goals(
    category_slug: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    q = {"user_id": user_id}
    if category_slug:
        q["category_slug"] = category_slug
    items = await db.goals.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api.post("/goals", response_model=GoalOut)
async def create_goal(body: GoalIn, user_id: str = Depends(get_current_user_id)):
    _category_meta(body.category_slug)
    doc = {
        "id": _new_id(),
        "user_id": user_id,
        **body.model_dump(),
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.goals.insert_one(dict(doc))
    return doc


@api.patch("/goals/{goal_id}", response_model=GoalOut)
async def update_goal(
    goal_id: str, body: GoalUpdate, user_id: str = Depends(get_current_user_id)
):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if not patch:
        raise HTTPException(400, "Nothing to update")
    patch["updated_at"] = _now_iso()
    res = await db.goals.update_one({"id": goal_id, "user_id": user_id}, {"$set": patch})
    if res.matched_count == 0:
        raise HTTPException(404, "Goal not found")
    g = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return g


@api.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.goals.delete_one({"id": goal_id, "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Goal not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Commitments
# ---------------------------------------------------------------------------
@api.get("/commitments", response_model=List[CommitmentOut])
async def list_commitments(
    category_slug: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    q = {"user_id": user_id}
    if category_slug:
        q["category_slug"] = category_slug
    items = await db.commitments.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api.post("/commitments", response_model=CommitmentOut)
async def create_commitment(body: CommitmentIn, user_id: str = Depends(get_current_user_id)):
    _category_meta(body.category_slug)
    doc = {
        "id": _new_id(),
        "user_id": user_id,
        **body.model_dump(),
        "created_at": _now_iso(),
    }
    await db.commitments.insert_one(dict(doc))
    return doc


@api.patch("/commitments/{cid}", response_model=CommitmentOut)
async def update_commitment(
    cid: str, body: CommitmentUpdate, user_id: str = Depends(get_current_user_id)
):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if not patch:
        raise HTTPException(400, "Nothing to update")
    res = await db.commitments.update_one({"id": cid, "user_id": user_id}, {"$set": patch})
    if res.matched_count == 0:
        raise HTTPException(404, "Commitment not found")
    c = await db.commitments.find_one({"id": cid}, {"_id": 0})
    return c


@api.delete("/commitments/{cid}")
async def delete_commitment(cid: str, user_id: str = Depends(get_current_user_id)):
    res = await db.commitments.delete_one({"id": cid, "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Commitment not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Quotes & Images
# ---------------------------------------------------------------------------
@api.get("/quotes", response_model=List[QuoteOut])
async def list_quotes(
    category_slug: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    q = {"user_id": user_id}
    if category_slug:
        q["category_slug"] = category_slug
    items = await db.quotes.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api.post("/quotes", response_model=QuoteOut)
async def create_quote(body: QuoteIn, user_id: str = Depends(get_current_user_id)):
    _category_meta(body.category_slug)
    doc = {
        "id": _new_id(),
        "user_id": user_id,
        **body.model_dump(),
        "created_at": _now_iso(),
    }
    await db.quotes.insert_one(dict(doc))
    return doc


@api.delete("/quotes/{qid}")
async def delete_quote(qid: str, user_id: str = Depends(get_current_user_id)):
    await db.quotes.delete_one({"id": qid, "user_id": user_id})
    return {"ok": True}


@api.get("/images", response_model=List[ImageOut])
async def list_images(
    category_slug: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    q = {"user_id": user_id}
    if category_slug:
        q["category_slug"] = category_slug
    items = await db.images.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api.post("/images", response_model=ImageOut)
async def create_image(body: ImageIn, user_id: str = Depends(get_current_user_id)):
    _category_meta(body.category_slug)
    doc = {
        "id": _new_id(),
        "user_id": user_id,
        **body.model_dump(),
        "created_at": _now_iso(),
    }
    await db.images.insert_one(dict(doc))
    return doc


@api.delete("/images/{iid}")
async def delete_image(iid: str, user_id: str = Depends(get_current_user_id)):
    await db.images.delete_one({"id": iid, "user_id": user_id})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------
@api.get("/search")
async def search(
    q: str = Query(..., min_length=1),
    user_id: str = Depends(get_current_user_id),
):
    regex = {"$regex": q, "$options": "i"}
    entries = await db.entries.find(
        {
            "user_id": user_id,
            "$or": [{"answer": regex}, {"question": regex}],
        },
        {"_id": 0},
    ).limit(50).to_list(50)
    quotes = await db.quotes.find(
        {"user_id": user_id, "$or": [{"text": regex}, {"author": regex}]}, {"_id": 0}
    ).limit(20).to_list(20)
    goals = await db.goals.find(
        {"user_id": user_id, "$or": [{"title": regex}, {"notes": regex}]}, {"_id": 0}
    ).limit(20).to_list(20)
    return {"entries": entries, "quotes": quotes, "goals": goals}


# ---------------------------------------------------------------------------
# AI routes
# ---------------------------------------------------------------------------
@api.post("/ai/suggest")
async def ai_suggest(body: SuggestIn, user_id: str = Depends(get_current_user_id)):
    cat = _category_meta(body.category_slug)
    past = await db.entries.find(
        {"user_id": user_id, "answer": {"$ne": ""}}, {"_id": 0}
    ).limit(50).to_list(50)
    enriched = []
    for p in past:
        meta = next((c for c in CATEGORIES if c["slug"] == p.get("category_slug")), None)
        enriched.append({**p, "category_name": meta["name"] if meta else p.get("category_slug")})
    suggestion = await suggest_answer(
        category_name=cat["name"],
        section=body.section,
        question=body.question,
        past_entries=enriched,
    )
    return {"suggestion": suggestion}


@api.post("/ai/reflect", response_model=ReflectionOut)
async def ai_reflect(body: ReflectionIn, user_id: str = Depends(get_current_user_id)):
    cat = _category_meta(body.category_slug)
    entries = await db.entries.find(
        {"user_id": user_id, "category_slug": body.category_slug}, {"_id": 0}
    ).to_list(500)
    summary = await reflect_summary(cat["name"], entries, body.period_label)
    doc = {
        "id": _new_id(),
        "user_id": user_id,
        "category_slug": body.category_slug,
        "period_label": body.period_label,
        "summary": summary,
        "created_at": _now_iso(),
    }
    await db.reflections.insert_one(dict(doc))
    return doc


@api.get("/reflections", response_model=List[ReflectionOut])
async def list_reflections(
    category_slug: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    q = {"user_id": user_id}
    if category_slug:
        q["category_slug"] = category_slug
    items = await db.reflections.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items


@api.post("/ai/insights", response_model=InsightOut)
async def ai_insights(user_id: str = Depends(get_current_user_id)):
    entries = await db.entries.find(
        {"user_id": user_id, "answer": {"$ne": ""}}, {"_id": 0}
    ).to_list(500)
    enriched = []
    for p in entries:
        meta = next((c for c in CATEGORIES if c["slug"] == p.get("category_slug")), None)
        enriched.append({**p, "category_name": meta["name"] if meta else p.get("category_slug")})
    content = await cross_category_insights(enriched)
    doc = {
        "id": _new_id(),
        "user_id": user_id,
        "content": content,
        "created_at": _now_iso(),
    }
    await db.ai_insights.insert_one(dict(doc))
    return InsightOut(id=doc["id"], content=content, created_at=doc["created_at"])


@api.get("/insights", response_model=List[InsightOut])
async def list_insights(user_id: str = Depends(get_current_user_id)):
    items = await db.ai_insights.find({"user_id": user_id}, {"_id": 0}).sort(
        "created_at", -1
    ).to_list(50)
    return items


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"app": "Atlas — Personal Lifebook", "ok": True}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
