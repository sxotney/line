import { describe, expect, it } from "vitest";
import { BALL_RADIUS, CUSHION, pocketCentres, SPOTS, viewBox } from "./geometry";

describe("geometry", () => {
  it("frames the play area plus a cushion on every side", () => {
    expect(viewBox()).toBe(`${-CUSHION} ${-CUSHION} ${3569 + CUSHION * 2} ${1778 + CUSHION * 2}`);
  });

  it("uses a ball radius consistent with Paths", () => {
    expect(BALL_RADIUS).toBe(30);
  });

  it("places six pockets: four corners and two middles", () => {
    const centres = pocketCentres();
    expect(centres).toHaveLength(6);
    expect(centres).toContainEqual({ x: 0, y: 0 });
    expect(centres).toContainEqual({ x: 3569, y: 1778 });
    expect(centres.filter((p) => p.x === 3569 / 2)).toHaveLength(2);
  });

  it("places the six colour spots inside the play area", () => {
    for (const spot of Object.values(SPOTS)) {
      expect(spot.x).toBeGreaterThan(0);
      expect(spot.x).toBeLessThan(3569);
      expect(spot.y).toBeGreaterThan(0);
      expect(spot.y).toBeLessThan(1778);
    }
  });

  it("puts the black nearer the top cushion than the yellow", () => {
    expect(SPOTS.black.x).toBeGreaterThan(SPOTS.yellow.x);
  });
});
