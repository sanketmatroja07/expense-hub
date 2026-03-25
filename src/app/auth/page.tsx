"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, User2, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/";
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const heading = useMemo(
    () =>
      mode === "sign-in"
        ? "Welcome back to ExpenseHub"
        : "Create your ExpenseHub account",
    [mode]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = createClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        router.replace(redirectedFrom);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.replace(redirectedFrom);
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Check your email to confirm your account, then sign in to continue."
      );
      setPassword("");
      setMode("sign-in");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to continue right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_#f8fafc,_#eef6ff_45%,_#f8fafc)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        <section className="w-full max-w-xl pb-10 lg:pb-0">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-lg shadow-sky-100/70 backdrop-blur">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg shadow-primary-500/25">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">ExpenseHub</p>
              <p className="text-xs text-neutral-500">
                Shared expenses without the spreadsheet mess
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <p className="badge-primary">Live and account-backed</p>
            <h1 className="max-w-lg text-4xl font-bold leading-tight text-neutral-950 sm:text-5xl">
              Track, split, and settle with your own real account.
            </h1>
            <p className="max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
              Sign in to keep your groups, balances, and notifications tied to
              your account instead of a shared demo profile.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "Separate data for every user",
              "Persistent sync across refreshes",
              "Real sign in and sign out flow",
            ].map((item) => (
              <div key={item} className="card border-white/70 bg-white/80 p-4 backdrop-blur">
                <p className="text-sm font-medium text-neutral-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-md">
          <div className="card border-white/80 bg-white/95 p-6 shadow-2xl shadow-sky-100/80 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-600">
                  Account access
                </p>
                <h2 className="mt-2 text-2xl font-bold text-neutral-950">
                  {heading}
                </h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("sign-in");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                  mode === "sign-in"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("sign-up");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                  mode === "sign-up"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "sign-up" && (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
                    <User2 className="h-4 w-4 text-neutral-400" />
                    Full name
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="input"
                    placeholder="Sanket Matroja"
                    required={mode === "sign-up"}
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <LockKeyhole className="h-4 w-4 text-neutral-400" />
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input"
                  placeholder="At least 6 characters"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                />
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
                  {successMessage}
                </div>
              ) : null}

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting
                  ? "Working..."
                  : mode === "sign-in"
                  ? "Sign in to ExpenseHub"
                  : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 text-sm text-neutral-500">
              <p>
                By continuing, you agree to use ExpenseHub with your own account
                data and persistent storage.
              </p>
              <p className="mt-3">Need help? Reach support from the product after signing in.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
