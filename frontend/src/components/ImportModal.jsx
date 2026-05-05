import { useRef, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import {
    UploadSimple,
    X,
    Sparkle,
    CheckCircle,
    Circle,
    BookOpen,
    Quotes as QuotesIcon,
    Target,
    HandHeart,
} from "@phosphor-icons/react";

const TYPE_META = {
    premise: { label: "Premise", icon: BookOpen, color: "#5C6B8A" },
    purpose: { label: "Purpose", icon: BookOpen, color: "#7B8F6F" },
    vision: { label: "Vision", icon: BookOpen, color: "#C8795A" },
    strategy: { label: "Strategy", icon: BookOpen, color: "#3E4A3D" },
    goal: { label: "Goal", icon: Target, color: "#7C6F5A" },
    commitment: { label: "Commitment", icon: HandHeart, color: "#B8775F" },
    quote: { label: "Quote", icon: QuotesIcon, color: "#8A9A86" },
};
const ALL_TYPES = Object.keys(TYPE_META);

/**
 * ImportModal — paste text or upload a doc; AI classifies; user confirms; commit.
 */
export default function ImportModal({ categorySlug, categoryName, onClose, onCommitted }) {
    const [stage, setStage] = useState("input"); // input | review | saving
    const [text, setText] = useState("");
    const [items, setItems] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [committing, setCommitting] = useState(false);
    const fileRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const fd = new FormData();
            fd.append("file", file);
            const r = await api.post("/import/upload-text", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setText(r.data.text || "");
            toast.success(`Loaded "${r.data.filename}"`);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not read file");
        } finally {
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const analyze = async () => {
        if (!text.trim()) {
            toast.error("Paste some notes or upload a file first");
            return;
        }
        setAnalyzing(true);
        try {
            const r = await api.post("/import/analyze", {
                category_slug: categorySlug,
                text,
            });
            const parsed = (r.data.items || []).map((it) => ({
                ...it,
                checked: true,
            }));
            if (parsed.length === 0) {
                toast.error("Atlas couldn't find anything to import. Try clearer notes.");
                return;
            }
            setItems(parsed);
            setStage("review");
        } catch {
            toast.error("Analysis failed — please try again");
        } finally {
            setAnalyzing(false);
        }
    };

    const updateItem = (id, patch) =>
        setItems((arr) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x)));

    const removeItem = (id) =>
        setItems((arr) => arr.filter((x) => x.id !== id));

    const commit = async () => {
        const selected = items.filter((x) => x.checked);
        if (selected.length === 0) {
            toast.error("Nothing selected");
            return;
        }
        setCommitting(true);
        try {
            const payload = {
                category_slug: categorySlug,
                items: selected.map((x) => ({
                    id: x.id,
                    type: x.type,
                    text: x.text,
                    confidence: x.confidence,
                    section:
                        x.type === "premise" ||
                            x.type === "purpose" ||
                            x.type === "vision" ||
                            x.type === "strategy"
                            ? x.type
                            : null,
                    author: x.author || null,
                    question: x.question || null,
                })),
            };
            const r = await api.post("/import/commit", payload);
            toast.success(
                `Imported ${r.data.entries + r.data.goals + r.data.commitments + r.data.quotes} items`
            );
            onCommitted?.(r.data);
            onClose();
        } catch {
            toast.error("Could not save imports");
        } finally {
            setCommitting(false);
        }
    };

    const counts = items.reduce((acc, x) => {
        if (x.checked) acc[x.type] = (acc[x.type] || 0) + 1;
        return acc;
    }, {});
    const totalChecked = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div
            data-testid="import-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-paper border border-line rounded-md w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="px-6 lg:px-8 py-5 border-b border-line flex items-start justify-between gap-4">
                    <div>
                        <p className="tracking-eyebrow text-ink-muted">
                            Smart import · {categoryName}
                        </p>
                        <h2 className="font-display text-3xl tracking-tight mt-1">
                            {stage === "input" ? "Bring your notes home" : "Review & confirm"}
                        </h2>
                    </div>
                    <button
                        data-testid="import-close-btn"
                        onClick={onClose}
                        className="text-ink-muted hover:text-terracotta"
                    >
                        <X size={20} weight="thin" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
                    {stage === "input" && (
                        <>
                            <p className="text-ink-soft leading-relaxed">
                                Paste anything — old journal entries, voice-note transcripts,
                                a Word doc you wrote years ago. Atlas will read it and sort each
                                idea into <em className="font-display-italic">premise, purpose,
                                    vision, strategy, goals, commitments,</em> or{" "}
                                <em className="font-display-italic">quotes</em>. You'll confirm
                                before anything is saved.
                            </p>

                            <textarea
                                data-testid="import-textarea"
                                className="atlas-input mt-6 min-h-[260px] text-base leading-relaxed"
                                placeholder="Paste your notes here…"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />

                            <div className="mt-4 flex items-center gap-3 flex-wrap">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".txt,.md,.pdf,.docx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="hidden"
                                    onChange={handleFile}
                                    data-testid="import-file-input"
                                />
                                <button
                                    type="button"
                                    data-testid="import-file-btn"
                                    onClick={() => fileRef.current?.click()}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-forest text-forest rounded-md tracking-wide text-sm hover:bg-forest hover:text-paper transition-colors"
                                >
                                    <UploadSimple size={14} weight="thin" />
                                    Upload file (.txt .md .pdf .docx)
                                </button>
                                <span className="text-xs text-ink-muted">
                                    Max 4MB. We only read text — never store the original file.
                                </span>
                            </div>
                        </>
                    )}

                    {stage === "review" && (
                        <>
                            <p className="text-ink-soft leading-relaxed">
                                Atlas found <strong>{items.length}</strong> ideas. Uncheck anything
                                you don't want, edit text inline, or change a type with the dropdown.
                            </p>

                            {/* Counts pill row */}
                            <div className="mt-5 flex flex-wrap gap-2">
                                {ALL_TYPES.filter((t) => counts[t]).map((t) => (
                                    <span
                                        key={t}
                                        className="px-3 py-1 rounded-full text-xs tracking-eyebrow text-paper"
                                        style={{ background: TYPE_META[t].color }}
                                    >
                                        {counts[t]} {TYPE_META[t].label}
                                    </span>
                                ))}
                            </div>

                            <ul className="mt-6 divide-y divide-line">
                                {items.map((it) => {
                                    const meta = TYPE_META[it.type];
                                    return (
                                        <li
                                            key={it.id}
                                            data-testid={`import-item-${it.id}`}
                                            className="py-4 flex items-start gap-4"
                                        >
                                            <button
                                                onClick={() => updateItem(it.id, { checked: !it.checked })}
                                                className="mt-1 text-forest"
                                                data-testid={`import-toggle-${it.id}`}
                                            >
                                                {it.checked ? (
                                                    <CheckCircle size={20} weight="fill" />
                                                ) : (
                                                    <Circle size={20} weight="thin" />
                                                )}
                                            </button>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <select
                                                        data-testid={`import-type-${it.id}`}
                                                        value={it.type}
                                                        onChange={(e) =>
                                                            updateItem(it.id, { type: e.target.value })
                                                        }
                                                        className="bg-paper-soft/60 border border-line rounded px-2 py-0.5 text-xs tracking-eyebrow text-ink"
                                                    >
                                                        {ALL_TYPES.map((t) => (
                                                            <option key={t} value={t}>
                                                                {TYPE_META[t].label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="text-xs text-ink-muted">
                                                        {Math.round(it.confidence * 100)}% sure
                                                    </span>
                                                </div>

                                                <textarea
                                                    data-testid={`import-text-${it.id}`}
                                                    className="atlas-input"
                                                    value={it.text}
                                                    rows={Math.max(2, Math.ceil(it.text.length / 80))}
                                                    onChange={(e) =>
                                                        updateItem(it.id, { text: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <button
                                                onClick={() => removeItem(it.id)}
                                                className="text-ink-muted hover:text-terracotta"
                                                title="Remove"
                                                data-testid={`import-remove-${it.id}`}
                                            >
                                                <X size={16} weight="thin" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </div>

                <div className="px-6 lg:px-8 py-4 border-t border-line bg-paper-soft/40 flex items-center justify-between gap-3">
                    {stage === "input" && (
                        <>
                            <p className="text-xs text-ink-muted">
                                Powered by Claude · ~5–15s
                            </p>
                            <button
                                data-testid="import-analyze-btn"
                                onClick={analyze}
                                disabled={analyzing || !text.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-paper rounded-md tracking-wide hover:bg-forest-soft transition-colors disabled:opacity-50"
                            >
                                <Sparkle size={14} weight="thin" />
                                {analyzing ? "Reading…" : "Analyse with AI"}
                            </button>
                        </>
                    )}
                    {stage === "review" && (
                        <>
                            <button
                                onClick={() => setStage("input")}
                                className="text-ink-muted hover:text-ink tracking-eyebrow"
                                data-testid="import-back-btn"
                            >
                                ← Edit text
                            </button>
                            <button
                                data-testid="import-commit-btn"
                                onClick={commit}
                                disabled={committing || totalChecked === 0}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta text-paper rounded-md tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {committing ? "Saving…" : `Save ${totalChecked} item${totalChecked === 1 ? "" : "s"}`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
