export const COLOURS = [
  "yellow", "green", "brown", "blue", "pink", "black",
] as const;

export type Colour = (typeof COLOURS)[number];

export const TABLE = { width: 3569, height: 1778 } as const;

export type BallId = string;

export interface Ball {
  id: BallId;
  kind: "red" | "colour" | "cue";
  colour?: Colour;
  x: number;
  y: number;
}

// Kid-sized deliberately: three strength bands, three vertical spins, no
// side. Coarser than Paths' 13-cell tip grid + 4 paces on purpose.
export const STRENGTHS = ["soft", "medium", "firm"] as const;
export type Strength = (typeof STRENGTHS)[number];

export const SPINS = ["low", "centre", "top"] as const;
export type Spin = (typeof SPINS)[number];

// The six pockets, named by table position (landscape, baulk at the left).
export const POCKETS = [
  "top-left",
  "top-middle",
  "top-right",
  "bottom-left",
  "bottom-middle",
  "bottom-right",
] as const;
export type Pocket = (typeof POCKETS)[number];

// One entry in Alex's line: the ball he taps plus how he'd play the shot.
// Strength is the raw slider value (0–100); it is judged by the band it
// falls in but drives the Leave continuously. The pocket is prefilled with
// the Suggested pocket, so it only differs when Alex meant it to.
export interface Shot {
  ball: BallId;
  strength: number;
  spin: Spin;
  pocket: Pocket;
}

export interface Step {
  ball: BallId;
  acceptable?: BallId[];
  strength: Strength;
  acceptableStrength?: Strength[];
  spin: Spin;
  acceptableSpin?: Spin[];
  // Authored only where the pot direction is the lesson: judged as a
  // fourth axis when present, display-only when absent.
  pocket?: Pocket;
  acceptablePocket?: Pocket[];
  why?: string;
}

// The one thing a Setup teaches. Drives ladder curation; surfaces to Alex
// only as a warm coaching line at the top of the Reveal — never a badge,
// filter, or picker (ADR 0004).
export const LESSONS = [
  "positional-play",
  "cluster",
  "cushion-work",
  "awkward-ball-first",
  "colour-choice",
] as const;
export type Lesson = (typeof LESSONS)[number];

export interface Setup {
  id: string;
  ladderIndex: number;
  lesson: Lesson;
  title?: string;
  balls: Ball[];
  coachedLine: Step[];
}
