import { BALL_RADIUS, POCKET_CENTRES } from "../ui/geometry";
import {
  POCKETS, TABLE,
  type BallId, type Pocket, type Setup, type Shot, type Strength,
} from "./types";

// Alex sets strength on a continuous 0–100 slider; coaching and judging
// happen in the three named bands marked on its track (CONTEXT.md,
// "Strength band"): soft [0–33], medium (33–66], firm (66–100].
export function strengthBand(value: number): Strength {
  if (value <= 33) return "soft";
  if (value <= 66) return "medium";
  return "firm";
}

export interface Point {
  x: number;
  y: number;
}

// The Simulated table: where the white sits, which reds are down, and the
// route the white took on the LATEST shot (start → contact → cushion kiss
// if any → rest) so the UI can animate the real path. Display only —
// never judged (ADR 0005).
export interface SimulatedTable {
  cue: Point;
  pottedReds: BallId[];
  path: Point[];
}

// The ideal rolling-ball model (the one behind the "30-degree rule").
// After an equal-mass contact the object ball takes the line-of-centres
// component; the white keeps the tangent component sinθ·t̂. Retained
// top/back spin then pulls it along its ORIGINAL direction (the spin axis
// doesn't know where the pocket is): once natural roll re-establishes,
// v_final = (5/7)·sinθ·t̂ ± (2/7)·d̂. Travel scales with that retained
// speed, so a thin cut runs much further than a full-ball hit.
const ROLL_RETENTION = 5 / 7;
const SPIN_PULL = 2 / 7;
// Tuning knobs, expected to be adjusted after watching Alex use it. The
// relational test style keeps retuning cheap.
// Sized so a firm straight follow (2/7 retention) still runs ~1.7m.
const MAX_TRAVEL = 7000; // mm at strength 100 with all speed retained
const CUSHION_RESTITUTION = 0.5; // a cushion eats about half the run

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const length = (v: Point) => Math.hypot(v.x, v.y);
const scale = (v: Point, k: number): Point => ({ x: v.x * k, y: v.y * k });
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;

function normalize(v: Point): Point {
  const len = length(v);
  return len === 0 ? { x: 0, y: 0 } : scale(v, 1 / len);
}

// The Suggested pocket: the easiest pot — straightest cut from where the
// white sits, ties broken by distance. Prefilled as every Shot's pocket;
// the pot always succeeds — this is a planning aid, never a pot judge
// (ADR 0005).
export function suggestedPocket(cue: Point, object: Point): Pocket {
  const incoming = normalize(sub(object, cue));
  let best: Pocket = POCKETS[0];
  let bestCos = -Infinity;
  let bestDistance = Infinity;
  for (const id of POCKETS) {
    const toPocket = sub(POCKET_CENTRES[id], object);
    const pocketDistance = length(toPocket);
    if (pocketDistance === 0) continue;
    const cos = dot(incoming, scale(toPocket, 1 / pocketDistance));
    if (
      cos > bestCos + 1e-9 ||
      (Math.abs(cos - bestCos) <= 1e-9 && pocketDistance < bestDistance)
    ) {
      best = id;
      bestCos = cos;
      bestDistance = pocketDistance;
    }
  }
  return best;
}

// One cushion reflection per axis at most, then a clamp backstop — enough
// for a kid-plausible overhit, deliberately not multi-cushion physics.
// Walks the run segment by segment so every cushion kiss becomes a
// waypoint; the final rest is identical to mirroring the endpoint.
function runWithCushions(start: Point, dir: Point, travel: number): Point[] {
  const min = BALL_RADIUS;
  const maxX = TABLE.width - BALL_RADIUS;
  const maxY = TABLE.height - BALL_RADIUS;

  const waypoints: Point[] = [];
  let p = start;
  let d = dir;
  let remaining = travel;
  let xBounce = true;
  let yBounce = true;

  while (remaining > 1e-9 && (xBounce || yBounce)) {
    const toX = d.x > 0 ? (maxX - p.x) / d.x : d.x < 0 ? (min - p.x) / d.x : Infinity;
    const toY = d.y > 0 ? (maxY - p.y) / d.y : d.y < 0 ? (min - p.y) / d.y : Infinity;
    const tX = xBounce && toX > 1e-9 ? toX : Infinity;
    const tY = yBounce && toY > 1e-9 ? toY : Infinity;
    const t = Math.min(tX, tY);
    if (t >= remaining) break;

    p = add(p, scale(d, t));
    if (Math.abs(tX - t) < 1e-9) {
      p = { ...p, x: d.x > 0 ? maxX : min };
      d = { x: -d.x, y: d.y };
      xBounce = false;
    }
    if (Math.abs(tY - t) < 1e-9) {
      p = { ...p, y: d.y > 0 ? maxY : min };
      d = { x: d.x, y: -d.y };
      yBounce = false;
    }
    waypoints.push(p);
    remaining = (remaining - t) * CUSHION_RESTITUTION;
  }

  const rest = add(p, scale(d, remaining));
  waypoints.push({
    x: Math.min(Math.max(rest.x, min), maxX),
    y: Math.min(Math.max(rest.y, min), maxY),
  });
  return waypoints;
}

// Where one shot leaves the white, as the waypoints it travels (excluding
// its starting point): contact, any cushion kiss, rest. The pot succeeds
// into the natural pocket; the white arrives at the ghost-ball contact
// point and departs along the tangent line, bent toward the pot line by
// top and away by low, running a distance set by the raw strength value.
function predictLeave(cue: Point, object: Point, shot: Shot): Point[] {
  const pocket = POCKET_CENTRES[shot.pocket];
  const potDir = normalize(sub(pocket, object));
  const contact = add(object, scale(potDir, -BALL_RADIUS * 2));
  const incoming = normalize(sub(contact, cue));

  // The stun departure: the tangent — the component of the incoming
  // direction perpendicular to the pot line, magnitude sinθ. Zero for a
  // dead-straight pot; nearly everything for a thin cut.
  const tangent = sub(incoming, scale(potDir, dot(incoming, potDir)));

  let departure: Point;
  switch (shot.spin) {
    case "centre":
      departure = tangent;
      break;
    case "top":
      departure = add(scale(tangent, ROLL_RETENTION), scale(incoming, SPIN_PULL));
      break;
    case "low":
      departure = sub(scale(tangent, ROLL_RETENTION), scale(incoming, SPIN_PULL));
      break;
  }

  // A dead-straight stun leaves only floating-point noise in the departure
  // — treat anything below this as "the white stops where it strikes"
  // rather than normalizing noise into a full-speed run.
  if (length(departure) < 1e-6) {
    return [contact];
  }
  const direction = normalize(departure);

  // |departure| is the fraction of the white's speed that survives the
  // contact — the run length carries it, so thin cuts travel further.
  const travel = (shot.strength / 100) * MAX_TRAVEL * length(departure);
  return [contact, ...runWithCushions(contact, direction, travel)];
}

// Replay Alex's shots from the Setup's starting position. Every chosen
// ball pots: reds come off the table, colours re-spot (their authored spot
// is where they always sit), and the white walks the break Leave by Leave.
export function simulateLine(setup: Setup, shots: Shot[]): SimulatedTable {
  const byId = new Map(setup.balls.map((b) => [b.id, b]));
  const start = setup.balls.find((b) => b.kind === "cue");

  let cue: Point = start ? { x: start.x, y: start.y } : { x: 0, y: 0 };
  const pottedReds: BallId[] = [];
  let path: Point[] = [];

  for (const shot of shots) {
    const object = byId.get(shot.ball);
    if (!object || object.kind === "cue") continue;
    const waypoints = predictLeave(cue, { x: object.x, y: object.y }, shot);
    path = [cue, ...waypoints];
    cue = waypoints[waypoints.length - 1]!;
    if (object.kind === "red") pottedReds.push(object.id);
  }

  return { cue, pottedReds, path };
}
