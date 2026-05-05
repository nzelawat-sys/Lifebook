import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash, Quotes } from "@phosphor-icons/react";

export default function QuotesSection({ categorySlug, quotes, setQuotes }) {
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
        } catch {
            toast.error("Could not add quote");
        }
    };

    const del = async (q) => {
        await api.delete(`/quotes/${q.id}`);
        setQuotes(quotes.filter((x) => x.id !== q.id));
    };

    return (
        <div data-testid="quotes-section" className="space-y-6">
            <form onSubmit={add} className="space-y-3">
                <textarea
                    data-testid="quote-text-input"
                    className="atlas-input"
                    placeholder="A quote that resonates…"
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
            {quotes.length === 0 && (
                <p className="text-ink-muted italic font-display-italic">
                    No quotes saved yet for this chapter.
                </p>
            )}
            <div className="grid sm:grid-cols-2 gap-6">
                {quotes.map((q) => (
                    <figure
                        key={q.id}
                        data-testid={`quote-${q.id}`}
                        className="relative bg-paper-soft/60 border border-line rounded-md p-6 group"
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
        </div>
    );
}
