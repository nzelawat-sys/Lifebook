import { useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { MagnifyingGlass } from "@phosphor-icons/react";

export default function SearchPage() {
    const [q, setQ] = useState("");
    const [results, setResults] = useState(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!q.trim()) return;
        setBusy(true);
        try {
            const r = await api.get(`/search?q=${encodeURIComponent(q)}`);
            setResults(r.data);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div data-testid="search-page" className="bg-paper-grain min-h-[calc(100vh-72px)]">
            <section className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
                <p className="tracking-eyebrow text-ink-muted">Atlas-wide search</p>
                <h1 className="mt-3 font-display text-5xl tracking-tight">
                    Find anything in your <em className="font-display-italic">life book</em>.
                </h1>
                <form onSubmit={submit} className="mt-8 flex items-center gap-3 border-b border-line py-3">
                    <MagnifyingGlass size={20} weight="thin" className="text-ink-muted" />
                    <input
                        data-testid="search-input"
                        autoFocus
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-lg"
                        placeholder="Search reflections, quotes, goals…"
                    />
                    <button
                        data-testid="search-submit"
                        type="submit"
                        disabled={busy}
                        className="tracking-eyebrow text-forest hover:text-terracotta transition-colors disabled:opacity-50"
                    >
                        {busy ? "Searching" : "Search"}
                    </button>
                </form>

                {results && (
                    <div className="mt-12 space-y-12" data-testid="search-results">
                        <Section
                            title="Reflections"
                            items={results.entries}
                            render={(e) => (
                                <Link
                                    key={e.id}
                                    to={`/category/${e.category_slug}`}
                                    className="block py-4 border-b border-line hover:bg-paper-soft/50 px-2 -mx-2 transition-colors"
                                >
                                    <p className="tracking-eyebrow text-ink-muted">
                                        {e.category_slug} · {e.section}
                                    </p>
                                    <p className="font-display text-xl mt-1">{e.question}</p>
                                    {e.answer && (
                                        <p className="mt-1 text-ink-soft line-clamp-2">{e.answer}</p>
                                    )}
                                </Link>
                            )}
                        />
                        <Section
                            title="Quotes"
                            items={results.quotes}
                            render={(qq) => (
                                <div key={qq.id} className="py-4 border-b border-line">
                                    <p className="font-display italic text-lg">"{qq.text}"</p>
                                    {qq.author && (
                                        <p className="mt-1 tracking-eyebrow text-ink-muted">
                                            — {qq.author} · {qq.category_slug}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                        <Section
                            title="Goals"
                            items={results.goals}
                            render={(g) => (
                                <Link
                                    key={g.id}
                                    to={`/category/${g.category_slug}`}
                                    className="block py-4 border-b border-line hover:bg-paper-soft/50 px-2 -mx-2 transition-colors"
                                >
                                    <p className="tracking-eyebrow text-ink-muted">{g.category_slug}</p>
                                    <p className="text-base mt-1">{g.title}</p>
                                </Link>
                            )}
                        />
                    </div>
                )}
            </section>
        </div>
    );
}

function Section({ title, items, render }) {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <h2 className="font-display text-3xl tracking-tight mb-4">{title}</h2>
            {items.map(render)}
        </div>
    );
}
