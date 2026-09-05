"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CarsonEvent, CompanyInfo, FocusState } from "@/lib/types";
import AdminGate from "./AdminGate";
import FocusTab from "./FocusTab";
import ToolsTab from "./ToolsTab";
import EventsTab from "./EventsTab";

type Tab = "focus" | "tools" | "events";

function FocusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 4.7L4 16.3a1.5 1.5 0 0 0 2.1 2.1l5.3-5.3a4 4 0 0 0 4.7-5.4l-2.6 2.6-2-2z" />
    </svg>
  );
}

function EventsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3.5" />
      <path d="M16 3v3.5" />
      <circle cx="8" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="16" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TABS: { key: Tab; label: string; Icon: () => React.JSX.Element }[] = [
  { key: "focus", label: "Focus", Icon: FocusIcon },
  { key: "tools", label: "Tools", Icon: ToolsIcon },
  { key: "events", label: "Events", Icon: EventsIcon },
];

export default function AppShell({
  initialFocus,
  initialCompanyInfo,
  initialEvents,
  isAdmin,
}: {
  initialFocus: FocusState;
  initialCompanyInfo: CompanyInfo[];
  initialEvents: CarsonEvent[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("focus");
  const [companyInfo, setCompanyInfo] = useState(initialCompanyInfo);
  const [showAdminGate, setShowAdminGate] = useState(false);

  return (
    <div className="app-shell">
      <header className="top-bar">
        <span className="top-bar-brand">
          <Image src="/icon-192.png" alt="" width={26} height={26} className="top-bar-logo" />
          <span className="top-bar-title">Marketing Team Dashboard</span>
        </span>
        <button className="admin-pin" onClick={() => setShowAdminGate(true)} aria-label="Admin unlock">
          {isAdmin ? "✓" : "⚙"}
        </button>
      </header>

      <main className="tab-content">
        {tab === "focus" && (
          <FocusTab
            initialFocus={initialFocus}
            companyInfo={companyInfo}
            setCompanyInfo={setCompanyInfo}
            isAdmin={isAdmin}
            onRequestAdmin={() => setShowAdminGate(true)}
          />
        )}
        {tab === "tools" && <ToolsTab />}
        {tab === "events" && <EventsTab initialEvents={initialEvents} companyInfo={companyInfo} />}
      </main>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            <span className="tab-icon">
              <t.Icon />
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {showAdminGate && (
        <AdminGate
          onClose={() => {
            setShowAdminGate(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
