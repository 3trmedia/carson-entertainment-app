"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { COMPANY_NAMES, CompanyInfo, CompanyKey, FocusState, Idea } from "@/lib/types";
import AdminGate from "./AdminGate";

const COMPANY_KEYS: CompanyKey[] = ["sdc", "wec", "smb"];

const FILTER_OPTIONS: { key: "all" | CompanyKey | "general"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sdc", label: "Dance Co" },
  { key: "wec", label: "Events Center" },
  { key: "smb", label: "Mechanical Bulls" },
  { key: "general", label: "General" },
];

export default function Board({
  initialFocus,
  initialCompanyInfo,
  initialIdeas,
  isAdmin,
}: {
  initialFocus: FocusState;
  initialCompanyInfo: CompanyInfo[];
  initialIdeas: Idea[];
  isAdmin: boolean;
}) {
  const router = useRouter();

  const [focus, setFocus] = useState(initialFocus);
  const [companyInfo, setCompanyInfo] = useState(initialCompanyInfo);
  const [ideas, setIdeas] = useState(initialIdeas);

  const [editingFocus, setEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(initialFocus);
  const [focusStatus, setFocusStatus] = useState("");
  const [focusSaving, setFocusSaving] = useState(false);

  const [openCompany, setOpenCompany] = useState<CompanyKey | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyKey | null>(null);
  const [companyDraft, setCompanyDraft] = useState<CompanyInfo | null>(null);
  const [companyStatus, setCompanyStatus] = useState("");
  const [companySaving, setCompanySaving] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);

  const [ideaName, setIdeaName] = useState("");
  const [ideaCompany, setIdeaCompany] = useState<CompanyKey | "general">("general");
  const [ideaText, setIdeaText] = useState("");
  const [ideaStatus, setIdeaStatus] = useState("");
  const [ideaSaving, setIdeaSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | CompanyKey | "general">("all");

  const filteredIdeas = useMemo(
    () => (filter === "all" ? ideas : ideas.filter((i) => i.company === filter)),
    [ideas, filter]
  );

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

  function toggleCompany(key: CompanyKey) {
    setOpenCompany((prev) => (prev === key ? null : key));
  }

  function startEditCompany(info: CompanyInfo) {
    if (!isAdmin) {
      setShowAdminGate(true);
      return;
    }
    setCompanyDraft(info);
    setCompanyStatus("");
    setEditingCompany(info.key);
  }

  async function saveCompany() {
    if (!companyDraft) return;
    setCompanySaving(true);
    setCompanyStatus("Saving…");
    const res = await fetch("/api/company-info", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyDraft),
    });
    setCompanySaving(false);
    if (!res.ok) {
      setCompanyStatus("Could not save. Try again.");
      return;
    }
    setCompanyInfo((prev) => prev.map((c) => (c.key === companyDraft.key ? companyDraft : c)));
    setEditingCompany(null);
    setCompanyStatus("");
  }

  async function postIdea() {
    const text = ideaText.trim();
    if (!text) {
      setIdeaStatus("Write the idea or goal before posting.");
      return;
    }
    setIdeaSaving(true);
    setIdeaStatus("Posting…");
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: ideaName.trim(), company: ideaCompany, text }),
    });
    setIdeaSaving(false);
    if (!res.ok) {
      setIdeaStatus("Could not post. Try again.");
      return;
    }
    const { idea } = await res.json();
    setIdeas((prev) => [idea, ...prev]);
    setIdeaText("");
    setIdeaStatus("Posted.");
    setTimeout(() => setIdeaStatus(""), 1800);
  }

  async function deleteIdea(id: string) {
    const prev = ideas;
    setIdeas(ideas.filter((i) => i.id !== id));
    const res = await fetch(`/api/ideas?id=${id}`, { method: "DELETE" });
    if (!res.ok) setIdeas(prev);
  }

  return (
    <>
      <header className="board-head">
        <div className="head-inner">
          <p className="eyebrow">Carson Portfolio · Marketing Rotation</p>
          <h1 className="title">Monthly Focus Board</h1>
          {focus.company ? (
            <div className="focus-line">
              <span className="month">{focus.month || "This month"}</span>
              <span className="company">{COMPANY_NAMES[focus.company]}</span>
              <span className="badge">Focus</span>
            </div>
          ) : (
            <div className="focus-line">
              <span className="month">No focus company set yet — click Edit below to choose one.</span>
            </div>
          )}
        </div>
      </header>

      <div className="wrap">
        <section className="block">
          <div className="block-head">
            <h2 className="block-title">What we&apos;re accomplishing this month</h2>
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
                  onChange={(e) =>
                    setFocusDraft({
                      ...focusDraft,
                      goals: e.target.value.split("\n"),
                    })
                  }
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
            <h2 className="block-title">The three companies</h2>
            {!isAdmin && (
              <button className="text-btn" onClick={() => setShowAdminGate(true)}>
                Admin
              </button>
            )}
          </div>
          <div className="company-list">
            {companyInfo.map((c) => (
              <div className="company-card" key={c.key}>
                <button className="company-toggle" onClick={() => toggleCompany(c.key)}>
                  <span>
                    {c.label}
                    <span className="sub">{c.sub}</span>
                  </span>
                  <span className="chev">{openCompany === c.key ? "−" : "+"}</span>
                </button>
                {openCompany === c.key && (
                  <div className="company-body open">
                    {editingCompany === c.key && companyDraft ? (
                      <div className="edit-form">
                        <div className="field">
                          <label>Sub-line</label>
                          <input
                            type="text"
                            value={companyDraft.sub}
                            onChange={(e) => setCompanyDraft({ ...companyDraft, sub: e.target.value })}
                          />
                        </div>
                        <div className="field">
                          <label>Passive month baseline (one per line)</label>
                          <textarea
                            value={companyDraft.baseline.join("\n")}
                            onChange={(e) =>
                              setCompanyDraft({ ...companyDraft, baseline: e.target.value.split("\n") })
                            }
                          />
                        </div>
                        <div className="field">
                          <label>Focus month adds (one per line)</label>
                          <textarea
                            value={companyDraft.focus.join("\n")}
                            onChange={(e) => setCompanyDraft({ ...companyDraft, focus: e.target.value.split("\n") })}
                          />
                        </div>
                        <div className="form-actions">
                          <button className="btn" onClick={saveCompany} disabled={companySaving}>
                            Save
                          </button>
                          <button className="btn secondary" onClick={() => setEditingCompany(null)}>
                            Cancel
                          </button>
                        </div>
                        {companyStatus && <div className="status-msg">{companyStatus}</div>}
                      </div>
                    ) : (
                      <>
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
                        <div className="form-actions" style={{ marginTop: 10 }}>
                          <button className="text-btn" onClick={() => startEditCompany(c)}>
                            {isAdmin ? "Edit" : "Edit (admin)"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="block-head">
            <h2 className="block-title">Idea board</h2>
          </div>

          <div className="idea-board">
            <div className="idea-form">
              <div className="row">
                <div className="field">
                  <label>Your name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tucker"
                    value={ideaName}
                    onChange={(e) => setIdeaName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Which company</label>
                  <select value={ideaCompany} onChange={(e) => setIdeaCompany(e.target.value as CompanyKey | "general")}>
                    {COMPANY_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {COMPANY_NAMES[k]}
                      </option>
                    ))}
                    <option value="general">General / all three</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Goal or idea</label>
                <textarea
                  placeholder="What do you want to try or accomplish?"
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button className="btn" onClick={postIdea} disabled={ideaSaving}>
                  Post to board
                </button>
              </div>
              {ideaStatus && <div className="status-msg">{ideaStatus}</div>}
            </div>

            <div className="filter-row">
              <span>Show:</span>
              {FILTER_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`chip ${filter === key ? "active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredIdeas.length ? (
              <div className="notes-grid">
                {filteredIdeas.map((idea) => (
                  <div className="note" key={idea.id}>
                    <span className="note-company">{COMPANY_NAMES[idea.company]}</span>
                    <p className="note-text">{idea.text}</p>
                    <div className="note-foot">
                      <span>{idea.name || "Anonymous"}</span>
                      <button className="del" onClick={() => deleteIdea(idea.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-ideas">Nothing posted yet. Be the first to add a goal or idea above.</p>
            )}
          </div>
        </section>
      </div>

      <footer className="note-foot-app">
        Everyone with this link sees the same board. Anyone can post, edit the focus, or remove a note.
      </footer>

      {showAdminGate && (
        <AdminGate
          onClose={() => {
            setShowAdminGate(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
