import { useEffect, useState } from "react";
import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";

export default function HomePage({
  user,
  onLogout,
  navOpen,
  onToggleNav,
  onOpenLesson,
}) {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/lessons")
      .then(async (response) => {
        if (!response.ok) {
          setError("Could not load lessons.");
          return;
        }
        const payload = await response.json();
        setLessons(payload.lessons);
      })
      .catch(() => {
        setError("Could not reach the server. Is Laravel running?");
      });
  }, []);

  return (
    <div className="page page-guest">
      <GuestNav
        current="home"
        open={navOpen}
        onToggle={onToggleNav}
        onGoHome={() => {}}
        onLogout={onLogout}
      />
      <div className="page-main">
        <section className="card">
          <p className="eyebrow">Karibu</p>
          <h1>Hujambo, {user.name}</h1>
          <p className="lede">Pick a lesson to start.</p>
          {error ? <p className="banner">{error}</p> : null}
          <ul className="lesson-list">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="lesson-row">
                <div>
                  <strong>{lesson.title}</strong>
                  <p className="hint">
                    {lesson.description} · {lesson.word_count} words
                  </p>
                </div>
                <button type="button" onClick={() => onOpenLesson(lesson.id)}>
                  Start
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}