import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash, Quotes } from "@phosphor-icons/react";

/**
 * QuotesSection — shows curated seed quotes (read-only, shared across users)
 * plus the user's own quotes.
 */
export default function QuotesSection({
    categorySlug,
    quotes,
    setQuotes,
    seedQuotes = [],
}) {
    const [text, setText] = useState("");
    const [author, setAuthor] = useState("");

    const add = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        try {
            const r = await api.post("/quotes", {
                category_slug: categorySlug,
                text: text.trim(),
                author: author.trim(),
            });
            setQuotes([r.data, ...quotes]);
            setText("");
            setAuthor("");
            toast.success("Quote saved");
        } catch {
            toast.error("Could not add quote");
        }
    };

    const del = async (q) => {
        await api.delete(`/quotes/${q.id}`);
        setQuotes(quotes.filter((x) => x.id !== q.id));
    };

    return (
        <div data-testid="quotes-section" className="space-y-10">
            {/* Curated seed quotes */}
            {seedQuotes.length > 0 && (
                <div>
                    <p className="tracking-eyebrow text-ink-muted mb-4">
                        Curated · timeless quotes for this chapter
                    </p>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {seedQuotes.map((q, i) => (
                            <figure
                                key={i}
                                data-testid={`seed-quote-${i}`}
                                className="relative bg-paper-soft/40 border border-line rounded-md p-6"
                            >
                                <Quotes
                                    size={20}
                                    weight="thin"
                                    className="text-terracotta mb-3"
                                />
                                <blockquote className="font-display italic text-2xl leading-snug text-ink">
                                    "{q.text}"
                                </blockquote>
                                {q.author && (
                                    <figcaption className="mt-3 text-sm tracking-eyebrow text-ink-muted">
                                        — {q.author}
                                    </figcaption>
                                )}
                            </figure>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <p className="tracking-eyebrow text-ink-muted mb-4">Add your own</p>
                <form onSubmit={add} className="space-y-3">
                    <textarea
                        data-testid="quote-text-input"
                        className="atlas-input"
                        placeholder="A quote that resonates with you…"
                        rows={2}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="flex items-end gap-3">
                        <input
                            data-testid="quote-author-input"
                            className="atlas-input flex-1"
                            placeholder="Author (optional)"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        />
                        <button
                            type="submit"
                            data-testid="quote-add-btn"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-paper rounded-md tracking-wide text-sm hover:bg-forest-soft transition-colors"
                        >
                            <Plus size={14} weight="thin" /> Add
                        </button>
                    </div>
                </form>
            </div>

            {/* User quotes */}
            <div>
                <p className="tracking-eyebrow text-ink-muted mb-4">
                    Your collection · {quotes.length}
                </p>
                {quotes.length === 0 ? (
                    <p className="text-ink-muted italic font-display-italic">
                        No personal quotes saved yet.
                    </p>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-6">
                        {quotes.map((q) => (
                            <figure
                                key={q.id}
                                data-testid={`quote-${q.id}`}
                                className="relative bg-paper border border-line rounded-md p-6 group"
                            >
                                <Quotes
                                    size={20}
                                    weight="thin"
                                    className="text-terracotta mb-3"
                                />
                                <blockquote className="font-display italic text-2xl leading-snug text-ink">
                                    "{q.text}"
                                </blockquote>
                                {q.author && (
                                    <figcaption className="mt-3 text-sm tracking-eyebrow text-ink-muted">
                                        — {q.author}
                                    </figcaption>
                                )}
                                <button
                                    onClick={() => del(q)}
                                    data-testid={`quote-delete-${q.id}`}
                                    className="absolute top-3 right-3 text-ink-muted hover:text-terracotta opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash size={14} weight="thin" />
                                </button>
                            </figure>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
