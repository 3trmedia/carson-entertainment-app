"use client";

import { useMemo, useState } from "react";
import { DaltonPage, FilmingEvent, VENUE_COLORS, VENUE_NAMES, VenueKey } from "@/lib/types";
import { buildMonthGrid, toISODate } from "@/lib/calendarGrid";

const VENUE_KEYS: VenueKey[] = ["grove", "sparks", "barn"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function EditableList({
  title,
  items,
  onSave,
}: {
  title: string;
  items: string[];
  onSave: (items: string[]) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(items.join("\n"));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  function open() {
    setDraft(items.join("\n"));
    setStatus("");
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setStatus("Saving…");
    const ok = await onSave(draft.split("\n"));
    setSaving(false);
    if (!ok) {
      setStatus("Could not save. Try again.");
      return;
    }
    setEditing(false);
    setStatus("");
  }

  return (
    <section className="block">
      <div className="block-head">
        <h2 className="block-title">{title}</h2>
        <button className="text-btn" onClick={open}>
          Edit
        </button>
      </div>
      <div className="goals-card">
        {items.length ? (
          <ul>
            {items.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-note">Nothing added yet.</p>
        )}
      </div>
      {editing && (
        <div className="edit-form">
          <div className="field">
            <label>{title} (one per line)</label>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn" onClick={save} disabled={saving}>
              Save
            </button>
            <button className="btn secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
          {status && <div className="status-msg">{status}</div>}
        </div>
      )}
    </section>
  );
}

export default function DaltonTab({
  initialDaltonPage,
  initialFilming,
}: {
  initialDaltonPage: DaltonPage;
  initialFilming: FilmingEvent[];
}) {
  const [postingSchedule, setPostingSchedule] = useState(initialDaltonPage.posting_schedule);
  const [notes, setNotes] = useState(initialDaltonPage.notes);
  const [filming, setFilming] = useState(initialFilming);

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newVenue, setNewVenue] = useState<VenueKey>("grove");
  const [newNotes, setNewNotes] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const filmingByDate = useMemo(() => {
    const map: Record<string, FilmingEvent[]> = {};
    for (const f of filming) {
      (map[f.filming_date] ??= []).push(f);
    }
    return map;
  }, [filming]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  function changeMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  async function savePosting(items: string[]) {
    const res = await fetch("/api/dalton", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posting_schedule: items, notes }),
    });
    if (!res.ok) return false;
    setPostingSchedule(items.filter((s) => s.trim()));
    return true;
  }

  async function saveNotes(items: string[]) {
    const res = await fetch("/api/dalton", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posting_schedule: postingSchedule, notes: items }),
    });
    if (!res.ok) return false;
    setNotes(items.filter((s) => s.trim()));
    return true;
  }

  async function addFilming() {
    if (!selectedDate) return;
    setAddSaving(true);
    setAddStatus("Saving…");
    const res = await fetch("/api/dalton-filming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venue: newVenue, filming_date: selectedDate, notes: newNotes.trim() }),
    });
    setAddSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setAddStatus(body?.error || "Could not save. Try again.");
      return;
    }
    const { event } = await res.json();
    setFilming((prev) => [...prev, event]);
    setNewNotes("");
    setAddStatus("");
  }

  async function deleteFilming(id: string) {
    const prev = filming;
    setFilming(filming.filter((f) => f.id !== id));
    const res = await fetch(`/api/dalton-filming?id=${id}`, { method: "DELETE" });
    if (!res.ok) setFilming(prev);
  }

  const dayFilming = selectedDate ? filmingByDate[selectedDate] ?? [] : [];

  return (
    <div className="tab-pane">
      <h2 className="page-title">Dalton</h2>

      <EditableList title="Posting schedule" items={postingSchedule} onSave={savePosting} />
      <EditableList title="Notes from Sam / focus areas" items={notes} onSave={saveNotes} />

      <section className="block">
        <div className="block-head">
          <h2 className="block-title">Filming calendar</h2>
        </div>
        <div className="calendar-legend">
          {VENUE_KEYS.map((v) => (
            <span className="legend-item" key={v}>
              <span className="legend-dot" style={{ background: VENUE_COLORS[v] }} />
              {VENUE_NAMES[v]}
            </span>
          ))}
        </div>

        <div className="calendar-head">
          <button className="cal-nav" onClick={() => changeMonth(-1)} aria-label="Previous month">
            ‹
          </button>
          <span className="cal-month">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
          <button className="cal-nav" onClick={() => changeMonth(1)} aria-label="Next month">
            ›
          </button>
        </div>

        <div className="cal-weekdays">
          {WEEKDAYS.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>

        <div className="cal-grid">
          {grid.map((d, i) => {
            if (d === null) return <div className="cal-cell empty" key={i} />;
            const iso = toISODate(year, month, d);
            const dayHasFilming = filmingByDate[iso] ?? [];
            const isToday = iso === toISODate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
            return (
              <button
                key={i}
                className={`cal-cell ${isToday ? "today" : ""}`}
                onClick={() => {
                  setSelectedDate(iso);
                  setNewNotes("");
                  setAddStatus("");
                }}
              >
                <span className="cal-daynum">{d}</span>
                <span className="cal-dots">
                  {dayHasFilming.map((f) => (
                    <span key={f.id} className="cal-dot" style={{ background: VENUE_COLORS[f.venue] }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedDate && (
        <div className="modal-backdrop" onClick={() => setSelectedDate(null)}>
          <div className="modal-card day-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {dayFilming.length > 0 && (
              <div className="day-events">
                {dayFilming.map((f) => (
                  <div className="day-event" key={f.id}>
                    <span className="legend-dot" style={{ background: VENUE_COLORS[f.venue] }} />
                    <div className="day-event-body">
                      <p className="day-event-title">{VENUE_NAMES[f.venue]}</p>
                      {f.notes && <p className="day-event-notes">{f.notes}</p>}
                    </div>
                    <button className="del" onClick={() => deleteFilming(f.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="field">
              <label>Venue</label>
              <select value={newVenue} onChange={(e) => setNewVenue(e.target.value as VenueKey)}>
                {VENUE_KEYS.map((v) => (
                  <option key={v} value={v}>
                    {VENUE_NAMES[v]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Notes (optional)</label>
              <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
            </div>
            <div className="form-actions">
              <button className="btn" onClick={addFilming} disabled={addSaving}>
                Add
              </button>
              <button className="btn secondary" onClick={() => setSelectedDate(null)}>
                Close
              </button>
            </div>
            {addStatus && <div className="status-msg error">{addStatus}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
