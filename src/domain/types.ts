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

// Kid-sized deliberately: three strengths, three vertical spins, no side.
// Coarser than Paths' 13-cell tip grid + 4 paces on purpose.
export const STRENGTHS = ["soft", "medium", "firm"] as const;
export type Strength = (typeof STRENGTHS)[number];

export const SPINS = ["low", "centre", "top"] as const;
export type Spin = (typeof SPINS)[number];

// One entry in Alex's line: the ball he taps plus how he'd play the shot.
export interface Shot {
  ball: BallId;
  strength: Strength;
  spin: Spin;
}

export interface Step {
  ball: BallId;
  acceptable?: BallId[];
  strength: Strength;
  acceptableStrength?: Strength[];
  spin: Spin;
  acceptableSpin?: Spin[];
  why?: string;
}

export interface Setup {
  id: string;
  ladderIndex: number;
  title?: string;
  balls: Ball[];
  coachedLine: Step[];
}
