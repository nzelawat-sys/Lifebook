import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import EntryCard from "../components/EntryCard";
import GoalsSection from "../components/GoalsSection";
import CommitmentsSection from "../components/CommitmentsSection";
import QuotesSection from "../components/QuotesSection";
import GallerySection from "../components/GallerySection";
import OverviewTab from "../components/OverviewTab";
import ImportModal from "../components/ImportModal";
import { toast } from "sonner";
import { ArrowLeft, Sparkle, Plus } from "@phosphor-icons/react";
import ReactMarkdown from "../lib/markdown";

const SECTION_ORDER = ["premise", "purpose", "vision", "strategy"];
const VIEW_TABS = [
    { id: "overview", label: "Overview" },
    { id: "sections", label: "Reflections" },
    { id: "goals", label: "Goals" },
    { id: "commitments", label: "Commitments" },
    { id: "quotes", label: "Quotes" },
    { id: "gallery", label: "Gallery" },
    { id: "reflections", label: "AI Reflections" },
];

export default function CategoryPage() {
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [activeView, setActiveView] = useState("overview");
    const [activeSection, setActiveSection] = useState("premise");
    const [goals, setGoals] = useState([]);
    const [commitments, setCommitments] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [images, setImages] = useState([]);
    const [reflections, setReflections] = useState([]);
    const [reflectBusy, setReflectBusy] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    const reload = async () => {
        const [cat, g, c, q, im, r] = await Promise.all([
            api.get(`/categories/${slug}`),
            api.get(`/goals?category_slug=${slug}`),
            api.get(`/commitments?category_slug=${slug}`),
            api.get(`/quotes?category_slug=${slug}`),
            api.get(`/images?category_slug=${slug}`),
            api.get(`/reflections?category_slug=${slug}`),
        ]);
        setData(cat.data);
        setGoals(g.data);
        setCommitments(c.data);
        setQuotes(q.data);
        setImages(im.data);
        setReflections(r.data);
    };

    useEffect(() => {
        setActiveView("overview");
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const reorderQuotes = async (ids) => {
        const map = new Map(quotes.map((x) => [x.id, x]));
        setQuotes(ids.map((id) => map.get(id)).filter(Boolean));
        try {
            await api.post("/quotes/reorder", { ids });
        } catch {
            toast.error("Could not save order");
        }
    };

    const reorderImages = async (ids) => {
        const map = new Map(images.map((x) => [x.id, x]));
        setImages(ids.map((id) => map.get(id)).filter(Boolean));
        try {
            await api.post("/images/reorder", { ids });
        } catch {
            toast.error("Could not save order");
        }
    };

    const updateEntry = (updated) => {
        setData((prev) => {
            if (!prev) return prev;
            const next = { ...prev, sections: { ...prev.sections } };
            for (const s of Object.keys(next.sections)) {
                next.sections[s] = next.sections[s].map((e) =>
                    e.id === updated.id ? updated : e
                );
            }
            return next;
        });
    };

    const generateReflection = async () => {
        setReflectBusy(true);
        try {
            const r = await api.post("/ai/reflect", {
                category_slug: slug,
                period_label: "current",
            });
            setReflections([r.data, ...reflections]);
            toast.success("Reflection ready");
            setActiveView("reflections");
        } catch {
            toast.error("Could not generate reflection");
        } finally {
            setReflectBusy(false);
        }
    };

    if (!data) {
        return (
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 text-ink-muted">
                Loading chapter…
            </div>
        );
    }

    const cat = data.category;
    const entries = data.sections[activeSection] || [];

    return (
        <div data-testid={`category-page-${slug}`} className="bg-paper-grain min-h-[calc(100vh-72px)]">
            {/* Hero */}
            <section className="relative">
                <div
                    className="relative h-[42vh] min-h-[320px] overflow-hidden"
                    style={{ backgroundColor: cat.color }}
                >
                    <img
                        src={cat.image}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom, transparent 30%, ${cat.color}d9 100%)`,
                        }}
                    />
                    <div className="absolute inset-0 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-end pb-12">
                        <Link
                            to="/"
                            data-testid="back-to-library"
                            className="inline-flex items-center gap-2 text-paper/90 hover:text-paper tracking-eyebrow mb-6"
                        >
                            <ArrowLeft size={16} weight="thin" /> Library
                        </Link>
                        <p className="tracking-eyebrow text-paper/80">
                            Chapter {String(cat.order).padStart(2, "0")}
                        </p>
                        <h1 className="mt-2 font-display text-5xl lg:text-7xl leading-none text-paper">
                            {cat.name}
                        </h1>
                        <p className="mt-3 font-display-italic text-paper/90 text-xl max-w-2xl">
                            {cat.tagline}
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-10">
                <p className="max-w-3xl text-ink-soft leading-relaxed">{cat.description}</p>
            </section>

            {/* View tabs */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-10">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-line">
                    {VIEW_TABS.map((t) => (
                        <button
                            key={t.id}
                            data-testid={`view-tab-${t.id}`}
                            onClick={() => setActiveView(t.id)}
                            className={`pb-3 tracking-eyebrow transition-colors ${activeView === t.id
                                    ? "atlas-tab-active"
                                    : "text-ink-muted hover:text-ink"
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                    <div className="ml-auto flex items-center gap-5">
                        <button
                            data-testid="open-import-btn"
                            onClick={() => setImportOpen(true)}
                            className="inline-flex items-center gap-1.5 text-forest hover:text-terracotta transition-colors"
                            title="Import notes / docs"
                        >
                            <Plus size={16} weight="thin" />
                            <span className="tracking-eyebrow">Smart import</span>
                        </button>
                        <button
                            data-testid="generate-reflection-btn"
                            onClick={generateReflection}
                            disabled={reflectBusy}
                            className="inline-flex items-center gap-1.5 text-terracotta hover:text-forest transition-colors disabled:opacity-50"
                        >
                            <Sparkle size={16} weight="thin" />
                            <span className="tracking-eyebrow">
                                {reflectBusy ? "Reflecting…" : "Generate reflection"}
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-14">
                {activeView === "overview" && (
                    <OverviewTab
                        category={cat}
                        sections={data.sections}
                        seedQuotes={data.seed_quotes || []}
                        seedImages={data.seed_images || []}
                        quotes={quotes}
                        images={images}
                        goals={goals}
                        commitments={commitments}
                        reflections={reflections}
                        onReorderQuotes={reorderQuotes}
                        onReorderImages={reorderImages}
                        onGenerateReflection={generateReflection}
                        reflectBusy={reflectBusy}
                    />
                )}
                {activeView === "sections" && (
                    <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
                        {/* Section sidebar */}
                        <aside>
                            <p className="tracking-eyebrow text-ink-muted mb-4">Sections</p>
                            <ul className="space-y-3">
                                {SECTION_ORDER.map((s) => {
                                    const count = data.sections[s]?.length || 0;
                                    const answered =
                                        data.sections[s]?.filter((e) => e.answer).length || 0;
                                    return (
                                        <li key={s}>
                                            <button
                                                data-testid={`section-tab-${s}`}
                                                onClick={() => setActiveSection(s)}
                                                className={`w-full text-left transition-colors ${activeSection === s
                                                        ? "text-forest"
                                                        : "text-ink-soft hover:text-ink"
                                                    }`}
                                            >
                                                <p className="font-display text-2xl tracking-tight">
                                                    {data.section_labels[s]}
                                                </p>
                                                <p className="text-xs tracking-eyebrow text-ink-muted mt-0.5">
                                                    {answered} / {count}
                                                </p>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </aside>
                        <div data-testid={`section-content-${activeSection}`} className="max-w-3xl">
                            <p className="tracking-eyebrow text-ink-muted">
                                {data.section_labels[activeSection]}
                            </p>
                            <h2 className="mt-2 font-display text-4xl lg:text-5xl tracking-tight leading-none">
                                {data.section_labels[activeSection]}.
                            </h2>
                            <div className="mt-8">
                                {entries.length === 0 ? (
                                    <p className="text-ink-muted italic font-display-italic">
                                        No prompts in this section yet.
                                    </p>
                                ) : (
                                    entries.map((e) => (
                                        <EntryCard
                                            key={e.id}
                                            entry={e}
                                            categorySlug={slug}
                                            onUpdate={updateEntry}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeView === "goals" && (
                    <div className="max-w-3xl">
                        <h2 className="font-display text-4xl tracking-tight">Goals</h2>
                        <p className="mt-2 text-ink-soft">
                            Track the goals you set in this category — and watch them evolve over time.
                        </p>
                        <div className="mt-8">
                            <GoalsSection
                                categorySlug={slug}
                                goals={goals}
                                setGoals={setGoals}
                            />
                        </div>
                    </div>
                )}

                {activeView === "commitments" && (
                    <div className="max-w-3xl">
                        <h2 className="font-display text-4xl tracking-tight">Commitments</h2>
                        <p className="mt-2 text-ink-soft">
                            Promises you've made — to yourself, to others. Mark each as kept,
                            broken, or open.
                        </p>
                        <div className="mt-8">
                            <CommitmentsSection
                                categorySlug={slug}
                                items={commitments}
                                setItems={setCommitments}
                            />
                        </div>
                    </div>
                )}

                {activeView === "quotes" && (
                    <div className="max-w-5xl">
                        <h2 className="font-display text-4xl tracking-tight">Quotes</h2>
                        <p className="mt-2 text-ink-soft">
                            Words from others that hold meaning in this chapter.
                        </p>
                        <div className="mt-8">
                            <QuotesSection
                                categorySlug={slug}
                                quotes={quotes}
                                setQuotes={setQuotes}
                                seedQuotes={data.seed_quotes || []}
                            />
                        </div>
                    </div>
                )}

                {activeView === "gallery" && (
                    <div>
                        <h2 className="font-display text-4xl tracking-tight">Gallery</h2>
                        <p className="mt-2 text-ink-soft max-w-3xl">
                            Beautiful imagery to anchor this chapter. Add photographs that
                            inspire, document, or remind.
                        </p>
                        <div className="mt-8">
                            <GallerySection
                                categorySlug={slug}
                                images={images}
                                setImages={setImages}
                                seedImages={data.seed_images || []}
                            />
                        </div>
                    </div>
                )}

                {activeView === "reflections" && (
                    <div className="max-w-3xl">
                        <h2 className="font-display text-4xl tracking-tight">AI Reflections</h2>
                        <p className="mt-2 text-ink-soft">
                            Periodic, AI-generated reflections summarizing your entries and the
                            inner shifts they reveal.
                        </p>
                        <div className="mt-8 space-y-8">
                            {reflections.length === 0 ? (
                                <p className="text-ink-muted italic font-display-italic">
                                    No reflections yet. Click "Generate reflection" above when
                                    you have entries to review.
                                </p>
                            ) : (
                                reflections.map((r) => (
                                    <article
                                        key={r.id}
                                        data-testid={`reflection-${r.id}`}
                                        className="bg-paper-soft/50 border border-line rounded-md p-6 lg:p-8"
                                    >
                                        <p className="tracking-eyebrow text-ink-muted">
                                            {new Date(r.created_at).toLocaleString()} · {r.period_label}
                                        </p>
                                        <div className="prose-atlas mt-4">
                                            <ReactMarkdown>{r.summary}</ReactMarkdown>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </section>

            {importOpen && (
                <ImportModal
                    categorySlug={slug}
                    categoryName={cat.name}
                    onClose={() => setImportOpen(false)}
                    onCommitted={() => reload()}
                />
            )}
        </div>
    );
}
