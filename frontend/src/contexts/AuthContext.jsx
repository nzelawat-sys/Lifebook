import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = tokenStore.get();
        if (!t) {
            setLoading(false);
            return;
        }
        api.get("/auth/me")
            .then((r) => setUser(r.data))
            .catch(() => tokenStore.clear())
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const r = await api.post("/auth/login", { email, password });
        tokenStore.set(r.data.token);
        setUser(r.data.user);
        return r.data.user;
    };

    const register = async (name, email, password) => {
        const r = await api.post("/auth/register", { name, email, password });
        tokenStore.set(r.data.token);
        setUser(r.data.user);
        return r.data.user;
    };

    const logout = () => {
        tokenStore.clear();
        setUser(null);
    };

    return (
        <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthCtx.Provider>
    );
}

export const useAuth = () => useContext(AuthCtx);
