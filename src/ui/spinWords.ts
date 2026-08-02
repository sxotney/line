import type { Spin } from "../domain/types";

// The UI speaks real snooker: screw, stun, top. The field values stay
// low/centre/top (CONTEXT.md — where the cue strikes, not the effect),
// so this is display language only.
export const SPIN_WORD: Record<Spin, string> = {
  low: "screw",
  centre: "stun",
  top: "top",
};
