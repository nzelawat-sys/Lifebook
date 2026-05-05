import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash, CheckCircle, Circle } from "@phosphor-icons/react";

export default function GoalsSection({ categorySlug, goals, setGoals }) {
    const [title, setTitle] = useState("");
    const [busy, setBusy] = useState(false);

    const add = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setBusy(true);
        try {
            const r = await api.post("/goals", {
                category_slug: categorySlug,
                title: title.trim(),
            });
            setGoals([r.data, ...goals]);
            setTitle("");
        } catch {
            toast.error("Could not add goal");
        } finally {
            setBusy(false);
        }
    };

    const toggle = async (g) => {
        const next = g.status === "achieved" ? "active" : "achieved";
        const r = await api.patch(`/goals/${g.id}`, { status: next });
        setGoals(goals.map((x) => (x.id === g.id ? r.data : x)));
    };

    const del = async (g) => {
        await api.delete(`/goals/${g.id}`);
        setGoals(goals.filter((x) => x.id !== g.id));
    };

    return (
        <div data-testid="goals-section" className="space-y-4">
            <form onSubmit={add} className="flex items-end gap-3">
                <input
                    data-testid="goal-input"
                    className="atlas-input flex-1"
                    placeholder="A goal for this category…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button
                    data-testid="goal-add-btn"
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-paper rounded-md tracking-wide text-sm hover:bg-forest-soft transition-colors disabled:opacity-50"
                >
                    <Plus size={14} weight="thin" /> Add
                </button>
            </form>

            <ul className="divide-y divide-line">
                {goals.length === 0 && (
                    <li className="py-6 text-ink-muted italic font-display-italic">
                        No goals recorded yet for this category.
                    </li>
                )}
                {goals.map((g) => (
                    <li
                        key={g.id}
                        data-testid={`goal-item-${g.id}`}
                        className="py-4 flex items-start justify-between gap-4"
                    >
                        <div className="flex items-start gap-3 flex-1">
                            <button
                                onClick={() => toggle(g)}
                                data-testid={`goal-toggle-${g.id}`}
                                className="mt-1 text-forest"
                            >
                                {g.status === "achieved" ? (
                                    <CheckCircle size={20} weight="fill" className="text-sage" />
                                ) : (
                                    <Circle size={20} weight="thin" />
                                )}
                            </button>
                            <div>
                                <p
                                    className={`text-base ${g.status === "achieved"
                                            ? "line-through text-ink-muted"
                                            : "text-ink"
                                        }`}
                                >
                                    {g.title}
                                </p>
                                <p className="mt-1 text-xs tracking-eyebrow text-ink-muted">
                                    {g.status} · added {new Date(g.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => del(g)}
                            data-testid={`goal-delete-${g.id}`}
                            className="text-ink-muted hover:text-terracotta transition-colors"
                        >
                            <Trash size={16} weight="thin" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
