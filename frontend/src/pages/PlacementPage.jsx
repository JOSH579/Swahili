import { useEffect, useState } from "react";
import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";

const SELF_LEVELS = [
  { id: "none", label: "I am just starting" },
  { id: "some", label: "I know a few words and greetings" },
  { id: "lots", label: "I can hold a simple conversation" },
];

const STAGE_COPY = {
  starter: {
    title: "Starter",
    lede: "Begin with Greetings. That is the right floor for now.",
  },
  survival: {
    title: "Survival",
    lede: "You know the basics. Greetings will sit under Review until the next unit is ready.",
  },
  beyond: {
    title: "Beyond greetings",
    lede: "You handled the harder checks. You can start here, or step down if you want more practice.",
  },
};

const LOWER_STAGES = {
  starter: [],
  survival: ["starter"],
  beyond: ["survival", "starter"],
};

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
  const [picked, setPicked] = useState("");
  const [checks, setChecks] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggested = user.placement;
  const showingResult = Boolean(suggested);

  useEffect(() => {
    if (showingResult) {
      return;
    }

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
  }, [showingResult]);

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

  function handleNext() {
    const question = questions[index];
    const nextChecks = { ...checks, [question.id]: picked };

    if (index + 1 >= questions.length) {
      savePlacement({
        self_level: selfLevel,
        checks: nextChecks,
      });
      return;
    }

    setChecks(nextChecks);
    setIndex((current) => current + 1);
    setPicked("");
  }

  const askingSelf = selfLevel === null && !showingResult;
  const question = questions[index];
  const canContinue =
    question?.type === "fill" ? picked.trim().length > 0 : picked.length > 0;
  const result = STAGE_COPY[suggested];

  return (
    <div className="page page-guest">
      <GuestNav
        current="landing"
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
                One honest answer, then six short checks. The last two are harder.
                You can skip and start from Greetings.
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

          {!askingSelf && question && !showingResult ? (
            <>
              <p className="eyebrow">
                Quick check · {index + 1} / {questions.length}
                {index >= 4 ? " · tougher" : ""}
              </p>
              <h1>What is the Swahili for “{question.prompt}”?</h1>

              {question.type === "choice" ? (
                <div className="choice-list">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`choice-btn${picked === option ? " correct" : ""}`}
                      onClick={() => setPicked(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <label>
                  Type your answer
                  <input
                    type="text"
                    autoComplete="off"
                    value={picked}
                    onChange={(event) => setPicked(event.target.value)}
                  />
                </label>
              )}

              {canContinue ? (
                <button type="button" onClick={handleNext} disabled={isSubmitting}>
                  {index + 1 >= questions.length
                    ? isSubmitting
                      ? "Checking…"
                      : "See my path"
                    : "Next"}
                </button>
              ) : null}
            </>
          ) : null}

          {showingResult && result ? (
            <>
              <p className="eyebrow">Your path</p>
              <h1>We suggest {result.title}.</h1>
              <p className="lede">{result.lede}</p>
              <div className="actions">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    savePlacement({
                      confirm: true,
                      placement: suggested,
                    })
                  }
                >
                  Start at {result.title}
                </button>
              </div>
              {LOWER_STAGES[suggested].length > 0 ? (
                <>
                  <p className="hint">Or start lower:</p>
                  <div className="choice-list">
                    {LOWER_STAGES[suggested].map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        className="choice-btn"
                        disabled={isSubmitting}
                        onClick={() =>
                          savePlacement({
                            confirm: true,
                            placement: stage,
                          })
                        }
                      >
                        Start at {STAGE_COPY[stage].title} instead
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : null}

          {!showingResult ? (
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
          ) : null}
        </section>
      </div>
    </div>
  );
}