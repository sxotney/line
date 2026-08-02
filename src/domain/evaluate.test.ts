import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import type { Setup, Shot, Spin, Strength } from "./types";

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
    {
      ball: "r1", strength: "medium", spin: "low",
      why: "take the awkward red first",
    },
    {
      ball: "black", acceptable: ["blue"],
      strength: "soft", acceptableStrength: ["medium"], spin: "centre",
      why: "stay low for the next red",
    },
    { ball: "r2", strength: "medium", spin: "top" },
    { ball: "blue", strength: "soft", spin: "centre" },
  ],
};

// Build the shot the coached line asks for at a given step, optionally
// overridden — keeps each test about the one axis it varies.
function coachedShot(
  index: number,
  override?: Partial<Shot>,
): Shot {
  const step = setup.coachedLine[index]!;
  return {
    ball: step.ball,
    strength: step.strength,
    spin: step.spin,
    ...override,
  };
}

const coachedFull = (): Shot[] =>
  setup.coachedLine.map((_, i) => coachedShot(i));

describe("evaluate", () => {
  it("marks every step and axis matched when the line is the coached line", () => {
    const result = evaluate(setup, coachedFull());
    expect(result.steps.map((s) => s.verdict)).toEqual([
      "matched", "matched", "matched", "matched",
    ]);
    expect(result.steps.every((s) =>
      s.ballVerdict === "matched" &&
      s.strengthVerdict === "matched" &&
      s.spinVerdict === "matched",
    )).toBe(true);
    expect(result.firstDivergence).toBeNull();
    expect(result.complete).toBe(true);
  });

  it("marks a ball in the acceptable set as an alternative, not a divergence", () => {
    const line = coachedFull();
    line[1] = coachedShot(1, { ball: "blue" });
    const result = evaluate(setup, line);
    expect(result.steps[1].ballVerdict).toBe("alternative");
    expect(result.steps[1].verdict).toBe("alternative");
    expect(result.firstDivergence).toBeNull();
  });

  it("marks an acceptable strength as an alternative on that axis only", () => {
    const line = coachedFull();
    line[1] = coachedShot(1, { strength: "medium" as Strength });
    const result = evaluate(setup, line);
    expect(result.steps[1].strengthVerdict).toBe("alternative");
    expect(result.steps[1].ballVerdict).toBe("matched");
    expect(result.steps[1].verdict).toBe("alternative");
  });

  it("marks a strength outside the acceptable set as a divergence", () => {
    const line = coachedFull();
    line[0] = coachedShot(0, { strength: "firm" as Strength });
    const result = evaluate(setup, line);
    expect(result.steps[0].strengthVerdict).toBe("divergence");
    expect(result.steps[0].verdict).toBe("divergence");
    expect(result.firstDivergence).toBe(0);
  });

  it("marks the spin axis independently of the ball axis", () => {
    const line = coachedFull();
    line[2] = coachedShot(2, { spin: "low" as Spin });
    const result = evaluate(setup, line);
    expect(result.steps[2].spinVerdict).toBe("divergence");
    expect(result.steps[2].ballVerdict).toBe("matched");
    expect(result.steps[2].verdict).toBe("divergence");
    expect(result.firstDivergence).toBe(2);
  });

  it("records the first divergence and keeps evaluating later steps", () => {
    const line = coachedFull();
    line[0] = coachedShot(0, { ball: "r2" });
    const result = evaluate(setup, line);
    expect(result.steps[0].verdict).toBe("divergence");
    expect(result.steps[1].verdict).toBe("matched");
    expect(result.firstDivergence).toBe(0);
  });

  it("treats a short line as incomplete and pads missing steps with null", () => {
    const result = evaluate(setup, [coachedShot(0), coachedShot(1)]);
    expect(result.complete).toBe(false);
    expect(result.steps).toHaveLength(4);
    expect(result.steps[2].chosen).toBeNull();
    expect(result.steps[2].verdict).toBe("divergence");
  });

  it("ignores shots beyond the length of the coached line", () => {
    const result = evaluate(setup, [...coachedFull(), coachedShot(1)]);
    expect(result.steps).toHaveLength(4);
    expect(result.complete).toBe(true);
  });

  it("allows a re-spotted colour to be taken again later in the line", () => {
    const respot: Setup = {
      ...setup,
      coachedLine: [
        { ball: "r1", strength: "medium", spin: "centre" },
        { ball: "black", strength: "soft", spin: "centre" },
        { ball: "r2", strength: "medium", spin: "centre" },
        { ball: "black", strength: "soft", spin: "centre" },
      ],
    };
    const line: Shot[] = respot.coachedLine.map((s) => ({
      ball: s.ball, strength: s.strength, spin: s.spin,
    }));
    const result = evaluate(respot, line);
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
