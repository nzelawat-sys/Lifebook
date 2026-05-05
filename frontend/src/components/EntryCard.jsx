import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Sparkle, ClockCounterClockwise } from "@phosphor-icons/react";

/**
 * EntryCard — a single Q&A prompt within a category section.
 * Auto-saves on blur; shows version & history; AI suggest.
 */
export default function EntryCard({ entry, categorySlug, onUpdate }) {
    const [answer, setAnswer] = useState(entry.answer || "");
    const [saving, setSaving] = useState(false);
    const [aiBusy, setAiBusy] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [history, setHistory] = useState([]);

    const save = async () => {
        if (answer === entry.answer) return;
        setSaving(true);
        try {
            const r = await api.put(`/entries/${entry.id}`, { answer });
            onUpdate(r.data);
            toast.success("Saved");
        } catch (e) {
            toast.error("Could not save");
        } finally {
            setSaving(false);
        }
    };

    const askAI = async () => {
        setAiBusy(true);
        try {
            const r = await api.post("/ai/suggest", {
                category_slug: categorySlug,
                section: entry.section,
                question: entry.question,
            });
            const suggestion = r.data.suggestion || "";
            // Append rather than overwrite, so user keeps any draft
            setAnswer((prev) =>
                prev ? `${prev}\n\n${suggestion}` : suggestion
            );
            toast.success("AI draft added — edit it as your own");
        } catch (e) {
            toast.error("AI suggestion failed");
        } finally {
            setAiBusy(false);
        }
    };

    const loadHistory = async () => {
        if (historyOpen) {
            setHistoryOpen(false);
            return;
        }
        try {
            const r = await api.get(`/entries/${entry.id}/history`);
            setHistory(r.data);
            setHistoryOpen(true);
        } catch (e) {
            toast.error("Could not load history");
        }
    };

    return (
        <div
            data-testid={`entry-card-${entry.id}`}
            className="border-b border-line py-8 first:pt-2"
        >
            <div className="flex items-start justify-between gap-6">
                <h4 className="font-display text-2xl tracking-tight text-ink leading-snug max-w-3xl">
                    {entry.question}
                </h4>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        data-testid={`history-btn-${entry.id}`}
                        onClick={loadHistory}
                        title="Change history"
                        className="text-ink-muted hover:text-forest transition-colors"
                    >
                        <ClockCounterClockwise size={18} weight="thin" />
                    </button>
                    <button
                        data-testid={`ai-suggest-btn-${entry.id}`}
                        onClick={askAI}
                        disabled={aiBusy}
                        className="inline-flex items-center gap-1.5 text-ink-muted hover:text-terracotta transition-colors disabled:opacity-50"
                        title="Ask Atlas AI to draft an answer in your voice"
                    >
                        <Sparkle size={16} weight="thin" />
                        <span className="tracking-eyebrow">{aiBusy ? "…" : "Suggest"}</span>
                    </button>
                </div>
            </div>

            <textarea
                data-testid={`entry-textarea-${entry.id}`}
                className="atlas-input mt-4 min-h-[80px] text-base leading-relaxed"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onBlur={save}
                placeholder="Begin here…"
                rows={3}
            />

            <div className="mt-2 flex items-center justify-between">
                <p className="tracking-eyebrow text-ink-muted">
                    {saving ? "Saving…" : `v${entry.version} · ${new Date(entry.updated_at).toLocaleDateString()}`}
                </p>
                {answer !== entry.answer && (
                    <button
                        data-testid={`save-btn-${entry.id}`}
                        onClick={save}
                        className="tracking-eyebrow text-forest hover:text-terracotta transition-colors"
                    >
                        Save
                    </button>
                )}
            </div>

            {historyOpen && (
                <div
                    data-testid={`history-list-${entry.id}`}
                    className="mt-4 bg-paper-soft/60 border border-line rounded-md p-5"
                >
                    <p className="tracking-eyebrow text-ink-muted mb-3">Earlier versions</p>
                    {history.length === 0 ? (
                        <p className="text-sm text-ink-muted italic">
                            No earlier versions yet.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {history.map((h) => (
                                <li
                                    key={h.id}
                                    className="text-sm text-ink-soft border-l-2 border-line pl-3"
                                >
                                    <p className="tracking-eyebrow text-ink-muted">
                                        v{h.version} · {new Date(h.changed_at).toLocaleString()}
                                    </p>
                                    <p className="mt-1 italic whitespace-pre-wrap">
                                        {h.answer || "(empty)"}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
