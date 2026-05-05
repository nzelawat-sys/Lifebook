import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import ReactMarkdown from "../lib/markdown";
import { Sparkle } from "@phosphor-icons/react";

export default function InsightsPage() {
    const [items, setItems] = useState([]);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/insights")
            .then((r) => setItems(r.data))
            .finally(() => setLoading(false));
    }, []);

    const generate = async () => {
        setBusy(true);
        try {
            const r = await api.post("/ai/insights");
            setItems([r.data, ...items]);
            toast.success("New insight generated");
        } catch {
            toast.error("Could not generate insight");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div data-testid="insights-page" className="bg-paper-grain min-h-[calc(100vh-72px)]">
            <section className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
                <p className="tracking-eyebrow text-ink-muted">Across all twelve chapters</p>
                <h1 className="mt-3 font-display text-5xl lg:text-6xl tracking-tight leading-none">
                    Cross-category{" "}
                    <em className="font-display-italic text-terracotta">insights</em>.
                </h1>
                <p className="mt-6 text-ink-soft leading-relaxed max-w-2xl">
                    Atlas reads across your entire journal to surface themes, tensions, and
                    one specific commitment to make this month.
                </p>
                <button
                    data-testid="generate-insight-btn"
                    onClick={generate}
                    disabled={busy}
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-forest text-paper rounded-md tracking-wide hover:bg-forest-soft transition-colors disabled:opacity-50"
                >
                    <Sparkle size={16} weight="thin" />
                    {busy ? "Reading your atlas…" : "Generate new insight"}
                </button>

                <div className="mt-12 space-y-10">
                    {loading ? (
                        <p className="text-ink-muted">Loading…</p>
                    ) : items.length === 0 ? (
                        <p className="text-ink-muted italic font-display-italic">
                            No insights yet. Generate your first when you've written across
                            a few chapters.
                        </p>
                    ) : (
                        items.map((it) => (
                            <article
                                key={it.id}
                                data-testid={`insight-${it.id}`}
                                className="bg-paper border border-line rounded-md p-8"
                            >
                                <p className="tracking-eyebrow text-ink-muted">
                                    {new Date(it.created_at).toLocaleString()}
                                </p>
                                <div className="prose-atlas mt-4">
                                    <ReactMarkdown>{it.content}</ReactMarkdown>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
