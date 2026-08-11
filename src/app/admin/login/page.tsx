"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn, type ActionState } from "../actions";

const initial: ActionState = {};

function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initial);
  // Carried through so a deep link into the admin returns you where you aimed.
  // `proxy.ts` sets it, and `signIn` refuses anything that is not a local path.
  const next = useSearchParams().get("next") ?? "/admin";

  return (
    <form action={action} className="w-full max-w-[380px]">
      <input type="hidden" name="next" value={next} />

      <div className="mb-7 text-center">
        <img
          src="/assets/imgs/logo/logo-dark.png"
          alt="Beyondpips"
          className="mx-auto mb-6 h-8 w-auto"
        />
        <h1 className="mb-1.5 font-mona text-[22px] font-medium tracking-[-0.02em] text-primary">
          Admin sign-in
        </h1>
        <p className="font-mona text-[13.5px] text-text">
          Enter the admin password to manage market notes.
        </p>
      </div>

      <div className="rounded-[12px] border border-primary/10 bg-white p-6">
        <label
          htmlFor="password"
          className="mb-1.5 block font-mona text-[12.5px] font-medium text-text"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-md border border-primary/12 bg-bg px-3.5 py-2.5 font-mona text-[15px] text-primary outline-none transition-colors duration-200 focus:border-secondary"
        />

        {state.error && (
          // role=alert so the message is announced, not just shown — a failed
          // sign-in with no feedback for a screen reader is a dead end.
          <p
            role="alert"
            className="mt-3 rounded-md bg-red/[0.08] px-3 py-2 font-mona text-[13px] leading-[155%] text-red"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="gold-surface mt-5 w-full cursor-pointer rounded-md bg-secondary px-4 py-2.5 font-mona text-[14px] font-medium text-primary transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Checking…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

/**
 * Admin sign-in.
 *
 * Sits outside the `(dashboard)` route group, so it renders without the admin
 * header and its sign-out button.
 *
 * The form is wrapped in Suspense because `useSearchParams` suspends during
 * prerender; without a boundary the whole route would be forced dynamic.
 */
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
