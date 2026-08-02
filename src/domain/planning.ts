import type { BallId, Setup, Shot } from "./types";

export function expectedKindAt(index: number): "red" | "colour" {
  return index % 2 === 0 ? "red" : "colour";
}

export function isLineComplete(setup: Setup, line: Shot[]): boolean {
  return line.length >= setup.coachedLine.length;
}

export function tappableBalls(setup: Setup, line: Shot[]): BallId[] {
  if (isLineComplete(setup, line)) return [];

  const expected = expectedKindAt(line.length);
  const takenReds = new Set(
    line
      .map((shot) => shot.ball)
      .filter((id) => setup.balls.find((b) => b.id === id)?.kind === "red"),
  );

  return setup.balls
    .filter((b) => b.kind === expected)
    .filter((b) => (b.kind === "red" ? !takenReds.has(b.id) : true))
    .map((b) => b.id);
}

// A shot is only appended if its ball is legally tappable at this point in
// the line — an illegal shot is ignored, never an exception. Strength and
// spin are Alex's to choose freely; legality is about the ball alone.
export function appendShot(setup: Setup, line: Shot[], shot: Shot): Shot[] {
  return tappableBalls(setup, line).includes(shot.ball)
    ? [...line, shot]
    : line;
}

export function undoTap(line: Shot[]): Shot[] {
  return line.slice(0, -1);
}
