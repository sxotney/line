import type { BallId, Setup } from "./types";

export function expectedKindAt(index: number): "red" | "colour" {
  return index % 2 === 0 ? "red" : "colour";
}

export function isLineComplete(setup: Setup, line: BallId[]): boolean {
  return line.length >= setup.coachedLine.length;
}

export function tappableBalls(setup: Setup, line: BallId[]): BallId[] {
  if (isLineComplete(setup, line)) return [];

  const expected = expectedKindAt(line.length);
  const takenReds = new Set(
    line.filter((id) => setup.balls.find((b) => b.id === id)?.kind === "red"),
  );

  return setup.balls
    .filter((b) => b.kind === expected)
    .filter((b) => (b.kind === "red" ? !takenReds.has(b.id) : true))
    .map((b) => b.id);
}

export function appendTap(
  setup: Setup,
  line: BallId[],
  ball: BallId,
): BallId[] {
  return tappableBalls(setup, line).includes(ball) ? [...line, ball] : line;
}

export function undoTap(line: BallId[]): BallId[] {
  return line.slice(0, -1);
}
