import type { BallId, Setup } from "../domain/types";

// Reds are named "red 1", "red 2", ... by their order of appearance in
// setup.balls, so text can refer to a specific red; colours keep their
// colour name. Shared by the Reveal and the shot picker.
export function ballNamer(setup: Setup): (id: BallId) => string {
  const redNumbers = new Map<string, number>();
  let redCount = 0;
  for (const ball of setup.balls) {
    if (ball.kind === "red") {
      redCount += 1;
      redNumbers.set(ball.id, redCount);
    }
  }

  return (id: BallId) => {
    const ball = setup.balls.find((b) => b.id === id);
    if (!ball) return id;
    if (ball.kind === "colour") {
      // The colour field is guaranteed by the schema for parsed content
      // only — fall back to a visible label rather than asserting.
      return ball.colour ?? "colour";
    }
    if (ball.kind === "cue") return "cue ball";
    return `red ${redNumbers.get(ball.id) ?? "?"}`;
  };
}
