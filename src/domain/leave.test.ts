import { describe, expect, it } from "vitest";
import { simulateLine, strengthBand, suggestedPocket } from "./leave";
import { BALL_RADIUS } from "../ui/geometry";
import { TABLE, type Pocket, type Setup, type Shot, type Spin } from "./types";

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
  lesson: "positional-play",
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

const shot = (
  ball: string,
  strength: number,
  spin: Spin,
  pocket: Pocket = "top-right",
): Shot => ({ ball, strength, spin, pocket });

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

  it("bounces an overhit off the cushion rather than parking on it", () => {
    for (const spin of ["low", "top"] as const) {
      const rest = leaveOf(shot("r1", 100, spin));
      // A reflection leaves the white well clear of every cushion here —
      // a clamp-only implementation would park it exactly on one.
      expect(rest.x).toBeGreaterThan(BALL_RADIUS + 100);
      expect(rest.x).toBeLessThan(TABLE.width - BALL_RADIUS - 100);
      expect(rest.y).toBeGreaterThan(BALL_RADIUS + 100);
      expect(rest.y).toBeLessThan(TABLE.height - BALL_RADIUS - 100);
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
    const rest = simulateLine(cutSetup, [shot("r1", 12, "centre")]).cue;
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

  it("suggests the easiest pocket — straightest cut from the white", () => {
    // Cue, red and the top-right corner are collinear in this fixture.
    expect(suggestedPocket(CUE, RED)).toBe("top-right");
    // From below the red the straightest available pot is still top-right.
    expect(suggestedPocket({ x: 3069, y: 1400 }, RED)).toBe("top-right");
  });

  it("pots along the Shot's pocket, not a guess", () => {
    // A mid-table red with two genuinely makeable pockets. Under stun the
    // white leaves along the tangent — perpendicular to the pot line — so
    // the two pockets throw it to opposite sides of the red.
    const twoWaySetup: Setup = {
      ...straightSetup,
      balls: straightSetup.balls.map((b) => {
        if (b.id === "r1") return { ...b, x: 2600, y: 889 };
        if (b.kind === "cue") return { ...b, x: 2000, y: 1200 };
        return b;
      }),
    };
    const red = { x: 2600, y: 889 };
    const toTop = simulateLine(twoWaySetup, [shot("r1", 30, "centre", "top-right")]).cue;
    const toBottom = simulateLine(twoWaySetup, [shot("r1", 30, "centre", "bottom-right")]).cue;
    // Cutting up to the top pocket sends the white below the red; cutting
    // down to the bottom pocket sends it above.
    expect(toTop.y).toBeGreaterThan(red.y);
    expect(toBottom.y).toBeLessThan(red.y);
    expect(distance(toTop, toBottom)).toBeGreaterThan(200);
  });

  it("pulls a followed cut along the original line, not through the pot (30-degree rule)", () => {
    // A half-ball cut with natural roll deflects roughly 30–35 degrees
    // from the white's ORIGINAL direction — never straight through the
    // pot line. Cue → red is horizontal; the pot line to the top-right
    // corner cuts up at ~45 degrees.
    const halfBallSetup: Setup = {
      ...straightSetup,
      balls: straightSetup.balls.map((b) => {
        if (b.id === "r1") return { ...b, x: 2862, y: 707 };
        if (b.kind === "cue") return { ...b, x: 1800, y: 707 };
        return b;
      }),
    };
    const rest = simulateLine(halfBallSetup, [shot("r1", 12, "top", "top-right")]).cue;
    const contact = { x: 2862 - 60 * Math.SQRT1_2, y: 707 + 60 * Math.SQRT1_2 };
    const travelled = distance(rest, contact);
    expect(travelled).toBeGreaterThan(0);
    // Deflection from the original (horizontal, +x) direction.
    const deflection = Math.abs(
      (Math.atan2(-(rest.y - contact.y), rest.x - contact.x) * 180) / Math.PI,
    );
    expect(deflection).toBeGreaterThan(20);
    expect(deflection).toBeLessThan(45);
  });

  it("keeps more speed on a thin cut than a full-ball hit", () => {
    // Same strength, same spin: a thin cut barely slows the white, a
    // near-straight follow kills most of its pace.
    const thin = simulateLine(
      {
        ...straightSetup,
        balls: straightSetup.balls.map((b) =>
          b.kind === "cue" ? { ...b, x: 3069, y: 1400 } : b,
        ),
      },
      [shot("r1", 40, "centre")],
    ).cue;
    const straightRest = leaveOf(shot("r1", 40, "top"));
    const thinTravel = distance(thin, { x: 3026.6, y: 542.4 });
    const straightTravel = distance(straightRest, {
      x: 3026.6, y: 542.4,
    });
    expect(thinTravel).toBeGreaterThan(straightTravel);
  });
});

describe("simulateLine — the path", () => {
  it("has no path before any shot", () => {
    expect(simulateLine(straightSetup, []).path).toEqual([]);
  });

  it("runs from where the white stood to where it rests", () => {
    const state = simulateLine(straightSetup, [shot("r1", 20, "top")]);
    expect(state.path[0]).toEqual(CUE);
    expect(state.path[state.path.length - 1]).toEqual(state.cue);
    expect(state.path.length).toBeGreaterThanOrEqual(2);
  });

  it("passes through the contact point on the way", () => {
    const state = simulateLine(straightSetup, [shot("r1", 20, "top")]);
    // Ghost-ball contact: two ball radii short of the object ball, on the
    // line of the pot (spec definition, independent of the implementation).
    const contact = state.path[1]!;
    expect(distance(contact, RED)).toBeCloseTo(BALL_RADIUS * 2, 0);
  });

  it("is just start-to-contact for a dead-straight stun", () => {
    const state = simulateLine(straightSetup, [shot("r1", 50, "centre")]);
    expect(state.path).toHaveLength(2);
    expect(state.path[1]).toEqual(state.cue);
  });

  it("bends at the cushion on an overhit instead of cutting the corner", () => {
    const state = simulateLine(straightSetup, [shot("r1", 100, "top")]);
    // Between contact and rest there is a waypoint ON a cushion line.
    const onCushion = state.path.slice(2, -1).some(
      (p) =>
        p.x === BALL_RADIUS ||
        p.x === TABLE.width - BALL_RADIUS ||
        p.y === BALL_RADIUS ||
        p.y === TABLE.height - BALL_RADIUS,
    );
    expect(onCushion).toBe(true);
  });

  it("is the latest shot's path after a fold", () => {
    const afterOne = simulateLine(straightSetup, [shot("r1", 50, "centre")]);
    const afterTwo = simulateLine(straightSetup, [
      shot("r1", 50, "centre"),
      shot("black", 30, "top"),
    ]);
    expect(afterTwo.path[0]).toEqual(afterOne.cue);
    expect(afterTwo.path[afterTwo.path.length - 1]).toEqual(afterTwo.cue);
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
    // Capture the two-shot state BEFORE the full line is ever simulated,
    // then re-fold after it: undo must reproduce the earlier state exactly,
    // which fails if any state leaks between calls.
    const beforeThird = simulateLine(straightSetup, line.slice(0, 2));
    const full = simulateLine(straightSetup, line);
    expect(full.cue).not.toEqual(beforeThird.cue);
    expect(full.pottedReds).toEqual(["r1", "r2"]);
    expect(simulateLine(straightSetup, line.slice(0, 2))).toEqual(beforeThird);
  });
});
