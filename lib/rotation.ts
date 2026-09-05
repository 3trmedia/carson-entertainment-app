import { CompanyKey } from "./types";

// The perpetual 3-month cycle: each company gets one calendar month in the
// focus spot, always handing off on the 13th, in this fixed order.
export const ROTATION_ORDER: CompanyKey[] = ["wec", "sdc", "smb"];

// Anchor: the 13th this company/month started its very first turn.
// Everything else is computed forward/backward from this in a perpetual
// 3-month cycle, so the rotation never needs manual updating.
const ANCHOR_YEAR = 2026;
const ANCHOR_MONTH = 8; // September (0-indexed)
const ROTATION_DAY = 13;

function monthsSinceAnchor(today: Date): number {
  const totalMonths = (today.getFullYear() - ANCHOR_YEAR) * 12 + (today.getMonth() - ANCHOR_MONTH);
  // Before the 13th, we're still in the previous month's slot.
  return today.getDate() < ROTATION_DAY ? totalMonths - 1 : totalMonths;
}

function currentSlotIndex(today: Date): number {
  return ((monthsSinceAnchor(today) % 3) + 3) % 3;
}

export function currentFocusCompany(today: Date = new Date()): CompanyKey {
  return ROTATION_ORDER[currentSlotIndex(today)];
}

export function currentFocusPeriodStart(today: Date = new Date()): Date {
  return new Date(ANCHOR_YEAR, ANCHOR_MONTH + monthsSinceAnchor(today), ROTATION_DAY);
}

/** The next date (today or in the future) this company's focus turn starts. */
export function nextStartDateFor(company: CompanyKey, today: Date = new Date()): Date {
  const companyIdx = ROTATION_ORDER.indexOf(company);
  const currentIdx = currentSlotIndex(today);
  let offset = companyIdx - currentIdx;
  if (offset < 0) offset += 3;
  return new Date(ANCHOR_YEAR, ANCHOR_MONTH + monthsSinceAnchor(today) + offset, ROTATION_DAY);
}
