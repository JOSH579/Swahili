import { useState } from "react";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setFormError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (response.status === 422) {
        setErrors(payload.errors ?? {});
        setFormError(payload.message ?? "Please fix the highlighted fields.");
        return;
      }

      if (!response.ok) {
        setFormError(payload.message ?? "Registration failed. Try again.");
        return;
      }
      localStorage.setItem('token', payload.token);
      setCreatedUser(payload.user);
      setForm(EMPTY_FORM);
    } catch {
      setFormError("Could not reach the server. Is Laravel running?");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdUser) {
    return (
      <main className="page">
        <section className="card">
          <p className="eyebrow">Karibu</p>
          <h1>Account created</h1>
          <p className="lede">
            You registered as <strong>{createdUser.name}</strong> ({createdUser.email}).
            Your role is <strong>{createdUser.role}</strong>. Login comes next.
          </p>
          <button type="button" onClick={() => setCreatedUser(null)}>
            Register another account
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Swahili for foreigners</p>
        <h1>Create your account</h1>
        <p className="lede">
          New learners start as students. You will use this account to open lessons
          later.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {formError ? <p className="banner">{formError}</p> : null}

          <label>
            Full name
            <input
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={updateField}
            />
            {errors.name ? <span className="field-error">{errors.name[0]}</span> : null}
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
            />
            {errors.email ? <span className="field-error">{errors.email[0]}</span> : null}
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={updateField}
            />
            {errors.password ? (
              <span className="field-error">{errors.password[0]}</span>
            ) : (
              <span className="hint">At least 8 characters.</span>
            )}
          </label>

          <label>
            Confirm password
            <input
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              value={form.password_confirmation}
              onChange={updateField}
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
