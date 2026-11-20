import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, Sparkle, Compass, Books, TrendUp } from "@phosphor-icons/react";

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
        api.get("/categories").then((r) => setCats(r.data)).catch(() => setCats([])).finally(() => setLoading(false));
    }, []);

    const overallProgress = cats.length ? cats.reduce((s, c) => s + c.progress, 0) / cats.length : 0;

    return (
        <main data-testid="dashboard-page" className="bg-paper-grain min-h-[calc(100vh-72px)] pb-20">
            <section className="atlas-hero">
                <div className="atlas-glow" />
                <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-14 sm:pt-20 pb-14 sm:pb-20">
                    <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-center">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-400/10 px-4 py-2 text-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_#60a5fa]" />
                                <span className="tracking-eyebrow">Your personal operating system</span>
                            </div>
                            <p className="mt-8 tracking-eyebrow text-blue-200/75">
                                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                            </p>
                            <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-[5.2rem] tracking-tight leading-[1.02] text-white">
                                Design a life<br />that feels <em className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">like yours.</em>
                            </h1>
                            <p className="mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300/90">
                                Welcome back, <span className="text-white font-semibold">{user?.name?.split(" ")[0]}</span>. Twelve dimensions. One space to think clearly, capture what matters, and make intentional progress.
                            </p>
                            <div className="mt-9 flex flex-wrap items-center gap-4">
                                <a href="#library" className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 hover:bg-blue-500 hover:-translate-y-0.5 transition-all">Explore your library <ArrowRight size={18} /></a>
                                <Link to="/insights" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/5 transition-colors"><Sparkle size={17} /> View insights</Link>
                            </div>
                        </div>
                        <div className="relative hidden lg:block min-h-[390px]">
                            <div className="absolute inset-8 rounded-[2rem] border border-blue-200/20 bg-gradient-to-br from-blue-400/20 via-indigo-500/10 to-transparent backdrop-blur-sm rotate-[-5deg]" />
                            <div className="absolute inset-0 rounded-[2rem] overflow-hidden border border-white/15 bg-[#101d34]/90 shadow-2xl shadow-black/40">
                                <div className="absolute inset-0 opacity-60" style={{backgroundImage:"radial-gradient(circle at 70% 25%, rgba(91,145,255,.4), transparent 32%), linear-gradient(145deg, transparent 30%, rgba(90,70,190,.16))"}} />
                                <div className="relative h-full p-9 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-slate-300"><span className="tracking-eyebrow">The bigger picture</span><Compass size={22} className="text-blue-300" /></div>
                                    <div>
                                        <p className="font-display text-6xl text-white">{Math.round(overallProgress * 100)}<span className="text-blue-400">%</span></p>
                                        <p className="mt-2 text-slate-300">of your life library explored</p>
                                        <div className="mt-7 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-400 transition-all" style={{width:`${Math.round(overallProgress * 100)}%`}} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4"><Books size={20} className="text-blue-300" /><p className="mt-3 text-2xl text-white font-semibold">{cats.length || "—"}</p><p className="text-xs text-slate-400">Life dimensions</p></div>
                                        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4"><TrendUp size={20} className="text-violet-300" /><p className="mt-3 text-2xl text-white font-semibold">{Math.round(overallProgress * 100)}%</p><p className="text-xs text-slate-400">Overall progress</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
                <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center rounded-2xl border border-line bg-paper-soft/60 px-6 sm:px-8 py-6">
                    <div>
                        <p className="tracking-eyebrow text-blue-300 mb-2">A thought to carry today</p>
                        <p className="font-display italic text-2xl sm:text-3xl text-ink">“{dailyQuote.t}”</p>
                        {dailyQuote.a && <p className="mt-2 text-sm text-ink-muted">— {dailyQuote.a}</p>}
                    </div>
                    <div className="md:border-l md:border-line md:pl-8">
                        <p className="tracking-eyebrow text-ink-muted">Your journey</p>
                        <p className="mt-1 text-3xl font-semibold text-ink">{Math.round(overallProgress * 100)}<span className="text-blue-400">%</span></p>
                        <p className="text-xs text-ink-muted">explored so far</p>
                    </div>
                </div>
            </section>

            <section id="library" className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 sm:pt-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-9">
                    <div>
                        <p className="tracking-eyebrow text-blue-300">Twelve chapters · one life</p>
                        <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-ink">Your life library<span className="text-blue-400">.</span></h2>
                        <p className="mt-3 text-ink-muted max-w-xl">Every dimension deserves attention. Choose a chapter and pick up where you left off.</p>
                    </div>
                    <Link to="/insights" data-testid="dashboard-insights-link" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors">Cross-category insights <ArrowRight size={17} /></Link>
                </div>

                {loading ? <div className="text-ink-muted py-12">Loading your library…</div> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {cats.map((c, idx) => (
                            <Link key={c.slug} to={`/category/${c.slug}`} data-testid={`category-card-${c.slug}`} className="editorial-card block border rounded-2xl overflow-hidden group" style={{animation:`fade-up .6s ${idx*40}ms ease-out both`}}>
                                <div className="relative aspect-[16/9] overflow-hidden bg-paper-soft">
                                    <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0" style={{background:`linear-gradient(to top, ${c.color}df 0%, rgba(7,13,25,.08) 75%)`}} />
                                    <span className="absolute top-4 left-4 rounded-full border border-white/25 bg-black/20 backdrop-blur-md px-3 py-1 tracking-eyebrow text-white/90">{String(c.order).padStart(2,"0")}</span>
                                    <ArrowRight size={20} className="absolute top-4 right-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-display text-3xl tracking-tight text-ink">{c.name}</h3>
                                    <p className="mt-1 font-display-italic text-base text-ink-muted">{c.tagline}</p>
                                    <div className="mt-6 flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{width:`${Math.round(c.progress*100)}%`,background:"linear-gradient(90deg,#4389FF,#A78BFA)"}} /></div>
                                            <p className="mt-2 text-[.65rem] tracking-eyebrow text-ink-muted">{Math.round(c.progress*100)}% · {c.entries_count} prompts</p>
                                        </div>
                                        <span className="text-xs text-blue-300 font-semibold group-hover:text-violet-300 transition-colors">Open chapter</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
