"""Smart-import service: parse a text blob and classify each line/paragraph
into one of the Lifebook entry types using Claude.
"""
import io
import json
import os
import re
import uuid
from typing import List

from emergentintegrations.llm.chat import LlmChat, UserMessage

DEFAULT_MODEL = ("anthropic", "claude-sonnet-4-5-20250929")

VALID_TYPES = {"premise", "purpose", "vision", "strategy", "goal", "commitment", "quote"}


def extract_text_from_upload(filename: str, content_type: str, data: bytes) -> str:
    """Best-effort plain-text extraction from common upload types."""
    name = (filename or "").lower()
    ct = (content_type or "").lower()

    # Plain text
    if ct.startswith("text/") or name.endswith((".txt", ".md")):
        try:
            return data.decode("utf-8", errors="replace")
        except Exception:
            return data.decode("latin-1", errors="replace")

    # PDF
    if ct == "application/pdf" or name.endswith(".pdf"):
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(data))
            return "\n\n".join(p.extract_text() or "" for p in reader.pages)
        except Exception as e:
            raise ValueError(f"Could not read PDF: {e}")

    # DOCX
    if name.endswith(".docx") or "wordprocessingml" in ct:
        try:
            from docx import Document

            doc = Document(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs if p.text)
        except Exception as e:
            raise ValueError(f"Could not read DOCX: {e}")

    raise ValueError("Unsupported file type for import. Use .txt, .md, .pdf, or .docx")


_SYSTEM_PROMPT = """\
You are an editor helping someone import their Lifebook notes into a digital journal.
The journal has these item types, all under a single category (e.g., Financial):

- premise: a foundational belief or principle the person holds
- purpose: a compelling reason / why behind their goals in this category
- vision: a description of the ideal future state
- strategy: a concrete action, habit, plan, or rule they will follow
- goal: a specific outcome with a clear target (often quantified or time-bound)
- commitment: a pledge or promise they are making (often phrased as "I will…")
- quote: a quotation from someone else (named or anonymous)

Read the user's input and produce a JSON array of items. Each item is:
{ "type": one of the above, "text": cleaned text, "author": author for quotes (string, "" if unknown), "confidence": 0.0-1.0 }

CRITICAL JSON FORMATTING RULES (MUST follow exactly):
- Return ONLY the JSON array. No markdown fences, no commentary.
- Inside the "text" field: NEVER use raw double-quote characters. If a quotation needs to appear, put the quotation in the "text" field WITHOUT surrounding quotation marks, and put the speaker in "author".
- Use straight ASCII quotes only for JSON syntax. Do not use smart/curly quotes anywhere.
- Escape any internal special characters per JSON spec.

Editorial rules:
- Split the input into atomic items (one belief / one goal / one quote each).
- Clean up shouting / all-caps; rewrite to natural sentence case while preserving meaning.
- Keep the user's voice. Trim filler like "I JUST LOVE" → "I love".
- If the same idea repeats, keep only the strongest phrasing.
- Aim for 3–25 items depending on input length.
"""


async def classify_text(category_name: str, text: str) -> List[dict]:
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    chat = LlmChat(
        api_key=key,
        session_id=str(uuid.uuid4()),
        system_message=_SYSTEM_PROMPT,
    ).with_model(*DEFAULT_MODEL)

    msg = UserMessage(
        text=(
            f"Category: {category_name}\n\n"
            f"User's notes:\n```\n{text[:12000]}\n```\n\n"
            "Return the JSON array now."
        )
    )
    raw = await chat.send_message(msg)
    return _parse_items(raw)


def _parse_items(raw: str) -> List[dict]:
    if not raw:
        return []
    s = raw.strip()
    s = re.sub(r"^```(?:json)?\s*", "", s)
    s = re.sub(r"\s*```$", "", s)
    start = s.find("[")
    end = s.rfind("]")
    if start == -1 or end == -1 or end <= start:
        return []
    arr_text = s[start : end + 1]

    # First try strict JSON parsing
    try:
        items = json.loads(arr_text)
    except Exception:
        items = _lenient_parse_objects(arr_text)

    out = []
    for it in items or []:
        if not isinstance(it, dict):
            continue
        t = (it.get("type") or "").strip().lower()
        text = (it.get("text") or "").strip()
        author = (it.get("author") or "").strip()
        if t not in VALID_TYPES or not text:
            continue
        try:
            conf = float(it.get("confidence", 0.7))
        except Exception:
            conf = 0.7
        out.append(
            {
                "id": str(uuid.uuid4()),
                "type": t,
                "text": text,
                "author": author,
                "confidence": max(0.0, min(1.0, conf)),
            }
        )
    return out


def _lenient_parse_objects(arr_text: str) -> List[dict]:
    """Fallback parser for when Claude emits invalid JSON (e.g., unescaped quotes).

    Walks the array text, extracts each top-level {...} object, and for each one
    pulls 'type', 'text', 'author', 'confidence' via regex tolerant of stray quotes.
    """
    objs = []
    depth = 0
    start_idx = None
    for i, ch in enumerate(arr_text):
        if ch == "{":
            if depth == 0:
                start_idx = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start_idx is not None:
                objs.append(arr_text[start_idx : i + 1])
                start_idx = None
    out = []
    for o in objs:
        item = {}
        m = re.search(r'"type"\s*:\s*"([^"]+)"', o)
        if m:
            item["type"] = m.group(1)
        # text: greedy until next ", "author" or ", "confidence" or end-brace
        m = re.search(
            r'"text"\s*:\s*"(.+?)"\s*(?=,\s*"(?:author|confidence)"|\s*})',
            o,
            re.DOTALL,
        )
        if m:
            item["text"] = m.group(1)
        m = re.search(r'"author"\s*:\s*"([^"]*)"', o)
        if m:
            item["author"] = m.group(1)
        m = re.search(r'"confidence"\s*:\s*([0-9.]+)', o)
        if m:
            try:
                item["confidence"] = float(m.group(1))
            except Exception:
                item["confidence"] = 0.7
        if item.get("type") and item.get("text"):
            out.append(item)
    return out
