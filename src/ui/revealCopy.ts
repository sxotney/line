import type { Result } from "../domain/evaluate";

export function verdictHeadline(result: Result): string {
  if (result.firstDivergence !== null) {
    return "Good thinking. Here's the cleaner line.";
  }
  if (result.steps.some((s) => s.verdict === "alternative")) {
    return "Even better — that's a line Brian would like.";
  }
  return "That's the line.";
}

export function stepLine(
  position: number,
  coachedName: string,
  chosenName: string | null,
  verdict: Result["steps"][number]["verdict"],
): string {
  const label = (name: string) => `${position}. ${name}`;

  if (verdict === "matched") return label(coachedName);

  if (verdict === "alternative") {
    // Alex's own choice is the whole point of this branch (ADR 0004) — lead
    // with what he picked, keep the coached ball visible as the reference.
    const chosen = chosenName ?? coachedName;
    return `${label(chosen)} — also fine (coached: ${coachedName})`;
  }

  // divergence: the coached ball stays the subject ("take this one instead"
  // refers to it), but acknowledge what he actually went for when known —
  // an unfilled step has no chosen ball to name.
  const suffix = chosenName ? ` (you went for ${chosenName})` : "";
  return `${label(coachedName)} — take this one instead${suffix}`;
}
