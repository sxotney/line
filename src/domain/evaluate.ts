import { strengthBand } from "./leave";
import type { Setup, Shot, Spin, Step, Strength } from "./types";

export type StepVerdict = "matched" | "alternative" | "divergence";

export interface StepResult {
  step: number;
  chosen: Shot | null;
  ballVerdict: StepVerdict;
  strengthVerdict: StepVerdict;
  spinVerdict: StepVerdict;
  // Judged only when the Step authors a pocket; otherwise always matched —
  // an unauthored pocket is display-only (ADR 0005).
  pocketVerdict: StepVerdict;
  // Worst of the axes: any divergence → divergence, else any alternative →
  // alternative, else matched. A missing shot is a divergence.
  verdict: StepVerdict;
}

export interface Result {
  steps: StepResult[];
  firstDivergence: number | null;
  complete: boolean;
}

function judgeAxis<T>(
  chosen: T,
  coached: T,
  acceptable: readonly T[] | undefined,
): StepVerdict {
  if (chosen === coached) return "matched";
  if (acceptable?.includes(chosen)) return "alternative";
  return "divergence";
}

function combined(...verdicts: StepVerdict[]): StepVerdict {
  if (verdicts.includes("divergence")) return "divergence";
  if (verdicts.includes("alternative")) return "alternative";
  return "matched";
}

function judgeShot(step: Step, index: number, chosen: Shot | null): StepResult {
  if (chosen === null) {
    return {
      step: index,
      chosen: null,
      ballVerdict: "divergence",
      strengthVerdict: "divergence",
      spinVerdict: "divergence",
      pocketVerdict: "divergence",
      verdict: "divergence",
    };
  }
  const ballVerdict = judgeAxis(chosen.ball, step.ball, step.acceptable);
  // The slider value is judged by the band it falls in (CONTEXT.md,
  // "Strength band") — coaching stays band-to-band while the raw value
  // drives the Leave.
  const strengthVerdict = judgeAxis<Strength>(
    strengthBand(chosen.strength), step.strength, step.acceptableStrength,
  );
  const spinVerdict = judgeAxis<Spin>(chosen.spin, step.spin, step.acceptableSpin);
  const pocketVerdict = step.pocket
    ? judgeAxis(chosen.pocket, step.pocket, step.acceptablePocket)
    : "matched";
  return {
    step: index,
    chosen,
    ballVerdict,
    strengthVerdict,
    spinVerdict,
    pocketVerdict,
    verdict: combined(ballVerdict, strengthVerdict, spinVerdict, pocketVerdict),
  };
}

export function evaluate(setup: Setup, alexLine: Shot[]): Result {
  const steps: StepResult[] = setup.coachedLine.map((step, index) =>
    judgeShot(step, index, alexLine[index] ?? null),
  );

  const firstDivergenceIndex = steps.findIndex(
    (s) => s.verdict === "divergence",
  );

  return {
    steps,
    firstDivergence: firstDivergenceIndex === -1 ? null : firstDivergenceIndex,
    complete: alexLine.length >= setup.coachedLine.length,
  };
}
