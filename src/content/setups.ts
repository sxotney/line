import { SPOTS } from "../ui/geometry";
import type { Setup } from "../domain/types";
import { parseSetups } from "./schema";

const colours = [
  { id: "yellow", kind: "colour" as const, colour: "yellow" as const, ...SPOTS.yellow },
  { id: "green", kind: "colour" as const, colour: "green" as const, ...SPOTS.green },
  { id: "brown", kind: "colour" as const, colour: "brown" as const, ...SPOTS.brown },
  { id: "blue", kind: "colour" as const, colour: "blue" as const, ...SPOTS.blue },
  { id: "pink", kind: "colour" as const, colour: "pink" as const, ...SPOTS.pink },
  { id: "black", kind: "colour" as const, colour: "black" as const, ...SPOTS.black },
];

const raw = [
  {
    id: "open-three",
    ladderIndex: 0,
    title: "Three open reds",
    balls: [
      ...colours,
      { id: "r1", kind: "red", x: 2600, y: 700 },
      { id: "r2", kind: "red", x: 2750, y: 1150 },
      { id: "r3", kind: "red", x: 3050, y: 900 },
      { id: "cue", kind: "cue", x: 1900, y: 900 },
    ],
    coachedLine: [
      { ball: "r1", strength: "medium", spin: "top", why: "Start with the red that leaves you a simple angle on the black. Roll through so you land on it." },
      { ball: "black", strength: "soft", acceptableStrength: ["medium"], spin: "centre", why: "Highest value, and it sits still — take it while the reds are open. Soft stun keeps you close." },
      { ball: "r2", strength: "medium", spin: "centre" },
      { ball: "black", strength: "soft", spin: "centre", why: "The black re-spots, so you can go back to it every time." },
      { ball: "r3", strength: "soft", acceptableStrength: ["medium"], spin: "centre" },
      { ball: "black", strength: "soft", spin: "centre" },
    ],
  },
  {
    id: "awkward-first",
    ladderIndex: 1,
    title: "One red on the cushion",
    balls: [
      ...colours,
      { id: "r1", kind: "red", x: 3300, y: 120 },
      { id: "r2", kind: "red", x: 2700, y: 950 },
      { id: "r3", kind: "red", x: 2500, y: 1200 },
      { id: "cue", kind: "cue", x: 2000, y: 800 },
    ],
    coachedLine: [
      { ball: "r1", strength: "medium", acceptableStrength: ["firm"], spin: "low", why: "Take the awkward one first, while you still have an angle on it. Screw back off the cushion into the open. Leave it to the end and it becomes the shot that stops your break." },
      { ball: "blue", acceptable: ["pink"], strength: "soft", spin: "centre", why: "Blue sits in the middle and opens up the rest of the table. Pink is fine too." },
      { ball: "r2", strength: "medium", spin: "centre" },
      { ball: "black", strength: "soft", acceptableStrength: ["medium"], spin: "centre" },
      { ball: "r3", strength: "medium", spin: "top" },
      { ball: "black", strength: "soft", spin: "centre" },
    ],
  },
  {
    id: "hold-the-pack",
    ladderIndex: 2,
    title: "Two loose, two in a cluster",
    balls: [
      ...colours,
      { id: "r1", kind: "red", x: 2450, y: 500 },
      { id: "r2", kind: "red", x: 2900, y: 1250 },
      { id: "r3", kind: "red", x: 3080, y: 880 },
      { id: "r4", kind: "red", x: 3140, y: 940 },
      { id: "cue", kind: "cue", x: 1800, y: 1080 },
    ],
    coachedLine: [
      { ball: "r1", strength: "medium", spin: "centre", why: "Pot the loose reds first. The cluster is not going anywhere." },
      { ball: "blue", strength: "soft", spin: "centre", why: "Blue keeps you in the middle of the table with a view of everything." },
      { ball: "r2", strength: "medium", spin: "low", why: "Screw back so the pink is on." },
      { ball: "pink", acceptable: ["black"], strength: "medium", spin: "centre", why: "Pink puts you on the right side to split the two reds that are close together." },
      { ball: "r3", strength: "medium", spin: "centre", why: "Now you are on the cluster with a colour to follow." },
      { ball: "black", strength: "soft", spin: "centre" },
      { ball: "r4", strength: "medium", acceptableStrength: ["soft"], spin: "centre" },
      { ball: "black", strength: "soft", spin: "centre" },
    ],
  },
];

export const SETUPS: Setup[] = parseSetups(raw).sort(
  (a, b) => a.ladderIndex - b.ladderIndex,
);
