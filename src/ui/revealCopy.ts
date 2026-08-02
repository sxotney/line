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
  ballName: string,
  verdict: Result["steps"][number]["verdict"],
): string {
  const prefix = `${position}. ${ballName}`;
  if (verdict === "matched") return `${prefix}`;
  if (verdict === "alternative") return `${prefix} — also fine`;
  return `${prefix} — take this one instead`;
}
