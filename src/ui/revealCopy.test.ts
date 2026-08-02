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
      stepLine(1, "red 1", "red 1", "matched"),
      stepLine(2, "blue", "pink", "alternative"),
      stepLine(3, "red 2", "black", "divergence"),
      stepLine(4, "black", null, "divergence"),
    ];
    const all = [...headlines, ...steps].join(" ");
    expect(all).not.toMatch(/score|%|streak|wrong|incorrect|fail|mistake|error/i);
  });
});

describe("stepLine", () => {
  it("renders a matched step with just the position and coached ball name", () => {
    expect(stepLine(1, "red 1", "red 1", "matched")).toBe("1. red 1");
  });

  it("renders an alternative step leading with Alex's own choice, coached ball kept as reference", () => {
    expect(stepLine(2, "blue", "pink", "alternative")).toBe(
      "2. pink — also fine (coached: blue)",
    );
  });

  it("renders a divergence step naming the coached ball as the subject and acknowledging Alex's choice", () => {
    expect(stepLine(3, "red 2", "black", "divergence")).toBe(
      "3. red 2 — take this one instead (you went for black)",
    );
  });

  it("renders a divergence step with no chosen ball sensibly, without inventing a name", () => {
    expect(stepLine(4, "black", null, "divergence")).toBe(
      "4. black — take this one instead",
    );
  });
});
