"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Could not sign in.");
        return;
      }
      // refresh() so the server components re-render with the new cookie;
      // push() alone can serve a cached unauthenticated render.
      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border p-7"
        style={{ background: "var(--surface)" }}
      >
        <p className="text-xs tracking-[0.18em] uppercase" style={{ color: "var(--accent)" }}>
          Founder 10X
        </p>
        <h1 className="mt-2 mb-6 text-xl font-semibold">Leads</h1>

        <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          required
          className="w-full rounded-md border px-3 py-2 mb-4"
          style={{ background: "var(--surface-2)" }}
        />

        <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-md border px-3 py-2"
          style={{ background: "var(--surface-2)" }}
        />

        {error ? (
          <p className="mt-4 text-sm" style={{ color: "var(--hot)" }} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-md px-3 py-2 font-medium disabled:opacity-60"
          style={{ background: "var(--accent)", color: "#17130a" }}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
