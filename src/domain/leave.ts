import type { Strength } from "./types";

// Alex sets strength on a continuous 0–100 slider; coaching and judging
// happen in the three named bands marked on its track (CONTEXT.md,
// "Strength band"): soft [0–33], medium (33–66], firm (66–100].
export function strengthBand(value: number): Strength {
  if (value <= 33) return "soft";
  if (value <= 66) return "medium";
  return "firm";
}
