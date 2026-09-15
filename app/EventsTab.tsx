"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CarsonEvent, COMPANY_COLORS, COMPANY_NAMES, COMPANY_THUMB, CompanyInfo, CompanyKey, MAX_EVENTS_PER_COMPANY_PER_MONTH } from "@/lib/types";
import { buildMonthGrid, pad, toISODate } from "@/lib/calendarGrid";
import { writeOrQueue } from "@/lib/offline/sync";

const COMPANY_KEYS: CompanyKey[] = ["sdc", "wec", "smb"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function EventsTab({
  initialEvents,
  companyInfo,
}: {
  initialEvents: CarsonEvent[];
  companyInfo: CompanyInfo[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [newCompany, setNewCompany] = useState<CompanyKey>("sdc");
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CarsonEvent[]> = {};
    for (const e of events) {
      (map[e.event_date] ??= []).push(e);
    }
    return map;
  }, [events]);

  const monthCountByCompany = useMemo(() => {
    const prefix = `${year}-${pad(month + 1)}`;
    const counts: Record<CompanyKey, number> = { sdc: 0, wec: 0, smb: 0 };
    for (const e of events) {
      if (e.event_date.startsWith(prefix)) counts[e.company]++;
    }
    return counts;
  }, [events, year, month]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  function changeMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  async function addEvent() {
    if (!selectedDate) return;
    const title = newTitle.trim();
    if (!title) {
      setAddStatus("Give the event a name.");
      return;
    }
    setAddSaving(true);
    const notes = newNotes.trim();
    const event: CarsonEvent = {
      id: crypto.randomUUID(),
      company: newCompany,
      title,
      event_date: selectedDate,
      notes: notes || null,
      created_at: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, event]);
    setNewTitle("");
    setNewNotes("");
    setAddStatus("");
    setAddSaving(false);
    await writeOrQueue({ method: "POST", url: "/api/events", body: { ...event } });
  }

  async function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await writeOrQueue({ method: "DELETE", url: `/api/events?id=${id}` });
  }

  const dayEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];
  const companyAtLimit = newCompany !== "smb" && monthCountByCompany[newCompany] >= MAX_EVENTS_PER_COMPANY_PER_MONTH;

  return (
    <div className="tab-pane">
      <section className="block">
        <h2 className="page-title">Upcoming Events</h2>
        <div className="calendar-legend">
          {companyInfo.map((c) => (
            <span className="legend-item" key={c.key}>
              <Image src={COMPANY_THUMB[c.key]} alt="" width={22} height={22} className="legend-thumb" />
              <span className="legend-dot" style={{ background: COMPANY_COLORS[c.key] }} />
              {c.label}
              <span className="legend-count">
                {c.key === "smb" ? monthCountByCompany[c.key] : `${monthCountByCompany[c.key]}/${MAX_EVENTS_PER_COMPANY_PER_MONTH}`}
              </span>
            </span>
          ))}
        </div>

        <div className="calendar-head">
          <button className="cal-nav" onClick={() => changeMonth(-1)} aria-label="Previous month">
            ‹
          </button>
          <span className="cal-month">
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
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
            const dayHasEvents = eventsByDate[iso] ?? [];
            const isToday = iso === toISODate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
            return (
              <button
                key={i}
                className={`cal-cell ${isToday ? "today" : ""}`}
                onClick={() => {
                  setSelectedDate(iso);
                  setNewTitle("");
                  setNewNotes("");
                  setAddStatus("");
                }}
              >
                <span className="cal-daynum">{d}</span>
                <span className="cal-dots">
                  {dayHasEvents.map((e) => (
                    <span key={e.id} className="cal-dot" style={{ background: COMPANY_COLORS[e.company] }} />
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

            {dayEvents.length > 0 && (
              <div className="day-events">
                {dayEvents.map((e) => (
                  <div className="day-event" key={e.id}>
                    <span className="legend-dot" style={{ background: COMPANY_COLORS[e.company] }} />
                    <div className="day-event-body">
                      <p className="day-event-title">{e.title}</p>
                      <p className="day-event-company">{COMPANY_NAMES[e.company]}</p>
                      {e.notes && <p className="day-event-notes">{e.notes}</p>}
                    </div>
                    <button className="del" onClick={() => deleteEvent(e.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="field">
              <label>Company</label>
              <select value={newCompany} onChange={(e) => setNewCompany(e.target.value as CompanyKey)}>
                {COMPANY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {COMPANY_NAMES[k]} (
                    {k === "smb" ? `${monthCountByCompany[k]} this month` : `${monthCountByCompany[k]}/${MAX_EVENTS_PER_COMPANY_PER_MONTH} this month`}
                    )
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Event name</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Fall Rodeo" />
            </div>
            <div className="field">
              <label>Notes (optional)</label>
              <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
            </div>
            <div className="form-actions">
              <button className="btn" onClick={addEvent} disabled={addSaving || companyAtLimit}>
                Add event
              </button>
              <button className="btn secondary" onClick={() => setSelectedDate(null)}>
                Close
              </button>
            </div>
            {companyAtLimit && !addStatus && (
              <div className="status-msg error">
                {COMPANY_NAMES[newCompany]} already has {MAX_EVENTS_PER_COMPANY_PER_MONTH} major events this month.
              </div>
            )}
            {addStatus && <div className="status-msg error">{addStatus}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
