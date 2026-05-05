import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CategoryPage from "./pages/CategoryPage";
import InsightsPage from "./pages/InsightsPage";
import SearchPage from "./pages/SearchPage";

function Protected({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper text-ink-muted">
                Loading…
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return (
        <>
            <Header />
            {children}
        </>
    );
}

function PublicOnly({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/" replace />;
    return children;
}

function ToasterThemed() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    background: isDark ? "#F1ECDF" : "#1C1917",
                    color: isDark ? "#16130F" : "#F9F6F0",
                    border: `1px solid ${isDark ? "#C9B98E" : "#2F3E35"}`,
                    fontFamily: "Manrope, sans-serif",
                },
            }}
        />
    );
}

export default function App() {
    return (
        <div className="App bg-paper min-h-screen">
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <ToasterThemed />
                        <Routes>
                            <Route
                                path="/login"
                                element={
                                    <PublicOnly>
                                        <LoginPage />
                                    </PublicOnly>
                                }
                            />
                            <Route
                                path="/"
                                element={
                                    <Protected>
                                        <DashboardPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/category/:slug"
                                element={
                                    <Protected>
                                        <CategoryPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/insights"
                                element={
                                    <Protected>
                                        <InsightsPage />
                                    </Protected>
                                }
                            />
                            <Route
                                path="/search"
                                element={
                                    <Protected>
                                        <SearchPage />
                                    </Protected>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </div>
    );
}
