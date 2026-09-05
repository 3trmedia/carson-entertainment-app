"use client";

import { useState } from "react";

interface SubTopic {
  title: string;
  body: string;
}
interface Category {
  key: string;
  label: string;
  subs: SubTopic[];
}

const CATEGORIES: Category[] = [
  {
    key: "future",
    label: "Mapping Out the Company's Future",
    subs: [
      {
        title: "Using AI Effectively",
        body: "Bring Claude real problems — planning, captions, ideas — and treat it like a working session, not a one-off question.",
      },
      {
        title: "Identifying Your Target Audience",
        body: "Know where they hang out, what keeps them at an event, and what makes them leave early.",
      },
      {
        title: "Trying New Things",
        body: "Split effort 70% proven, 25% safe new ideas, 5% one bold swing worth testing.",
      },
    ],
  },
  {
    key: "in-person",
    label: "In Person Marketing",
    subs: [
      {
        title: "Flyering Where Your Target Market Is",
        body: "Flyer where your audience already spends time — gyms, feed stores, boot shops — not just anywhere with traffic.",
      },
      {
        title: "Hosting or Teaching at Free Events",
        body: "Offer to teach a class, host the bull, or hand out a sample so people experience it first.",
      },
      {
        title: "Asking for Referrals",
        body: "Ask happy customers directly and give them something easy to share or send.",
      },
    ],
  },
  {
    key: "social",
    label: "Social Media",
    subs: [
      {
        title: "Plan 1-2 Months in Advance",
        body: "Build the content calendar before the month starts — no last-minute posts.",
      },
      {
        title: "Sustainability Over Trends",
        body: "Keep a steady pace instead of chasing trends or burning out on volume.",
      },
      {
        title: "Promoting Larger Events",
        body: "Whisper the tease, speak the details, shout it hard the final week.",
      },
    ],
  },
  {
    key: "cross-platform",
    label: "Cross Platform Posting",
    subs: [
      {
        title: "Why Separate Accounts Win",
        body: "Keep each brand distinct so followers are there for your offer, not a sister company's.",
      },
      {
        title: "Post With Intention",
        body: "Fewer, stronger posts beat flooding the feed — volume trains people to tune out.",
      },
      {
        title: "Keep Content Sorted by Brand",
        body: "Dancing content is Swingin Dance Co; western content, including buck-offs and bulldogging, is WEC.",
      },
    ],
  },
  {
    key: "venue-barn",
    label: "Venue Usage | The Barn",
    subs: [
      {
        title: "Who to Contact",
        body: "Everything at the Barn runs through Taft before you plan around the space.",
      },
      {
        title: "Getting Something Approved",
        body: "Meetings, parties, and unplanned events need approval through Western Events and a spot on the calendar.",
      },
      {
        title: "Booking It Ahead",
        body: "Lock in the date early — don't assume the space is open just because it looks empty.",
      },
    ],
  },
  {
    key: "discounts",
    label: "Discounts",
    subs: [
      {
        title: "Don't Use Them",
        body: "Your price is your price — discounts train your audience to wait for the next one.",
      },
      {
        title: "No 2-for-1s or Percent-Off",
        body: "Skip these unless planned well in advance for a real reason, never just to boost numbers.",
      },
      {
        title: "Fix the Event, Not the Price",
        body: "A last-minute discount means weak planning — build a stronger event instead of lowering the cost.",
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
                        {isOpen && <p className="accordion-sub-body">{sub.body}</p>}
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
