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
}

export interface Idea {
  id: string;
  name: string | null;
  company: CompanyKey | "general";
  text: string;
  created_at: string;
}

export const COMPANY_NAMES: Record<CompanyKey | "general", string> = {
  sdc: "Swingin Dance Co",
  wec: "Western Events Center",
  smb: "Swingin Mechanical Bulls",
  general: "General",
};
