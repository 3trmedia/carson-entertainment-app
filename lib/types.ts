export type CompanyKey = "sdc" | "wec" | "smb";

export interface FocusState {
  company: CompanyKey | "";
  month: string;
  goals: string[];
}

export interface CompanyInfo {
  key: CompanyKey;
  label: string;
  sub: string;
  baseline: string[];
  focus: string[];
  next_focus_date: string | null;
}

export interface CarsonEvent {
  id: string;
  company: CompanyKey;
  title: string;
  event_date: string;
  notes: string | null;
  created_at: string;
}

export const COMPANY_NAMES: Record<CompanyKey | "general", string> = {
  sdc: "Swingin Dance Co",
  wec: "Western Events Center",
  smb: "Swingin Mechanical Bulls",
  general: "General",
};

export const COMPANY_COLORS: Record<CompanyKey, string> = {
  sdc: "#d4a72c",
  wec: "#5b8def",
  smb: "#4caf6d",
};

export const COMPANY_THUMB: Record<CompanyKey, string> = {
  sdc: "/images/sdc-thumb.jpg",
  wec: "/images/wec-thumb.jpg",
  smb: "/images/smb-thumb.jpg",
};

export const MAX_EVENTS_PER_COMPANY_PER_MONTH = 3;
