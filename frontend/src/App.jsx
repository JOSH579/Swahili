import { useEffect, useState } from "react";
import { apiFetch, clearToken, getToken } from "./api.js";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  const [page, setPage] = useState("register");
  const [user, setUser] = useState(null);
  const [isCheckingToken, setIsCheckingToken] = useState(Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsCheckingToken(false);
      return;
    }

    apiFetch("/api/me")
      .then(async (response) => {
        if (!response.ok) {
          clearToken();
          return;
        }
        const payload = await response.json();
        setUser(payload.user);
      })
      .finally(() => {
        setIsCheckingToken(false);
      });
  }, []);

  async function handleLogout() {
    await apiFetch("/api/logout", { method: "POST" });
    clearToken();
    setUser(null);
    setPage("login");
  }

  if (isCheckingToken) {
    return (
      <main className="page">
        <section className="card">
          <p className="lede">Checking your session…</p>
        </section>
      </main>
    );
  }

  if (user) {
    return <HomePage user={user} onLogout={handleLogout} />;
  }

  if (page === "login") {
    return (
      <LoginPage
        onGoToRegister={() => setPage("register")}
        onSuccess={setUser}
      />
    );
  }

  return (
    <RegisterPage
      onGoToLogin={() => setPage("login")}
      onSuccess={setUser}
    />
  );
}