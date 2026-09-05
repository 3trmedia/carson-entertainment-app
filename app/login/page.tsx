"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("That passcode didn't work. Try again.");
      return;
    }
    router.push(params.get("next") || "/");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <Image src="/images/hero.jpg" alt="" fill priority sizes="100vw" className="login-bg-img" />
      <div className="login-bg-overlay" />
      <form className="login-card" onSubmit={submit}>
        <p className="eyebrow">Carson Portfolio</p>
        <h1 className="login-title">Manager Dashboard</h1>
        <label htmlFor="passcode">Passcode</label>
        <input
          id="passcode"
          type="password"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
        />
        {error && <p className="status-msg error">{error}</p>}
        <button className="btn" type="submit" disabled={busy || !passcode}>
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
