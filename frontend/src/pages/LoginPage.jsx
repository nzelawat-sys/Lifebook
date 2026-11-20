import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Compass, ArrowRight, Sparkle } from "@phosphor-icons/react";

const HERO_IMAGE = "https://images.pexels.com/photos/34725104/pexels-photo-34725104.jpeg";

export default function LoginPage() {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            if (mode === "login") await login(email, password);
            else await register(name, email, password);
            toast.success("Welcome to your Atlas.");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Something went wrong");
        } finally { setBusy(false); }
    };

    return (
        <div data-testid="login-page" className="min-h-screen grid lg:grid-cols-[1fr_1fr] bg-[#080D19] text-white">
            <section className="relative flex flex-col justify-between px-7 sm:px-12 lg:px-16 xl:px-24 py-8 sm:py-10 min-h-screen overflow-hidden">
                <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />
                <LinkBrand />
                <div className="relative z-10 max-w-md w-full mx-auto py-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-2 text-blue-200">
                        <Sparkle size={14} /><span className="tracking-eyebrow">Your personal lifebook</span>
                    </div>
                    <h1 className="mt-7 font-display text-5xl sm:text-6xl tracking-tight leading-[1.04] text-white">The book of <em className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">your</em> life.</h1>
                    <p className="mt-6 text-slate-300 leading-relaxed">Twelve dimensions. One quiet space to think, write, and return to — for the next decade of your becoming.</p>

                    <div className="mt-10 flex gap-7 border-b border-white/15">
                        <button data-testid="tab-login" onClick={() => setMode("login")} className={`pb-3 tracking-eyebrow transition-colors ${mode==="login"?"text-white border-b-2 border-blue-400":"text-slate-400 hover:text-white"}`}>Sign in</button>
                        <button data-testid="tab-register" onClick={() => setMode("register")} className={`pb-3 tracking-eyebrow transition-colors ${mode==="register"?"text-white border-b-2 border-blue-400":"text-slate-400 hover:text-white"}`}>Create account</button>
                    </div>

                    <form onSubmit={submit} className="mt-8 space-y-5">
                        {mode==="register" && <div><label className="tracking-eyebrow text-slate-300">Name</label><input data-testid="input-name" type="text" className="atlas-input mt-2" value={name} onChange={e=>setName(e.target.value)} required placeholder="Your name" /></div>}
                        <div><label className="tracking-eyebrow text-slate-300">Email</label><input data-testid="input-email" type="email" className="atlas-input mt-2" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" /></div>
                        <div><label className="tracking-eyebrow text-slate-300">Password</label><input data-testid="input-password" type="password" className="atlas-input mt-2" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="••••••••" /></div>
                        <button data-testid="submit-auth" type="submit" disabled={busy} className="mt-3 inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-950/40 hover:bg-blue-500 hover:-translate-y-0.5 transition-all disabled:opacity-60">{busy?"Please wait…":mode==="login"?"Enter Atlas":"Begin your journey"} <ArrowRight size={18}/></button>
                    </form>
                    <p className="mt-9 text-xs text-slate-500 leading-relaxed">A private, single-user journal. Your reflections never leave your account.</p>
                </div>
                <p className="tracking-eyebrow text-slate-500">Twelve dimensions · Premise · Purpose · Vision · Strategy</p>
            </section>

            <section className="hidden lg:block relative min-h-screen overflow-hidden">
                <img src={HERO_IMAGE} alt="A quiet landscape at sunset" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#08101f]/30 via-[#0a1730]/35 to-[#080D19]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080D19] via-transparent to-[#080D19]/15" />
                <div className="relative z-10 h-full min-h-screen flex flex-col justify-between p-12 xl:p-16">
                    <div className="self-end rounded-full border border-white/20 bg-black/15 backdrop-blur-md px-4 py-2 text-xs tracking-eyebrow text-white/80">A space to become</div>
                    <blockquote className="max-w-lg">
                        <p className="font-display italic text-4xl xl:text-5xl leading-tight text-white">“What we think, we become.”</p>
                        <p className="mt-5 tracking-eyebrow text-white/70">— Buddha</p>
                    </blockquote>
                    <div className="flex items-center gap-2 text-white/60 text-xs tracking-eyebrow"><span className="w-7 h-px bg-blue-300/70"/> Reflect · Refine · Reimagine</div>
                </div>
            </section>
        </div>
    );
}

function LinkBrand() {
    return <div className="relative z-10 flex items-center gap-3"><span className="w-10 h-10 rounded-xl border border-blue-300/25 bg-blue-400/10 flex items-center justify-center text-blue-300"><Compass size={21}/></span><span className="font-display text-3xl tracking-tight">Atlas<span className="text-blue-400">.</span></span></div>;
}
