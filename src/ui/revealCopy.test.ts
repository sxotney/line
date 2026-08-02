import { describe, expect, it } from "vitest";
import { stepLine, verdictHeadline, type ShotWords } from "./revealCopy";
import type { Result } from "../domain/evaluate";

const make = (verdicts: Result["steps"][number]["verdict"][]): Result => ({
  steps: verdicts.map((verdict, step) => ({
    step,
    chosen: { ball: "x", strength: 50, spin: "centre" },
    ballVerdict: verdict,
    strengthVerdict: "matched",
    spinVerdict: "matched",
    verdict,
  })),
  firstDivergence:
    verdicts.indexOf("divergence") === -1 ? null : verdicts.indexOf("divergence"),
  complete: true,
});

const shot = (ball: string, strength = "medium", spin = "centre"): ShotWords => ({
  ball, strength, spin,
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
      stepLine(1, shot("red 1"), shot("red 1"), "matched", "matched"),
      stepLine(2, shot("blue"), shot("pink"), "alternative", "alternative"),
      stepLine(3, shot("blue"), shot("blue", "firm"), "alternative", "matched"),
      stepLine(4, shot("red 2"), shot("black"), "divergence", "divergence"),
      stepLine(5, shot("red 2"), shot("red 2", "firm", "top"), "divergence", "matched"),
      stepLine(6, shot("black"), null, "divergence", "divergence"),
    ];
    const all = [...headlines, ...steps].join(" ");
    expect(all).not.toMatch(/score|%|streak|wrong|incorrect|fail|mistake|error/i);
  });
});

describe("stepLine", () => {
  it("renders a matched step as the coached shot", () => {
    expect(stepLine(1, shot("red 1", "medium", "top"), shot("red 1", "medium", "top"), "matched", "matched"))
      .toBe("1. red 1 · medium · top");
  });

  it("renders a ball alternative leading with Alex's choice, short coached reference", () => {
    expect(stepLine(2, shot("blue", "soft"), shot("pink", "soft"), "alternative", "alternative"))
      .toBe("2. pink · soft · centre — also fine (coached: blue)");
  });

  it("renders a strength alternative naming only the differing coached part", () => {
    expect(stepLine(2, shot("black", "soft"), shot("black", "medium"), "alternative", "matched"))
      .toBe("2. black · medium · centre — also fine (coached: soft)");
  });

  it("renders a ball divergence with the coached shot as subject, acknowledging the choice", () => {
    expect(stepLine(3, shot("red 2"), shot("black", "firm"), "divergence", "divergence"))
      .toBe("3. red 2 · medium · centre — take this one instead (you went for black · firm · centre)");
  });

  it("renders a strength/spin divergence on the right ball with its own phrasing", () => {
    expect(stepLine(3, shot("red 2", "medium", "low"), shot("red 2", "firm", "top"), "divergence", "matched"))
      .toBe("3. red 2 · medium · low — right ball, play it like this (you went for red 2 · firm · top)");
  });

  it("renders a divergence with no chosen shot sensibly, without inventing one", () => {
    expect(stepLine(4, shot("black", "soft"), null, "divergence", "divergence"))
      .toBe("4. black · soft · centre");
  });
});
