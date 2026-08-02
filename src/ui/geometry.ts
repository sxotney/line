import { TABLE, type Colour } from "../domain/types";

export const BALL_RADIUS = 30;
export const CUSHION = 100;
export const POCKET_RADIUS = 60;

// Landscape: long axis horizontal. Baulk at the left.
const BAULK_X = TABLE.width * 0.2;
const CENTRE_Y = TABLE.height / 2;

export const SPOTS: Record<Colour, { x: number; y: number }> = {
  yellow: { x: BAULK_X, y: CENTRE_Y + TABLE.height * 0.2 },
  green: { x: BAULK_X, y: CENTRE_Y - TABLE.height * 0.2 },
  brown: { x: BAULK_X, y: CENTRE_Y },
  blue: { x: TABLE.width / 2, y: CENTRE_Y },
  pink: { x: TABLE.width * 0.75, y: CENTRE_Y },
  black: { x: TABLE.width - TABLE.width * 0.09, y: CENTRE_Y },
};

export function viewBox(): string {
  return `${-CUSHION} ${-CUSHION} ${TABLE.width + CUSHION * 2} ${TABLE.height + CUSHION * 2}`;
}

export function pocketCentres(): { x: number; y: number }[] {
  return [
    { x: 0, y: 0 },
    { x: TABLE.width / 2, y: 0 },
    { x: TABLE.width, y: 0 },
    { x: 0, y: TABLE.height },
    { x: TABLE.width / 2, y: TABLE.height },
    { x: TABLE.width, y: TABLE.height },
  ];
}
