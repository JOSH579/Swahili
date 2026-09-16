import { useEffect, useState } from "react";
import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";

export default function LessonPage({
  lessonId,
  onBack,
  onStartQuiz,
  navOpen,
  onToggleNav,
  onLogout,
}) {
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/api/lessons/${lessonId}`)
      .then(async (response) => {
        if (!response.ok) {
          setError("Could not load this lesson.");
          return;
        }
        const payload = await response.json();
        setLesson(payload.lesson);
      })
      .catch(() => {
        setError("Could not reach the server. Is Laravel running?");
      });
  }, [lessonId]);

  return (
    <div className="page page-guest">
      <GuestNav
        current="home"
        open={navOpen}
        onToggle={onToggleNav}
        onGoHome={onBack}
        onLogout={onLogout}
      />
      <div className="page-main">
        <section className="card">
          {error ? <p className="banner">{error}</p> : null}
          {!lesson && !error ? <p className="lede">Loading lesson…</p> : null}
          {lesson ? (
            <>
              <p className="eyebrow">Lesson</p>
              <h1>{lesson.title}</h1>
              <p className="lede">{lesson.description}</p>
              <ul className="word-list">
                {lesson.words.map((word) => (
                  <li key={word.id} className="word-row">
                    <strong>{word.swahili}</strong>
                    <span>{word.english}</span>
                  </li>
                ))}
              </ul>
              <div className="actions">
                <button type="button" onClick={onStartQuiz}>
                  Take quiz
                </button>
                <button type="button" className="secondary" onClick={onBack}>
                  Back to lessons
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}