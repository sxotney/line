import type { Colour } from "../domain/types";

export const CLOTH = "#0b6b3a";
export const CUSHION_COLOUR = "#5a3a1a";
export const POCKET = "#0a0a0a";

export const BALL_FILL: Record<Colour | "red" | "cue", string> = {
  red: "#c1272d",
  yellow: "#f2c31b",
  green: "#0f7a3d",
  brown: "#7a4a1e",
  blue: "#1d5fa8",
  pink: "#e88ba6",
  black: "#141414",
  cue: "#f7f4ec",
};

// Deliberately garish and unlike any real ball colour: renders visibly
// instead of vanishing if a "colour" ball ever reaches TableView without
// its `colour` field set. Should never happen for data that passed
// through parseSetup, but the component can't assume that route.
export const MISSING_COLOUR_FILL = "#ff00ff";
