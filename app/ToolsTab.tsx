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
    key: "future",
    label: "Mapping Out the Company's Future",
    subs: [
      {
        title: "Using AI Effectively",
        body: [
          "Claude can plan your month, write captions, and brainstorm ideas in minutes.",
          "Bring it real problems: a slow week, a flop, a goal you're chasing.",
          "Treat it like a working session, not a one-time question.",
        ],
      },
      {
        title: "Identifying Your Target Audience",
        body: [
          "Know where they hang out, online and in person.",
          "Know what makes them stay at an event, and what makes them leave early.",
          "Watch what they actually respond to, not just what you assume.",
        ],
      },
      {
        title: "Trying New Things",
        body: [
          "70% of your effort goes to what's already proven to work.",
          "25% goes to safe, low-risk ideas worth testing.",
          "5% goes to one bold swing, something genuinely new.",
        ],
      },
    ],
  },
  {
    key: "in-person",
    label: "In Person Marketing",
    subs: [
      {
        title: "Flyering Where Your Target Market Is",
        body: [
          "Go where your audience already spends time, not just anywhere with foot traffic.",
          "Think gyms, feed stores, boot shops, wherever fits your crowd.",
          "A flyer in the wrong place is wasted paper.",
        ],
      },
      {
        title: "Hosting or Teaching at Free Events",
        body: [
          "Offer to teach a class, host the bull, or hand out a free sample.",
          "Let people experience it before they pay for it.",
          "This builds trust faster than any ad can.",
        ],
      },
      {
        title: "Asking for Referrals",
        body: [
          "Ask happy customers directly, don't wait for them to think of it.",
          "Make it easy: give them something to share or send.",
          "A referral carries more weight than any post you make.",
        ],
      },
    ],
  },
  {
    key: "social",
    label: "Social Media",
    subs: [
      {
        title: "Plan 1-2 Months in Advance",
        body: [
          "We don't post on last-minute notice.",
          "Build your content calendar before the month starts.",
          "Last-minute posts feel rushed and perform worse.",
        ],
      },
      {
        title: "Sustainability Over Trends",
        body: [
          "Don't chase every trend or post just to stay busy.",
          "A steady pace beats a burst that burns you out.",
          "Consistency matters more than volume.",
        ],
      },
      {
        title: "Promoting Larger Events",
        body: [
          "Use whisper, speak, shout: tease it, announce it, then push hard.",
          "Spread it out, don't dump everything in one post.",
          "Give people time to plan around it.",
        ],
      },
    ],
  },
  {
    key: "cross-platform",
    label: "Cross Platform Posting",
    subs: [
      {
        title: "Why Separate Accounts Win",
        body: [
          "Followers should be there for your offer, not a sister company's.",
          "A smaller, engaged audience beats a bigger one that scrolls past.",
          "Keep each brand's voice and content distinct.",
        ],
      },
      {
        title: "Post With Intention",
        body: [
          "Fewer, stronger posts beat flooding the feed.",
          "Posting too much trains people to tune you out.",
          "Every post should earn its spot.",
        ],
      },
      {
        title: "Keep Content Sorted by Brand",
        body: [
          "All dancing content belongs to Swingin Dance Co.",
          "All western content, including buck-offs and bulldogging, belongs to WEC.",
          "When in doubt, ask which brand it fits.",
        ],
      },
    ],
  },
  {
    key: "venue-barn",
    label: "Venue Usage | The Barn",
    subs: [
      {
        title: "Who to Contact",
        body: [
          "Everything at the Barn runs through Taft.",
          "Reach out to him before you plan around the space.",
          "He's the one who knows what's already booked.",
        ],
      },
      {
        title: "Getting Something Approved",
        body: [
          "Meetings, parties, and unplanned events need approval through Western Events.",
          "Nothing happens at the Barn until it's approved and on the calendar.",
          "Approval comes before promotion, not after.",
        ],
      },
      {
        title: "Booking It Ahead",
        body: [
          "The earlier you ask, the more likely you get the date.",
          "Don't assume the space is open just because it looks empty.",
          "Lock it in, then build your plans around it.",
        ],
      },
    ],
  },
  {
    key: "discounts",
    label: "Discounts",
    subs: [
      {
        title: "Don't Use Them",
        body: [
          "Discounts train your audience to wait for the next one.",
          "Your price is your price.",
          "If someone won't pay it, they're probably not your audience.",
        ],
      },
      {
        title: "No 2-for-1s or Percent-Off",
        body: [
          "Skip these unless it's planned well in advance for a real reason.",
          "Never plan one just to boost a headcount.",
          "A last-minute discount is a red flag, not a strategy.",
        ],
      },
      {
        title: "Fix the Event, Not the Price",
        body: [
          "A discount to save a struggling event means weak planning, not a weak price.",
          "Build a stronger event or offer instead of lowering the cost.",
          "Confidence in the event sells better than a markdown.",
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
