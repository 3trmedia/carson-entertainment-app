"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarsonEvent, CompanyInfo, FocusState } from "@/lib/types";
import AdminGate from "./AdminGate";
import FocusTab from "./FocusTab";
import ToolsTab from "./ToolsTab";
import EventsTab from "./EventsTab";

type Tab = "focus" | "tools" | "events";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "focus", label: "Focus", icon: "◉" },
  { key: "tools", label: "Tools", icon: "✦" },
  { key: "events", label: "Events", icon: "▦" },
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
        <span className="top-bar-title">Carson Portfolio</span>
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
            <span className="tab-icon">{t.icon}</span>
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
