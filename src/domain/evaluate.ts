import type { BallId, Setup } from "./types";

export type StepVerdict = "matched" | "alternative" | "divergence";

export interface StepResult {
  step: number;
  chosen: BallId | null;
  verdict: StepVerdict;
}

export interface Result {
  steps: StepResult[];
  firstDivergence: number | null;
  complete: boolean;
}

export function evaluate(setup: Setup, alexLine: BallId[]): Result {
  const steps: StepResult[] = setup.coachedLine.map((step, index) => {
    const chosen = alexLine[index] ?? null;

    if (chosen === null) {
      return { step: index, chosen: null, verdict: "divergence" };
    }
    if (chosen === step.ball) {
      return { step: index, chosen, verdict: "matched" };
    }
    if (step.acceptable?.includes(chosen)) {
      return { step: index, chosen, verdict: "alternative" };
    }
    return { step: index, chosen, verdict: "divergence" };
  });

  const firstDivergenceIndex = steps.findIndex(
    (s) => s.verdict === "divergence",
  );

  return {
    steps,
    firstDivergence: firstDivergenceIndex === -1 ? null : firstDivergenceIndex,
    complete: alexLine.length >= setup.coachedLine.length,
  };
}
