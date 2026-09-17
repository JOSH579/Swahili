import GuestNav from "../components/GuestNav.jsx";

const PREVIEW_WORDS = [
  { swahili: "Hujambo", english: "Hello (to one person)" },
  { swahili: "Asante", english: "Thank you" },
  { swahili: "Karibu", english: "Welcome" },
];

const HIGHLIGHTS = [
  {
    title: "Words that travel",
    copy: "Start with greetings you can use the same day — not a grammar textbook.",
  },
  {
    title: "See both sides",
    copy: "Each card shows Kiswahili and English together so the meaning sticks.",
  },
  {
    title: "Your place is saved",
    copy: "Create an account and come back later. The app still knows who you are.",
  },
];

export default function LandingPage({ onGoToRegister,  onGoToLogin, onGoToLanding, navOpen, onToggleNav }) {
  return (
    <div className="page page-guest">
      <GuestNav
        current="landing"
        open={navOpen}
        onToggle={onToggleNav}
        onGoHome={onGoToLanding}
        onGoToLogin={onGoToLogin}
        onGoToRegister={onGoToRegister}
      />

      <main className="landing">
        <section className="hero">
          <p className="eyebrow">Swahili for foreigners</p>
          <h1>Karibu. Learn Kiswahili one honest word at a time.</h1>
          <p className="lede">
            A small, focused lesson for people who need useful Swahili — hello,
            thank you, yes, no — before they land, travel, or talk to neighbours.
          </p>
          <div className="actions">
            <button type="button" onClick={onGoToRegister}>
              Create a free account
            </button>
            <button type="button" className="secondary" onClick={onGoToLogin}>
              I already have an account
            </button>
          </div>
        </section>

        <section className="preview-panel" aria-labelledby="preview-heading">
          <h2 id="preview-heading" className="preview-heading">
            Peek at the Greetings lesson
          </h2>
          <p className="hint">Three of nine Greetings words. Sign in for the full set.</p>
          <ul className="preview-grid">
            {PREVIEW_WORDS.map((word) => (
              <li key={word.swahili} className="preview-card">
                <p className="preview-swahili">{word.swahili}</p>
                <p className="preview-english">{word.english}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="highlights" aria-label="What you get">
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className="highlight">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
