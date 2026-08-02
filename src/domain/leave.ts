import { BALL_RADIUS, pocketCentres } from "../ui/geometry";
import { TABLE, type BallId, type Setup, type Shot, type Strength } from "./types";

// Alex sets strength on a continuous 0–100 slider; coaching and judging
// happen in the three named bands marked on its track (CONTEXT.md,
// "Strength band"): soft [0–33], medium (33–66], firm (66–100].
export function strengthBand(value: number): Strength {
  if (value <= 33) return "soft";
  if (value <= 66) return "medium";
  return "firm";
}

interface Point {
  x: number;
  y: number;
}

// The Simulated table: where the white sits and which reds are down after
// replaying Alex's shots so far. Display only — never judged (ADR 0005).
export interface SimulatedTable {
  cue: Point;
  pottedReds: BallId[];
}

// Kid-plausible tuning knobs, expected to be adjusted after watching Alex
// use it. The relational test style keeps retuning cheap.
const MAX_TRAVEL = 2000; // mm the white runs at strength 100
const SPIN_BEND = 0.8; // how hard top/low bend the tangent toward/away from the pot line

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const length = (v: Point) => Math.hypot(v.x, v.y);
const scale = (v: Point, k: number): Point => ({ x: v.x * k, y: v.y * k });
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;

function normalize(v: Point): Point {
  const len = length(v);
  return len === 0 ? { x: 0, y: 0 } : scale(v, 1 / len);
}

// The natural pocket: straightest cut from where the white sits, ties
// broken by distance. The pot always succeeds — this is a planning aid,
// never a pot judge (ADR 0005).
function naturalPocket(cue: Point, object: Point): Point {
  const incoming = normalize(sub(object, cue));
  let best = pocketCentres()[0]!;
  let bestCos = -Infinity;
  let bestDistance = Infinity;
  for (const pocket of pocketCentres()) {
    const toPocket = sub(pocket, object);
    const pocketDistance = length(toPocket);
    if (pocketDistance === 0) continue;
    const cos = dot(incoming, scale(toPocket, 1 / pocketDistance));
    if (
      cos > bestCos + 1e-9 ||
      (Math.abs(cos - bestCos) <= 1e-9 && pocketDistance < bestDistance)
    ) {
      best = pocket;
      bestCos = cos;
      bestDistance = pocketDistance;
    }
  }
  return best;
}

// One cushion reflection per axis at most, then a clamp backstop — enough
// for a kid-plausible overhit, deliberately not multi-cushion physics.
function reflectIntoTable(p: Point): Point {
  const min = BALL_RADIUS;
  const maxX = TABLE.width - BALL_RADIUS;
  const maxY = TABLE.height - BALL_RADIUS;
  let { x, y } = p;
  if (x < min) x = 2 * min - x;
  else if (x > maxX) x = 2 * maxX - x;
  if (y < min) y = 2 * min - y;
  else if (y > maxY) y = 2 * maxY - y;
  return {
    x: Math.min(Math.max(x, min), maxX),
    y: Math.min(Math.max(y, min), maxY),
  };
}

// Where one shot leaves the white. The pot succeeds into the natural
// pocket; the white arrives at the ghost-ball contact point and departs
// along the tangent line, bent toward the pot line by top and away by low,
// running a distance set by the raw strength value.
function predictLeave(cue: Point, object: Point, shot: Shot): Point {
  const pocket = naturalPocket(cue, object);
  const potDir = normalize(sub(pocket, object));
  const contact = add(object, scale(potDir, -BALL_RADIUS * 2));
  const incoming = normalize(sub(contact, cue));

  // The stun departure: the component of the incoming direction
  // perpendicular to the pot line. Zero for a dead-straight pot.
  const tangent = sub(incoming, scale(potDir, dot(incoming, potDir)));

  let departure: Point;
  switch (shot.spin) {
    case "centre":
      departure = tangent;
      break;
    case "top":
      departure = add(tangent, scale(potDir, SPIN_BEND));
      break;
    case "low":
      departure = add(tangent, scale(potDir, -SPIN_BEND));
      break;
  }

  // A dead-straight stun leaves only floating-point noise in the tangent —
  // treat anything below this as "the white stops where it strikes" rather
  // than normalizing noise into a full-speed departure.
  if (length(departure) < 1e-6) {
    return contact;
  }
  const direction = normalize(departure);

  const travel = (shot.strength / 100) * MAX_TRAVEL;
  return reflectIntoTable(add(contact, scale(direction, travel)));
}

// Replay Alex's shots from the Setup's starting position. Every chosen
// ball pots: reds come off the table, colours re-spot (their authored spot
// is where they always sit), and the white walks the break Leave by Leave.
export function simulateLine(setup: Setup, shots: Shot[]): SimulatedTable {
  const byId = new Map(setup.balls.map((b) => [b.id, b]));
  const start = setup.balls.find((b) => b.kind === "cue");

  let cue: Point = start ? { x: start.x, y: start.y } : { x: 0, y: 0 };
  const pottedReds: BallId[] = [];

  for (const shot of shots) {
    const object = byId.get(shot.ball);
    if (!object || object.kind === "cue") continue;
    cue = predictLeave(cue, { x: object.x, y: object.y }, shot);
    if (object.kind === "red") pottedReds.push(object.id);
  }

  return { cue, pottedReds };
}
