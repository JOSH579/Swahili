import { useEffect, useState } from "react";
import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";

export default function QuizPage({
  lessonId,
  onBack,
  onGoHome,
  navOpen,
  onToggleNav,
  onLogout,
}) {
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function loadQuiz() {
    setError("");
    setQuiz(null);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);

    apiFetch(`/api/lessons/${lessonId}/quiz`)
      .then(async (response) => {
        if (!response.ok) {
          setError("Could not load the quiz.");
          return;
        }
        const payload = await response.json();
        setQuiz(payload.quiz);
      })
      .catch(() => {
        setError("Could not reach the server. Is Laravel running?");
      });
  }

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  function handlePick(option) {
    if (picked) {
      return;
    }
    setPicked(option);
    if (option === quiz.questions[index].answer) {
      setScore((current) => current + 1);
    }
  }

  function handleNext() {
    if (index + 1 >= quiz.questions.length) {
      setDone(true);
      return;
    }
    setIndex((current) => current + 1);
    setPicked(null);
  }

  const question = quiz?.questions[index];

  return (
    <div className="page page-guest">
      <GuestNav
        current="home"
        open={navOpen}
        onToggle={onToggleNav}
        onGoHome={onGoHome}
        onLogout={onLogout}
      />
      <div className="page-main">
        <section className="card">
          {error ? <p className="banner">{error}</p> : null}
          {!quiz && !error ? <p className="lede">Loading quiz…</p> : null}

          {quiz && question && !done ? (
            <>
              <p className="eyebrow">
                {quiz.title} · {index + 1} / {quiz.questions.length}
              </p>
              <h1>What is the Swahili word for “{question.prompt}”?</h1>
              <div className="choice-list">
                {question.options.map((option) => {
                  let extra = "";
                  if (picked) {
                    if (option === question.answer) {
                      extra = " correct";
                    } else if (option === picked) {
                      extra = " wrong";
                    }
                  }
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`choice-btn${extra}`}
                      onClick={() => handlePick(option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {picked ? (
                <button type="button" onClick={handleNext}>
                  {index + 1 >= quiz.questions.length ? "See score" : "Next"}
                </button>
              ) : null}
            </>
          ) : null}

          {done && quiz ? (
            <>
              <p className="eyebrow">Quiz complete</p>
              <h1>
                {score} / {quiz.questions.length}
              </h1>
              <p className="lede">
                {score === quiz.questions.length
                  ? "Hongera — all correct."
                  : "Review the words and try again."}
              </p>
              <div className="actions">
                <button type="button" onClick={loadQuiz}>
                  Try again
                </button>
                <button type="button" className="secondary" onClick={onBack}>
                  Back to lesson
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}