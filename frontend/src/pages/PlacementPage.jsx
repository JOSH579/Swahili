import { useEffect, useState } from "react";
import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";

const SELF_LEVELS = [
  { id: "none", label: "I am just starting" },
  { id: "some", label: "I know a few words and greetings" },
  { id: "lots", label: "I can hold a simple conversation" },
];

export default function PlacementPage({
  user,
  onComplete,
  navOpen,
  onToggleNav,
  onLogout,
}) {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [selfLevel, setSelfLevel] = useState(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [checks, setChecks] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiFetch("/api/placement")
      .then(async (response) => {
        if (!response.ok) {
          setError("Could not load the questions.");
          return;
        }
        const payload = await response.json();
        setQuestions(payload.questions);
      })
      .catch(() => {
        setError("Could not reach the server. Is Laravel running?");
      });
  }, []);

  async function savePlacement(body) {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiFetch("/api/placement", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "Could not save your placement.");
        return;
      }

      onComplete(payload.user);
    } catch {
      setError("Could not reach the server. Is Laravel running?");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSkip() {
    savePlacement({ skip: true });
  }

  function handlePick(option) {
    if (picked) {
      return;
    }
    setPicked(option);
  }

  function handleNext() {
    const question = questions[index];
    const nextChecks = { ...checks, [question.id]: picked };

    if (index + 1 >= questions.length) {
      savePlacement({
        skip: false,
        self_level: selfLevel,
        checks: nextChecks,
      });
      return;
    }

    setChecks(nextChecks);
    setIndex((current) => current + 1);
    setPicked(null);
  }

  const askingSelf = selfLevel === null;
  const question = questions[index];

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
          {error ? <p className="banner">{error}</p> : null}

          {askingSelf ? (
            <>
              <p className="eyebrow">Before you start</p>
              <h1>Hujambo, {user.name}. How much Swahili do you already know?</h1>
              <p className="lede">
                One honest answer, then five short checks. You can skip and
                start from the beginning.
              </p>
              <div className="choice-list">
                {SELF_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    className="choice-btn"
                    onClick={() => setSelfLevel(level.id)}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {!askingSelf && question ? (
            <>
              <p className="eyebrow">
                Quick check · {index + 1} / {questions.length}
              </p>
              <h1>What is the Swahili for “{question.prompt}”?</h1>
              <div className="choice-list">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`choice-btn${picked === option ? " correct" : ""}`}
                    onClick={() => handlePick(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {picked ? (
                <button type="button" onClick={handleNext} disabled={isSubmitting}>
                  {index + 1 >= questions.length
                    ? isSubmitting
                      ? "Saving…"
                      : "See my path"
                    : "Next"}
                </button>
              ) : null}
            </>
          ) : null}

          <p className="switch">
            <button
              type="button"
              className="link"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip — start from Greetings
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}