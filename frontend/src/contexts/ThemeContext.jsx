import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext(null);
const KEY = "atlas_theme";

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem(KEY) || "dark";
        } catch {
            return "dark";
        }
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
    }, [theme]);

    const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
