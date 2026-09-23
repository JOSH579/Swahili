import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";
import { useEffect, useRef, useState } from "react";

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function isBlankHeard(text) {
  return normalize(text).replace(/[.\u2026…,!?'"-]+/g, "").trim() === "";
}

function isClose(heard, expected) {
  const a = normalize(heard);
  const b = normalize(expected);
  return a === b || a.includes(b) || b.includes(a);
}

function clipFile(swahili) {
  return swahili.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function clipPath(slug, swahili) {
  return `/audio/${slug}/${clipFile(swahili)}.mp3`;
}

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
  const [status, setStatus] = useState({});
  const [busyId, setBusyId] = useState(null);
  const sessionRef = useRef(null);

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

  function setWordStatus(id, text) {
    setStatus((current) => ({ ...current, [id]: text }));
  }

  function handleHear(word) {
    const sound = new Audio(clipPath(lesson.slug, word.swahili));
    sound.play().catch(() => {
      setWordStatus(word.id, "Could not play audio. Generate the mp3 files first.");
    });
  }

  async function startSpeak(word) {
      if (sessionRef.current) {
        return;
      }
    
      setBusyId(word.id);
      setWordStatus(word.id, "Hold and speak…");
    
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];
    
        recorder.ondataavailable = (event) => {
          if (event.data.size) {
            chunks.push(event.data);
          }
        };
    
        const startedAt = Date.now();
        const maxTimer = window.setTimeout(() => stopSpeak(), 8000);
    
        recorder.start();
        sessionRef.current = { word, stream, recorder, chunks, startedAt, maxTimer };
      } catch {
        setBusyId(null);
        setWordStatus(
          word.id,
          "Microphone blocked. Allow the mic, and keep uvicorn running."
        );
      }
    }
    
    function stopSpeak() {
      const session = sessionRef.current;
      if (!session) {
        return;
      }
      sessionRef.current = null;
      window.clearTimeout(session.maxTimer);
    
      if (session.recorder.state === "recording") {
        session.recorder.onstop = () => {
          session.stream.getTracks().forEach((track) => track.stop());
          const blob = new Blob(session.chunks, { type: session.recorder.mimeType });
          finishSpeak(session.word, blob, Date.now() - session.startedAt);
        };
        session.recorder.stop();
        return;
      }
    
      session.stream.getTracks().forEach((track) => track.stop());
      setBusyId(null);
    }
    
    async function finishSpeak(word, blob, durationMs) {
      if (durationMs < 400) {
        setWordStatus(word.id, "Hold Speak while you talk, then release.");
        setBusyId(null);
        return;
      }
    
      setWordStatus(word.id, "Checking…");
    
      try {
        const body = new FormData();
        body.append("file", blob, "clip.webm");
    
        const response = await fetch("/speech/transcribe", {
          method: "POST",
          body,
        });
    
        if (!response.ok) {
          setWordStatus(word.id, "Speech service is not running. Start uvicorn.");
          return;
        }
    
        const payload = await response.json();
        const heard = payload.text || "";
    
        if (!heard || isBlankHeard(heard)) {
          setWordStatus(word.id, "I did not catch that. Try again.");
          return;
        }
    
        const passed = isClose(heard, word.swahili);
    
        if (passed) {
          setWordStatus(word.id, `Heard “${heard}” — close enough.`);
        } else {
          setWordStatus(word.id, `Heard “${heard}”. Expected ${word.swahili}.`);
        }
    
        const save = await apiFetch(`/api/vocab-items/${word.id}/spoken`, {
          method: "POST",
          body: JSON.stringify({ heard }),
        });
    
        if (save.ok) {
          const saved = await save.json();
          setLesson((current) => ({
            ...current,
            words: current.words.map((item) =>
              item.id === word.id
                ? { ...item, spoken: saved.spoken.passed }
                : item
            ),
          }));
        }
      } catch {
        setWordStatus(
          word.id,
          "Could not check that clip. Is the speech service running?"
        );
      } finally {
        setBusyId(null);
      }
    }

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
                  <li key={word.id} 
                  className={word.spoken ? "word-row said" : "word-row"}>
                    <div>
                      <strong>
                        {word.swahili}
                        {word.spoken ? " . Said" : ""}
                      </strong>
                      <p className="hint">{word.english}</p>
                      {status[word.id] ? (
                        <p className="hint">{status[word.id]}</p>
                      ) : null}
                    </div>
                    <div className="word-actions">
                      <button type="button" className="secondary" onClick={() => handleHear(word)}>
                        Hear
                      </button>
                      <button
                        type="button"
                        className="speak-btn"
                        disabled={busyId !== null && busyId !== word.id}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          startSpeak(word);
                        }}
                        onPointerUp={stopSpeak}
                        onPointerCancel={stopSpeak}
                      >
                        {busyId === word.id ? "Listening…" : "Hold to speak"}
                      </button>
                    </div>
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