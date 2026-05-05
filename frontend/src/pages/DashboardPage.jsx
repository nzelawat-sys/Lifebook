import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";

const QUOTES = [
    { t: "Thoughts become things.", a: "" },
    { t: "All that we are is the result of what we have thought.", a: "Buddha" },
    { t: "We do not see things as they are, we see them as we are.", a: "Anaïs Nin" },
    { t: "What you do every day matters more than what you do once in a while.", a: "" },
    { t: "Energy attracts energy. Thoughts shape vibration.", a: "" },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const dailyQuote = QUOTES[new Date().getDate() % QUOTES.length];

    useEffect(() => {
        api.get("/categories").then((r) => {
            setCats(r.data);
            setLoading(false);
        });
    }, []);

    const overallProgress = cats.length
        ? cats.reduce((s, c) => s + c.progress, 0) / cats.length
        : 0;

    return (
        <div data-testid="dashboard-page" className="bg-paper-grain min-h-[calc(100vh-72px)]">
            {/* Editorial hero */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12">
                <p className="tracking-eyebrow text-ink-muted">
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
                <h1 className="mt-4 font-display text-5xl lg:text-7xl tracking-tight leading-[1.05] text-ink">
                    Welcome back,{" "}
                    <em className="font-display-italic text-forest">
                        {user?.name?.split(" ")[0]}
                    </em>
                    .
                </h1>
                <div className="mt-8 grid lg:grid-cols-3 gap-10 lg:gap-16 items-end">
                    <div className="lg:col-span-2">
                        <p className="text-lg text-ink-soft leading-relaxed font-light max-w-2xl">
                            Your atlas across twelve dimensions of life. Open a chapter, sit
                            with a question, and write what's true today. We'll keep every word.
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-line" />
                            <span className="tracking-eyebrow text-ink-muted">
                                {Math.round(overallProgress * 100)}% explored
                            </span>
                        </div>
                    </div>
                    <div className="border-l border-line pl-6 lg:pl-10">
                        <p className="tracking-eyebrow text-ink-muted mb-3">Today's quote</p>
                        <p className="font-display italic text-2xl leading-snug text-ink">
                            "{dailyQuote.t}"
                        </p>
                        {dailyQuote.a && (
                            <p className="mt-2 text-sm text-ink-muted">— {dailyQuote.a}</p>
                        )}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="divider-rule" />
            </div>

            {/* Categories grid */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <p className="tracking-eyebrow text-ink-muted">Twelve chapters</p>
                        <h2 className="mt-2 font-display text-4xl tracking-tight">
                            Your library
                        </h2>
                    </div>
                    <Link
                        to="/insights"
                        data-testid="dashboard-insights-link"
                        className="hidden md:inline-flex items-center gap-2 text-forest hover:text-terracotta transition-colors"
                    >
                        <Sparkle size={16} weight="thin" />
                        <span className="tracking-eyebrow">Cross-category insights</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-ink-muted">Loading your library…</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cats.map((c, idx) => (
                            <Link
                                key={c.slug}
                                to={`/category/${c.slug}`}
                                data-testid={`category-card-${c.slug}`}
                                className="editorial-card block bg-paper border border-line rounded-md overflow-hidden group"
                                style={{ animation: `fade-up 0.6s ${idx * 40}ms ease-out both` }}
                            >
                                <div className="relative aspect-[5/3] overflow-hidden bg-paper-soft">
                                    <img
                                        src={c.image}
                                        alt={c.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: `linear-gradient(to top, ${c.color}cc 0%, transparent 60%)`,
                                        }}
                                    />
                                    <span className="absolute top-4 left-4 tracking-eyebrow text-paper/90">
                                        {String(c.order).padStart(2, "0")}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-display text-3xl tracking-tight text-ink leading-tight">
                                        {c.name}
                                    </h3>
                                    <p className="mt-1 font-display-italic text-base text-ink-muted">
                                        {c.tagline}
                                    </p>
                                    <div className="mt-5 flex items-center justify-between">
                                        <div className="flex-1 mr-4">
                                            <div className="h-px bg-line relative overflow-hidden">
                                                <div
                                                    className="absolute left-0 top-0 h-full"
                                                    style={{
                                                        width: `${Math.round(c.progress * 100)}%`,
                                                        background: c.color,
                                                    }}
                                                />
                                            </div>
                                            <p className="mt-2 text-xs tracking-eyebrow text-ink-muted">
                                                {Math.round(c.progress * 100)}% · {c.entries_count} prompts
                                            </p>
                                        </div>
                                        <ArrowRight
                                            size={18}
                                            weight="thin"
                                            className="text-ink-muted group-hover:text-forest group-hover:translate-x-1 transition-all"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
