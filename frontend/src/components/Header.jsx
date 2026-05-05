import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Compass, MagnifyingGlass, Sparkle, SignOut } from "@phosphor-icons/react";

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const navLink = (to, label, testid) => {
        const active = location.pathname === to ||
            (to !== "/" && location.pathname.startsWith(to));
        return (
            <Link
                to={to}
                data-testid={testid}
                className={`tracking-eyebrow transition-colors ${active ? "text-forest" : "text-ink-muted hover:text-ink"
                    }`}
            >
                {label}
            </Link>
        );
    };

    return (
        <header
            data-testid="atlas-header"
            className="sticky top-0 z-40 backdrop-blur-xl bg-paper/80 border-b border-line"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-5">
                <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
                    <Compass size={22} weight="thin" className="text-forest" />
                    <span className="font-display text-2xl tracking-tight text-ink">
                        Atlas
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-10">
                    {navLink("/", "Library", "nav-library")}
                    {navLink("/insights", "Insights", "nav-insights")}
                    {navLink("/search", "Search", "nav-search")}
                </nav>

                <div className="flex items-center gap-4">
                    <button
                        data-testid="header-search-btn"
                        onClick={() => navigate("/search")}
                        className="md:hidden text-ink-muted hover:text-ink transition-colors"
                        aria-label="Search"
                    >
                        <MagnifyingGlass size={20} weight="thin" />
                    </button>
                    <button
                        data-testid="header-insights-btn"
                        onClick={() => navigate("/insights")}
                        className="md:hidden text-ink-muted hover:text-ink transition-colors"
                        aria-label="Insights"
                    >
                        <Sparkle size={20} weight="thin" />
                    </button>
                    <span className="hidden md:block text-sm text-ink-soft font-light italic">
                        Hello, {user.name?.split(" ")[0]}
                    </span>
                    <button
                        data-testid="logout-btn"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="text-ink-muted hover:text-terracotta transition-colors"
                        aria-label="Sign out"
                    >
                        <SignOut size={18} weight="thin" />
                    </button>
                </div>
            </div>
        </header>
    );
}
