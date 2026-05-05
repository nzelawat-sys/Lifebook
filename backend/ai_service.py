"""AI helpers using Claude Sonnet 4.5 via emergentintegrations."""
import os
import uuid
from typing import List, Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
DEFAULT_MODEL = ("anthropic", "claude-sonnet-4-5-20250929")


def _new_chat(system_message: str) -> LlmChat:
    if not EMERGENT_LLM_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=str(uuid.uuid4()),
        system_message=system_message,
    ).with_model(*DEFAULT_MODEL)


async def suggest_answer(
    category_name: str,
    section: str,
    question: str,
    past_entries: List[dict],
) -> str:
    """Suggest an answer based on the user's past entries (auto-suggest)."""
    history = "\n".join(
        f"- [{e.get('category_name','')}/{e.get('section','')}] Q: {e.get('question','')}\n  A: {e.get('answer','')}"
        for e in past_entries[:25]
        if e.get("answer")
    )
    system = (
        "You are a thoughtful life-reflection writing partner for someone building their personal Lifebook. "
        "You help them articulate their own thoughts, never invent values they haven't expressed. "
        "Read their past entries to understand their voice, then suggest a brief draft answer they can edit. "
        "Keep responses warm, concrete, and 2–4 sentences. Use first person ('I')."
    )
    chat = _new_chat(system)
    user_msg = UserMessage(
        text=(
            f"Category: {category_name}\nSection: {section.title()}\nQuestion: {question}\n\n"
            f"Their past entries (for voice & context):\n{history if history else '(none yet)'}\n\n"
            "Write a short draft answer in their voice that they can edit. "
            "If you have no signal from past entries, ask one clarifying nudge in 1 sentence "
            "and then offer a generic but thoughtful starter."
        )
    )
    return await chat.send_message(user_msg)


async def reflect_summary(
    category_name: str,
    entries: List[dict],
    period_label: str,
) -> str:
    """Generate a 6-month (or any period) reflection summary for a category."""
    body = "\n".join(
        f"[{e.get('section','')}] {e.get('question','')}\n→ {e.get('answer','')}\n"
        for e in entries
        if e.get("answer")
    )
    system = (
        "You are a wise reflection coach. Read the user's entries for one Lifebook category and "
        "produce a calm, warm, honest reflection. Highlight: (1) what they've clarified, "
        "(2) the inner shifts you can sense, (3) the gaps or contradictions to watch, "
        "(4) two questions to bring to their next reflection."
    )
    chat = _new_chat(system)
    user_msg = UserMessage(
        text=(
            f"Category: {category_name}\nPeriod: {period_label}\n\n"
            f"Their entries:\n{body if body else '(empty)'}\n\n"
            "Write the reflection in markdown with short sections."
        )
    )
    return await chat.send_message(user_msg)


async def cross_category_insights(all_entries: List[dict]) -> str:
    """Find patterns and tensions across the user's full Atlas."""
    body = "\n".join(
        f"[{e.get('category_name','')}/{e.get('section','')}] Q: {e.get('question','')}\n  A: {e.get('answer','')}"
        for e in all_entries[:120]
        if e.get("answer")
    )
    system = (
        "You are a perceptive life-coach reading across a person's full life journal (12 categories). "
        "Find: (1) the 3 strongest themes that appear across categories, "
        "(2) one productive tension or contradiction they may not see, "
        "(3) one underdeveloped area, (4) one specific commitment they could make this month. "
        "Be specific, warm, and never generic."
    )
    chat = _new_chat(system)
    user_msg = UserMessage(
        text=(
            f"Full journal entries (truncated):\n{body if body else '(empty)'}\n\n"
            "Write your reflection in markdown."
        )
    )
    return await chat.send_message(user_msg)
