import { useState, type FormEvent } from "react";
import { api, type MockInfo } from "./api";

interface Props {
  mode: "signup" | "login";
  claimMock: MockInfo | null;
  onDone: (user: { email: string }, note?: string) => void;
  onSwitch: () => void;
  onCancel: () => void;
}

export function AuthForm({ mode, claimMock, onDone, onSwitch, onCancel }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      const { status, data } = await api.signup(email, password, claimMock?.id);
      if (status !== 200) return setError(data.error ?? "Sign-up failed.");
      onDone(
        data.user,
        data.claimed
          ? "Welcome! Your mock is now permanent."
          : claimMock
            ? "Welcome! That mock had already expired or been claimed, so it was not kept."
            : "Welcome!",
      );
    } else {
      const { status, data } = await api.login(email, password);
      if (status !== 200) return setError(data.error ?? "Log in failed.");
      onDone(data.user);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth" onSubmit={submit}>
        <h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        {mode === "signup" && claimMock && (
          <p className="notice">Signing up keeps <code>{claimMock.method} {claimMock.path}</code> permanently.</p>
        )}
        <label>
          Email
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button>{mode === "signup" ? "Create account" : "Log in"}</button>
        <div className="alt">
          <button type="button" className="link" onClick={onSwitch}>
            {mode === "signup" ? "Have an account? Log in" : "New here? Sign up"}
          </button>
          <button type="button" className="link" onClick={onCancel}>Back to chat</button>
        </div>
      </form>
    </div>
  );
}
