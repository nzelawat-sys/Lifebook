# Atlas — Personal Lifebook (PRD)

## Original Problem Statement
User wanted a deeply personal "My Life Book" web app — a private, beautiful place to document their life across the 12 standard Lifebook categories (Health & Fitness, Intellectual, Emotional, Character, Spiritual, Love Relationship, Parenting, Social, Financial, Career, Quality of Life, Life Vision). Each category follows the Premise → Purpose → Vision → Strategy structure with default questions the user can answer over time. The app must keep an audit trail of changes (so the user can re-assess every 6 months), record goal changes and commitments, and "must be beautiful — something I look forward to opening every day." User uploaded 25 reference Lifebook documents to seed content and tone.

## Architecture
- **Backend**: FastAPI + Motor (async MongoDB) + JWT auth + Claude Sonnet 4.5 via `emergentintegrations` (Emergent LLM key).
- **Frontend**: React 19 + react-router-dom v7 + Tailwind + Shadcn UI + Phosphor Icons + sonner toasts + lightweight in-house markdown renderer.
- **Theme**: Cormorant Garamond (display) + Manrope (body); warm paper #F9F6F0, deep forest #2F3E35, terracotta #C8795A — luxury editorial / leather-bound journal aesthetic.

## User Persona
- **Single user** (this is a private journal). Multiple accounts supported but each user's data is fully isolated.
- Reflective, contemplative, returns periodically (weekly / monthly / every 6 months) to read and update.

## Core Requirements (static)
1. 12 Lifebook categories pre-seeded with default Q&A.
2. Per category: Premise / Purpose / Vision / Strategy sections, plus Goals, Commitments, Quotes, Gallery, AI Reflections.
3. Auto-save Q&A entries with versioned history (audit trail).
4. AI: auto-suggest answer in user's voice, generate 6-month reflection summaries, surface cross-category insights.
5. Beautiful editorial UI — feels like a magazine + leather journal, not a SaaS dashboard.
6. Auth: JWT email/password. Google OAuth deferred.

## What's Implemented (2026-02-05)
- ✅ JWT auth (register / login / me) with bcrypt password hashing.
- ✅ 12 categories auto-seeded with 11–14 default questions per category across 4 sections.
- ✅ Entries CRUD + automatic version history on every change.
- ✅ Goals (active/achieved/paused/changed) full CRUD with status toggle.
- ✅ Commitments (open/kept/broken) full CRUD with status cycle.
- ✅ Quotes (text + author) per category.
- ✅ Gallery (URL-based image refs + caption) per category.
- ✅ AI suggest — Claude reads past entries and drafts an answer in user's voice.
- ✅ AI reflect — generates a category-level reflection summary, stored for re-reading.
- ✅ AI insights — cross-category pattern analysis stored as insights feed.
- ✅ Atlas-wide search across entries / quotes / goals.
- ✅ Editorial design: Cormorant Garamond + Manrope, paper grain, sunset hero, bento grid of 12 chapters with custom image + accent color per category.
- ✅ Backend tested: 22/22 pytest cases passing including 3 real Claude calls.

## What's Implemented — Iteration 3 (2026-02-05 PM2)
- ✅ **Smart Import** — paste any text or upload `.txt/.md/.pdf/.docx`. Claude classifies each idea into one of 7 types (premise/purpose/vision/strategy/goal/commitment/quote) with a confidence score. User reviews each item in a magazine-style modal (color-coded type pills, inline edit, type dropdown, individual remove), then confirms — items are saved into the right places (entries/goals/commitments/quotes) automatically.
- ✅ **Lenient JSON parser** — survives Claude's occasional unescaped-quote payloads (real-world bug found and patched).
- ✅ **Overview tab** — now the default landing per category. Shows the latest AI reflection at top, followed by all curated + user quotes in a 3-col masonry, photographs in a 4-col strip, and goal/commitment mini-cards. "Refresh" button to regenerate the reflection from the same place.
- ✅ **Drag-and-drop reorder** for both quotes and images, persisted to backend via /api/quotes/reorder and /api/images/reorder.
- ✅ **Auto-derived prompt titles** for imported reflections — first 60 chars become the section question instead of all imports stacking under "Imported reflection".
- ✅ Backend tested: **47/47 pytest** (22 baseline + 13 iter-2 + 12 iter-3), 100% passing.

## What's Implemented — Iteration 2 (2026-02-05 PM)
- ✅ **Rich text editor** for entries — bold / italic / H2 / H3 / lists / blockquote, contenteditable-based, no extra deps. Auto-saves HTML on blur.
- ✅ **Object storage upload** via Emergent Object Storage. `/api/upload` + `/api/files/{path}?auth=token` with per-user data isolation, 8MB cap, image-only.
- ✅ **Dark theme** — full light/dark toggle in header. Dark palette is warm candlelit (deep #16130F bg, parchment #F1ECDF text, ochre forest #C9B98E accents). Toasts adapt.
- ✅ **Financial chapter, deeply seeded** from the user's source documents:
  - 9 Premise + 9 Purpose + 9 Vision + 15 Strategy prompts (42 total) — drawn directly from the user's Lifebook financial doc.
  - 8 curated quotes (Lowell, Tucker, Thatcher, Franklin x2, Wilde, Seneca, Kiyosaki) — all users see these.
  - 4 inspiration images (luxury/abundance imagery).
- ✅ **Idempotent additive seeding** — when new prompts are added later, existing accounts pick them up on next request without losing existing answers.
- ✅ **Multi-tenant by design** — every account sees the same questions; only their answers are private.
- ✅ Backend tested: **35/35 pytest** (22 baseline + 13 iter-2), 100% passing.

## Prioritized Backlog
### P0
- (none — MVP shipped end-to-end)

### P1 (Next session)
- Google OAuth login (Emergent-managed) alongside JWT.
- Image upload to object storage (currently URL-only).
- Apple Watch / health data integration for Health & Fitness category (user mentioned this).
- Rich text editor for entries (currently plain textarea).
- Scheduled 6-month reflection reminder (email/push).
- Enrich seed questions to 14–22 per category (currently 11–14).

### P2
- Export entire Atlas as PDF / printable book.
- Multi-device sync indicator + offline support.
- Reflection comparison view (side-by-side current vs. earlier version).
- Soft tagging across categories ("themes I keep returning to").

## Test Credentials
- Email: `test@atlas.com`
- Password: `password123`
(see `/app/memory/test_credentials.md`)

## File Map
```
/app/backend/
  server.py          — all /api routes
  auth.py            — JWT + bcrypt
  ai_service.py      — Claude Sonnet 4.5 wrapper (suggest / reflect / insights)
  seed_data.py       — 12 categories + default Q&A
  tests/test_atlas_backend.py — pytest regression suite
/app/frontend/src/
  App.js
  contexts/AuthContext.jsx
  lib/api.js
  lib/markdown.jsx
  components/ Header / EntryCard / GoalsSection / CommitmentsSection / QuotesSection / GallerySection
  pages/ LoginPage / DashboardPage / CategoryPage / InsightsPage / SearchPage
```
