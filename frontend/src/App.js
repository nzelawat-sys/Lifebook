import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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

export default function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: "#1C1917",
                                color: "#F9F6F0",
                                border: "1px solid #2F3E35",
                                fontFamily: "Manrope, sans-serif",
                            },
                        }}
                    />
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
            </BrowserRouter>
        </div>
    );
}
