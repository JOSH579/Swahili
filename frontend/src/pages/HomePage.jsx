import { useEffect, useState } from "react";
import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";

const HOME_COPY = {
  starter: {
    eyebrow: "Your path",
    lede: "Start with Greetings — words you can use on day one.",
    action: "Start",
  },
  survival: {
    eyebrow: "Survival Swahili",
    lede: "You already know some basics. Review Greetings, or wait for the next unit.",
    action: "Review",
  },
  beyond: {
    eyebrow: "You are ahead",
    lede: "Greetings is below your level. Review if you want; new lessons will meet you here.",
    action: "Review",
  },
};

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

  const copy = HOME_COPY[user.placement] ?? HOME_COPY.starter;

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
        <p className="eyebrow">{copy.eyebrow}</p>
          <h1>Hujambo, {user.name}</h1>
          <p className="lede">{copy.lede}</p>
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
                  {copy.action}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}