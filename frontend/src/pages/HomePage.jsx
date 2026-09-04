export default function HomePage({ user, onLogout }) {
    return (
      <main className="page">
        <section className="card">
          <p className="eyebrow">Karibu</p>
          <h1>Hujambo, {user.name}</h1>
          <p className="lede">
            You are signed in as <strong>{user.email}</strong> ({user.role}).
            Lessons come next.
          </p>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </section>
      </main>
    );
  }