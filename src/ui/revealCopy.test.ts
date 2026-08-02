import { describe, expect, it } from "vitest";
import { verdictHeadline } from "./revealCopy";
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
    const all = [make(["matched"]), make(["alternative"]), make(["divergence"])]
      .map(verdictHeadline)
      .join(" ");
    expect(all).not.toMatch(/score|%|streak|wrong|incorrect|fail/i);
  });
});
