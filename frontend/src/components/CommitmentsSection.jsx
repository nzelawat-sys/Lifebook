import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash, CheckCircle, Circle, XCircle } from "@phosphor-icons/react";

export default function CommitmentsSection({ categorySlug, items, setItems }) {
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);

    const add = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setBusy(true);
        try {
            const r = await api.post("/commitments", {
                category_slug: categorySlug,
                text: text.trim(),
            });
            setItems([r.data, ...items]);
            setText("");
        } catch {
            toast.error("Could not add commitment");
        } finally {
            setBusy(false);
        }
    };

    const cycle = async (c) => {
        const order = ["open", "kept", "broken"];
        const next = order[(order.indexOf(c.status) + 1) % order.length];
        const r = await api.patch(`/commitments/${c.id}`, { status: next });
        setItems(items.map((x) => (x.id === c.id ? r.data : x)));
    };

    const del = async (c) => {
        await api.delete(`/commitments/${c.id}`);
        setItems(items.filter((x) => x.id !== c.id));
    };

    const icon = (status) => {
        if (status === "kept")
            return <CheckCircle size={20} weight="fill" className="text-sage" />;
        if (status === "broken")
            return <XCircle size={20} weight="fill" className="text-terracotta" />;
        return <Circle size={20} weight="thin" className="text-ink-muted" />;
    };

    return (
        <div data-testid="commitments-section" className="space-y-4">
            <form onSubmit={add} className="flex items-end gap-3">
                <input
                    data-testid="commitment-input"
                    className="atlas-input flex-1"
                    placeholder="A commitment I'm making…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button
                    type="submit"
                    data-testid="commitment-add-btn"
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-paper rounded-md tracking-wide text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    <Plus size={14} weight="thin" /> Pledge
                </button>
            </form>
            <ul className="divide-y divide-line">
                {items.length === 0 && (
                    <li className="py-6 text-ink-muted italic font-display-italic">
                        No commitments recorded yet.
                    </li>
                )}
                {items.map((c) => (
                    <li
                        key={c.id}
                        data-testid={`commitment-item-${c.id}`}
                        className="py-4 flex items-start justify-between gap-4"
                    >
                        <div className="flex items-start gap-3 flex-1">
                            <button
                                onClick={() => cycle(c)}
                                data-testid={`commitment-toggle-${c.id}`}
                                className="mt-1"
                            >
                                {icon(c.status)}
                            </button>
                            <div>
                                <p
                                    className={`text-base ${c.status === "kept" ? "text-ink" : "text-ink-soft"
                                        }`}
                                >
                                    {c.text}
                                </p>
                                <p className="mt-1 text-xs tracking-eyebrow text-ink-muted">
                                    {c.status} · pledged{" "}
                                    {new Date(c.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => del(c)}
                            data-testid={`commitment-delete-${c.id}`}
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
