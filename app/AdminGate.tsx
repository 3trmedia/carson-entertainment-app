"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGate({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("That admin passcode didn't work.");
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h3>Admin unlock</h3>
        <p className="modal-sub">Unlock editing for the company reference cards.</p>
        <input
          type="password"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Admin passcode"
        />
        {error && <p className="status-msg error">{error}</p>}
        <div className="form-actions">
          <button className="btn" type="submit" disabled={busy || !passcode}>
            {busy ? "Checking…" : "Unlock"}
          </button>
          <button className="btn secondary" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
