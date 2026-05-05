import { tokenStore } from "../lib/api";
import { Quotes as QuotesIcon, Target, HandHeart } from "@phosphor-icons/react";

/**
 * OverviewTab — the magazine-style landing for a category.
 * Shows the latest AI reflection + a masonry of quotes/photos/answered prompts
 * + small cards for goals & commitments.
 *
 * Drag-and-drop reorder is enabled within the quotes row and within the photos row
 * (each column accepts intra-column drops, persisted via /quotes/reorder, /images/reorder).
 */
export default function OverviewTab({
    category,
    sections,
    seedQuotes,
    seedImages,
    quotes,
    images,
    goals,
    commitments,
    reflections,
    onReorderQuotes,
    onReorderImages,
    onGenerateReflection,
    reflectBusy,
}) {
    const latestReflection = reflections?.[0] || null;
    const allAnswered = Object.values(sections || {})
        .flat()
        .filter((e) => stripTags(e.answer || "").trim().length > 0);

    const renderImgSrc = (img) => {
        if (img.storage_path) {
            const t = tokenStore.get();
            return `${process.env.REACT_APP_BACKEND_URL}/api/files/${img.storage_path}?auth=${t}`;
        }
        return img.url;
    };

    return (
        <div data-testid="overview-tab" className="space-y-14">
            {/* AI reflection front-and-centre */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <p className="tracking-eyebrow text-ink-muted">
                        Atlas reflects · what you've been writing here
                    </p>
                    <button
                        data-testid="overview-refresh-reflection"
                        onClick={onGenerateReflection}
                        disabled={reflectBusy}
                        className="text-terracotta hover:text-forest tracking-eyebrow transition-colors disabled:opacity-50"
                    >
                        {reflectBusy ? "Reflecting…" : latestReflection ? "Refresh" : "Generate"}
                    </button>
                </div>
                {latestReflection ? (
                    <article
                        data-testid="overview-reflection"
                        className="bg-paper-soft/40 border-l-2 border-terracotta pl-6 py-2"
                    >
                        <p className="tracking-eyebrow text-ink-muted">
                            {new Date(latestReflection.created_at).toLocaleDateString()} ·{" "}
                            {latestReflection.period_label}
                        </p>
                        <div
                            className="prose-atlas mt-2"
                            dangerouslySetInnerHTML={{
                                __html: smallMd(latestReflection.summary),
                            }}
                        />
                    </article>
                ) : (
                    <p className="font-display-italic italic text-ink-muted text-lg">
                        No reflection yet. Once you've written a few answers, generate one and Atlas
                        will hold up a calm mirror.
                    </p>
                )}
            </section>

            <Divider />

            {/* Quotes row — curated + user, draggable */}
            <section>
                <p className="tracking-eyebrow text-ink-muted mb-4">
                    Quotes · {seedQuotes.length + quotes.length}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {seedQuotes.map((q, i) => (
                        <QuoteCard key={`s-${i}`} q={q} curated />
                    ))}
                    {quotes.map((q, idx) => (
                        <QuoteCard
                            key={q.id}
                            q={q}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", q.id);
                                e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                const fromId = e.dataTransfer.getData("text/plain");
                                if (!fromId || fromId === q.id) return;
                                const ids = quotes.map((x) => x.id);
                                const fromIdx = ids.indexOf(fromId);
                                if (fromIdx === -1) return;
                                ids.splice(fromIdx, 1);
                                ids.splice(idx, 0, fromId);
                                onReorderQuotes?.(ids);
                            }}
                        />
                    ))}
                </div>
            </section>

            <Divider />

            {/* Photos row — seed + user, draggable */}
            <section>
                <p className="tracking-eyebrow text-ink-muted mb-4">
                    Photographs · {seedImages.length + images.length}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {seedImages.map((src, i) => (
                        <figure
                            key={`s-${i}`}
                            className="relative aspect-[4/5] overflow-hidden border border-line rounded-md"
                        >
                            <img
                                src={src}
                                alt="Inspiration"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </figure>
                    ))}
                    {images.map((img, idx) => (
                        <figure
                            key={img.id}
                            data-testid={`overview-img-${img.id}`}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", img.id);
                                e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                const fromId = e.dataTransfer.getData("text/plain");
                                if (!fromId || fromId === img.id) return;
                                const ids = images.map((x) => x.id);
                                const fromIdx = ids.indexOf(fromId);
                                if (fromIdx === -1) return;
                                ids.splice(fromIdx, 1);
                                ids.splice(idx, 0, fromId);
                                onReorderImages?.(ids);
                            }}
                            className="relative aspect-[4/5] overflow-hidden border border-line rounded-md cursor-grab active:cursor-grabbing group"
                        >
                            <img
                                src={renderImgSrc(img)}
                                alt={img.caption || "photo"}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {img.caption && (
                                <figcaption className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-paper text-xs italic font-display-italic">
                                    {img.caption}
                                </figcaption>
                            )}
                        </figure>
                    ))}
                </div>
            </section>

            {(goals.length > 0 || commitments.length > 0) && (
                <>
                    <Divider />
                    <section className="grid md:grid-cols-2 gap-8">
                        {goals.length > 0 && (
                            <MiniListCard
                                title="Active goals"
                                icon={Target}
                                items={goals
                                    .filter((g) => g.status !== "achieved")
                                    .slice(0, 5)
                                    .map((g) => g.title)}
                                empty="No active goals"
                            />
                        )}
                        {commitments.length > 0 && (
                            <MiniListCard
                                title="Open commitments"
                                icon={HandHeart}
                                items={commitments
                                    .filter((c) => c.status === "open")
                                    .slice(0, 5)
                                    .map((c) => c.text)}
                                empty="No open commitments"
                            />
                        )}
                    </section>
                </>
            )}

            {allAnswered.length > 0 && (
                <>
                    <Divider />
                    <section>
                        <p className="tracking-eyebrow text-ink-muted mb-4">
                            Recent reflections
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            {allAnswered.slice(0, 4).map((e) => (
                                <article
                                    key={e.id}
                                    className="bg-paper border border-line rounded-md p-5"
                                >
                                    <p className="tracking-eyebrow text-ink-muted">{e.section}</p>
                                    <h4 className="font-display text-xl mt-1 leading-snug">
                                        {e.question}
                                    </h4>
                                    <div
                                        className="prose-atlas mt-2 text-sm line-clamp-4"
                                        dangerouslySetInnerHTML={{ __html: e.answer }}
                                    />
                                </article>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

function QuoteCard({ q, curated, ...props }) {
    return (
        <figure
            {...props}
            className={`relative bg-paper-soft/40 border border-line rounded-md p-5 ${props.draggable ? "cursor-grab active:cursor-grabbing" : ""
                }`}
        >
            <QuotesIcon size={16} weight="thin" className="text-terracotta mb-2" />
            <blockquote className="font-display italic text-xl leading-snug text-ink">
                "{q.text}"
            </blockquote>
            {q.author && (
                <figcaption className="mt-2 text-xs tracking-eyebrow text-ink-muted">
                    — {q.author}
                </figcaption>
            )}
            {curated && (
                <span className="absolute top-3 right-3 text-[10px] tracking-eyebrow text-ink-muted">
                    curated
                </span>
            )}
        </figure>
    );
}

function MiniListCard({ title, icon: Icon, items, empty }) {
    return (
        <div className="bg-paper border border-line rounded-md p-5">
            <div className="flex items-center gap-2 mb-3">
                <Icon size={16} weight="thin" className="text-forest" />
                <p className="tracking-eyebrow text-ink-soft">{title}</p>
            </div>
            {items.length === 0 ? (
                <p className="text-sm italic text-ink-muted">{empty}</p>
            ) : (
                <ul className="space-y-2">
                    {items.map((t, i) => (
                        <li key={i} className="text-base text-ink leading-snug">
                            · {t}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function Divider() {
    return <div className="divider-rule" />;
}

function stripTags(html) {
    if (typeof document === "undefined") return html;
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return tmp.textContent || "";
}

// Tiny markdown helper for reflection summary, mirrors the standalone lib/markdown
function smallMd(md = "") {
    const escape = (s) =>
        s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    return md
        .split(/\r?\n/)
        .map((l) => {
            const h = l.match(/^(#{1,3})\s+(.*)/);
            if (h) {
                const lvl = h[1].length + 1;
                return `<h${lvl}>${escape(h[2])}</h${lvl}>`;
            }
            const li = l.match(/^[-*]\s+(.*)/);
            if (li) return `<li>${escape(li[1])}</li>`;
            if (!l.trim()) return "";
            return `<p>${escape(l)
                .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                .replace(/\*([^*]+)\*/g, "<em>$1</em>")}</p>`;
        })
        .join("");
}
