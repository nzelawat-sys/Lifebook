import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Compass } from "@phosphor-icons/react";

const HERO_IMAGE =
    "https://images.pexels.com/photos/34725104/pexels-photo-34725104.jpeg";

export default function LoginPage() {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState("login"); // login | register
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            if (mode === "login") {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            toast.success("Welcome to your Atlas.");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Something went wrong");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div data-testid="login-page" className="min-h-screen grid lg:grid-cols-2">
            {/* Left: form */}
            <div className="flex flex-col justify-between px-8 lg:px-16 py-10 bg-paper">
                <div className="flex items-center gap-2">
                    <Compass size={22} weight="thin" className="text-forest" />
                    <span className="font-display text-2xl tracking-tight">Atlas</span>
                </div>

                <div className="max-w-md w-full mx-auto py-12">
                    <p className="tracking-eyebrow text-ink-muted mb-6">
                        Your personal lifebook
                    </p>
                    <h1 className="font-display text-5xl lg:text-6xl tracking-tight leading-none text-ink">
                        The book of <em className="font-display-italic">your</em> life.
                    </h1>
                    <p className="mt-6 text-ink-soft leading-relaxed">
                        Twelve dimensions. One quiet space to think, write, and return to —
                        for the next decade of your becoming.
                    </p>

                    <div className="mt-12 flex gap-6 border-b border-line">
                        <button
                            data-testid="tab-login"
                            onClick={() => setMode("login")}
                            className={`pb-3 tracking-eyebrow transition-colors ${mode === "login"
                                    ? "atlas-tab-active"
                                    : "text-ink-muted hover:text-ink"
                                }`}
                        >
                            Sign in
                        </button>
                        <button
                            data-testid="tab-register"
                            onClick={() => setMode("register")}
                            className={`pb-3 tracking-eyebrow transition-colors ${mode === "register"
                                    ? "atlas-tab-active"
                                    : "text-ink-muted hover:text-ink"
                                }`}
                        >
                            Create account
                        </button>
                    </div>

                    <form onSubmit={submit} className="mt-8 space-y-6">
                        {mode === "register" && (
                            <div>
                                <label className="tracking-eyebrow text-ink-muted">Name</label>
                                <input
                                    data-testid="input-name"
                                    type="text"
                                    className="atlas-input mt-1"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Jon Butcher"
                                />
                            </div>
                        )}
                        <div>
                            <label className="tracking-eyebrow text-ink-muted">Email</label>
                            <input
                                data-testid="input-email"
                                type="email"
                                className="atlas-input mt-1"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="tracking-eyebrow text-ink-muted">Password</label>
                            <input
                                data-testid="input-password"
                                type="password"
                                className="atlas-input mt-1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            data-testid="submit-auth"
                            type="submit"
                            disabled={busy}
                            className="mt-4 inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-forest text-paper font-medium tracking-wide rounded-md hover:bg-forest-soft transition-all disabled:opacity-60"
                        >
                            {busy ? "..." : mode === "login" ? "Enter Atlas" : "Begin"}
                        </button>
                    </form>

                    <p className="mt-10 text-xs text-ink-muted leading-relaxed">
                        A private, single-user journal. Your reflections never leave your account.
                    </p>
                </div>

                <p className="text-xs tracking-eyebrow text-ink-muted">
                    Twelve categories · Premise · Purpose · Vision · Strategy
                </p>
            </div>

            {/* Right: image */}
            <div className="hidden lg:block relative overflow-hidden">
                <img
                    src={HERO_IMAGE}
                    alt="Sunset reflection"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-forest/40 via-transparent to-transparent" />
                <div className="relative z-10 h-full flex items-end p-16">
                    <blockquote className="max-w-md text-paper">
                        <p className="font-display italic text-3xl leading-snug">
                            "What we think, we become."
                        </p>
                        <p className="mt-3 text-sm tracking-eyebrow text-paper/80">
                            — Buddha
                        </p>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
