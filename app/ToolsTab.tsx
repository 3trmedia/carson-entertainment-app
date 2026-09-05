"use client";

import { useState } from "react";

interface SubTopic {
  title: string;
  body: string[];
}
interface Category {
  key: string;
  label: string;
  subs: SubTopic[];
}

const CATEGORIES: Category[] = [
  {
    key: "planning",
    label: "Planning",
    subs: [
      {
        title: "Venue & date lockdown",
        body: [
          "Confirm venue availability at least 6 weeks out.",
          "Get the date locked on the Events tab as soon as it's real, not once it's official.",
          "Block out setup and teardown time, not just the event window.",
        ],
      },
      {
        title: "Staffing & roles",
        body: [
          "Assign a day-of lead before promotion starts.",
          "Assign a door/ticket person and a dedicated content shooter separately — don't double them up.",
        ],
      },
      {
        title: "Budget & ticketing",
        body: [
          "Set a target headcount and price point before any promotion goes out.",
          "Track spend against the ad goal noted on the Focus tab.",
        ],
      },
    ],
  },
  {
    key: "content",
    label: "Content",
    subs: [
      {
        title: "Shot list",
        body: [
          "Wide room shot, empty.",
          "Wide room shot, full.",
          "3 close-up candid shots (dancing, riding, crowd).",
          "1 signage or branding shot.",
          "1 vertical clip cut for stories.",
        ],
      },
      {
        title: "Caption & hook prompts",
        body: [
          "“Write 3 hook options, under 8 words each, for a video announcing [event] at [company].”",
          "“Turn this event recap into 5 short-form video hooks and 3 caption options.”",
        ],
      },
      {
        title: "Recap content",
        body: [
          "Post the best clip within 24–48 hours while it's still relevant.",
          "Save 2–3 strong clips for a later “best of” roundup instead of using everything at once.",
        ],
      },
    ],
  },
  {
    key: "promotions",
    label: "Promotions / Marketing",
    subs: [
      {
        title: "Whisper / speak / shout timeline",
        body: [
          "Whisper (leak it): ~3 weeks out.",
          "Speak (full details): ~2 weeks out.",
          "Shout (push hard): final week.",
        ],
      },
      {
        title: "Ad templates",
        body: [
          "“Write a Meta ad headline and primary text for [event], emphasizing [family-friendly / date-night / group outing].”",
        ],
      },
      {
        title: "Cross-promotion",
        body: [
          "SDC, WEC, and SMB can boost each other's flagship events on their own pages.",
          "Only when it's genuinely on-brand for that audience — not every event, every time.",
        ],
      },
    ],
  },
  {
    key: "day-of",
    label: "Day-of Ops",
    subs: [
      {
        title: "Day-of checklist",
        body: [
          "Confirm equipment/sound arrival time.",
          "Confirm staff arrival time.",
          "Confirm signage is up before doors open.",
          "Confirm who's shooting content and when.",
        ],
      },
      {
        title: "Vendor & equipment",
        body: [
          "Confirm any rented equipment (sound, mechanical bull, extra seating) a full week out, not the day before.",
        ],
      },
    ],
  },
];

export default function ToolsTab() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);

  return (
    <div className="tab-pane">
      <section className="block">
        <h2 className="page-title">Tools &amp; Resources</h2>
        <p className="empty-note tools-intro">
          Reference material to keep moving on your own company, even outside your focus month.
        </p>

        <div className="accordion">
          {CATEGORIES.map((cat) => (
            <div className="accordion-item" key={cat.key}>
              <button
                className="accordion-head"
                onClick={() => setOpenCategory((prev) => (prev === cat.key ? null : cat.key))}
              >
                <span>{cat.label}</span>
                <span className="accordion-chev">{openCategory === cat.key ? "−" : "+"}</span>
              </button>

              {openCategory === cat.key && (
                <div className="accordion-body">
                  {cat.subs.map((sub) => {
                    const subKey = `${cat.key}::${sub.title}`;
                    const isOpen = openSub === subKey;
                    return (
                      <div className="accordion-sub" key={subKey}>
                        <button className="accordion-sub-head" onClick={() => setOpenSub(isOpen ? null : subKey)}>
                          <span>{sub.title}</span>
                          <span className="accordion-chev">{isOpen ? "−" : "+"}</span>
                        </button>
                        {isOpen && (
                          <ul className="accordion-sub-body">
                            {sub.body.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
