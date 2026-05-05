import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const TOKEN_KEY = "atlas_token";

export const tokenStore = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (t) => localStorage.setItem(TOKEN_KEY, t),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
    const t = tokenStore.get();
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err?.response?.status === 401) {
            tokenStore.clear();
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);
