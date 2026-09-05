import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CompanyInfo, FocusState, Idea } from "@/lib/types";
import Board from "./Board";

export const dynamic = "force-dynamic";

const DEFAULT_COMPANY_INFO: CompanyInfo[] = [
  {
    key: "sdc",
    label: "Swingin Dance Co",
    sub: "Tucker manages day to day · Dalton films and posts",
    baseline: [
      "Dalton keeps posting on his own, alternating weekly between Mon/Thu and Tue/Fri",
      "Occasional third post in a week when a specific event is coming up",
      "Tucker stays the point of contact and oversees day to day",
    ],
    focus: [
      "Ben adds one extra video per week promoting the bigger event or specialized content",
      "Event promotion runs whisper, speak, shout: leak it, then release details, then push hard",
      "Flyers and story posts sprinkled in before and during event week",
      "Flagship event (like a country prom) targeted at least once a quarter",
    ],
  },
  {
    key: "wec",
    label: "Western Events Center",
    sub: "Taft manages, minority stake, largely runs it himself",
    baseline: [
      "One post a week of venue and event photos, plus one flyer for one large event a month",
      "Taft creates most content himself with guidelines from Ben",
      "Neither Ben nor Dalton has account access; Ben sends Taft a monthly content bundle to post",
    ],
    focus: [
      "Mirrors the Dance Co approach with more weight on events",
      "Adds an SEO push aimed at increasing lead form submissions through Google",
      "Direction: more concerts, a learn-to-rope night, hangout nights, indoor pickleball, a year-round western events calendar",
      "Dance Co's Instagram can promote WEC events, only when they're on-brand for that audience",
    ],
  },
  {
    key: "smb",
    label: "Swingin Mechanical Bulls",
    sub: "Sam is the point of contact, no dedicated manager yet",
    baseline: [
      "Whichever ads were still winning at the end of the last focus month keep running untouched",
      "No new ads started, nothing requires a person day to day",
      "Automated lead and quote system keeps working in the background",
    ],
    focus: [
      "Ben builds 25 new ads for the month, then prunes only the underperformers",
      "Occasional event photography and filming to build future ad content and social posts",
      "Dedicated page stays light on posting since people follow for experiences, not services",
      "Ad goal: $10k/month, roughly 12 rentals (about 3 a week)",
    ],
  },
];

export default async function Home() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("carson_admin")?.value === process.env.CARSON_ADMIN_PASSCODE;

  const supabase = getSupabaseAdmin();

  const [focusRes, companyRes, ideasRes] = await Promise.all([
    supabase.from("carson_focus_state").select("*").eq("id", 1).maybeSingle(),
    supabase.from("carson_company_info").select("*").order("key"),
    supabase.from("carson_ideas").select("*").order("created_at", { ascending: false }),
  ]);

  const focus: FocusState = focusRes.data
    ? { company: focusRes.data.company ?? "", month: focusRes.data.month ?? "", goals: focusRes.data.goals ?? [] }
    : { company: "", month: "", goals: [] };

  const companyInfo: CompanyInfo[] =
    companyRes.data && companyRes.data.length > 0 ? (companyRes.data as CompanyInfo[]) : DEFAULT_COMPANY_INFO;

  const ideas: Idea[] = (ideasRes.data as Idea[]) ?? [];

  return <Board initialFocus={focus} initialCompanyInfo={companyInfo} initialIdeas={ideas} isAdmin={isAdmin} />;
}
