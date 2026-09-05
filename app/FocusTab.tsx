"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { COMPANY_NAMES, COMPANY_THUMB, CompanyInfo, CompanyKey, FocusState } from "@/lib/types";
import { currentFocusCompany, currentFocusPeriodStart, nextStartDateFor } from "@/lib/rotation";

function formatMonthDay(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}
function formatMonthYear(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
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
  const [goals, setGoals] = useState(initialFocus.goals);
  const [editingFocus, setEditingFocus] = useState(false);
  const [goalsDraft, setGoalsDraft] = useState(initialFocus.goals);
  const [focusStatus, setFocusStatus] = useState("");
  const [focusSaving, setFocusSaving] = useState(false);

  const [openCompany, setOpenCompany] = useState<CompanyKey | null>(null);

  const [editingDetailFor, setEditingDetailFor] = useState<CompanyKey | null>(null);
  const [detailDraft, setDetailDraft] = useState<CompanyInfo | null>(null);
  const [detailStatus, setDetailStatus] = useState("");
  const [detailSaving, setDetailSaving] = useState(false);

  const activeCompany = useMemo(() => currentFocusCompany(), []);
  const periodStart = useMemo(() => currentFocusPeriodStart(), []);
  const activeLabel = useMemo(() => COMPANY_NAMES[activeCompany], [activeCompany]);
  const activeMonthLabel = useMemo(() => formatMonthYear(periodStart), [periodStart]);

  const rotationOrder = useMemo(() => {
    return [...companyInfo].sort(
      (a, b) => nextStartDateFor(a.key).getTime() - nextStartDateFor(b.key).getTime()
    );
  }, [companyInfo]);

  function openFocusEditor() {
    setGoalsDraft(goals);
    setFocusStatus("");
    setEditingFocus(true);
  }

  async function saveFocus() {
    setFocusSaving(true);
    setFocusStatus("Saving…");
    const res = await fetch("/api/focus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: activeCompany, month: activeMonthLabel, goals: goalsDraft }),
    });
    setFocusSaving(false);
    if (!res.ok) {
      setFocusStatus("Could not save. Try again.");
      return;
    }
    setGoals(goalsDraft);
    setEditingFocus(false);
    setFocusStatus("");
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
      <p className="section-label">Focus Company</p>
      <section className="focus-banner">
        <div className="focus-banner-bg">
          <Image src="/images/hero.jpg" alt="" fill sizes="560px" priority className="focus-banner-img" />
          <div className="focus-banner-overlay" />
        </div>
        <div className="focus-banner-content">
          <p className="focus-banner-month">{activeMonthLabel}</p>
          <p className="focus-banner-company">{activeLabel}</p>
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
          {goals && goals.length ? (
            <ul>
              {goals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-note">No specific goals listed yet.</p>
          )}
        </div>

        {editingFocus && (
          <div className="edit-form">
            <p className="empty-note" style={{ marginBottom: 10 }}>
              Goals for {activeLabel}&apos;s turn ({activeMonthLabel}) — the focus company rotates automatically.
            </p>
            <div className="field">
              <label>Goals (one per line)</label>
              <textarea
                placeholder={"e.g.\nLock the date for the rodeo event\nPost one extra video per week"}
                value={goalsDraft.join("\n")}
                onChange={(e) => setGoalsDraft(e.target.value.split("\n"))}
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
                <span className="rotation-date">
                  {c.key === activeCompany ? "Now" : formatMonthDay(nextStartDateFor(c.key))}
                </span>
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
