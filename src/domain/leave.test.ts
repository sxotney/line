import { describe, expect, it } from "vitest";
import { simulateLine, strengthBand } from "./leave";
import { BALL_RADIUS } from "../ui/geometry";
import { TABLE, type Setup, type Shot, type Spin } from "./types";

describe("strengthBand", () => {
  it("maps the soft band: 0–33", () => {
    expect(strengthBand(0)).toBe("soft");
    expect(strengthBand(33)).toBe("soft");
  });

  it("maps the medium band: 34–66", () => {
    expect(strengthBand(34)).toBe("medium");
    expect(strengthBand(66)).toBe("medium");
  });

  it("maps the firm band: 67–100", () => {
    expect(strengthBand(67)).toBe("firm");
    expect(strengthBand(100)).toBe("firm");
  });
});

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

// A red dead straight to the top-right corner pocket (3569, 0): cue, red
// and pocket are collinear, so the natural pocket is unambiguous.
const CORNER = { x: TABLE.width, y: 0 };
const RED = { x: 3069, y: 500 };
const CUE = { x: 2569, y: 1000 };

const straightSetup: Setup = {
  id: "s1",
  ladderIndex: 0,
  balls: [
    { id: "r1", kind: "red", ...RED },
    { id: "r2", kind: "red", x: 600, y: 500 },
    { id: "black", kind: "colour", colour: "black", x: 3248, y: 889 },
    { id: "cue", kind: "cue", ...CUE },
  ],
  coachedLine: [
    { ball: "r1", strength: "medium", spin: "centre" },
    { ball: "black", strength: "soft", spin: "centre" },
    { ball: "r2", strength: "medium", spin: "centre" },
    { ball: "black", strength: "soft", spin: "centre" },
  ],
};

const shot = (ball: string, strength: number, spin: Spin): Shot => ({
  ball, strength, spin,
});

const leaveOf = (s: Shot) => simulateLine(straightSetup, [s]).cue;

describe("simulateLine — the single-shot heuristic", () => {
  it("starts the white at the setup's cue position for an empty line", () => {
    const state = simulateLine(straightSetup, []);
    expect(state.cue).toEqual(CUE);
    expect(state.pottedReds).toEqual([]);
  });

  it("stops a dead-straight stun at the contact point", () => {
    const rest = leaveOf(shot("r1", 50, "centre"));
    // Ghost-ball contact: two ball radii from the object ball's centre,
    // on the cue's side of the line.
    expect(distance(rest, RED)).toBeCloseTo(BALL_RADIUS * 2, 0);
    expect(distance(rest, CUE)).toBeLessThan(distance(RED, CUE));
  });

  it("follows through toward the pocket with top", () => {
    const rest = leaveOf(shot("r1", 20, "top"));
    expect(distance(rest, CORNER)).toBeLessThan(
      distance(RED, CORNER),
    );
  });

  it("screws back toward the cue with low", () => {
    const rest = leaveOf(shot("r1", 20, "low"));
    expect(distance(rest, RED)).toBeGreaterThan(BALL_RADIUS * 2 + 100);
    expect(distance(rest, CUE)).toBeLessThan(distance(RED, CUE));
  });

  it("sends the white further the firmer the strength", () => {
    const softRest = leaveOf(shot("r1", 20, "low"));
    const firmRest = leaveOf(shot("r1", 85, "low"));
    expect(distance(firmRest, RED)).toBeGreaterThan(distance(softRest, RED));
  });

  it("keeps the white inside the cushions even badly overhit", () => {
    for (const spin of ["low", "centre", "top"] as const) {
      const rest = leaveOf(shot("r1", 100, spin));
      expect(rest.x).toBeGreaterThanOrEqual(BALL_RADIUS);
      expect(rest.x).toBeLessThanOrEqual(TABLE.width - BALL_RADIUS);
      expect(rest.y).toBeGreaterThanOrEqual(BALL_RADIUS);
      expect(rest.y).toBeLessThanOrEqual(TABLE.height - BALL_RADIUS);
    }
  });

  it("leaves a cut shot along the tangent line under stun", () => {
    // Cue below the red, pot line still to the top-right corner: the white
    // must depart perpendicular to the pot line, not follow the pot.
    const cutSetup: Setup = {
      ...straightSetup,
      balls: straightSetup.balls.map((b) =>
        b.kind === "cue" ? { ...b, x: 3069, y: 1400 } : b,
      ),
    };
    // Soft, so the tangent run stays clear of the cushions.
    const rest = simulateLine(cutSetup, [shot("r1", 20, "centre")]).cue;
    // Pot direction and contact point derived from the spec's ghost-ball
    // definition, not from the implementation.
    const potLength = distance(RED, CORNER);
    const u = {
      x: (CORNER.x - RED.x) / potLength,
      y: (CORNER.y - RED.y) / potLength,
    };
    const contact = {
      x: RED.x - u.x * BALL_RADIUS * 2,
      y: RED.y - u.y * BALL_RADIUS * 2,
    };
    const travelled = distance(rest, contact);
    expect(travelled).toBeGreaterThan(0);
    const along =
      ((rest.x - contact.x) * u.x + (rest.y - contact.y) * u.y) / travelled;
    expect(Math.abs(along)).toBeLessThan(0.05);
  });

  it("chooses the natural pocket over an absurd one", () => {
    // Top spin follows the pot line — so the white heading toward the
    // top-right corner is observable proof that corner was chosen.
    const rest = leaveOf(shot("r1", 20, "top"));
    const towardsCorner = distance(rest, CORNER) < distance(RED, CORNER);
    const oppositeCorner = { x: 0, y: TABLE.height };
    const towardsOpposite =
      distance(rest, oppositeCorner) < distance(RED, oppositeCorner);
    expect(towardsCorner).toBe(true);
    expect(towardsOpposite).toBe(false);
  });
});

describe("simulateLine — the fold", () => {
  it("accumulates potted reds and never pots a colour off the table", () => {
    const line = [shot("r1", 50, "centre"), shot("black", 50, "centre")];
    const state = simulateLine(straightSetup, line);
    expect(state.pottedReds).toEqual(["r1"]);
  });

  it("plays each shot from the previous Leave", () => {
    const afterOne = simulateLine(straightSetup, [shot("r1", 50, "centre")]);
    const afterTwo = simulateLine(straightSetup, [
      shot("r1", 50, "centre"),
      shot("black", 50, "centre"),
    ]);
    expect(afterTwo.cue).not.toEqual(afterOne.cue);
    expect(afterTwo.pottedReds).toEqual(["r1"]);
  });

  it("re-folds a shorter line to exactly the earlier state (undo)", () => {
    const line = [
      shot("r1", 50, "centre"),
      shot("black", 30, "top"),
      shot("r2", 70, "low"),
    ];
    expect(simulateLine(straightSetup, line.slice(0, 2))).toEqual(
      simulateLine(straightSetup, [line[0]!, line[1]!]),
    );
    expect(simulateLine(straightSetup, line.slice(0, 1))).toEqual(
      simulateLine(straightSetup, [line[0]!]),
    );
  });
});
