"use client";

import { useMemo, useState } from "react";
import { COMPANY_NAMES, CompanyKey, Idea } from "@/lib/types";

const COMPANY_KEYS: CompanyKey[] = ["sdc", "wec", "smb"];

const FILTER_OPTIONS: { key: "all" | CompanyKey | "general"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sdc", label: "Dance Co" },
  { key: "wec", label: "Events Center" },
  { key: "smb", label: "Mechanical Bulls" },
  { key: "general", label: "General" },
];

const TOOLKIT_ITEMS = [
  {
    title: "Claude prompt: event announcement post",
    body: "\"Write a 3-post announcement sequence (leak, details, push) for [event] at [company] happening [date].\"",
  },
  {
    title: "Claude prompt: recap content",
    body: "\"Turn this event recap into 5 short video hooks and 3 caption options for [company]'s page.\"",
  },
  {
    title: "How we throw an event, quick version",
    body: "Lock date + venue → whisper post 3 weeks out → full details 2 weeks out → push hard the final week → recap within 48 hours.",
  },
];

export default function IdeasTab({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [showToolkit, setShowToolkit] = useState(false);

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
    <div className="tab-pane">
      <section className="block">
        <div className="block-head">
          <h2 className="block-title">Toolkit</h2>
          <button className="text-btn" onClick={() => setShowToolkit((v) => !v)}>
            {showToolkit ? "Hide" : "Show"}
          </button>
        </div>
        {showToolkit && (
          <div className="toolkit-list">
            {TOOLKIT_ITEMS.map((t, i) => (
              <div className="toolkit-card" key={i}>
                <h4>{t.title}</h4>
                <p>{t.body}</p>
              </div>
            ))}
            <p className="empty-note">More tools (event playbooks, ad templates) coming as we build these out.</p>
          </div>
        )}
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
              <button key={key} className={`chip ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
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
  );
}
