import { useState } from "react";
import { setToken } from "../api.js";

const EMPTY_FORM = {
  email: "",
  password: "",
};

export default function LoginPage({ onGoToRegister, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await fetch("/api/login", {
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
        setFormError(payload.message ?? "Login failed. Try again.");
        return;
      }

      setToken(payload.token);
      onSuccess(payload.user);
    } catch {
      setFormError("Could not reach the server. Is Laravel running?");
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Swahili for foreigners</p>
        <h1>Log in</h1>
        <p className="lede">Use the email and password you registered with.</p>

        <form onSubmit={handleSubmit} noValidate>
          {formError ? <p className="banner">{formError}</p> : null}

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
              autoComplete="current-password"
              value={form.password}
              onChange={updateField}
            />
            {errors.password ? (
              <span className="field-error">{errors.password[0]}</span>
            ) : null}
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="switch">
          New here?{" "}
          <button type="button" className="link" onClick={onGoToRegister}>
            Create an account
          </button>
        </p>
      </section>
    </main>
  );
}
