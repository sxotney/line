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

export interface Step {
  ball: BallId;
  acceptable?: BallId[];
  why?: string;
}

export interface Setup {
  id: string;
  ladderIndex: number;
  title?: string;
  balls: Ball[];
  coachedLine: Step[];
}
