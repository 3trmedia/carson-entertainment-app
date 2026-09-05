"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { COMPANY_NAMES, COMPANY_THUMB, CompanyInfo, CompanyKey, FocusState } from "@/lib/types";

const COMPANY_KEYS: CompanyKey[] = ["sdc", "wec", "smb"];

function formatDate(iso: string | null) {
  if (!iso) return "No date set";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

export default function FocusTab({
  initialFocus,
  companyInfo,
  setCompanyInfo,
  isAdmin,
  onRequestAdmin,
}: {
  initialFocus: FocusState;
  companyInfo: CompanyInfo[];
  setCompanyInfo: (fn: (prev: CompanyInfo[]) => CompanyInfo[]) => void;
  isAdmin: boolean;
  onRequestAdmin: () => void;
}) {
  const [focus, setFocus] = useState(initialFocus);
  const [editingFocus, setEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(initialFocus);
  const [focusStatus, setFocusStatus] = useState("");
  const [focusSaving, setFocusSaving] = useState(false);

  const [openCompany, setOpenCompany] = useState<CompanyKey | null>(null);
  const [editingDateFor, setEditingDateFor] = useState<CompanyKey | null>(null);
  const [dateDraft, setDateDraft] = useState("");

  const [editingDetailFor, setEditingDetailFor] = useState<CompanyKey | null>(null);
  const [detailDraft, setDetailDraft] = useState<CompanyInfo | null>(null);
  const [detailStatus, setDetailStatus] = useState("");
  const [detailSaving, setDetailSaving] = useState(false);

  const rotationOrder = useMemo(() => {
    return [...companyInfo].sort((a, b) => {
      if (!a.next_focus_date && !b.next_focus_date) return 0;
      if (!a.next_focus_date) return 1;
      if (!b.next_focus_date) return -1;
      return a.next_focus_date.localeCompare(b.next_focus_date);
    });
  }, [companyInfo]);

  function openFocusEditor() {
    setFocusDraft(focus);
    setFocusStatus("");
    setEditingFocus(true);
  }

  async function saveFocus() {
    const month = focusDraft.month.trim();
    if (!month || !focusDraft.company) {
      setFocusStatus("Choose a company and month.");
      return;
    }
    setFocusSaving(true);
    setFocusStatus("Saving…");
    const res = await fetch("/api/focus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: focusDraft.company, month, goals: focusDraft.goals }),
    });
    setFocusSaving(false);
    if (!res.ok) {
      setFocusStatus("Could not save. Try again.");
      return;
    }
    setFocus({ ...focusDraft, month });
    setEditingFocus(false);
    setFocusStatus("");
  }

  function startEditDate(c: CompanyInfo) {
    if (!isAdmin) {
      onRequestAdmin();
      return;
    }
    setEditingDateFor(c.key);
    setDateDraft(c.next_focus_date ?? "");
  }

  async function saveDate(c: CompanyInfo) {
    const res = await fetch("/api/company-info", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, next_focus_date: dateDraft || null }),
    });
    if (!res.ok) return;
    setCompanyInfo((prev) => prev.map((x) => (x.key === c.key ? { ...x, next_focus_date: dateDraft || null } : x)));
    setEditingDateFor(null);
  }

  function startEditDetail(c: CompanyInfo) {
    if (!isAdmin) {
      onRequestAdmin();
      return;
    }
    setDetailDraft(c);
    setDetailStatus("");
    setEditingDetailFor(c.key);
  }

  async function saveDetail() {
    if (!detailDraft) return;
    setDetailSaving(true);
    setDetailStatus("Saving…");
    const res = await fetch("/api/company-info", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detailDraft),
    });
    setDetailSaving(false);
    if (!res.ok) {
      setDetailStatus("Could not save. Try again.");
      return;
    }
    setCompanyInfo((prev) => prev.map((c) => (c.key === detailDraft.key ? detailDraft : c)));
    setEditingDetailFor(null);
  }

  return (
    <div className="tab-pane">
      <section className="focus-banner">
        <div className="focus-banner-bg">
          <Image src="/images/hero.jpg" alt="" fill sizes="560px" priority className="focus-banner-img" />
          <div className="focus-banner-overlay" />
        </div>
        <div className="focus-banner-content">
          {focus.company ? (
            <>
              <p className="focus-banner-month">{focus.month || "This month"}</p>
              <p className="focus-banner-company">{COMPANY_NAMES[focus.company]}</p>
            </>
          ) : (
            <p className="focus-banner-empty">No focus company set yet.</p>
          )}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <h2 className="block-title">This month&apos;s goals</h2>
          <button className="text-btn" onClick={openFocusEditor}>
            Edit
          </button>
        </div>
        <div className="goals-card">
          {focus.goals && focus.goals.length ? (
            <ul>
              {focus.goals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-note">No specific goals listed yet.</p>
          )}
        </div>

        {editingFocus && (
          <div className="edit-form">
            <div className="field">
              <label>Focus company</label>
              <select
                value={focusDraft.company || "sdc"}
                onChange={(e) => setFocusDraft({ ...focusDraft, company: e.target.value as CompanyKey })}
              >
                {COMPANY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {COMPANY_NAMES[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Month</label>
              <input
                type="text"
                placeholder="e.g. September 2026"
                value={focusDraft.month}
                onChange={(e) => setFocusDraft({ ...focusDraft, month: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Goals (one per line)</label>
              <textarea
                placeholder={"e.g.\nLock the date for the rodeo event\nPost one extra video per week"}
                value={focusDraft.goals.join("\n")}
                onChange={(e) => setFocusDraft({ ...focusDraft, goals: e.target.value.split("\n") })}
              />
            </div>
            <div className="form-actions">
              <button className="btn" onClick={saveFocus} disabled={focusSaving}>
                Save
              </button>
              <button className="btn secondary" onClick={() => setEditingFocus(false)}>
                Cancel
              </button>
            </div>
            {focusStatus && <div className="status-msg">{focusStatus}</div>}
          </div>
        )}
      </section>

      <section className="block">
        <div className="block-head">
          <h2 className="block-title">Focus rotation</h2>
        </div>
        <div className="rotation-list">
          {rotationOrder.map((c) => (
            <div className="rotation-card" key={c.key}>
              <div className="rotation-row">
                <button
                  className="rotation-name-btn"
                  onClick={() => setOpenCompany((prev) => (prev === c.key ? null : c.key))}
                >
                  <Image src={COMPANY_THUMB[c.key]} alt="" width={40} height={40} className="rotation-thumb" />
                  <span className="rotation-name">{c.label}</span>
                </button>
                {editingDateFor === c.key ? (
                  <div className="rotation-edit">
                    <input type="date" value={dateDraft} onChange={(e) => setDateDraft(e.target.value)} />
                    <button className="text-btn" onClick={() => saveDate(c)}>
                      Save
                    </button>
                  </div>
                ) : (
                  <button className="rotation-date" onClick={() => startEditDate(c)}>
                    {formatDate(c.next_focus_date)}
                  </button>
                )}
              </div>

              {openCompany === c.key && (
                <div className="company-body">
                  {editingDetailFor === c.key && detailDraft ? (
                    <div className="edit-form">
                      <div className="field">
                        <label>Sub-line</label>
                        <input
                          type="text"
                          value={detailDraft.sub}
                          onChange={(e) => setDetailDraft({ ...detailDraft, sub: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Passive month baseline (one per line)</label>
                        <textarea
                          value={detailDraft.baseline.join("\n")}
                          onChange={(e) => setDetailDraft({ ...detailDraft, baseline: e.target.value.split("\n") })}
                        />
                      </div>
                      <div className="field">
                        <label>Focus month adds (one per line)</label>
                        <textarea
                          value={detailDraft.focus.join("\n")}
                          onChange={(e) => setDetailDraft({ ...detailDraft, focus: e.target.value.split("\n") })}
                        />
                      </div>
                      <div className="form-actions">
                        <button className="btn" onClick={saveDetail} disabled={detailSaving}>
                          Save
                        </button>
                        <button className="btn secondary" onClick={() => setEditingDetailFor(null)}>
                          Cancel
                        </button>
                      </div>
                      {detailStatus && <div className="status-msg">{detailStatus}</div>}
                    </div>
                  ) : (
                    <>
                      <p className="rotation-sub">{c.sub}</p>
                      <h4>Passive month baseline</h4>
                      <ul>
                        {c.baseline.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                      <h4>Focus month adds</h4>
                      <ul>
                        {c.focus.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                      <button className="text-btn" onClick={() => startEditDetail(c)}>
                        {isAdmin ? "Edit" : "Edit (admin)"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
