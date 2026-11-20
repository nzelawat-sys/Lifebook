import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Compass, MagnifyingGlass, Sparkle, SignOut, Sun, MoonStars, House } from "@phosphor-icons/react";

export default function Header() {
 const { user, logout } = useAuth();
 const { theme, toggle } = useTheme();
 const navigate = useNavigate();
 const location = useLocation();
 if (!user) return null;
 const navLink = (to,label,testid) => {
  const active = location.pathname === to || (to !== "/app" && location.pathname.startsWith(to));
  return <Link to={to} data-testid={testid} className={`relative py-2 tracking-eyebrow transition-colors after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:origin-left after:transition-transform ${active?"text-ink after:scale-x-100 after:bg-forest":"text-ink-muted after:scale-x-0 after:bg-forest hover:text-ink hover:after:scale-x-100"}`}>{label}</Link>;
 };
 return <header data-testid="atlas-header" className="atlas-header sticky top-0 z-40 backdrop-blur-2xl border-b border-line"><div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4">
  <Link to="/app" data-testid="logo-link" className="flex items-center gap-3"><span className="flex items-center justify-center w-9 h-9 rounded-xl border border-blue-400/30 bg-blue-500/10 text-blue-300"><Compass size={20}/></span><span className="font-display text-[1.7rem] tracking-tight text-ink">Lifebook<span className="text-blue-400">.</span></span></Link>
  <nav className="hidden md:flex items-center gap-8">{navLink("/app","My space","nav-library")}{navLink("/insights","Insights","nav-insights")}{navLink("/search","Search","nav-search")}</nav>
  <div className="flex items-center gap-4"><button onClick={()=>navigate("/")} className="hidden sm:flex items-center gap-2 text-xs text-ink-muted hover:text-ink"><House size={17}/> Public site</button><button data-testid="theme-toggle-btn" onClick={toggle} className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-ink-muted hover:text-ink" aria-label="Toggle theme">{theme==="dark"?<Sun size={18}/>:<MoonStars size={18}/>}</button><button data-testid="header-search-btn" onClick={()=>navigate("/search")} className="md:hidden text-ink-muted" aria-label="Search"><MagnifyingGlass size={20}/></button><button data-testid="header-insights-btn" onClick={()=>navigate("/insights")} className="md:hidden text-ink-muted" aria-label="Insights"><Sparkle size={20}/></button><span className="hidden md:block text-sm text-ink-soft">Hi, {user.name?.split(" ")[0]}</span><button data-testid="logout-btn" onClick={()=>{logout();navigate("/");}} className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-ink-muted hover:text-red-300" aria-label="Sign out"><SignOut size={18}/></button></div>
 </div></header>;
}
