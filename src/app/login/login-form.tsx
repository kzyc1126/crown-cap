"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "./actions";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);
  const from = useSearchParams().get("from") ?? "/admin";

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="from" value={from} />

      <div>
        <label className="field-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
          required
          className="input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>

      {state.error ? (
        <p className="text-[14px]" style={{ color: "var(--accent-strong)" }} role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn solid mt-1" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
