import { describe, expect, it } from "vitest";
import { stepLine, verdictHeadline } from "./revealCopy";
import type { Result } from "../domain/evaluate";

const make = (verdicts: Result["steps"][number]["verdict"][]): Result => ({
  steps: verdicts.map((verdict, step) => ({ step, chosen: "x", verdict })),
  firstDivergence: verdicts.indexOf("divergence") === -1 ? null : verdicts.indexOf("divergence"),
  complete: true,
});

describe("verdictHeadline", () => {
  it("affirms a line that matches the coached line", () => {
    expect(verdictHeadline(make(["matched", "matched"]))).toBe("That's the line.");
  });

  it("praises a valid alternative as even better", () => {
    expect(verdictHeadline(make(["matched", "alternative"]))).toBe(
      "Even better — that's a line Brian would like.",
    );
  });

  it("stays warm when the line diverges", () => {
    expect(verdictHeadline(make(["matched", "divergence"]))).toBe(
      "Good thinking. Here's the cleaner line.",
    );
  });

  it("never mentions a score, percentage or streak", () => {
    const headlines = [make(["matched"]), make(["alternative"]), make(["divergence"])]
      .map(verdictHeadline);
    const steps = [
      stepLine(1, "red 1", "matched"),
      stepLine(2, "blue", "alternative"),
      stepLine(3, "black", "divergence"),
    ];
    const all = [...headlines, ...steps].join(" ");
    expect(all).not.toMatch(/score|%|streak|wrong|incorrect|fail/i);
  });
});

describe("stepLine", () => {
  it("renders a matched step with just the position and ball name", () => {
    expect(stepLine(1, "red 1", "matched")).toBe("1. red 1");
  });

  it("renders an alternative step as also fine", () => {
    expect(stepLine(2, "blue", "alternative")).toBe("2. blue — also fine");
  });

  it("renders a divergence step as take this one instead", () => {
    expect(stepLine(3, "black", "divergence")).toBe("3. black — take this one instead");
  });
});
