import { describe, expect, it } from "vitest";
import { SETUPS } from "./setups";

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
});
