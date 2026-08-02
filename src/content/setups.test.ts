import { describe, expect, it } from "vitest";
import { SETUPS } from "./setups";
import { TABLE } from "../domain/types";
import { BALL_RADIUS } from "../ui/geometry";

describe("SETUPS", () => {
  it("ships at least three setups", () => {
    expect(SETUPS.length).toBeGreaterThanOrEqual(3);
  });

  it("is ordered by ladderIndex ascending", () => {
    const indices = SETUPS.map((s) => s.ladderIndex);
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
  });

  it("gives every setup a coached line of even length", () => {
    for (const setup of SETUPS) {
      expect(setup.coachedLine.length % 2).toBe(0);
      expect(setup.coachedLine.length).toBeGreaterThan(0);
    }
  });

  it("explains at least one decision in every setup", () => {
    for (const setup of SETUPS) {
      expect(setup.coachedLine.some((step) => step.why)).toBe(true);
    }
  });

  it("has unique setup ids", () => {
    const ids = SETUPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // The zod schema (schema.ts) validates structure — ids, references,
  // alternation — but has no idea about geometry. Overlapping or off-table
  // balls are the one authoring hazard it cannot catch, so check it here
  // directly against the authored coordinates.
  it("keeps every ball on the table and at least two ball-widths from every other ball", () => {
    const minDistance = 2 * BALL_RADIUS;
    for (const setup of SETUPS) {
      for (const ball of setup.balls) {
        expect(ball.x).toBeGreaterThanOrEqual(0);
        expect(ball.x).toBeLessThanOrEqual(TABLE.width);
        expect(ball.y).toBeGreaterThanOrEqual(0);
        expect(ball.y).toBeLessThanOrEqual(TABLE.height);
      }

      for (let i = 0; i < setup.balls.length; i += 1) {
        for (let j = i + 1; j < setup.balls.length; j += 1) {
          const a = setup.balls[i];
          const b = setup.balls[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          expect(
            distance,
            `${setup.id}: "${a.id}" and "${b.id}" are ${distance.toFixed(1)} apart (need >= ${minDistance})`,
          ).toBeGreaterThanOrEqual(minDistance);
        }
      }
    }
  });
});
