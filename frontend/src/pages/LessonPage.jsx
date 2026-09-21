import { useEffect, useState } from "react";
import GuestNav from "../components/GuestNav.jsx";
import { apiFetch } from "../api.js";

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
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

  async function handleSpeak(word) {
    setBusyId(word.id);
    setWordStatus(word.id, "Listening…");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      const blob = await new Promise((resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size) {
            chunks.push(event.data);
          }
        };
        recorder.onerror = () => reject(new Error("recorder"));
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType }));
        recorder.start();
        window.setTimeout(() => recorder.stop(), 3000);
      });

      stream.getTracks().forEach((track) => track.stop());
      setWordStatus(word.id, "Checking…");

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

      if (!heard) {
        setWordStatus(word.id, "I did not catch that. Try again.");
        return;
      }

      if (isClose(heard, word.swahili)) {
        setWordStatus(word.id, `Heard “${heard}” — close enough.`);
      } else {
        setWordStatus(word.id, `Heard “${heard}”. Expected ${word.swahili}.`);
      }
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      setWordStatus(
        word.id,
        "Microphone blocked or speech service down. Allow the mic, and keep uvicorn running."
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
                  <li key={word.id} className="word-row">
                    <div>
                      <strong>{word.swahili}</strong>
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
                        disabled={busyId === word.id}
                        onClick={() => handleSpeak(word)}
                      >
                        {busyId === word.id ? "…" : "Speak"}
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