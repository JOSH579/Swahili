import { useEffect, useState } from "react";
import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";

const HOME_COPY = {
  starter: {
    eyebrow: "Your path",
    lede: "Start with Greetings — words you can use on day one.",
  },
  survival: {
    eyebrow: "Survival Swahili",
    lede: "You already know some basics. Introduction is next; Greetings sits under Review.",
  },
  beyond: {
    eyebrow: "You are ahead",
    lede: "Greetings is below your level. Review if you want; new lessons will meet you here.",
  },
};

function LessonList({ lessons, action, onOpenLesson }) {
  if (lessons.length === 0) {
    return null;
  }

  return (
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
            {action}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function HomePage({
  user,
  onLogout,
  navOpen,
  onToggleNav,
  onOpenLesson,
}) {
  const [upNext, setUpNext] = useState([]);
  const [review, setReview] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/lessons")
      .then(async (response) => {
        if (!response.ok) {
          setError("Could not load lessons.");
          return;
        }
        const payload = await response.json();
        setUpNext(payload.up_next);
        setReview(payload.review);
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

          <h2 className="preview-heading">Up next</h2>
          {upNext.length === 0 ? (
            <p className="hint">No new lesson at your stage yet. More units will land here.</p>
          ) : (
            <LessonList
              lessons={upNext}
              action="Start"
              onOpenLesson={onOpenLesson}
            />
          )}

          {review.length > 0 ? (
            <>
              <h2 className="preview-heading">Review</h2>
              <LessonList
                lessons={review}
                action="Review"
                onOpenLesson={onOpenLesson}
              />
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}