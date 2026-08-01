import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import type { Setup } from "./types";

const setup: Setup = {
  id: "s1",
  ladderIndex: 0,
  balls: [
    { id: "r1", kind: "red", x: 100, y: 100 },
    { id: "r2", kind: "red", x: 200, y: 200 },
    { id: "black", kind: "colour", colour: "black", x: 300, y: 300 },
    { id: "blue", kind: "colour", colour: "blue", x: 400, y: 400 },
    { id: "cue", kind: "cue", x: 500, y: 500 },
  ],
  coachedLine: [
    { ball: "r1", why: "take the awkward red first" },
    { ball: "black", acceptable: ["blue"], why: "stay low for the next red" },
    { ball: "r2" },
    { ball: "blue" },
  ],
};

describe("evaluate", () => {
  it("marks every step matched when the line is the coached line", () => {
    const result = evaluate(setup, ["r1", "black", "r2", "blue"]);
    expect(result.steps.map((s) => s.verdict)).toEqual([
      "matched", "matched", "matched", "matched",
    ]);
    expect(result.firstDivergence).toBeNull();
    expect(result.complete).toBe(true);
  });

  it("marks a ball in the acceptable set as an alternative, not a divergence", () => {
    const result = evaluate(setup, ["r1", "blue", "r2", "blue"]);
    expect(result.steps[1].verdict).toBe("alternative");
    expect(result.firstDivergence).toBeNull();
  });

  it("records the first divergence and keeps evaluating later steps", () => {
    const result = evaluate(setup, ["r2", "black", "r2", "blue"]);
    expect(result.steps[0].verdict).toBe("divergence");
    expect(result.steps[1].verdict).toBe("matched");
    expect(result.firstDivergence).toBe(0);
  });

  it("reports only the FIRST divergence index when there are several", () => {
    const result = evaluate(setup, ["r2", "blue", "r1", "black"]);
    expect(result.firstDivergence).toBe(0);
    expect(result.steps[3].verdict).toBe("divergence");
  });

  it("treats a short line as incomplete and pads missing steps with null", () => {
    const result = evaluate(setup, ["r1", "black"]);
    expect(result.complete).toBe(false);
    expect(result.steps).toHaveLength(4);
    expect(result.steps[2].chosen).toBeNull();
    expect(result.steps[2].verdict).toBe("divergence");
  });

  it("ignores taps beyond the length of the coached line", () => {
    const result = evaluate(setup, ["r1", "black", "r2", "blue", "black"]);
    expect(result.steps).toHaveLength(4);
    expect(result.complete).toBe(true);
  });

  it("allows a re-spotted colour to be taken again later in the line", () => {
    const respot: Setup = {
      ...setup,
      coachedLine: [
        { ball: "r1" }, { ball: "black" }, { ball: "r2" }, { ball: "black" },
      ],
    };
    const result = evaluate(respot, ["r1", "black", "r2", "black"]);
    expect(result.steps.map((s) => s.verdict)).toEqual([
      "matched", "matched", "matched", "matched",
    ]);
  });

  it("returns an empty, complete result for an empty coached line", () => {
    const empty: Setup = { ...setup, coachedLine: [] };
    const result = evaluate(empty, []);
    expect(result.steps).toEqual([]);
    expect(result.complete).toBe(true);
    expect(result.firstDivergence).toBeNull();
  });
});
