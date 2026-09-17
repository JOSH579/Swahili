import { useEffect, useState } from "react";
import { apiFetch, clearToken, getToken } from "./api.js";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LessonPage from "./pages/LessonPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import PlacementPage from "./pages/PlacementPage.jsx";


export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [isCheckingToken, setIsCheckingToken] = useState(Boolean(getToken()));
  const [navOpen, setNavOpen] = useState(false);
  const [lessonId, setLessonId] = useState(null);
  const [takingQuiz, setTakingQuiz] = useState(false);

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
    setLessonId(null);
    setTakingQuiz(false);
    setPage("landing");
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

  if (user && !user.onboarded_at) {
    return (
      <PlacementPage
        user={user}
        onComplete={setUser}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
        onLogout={handleLogout}
      />
    );
  }

  if (user && lessonId && takingQuiz) {
    return (
      <QuizPage
        lessonId={lessonId}
        onBack={() => setTakingQuiz(false)}
        onGoHome={() => {
          setTakingQuiz(false);
          setLessonId(null);
        }}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
        onLogout={handleLogout}
      />
    );
  }
  
  if (user && lessonId) {
    return (
      <LessonPage
        lessonId={lessonId}
        onBack={() => setLessonId(null)}
        onStartQuiz={() => setTakingQuiz(true)}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
        onLogout={handleLogout}
      />
    );
  }
  
  if (user) {
    return (
      <HomePage
        user={user}
        onLogout={handleLogout}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
        onOpenLesson={setLessonId}
      />
    );
  }

  if (page === "login") {
    return (
      <LoginPage
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
        onGoToLogin={() => setPage("login")}
        onGoToLanding={() => setPage("landing")}
        onGoToRegister={() => setPage("register")}
        onSuccess={setUser}
      />
    );
  }
  
  if (page === "register") {
    return (
      <RegisterPage
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
        onGoToLanding={() => setPage("landing")}
        onGoToLogin={() => setPage("login")}
        onSuccess={setUser}
      />
    );
  }
  
  return (
    <LandingPage
      navOpen={navOpen}
      onToggleNav={() => setNavOpen((open) => !open)}
      onGoToLanding={() => setPage("landing")}
      onGoToLogin={() => setPage("login")}
      onGoToRegister={() => setPage("register")}
      onSuccess={setUser}
    />
  );
}