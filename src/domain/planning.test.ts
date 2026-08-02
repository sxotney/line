import { describe, expect, it } from "vitest";
import {
  appendShot, expectedKindAt, isLineComplete, tappableBalls, undoTap,
} from "./planning";
import type { BallId, Setup, Shot } from "./types";

const setup: Setup = {
  id: "s1",
  ladderIndex: 0,
  lesson: "positional-play",
  balls: [
    { id: "r1", kind: "red", x: 1, y: 1 },
    { id: "r2", kind: "red", x: 2, y: 2 },
    { id: "black", kind: "colour", colour: "black", x: 3, y: 3 },
    { id: "blue", kind: "colour", colour: "blue", x: 4, y: 4 },
    { id: "cue", kind: "cue", x: 5, y: 5 },
  ],
  coachedLine: [
    { ball: "r1", strength: "medium", spin: "centre" },
    { ball: "black", strength: "soft", spin: "centre" },
    { ball: "r2", strength: "medium", spin: "centre" },
    { ball: "blue", strength: "soft", spin: "centre" },
  ],
};

// Strength/spin/pocket never affect legality — any values do in these tests.
const shot = (ball: BallId): Shot => ({
  ball, strength: 50, spin: "centre", pocket: "top-right",
});
const line = (...balls: BallId[]): Shot[] => balls.map(shot);

describe("expectedKindAt", () => {
  it("alternates red at even indices and colour at odd", () => {
    expect(expectedKindAt(0)).toBe("red");
    expect(expectedKindAt(1)).toBe("colour");
    expect(expectedKindAt(2)).toBe("red");
  });
});

describe("tappableBalls", () => {
  it("offers only unpotted reds at the start", () => {
    expect(tappableBalls(setup, [])).toEqual(["r1", "r2"]);
  });

  it("offers only colours after a red", () => {
    expect(tappableBalls(setup, line("r1"))).toEqual(["black", "blue"]);
  });

  it("excludes reds already taken", () => {
    expect(tappableBalls(setup, line("r1", "black"))).toEqual(["r2"]);
  });

  it("offers colours again because they re-spot", () => {
    expect(tappableBalls(setup, line("r1", "black", "r2"))).toEqual([
      "black", "blue",
    ]);
  });

  it("never offers the cue ball", () => {
    expect(tappableBalls(setup, []).includes("cue")).toBe(false);
  });

  it("offers nothing once the line is complete", () => {
    expect(tappableBalls(setup, line("r1", "black", "r2", "blue"))).toEqual([]);
  });
});

describe("appendShot", () => {
  it("appends a legal shot", () => {
    expect(appendShot(setup, [], shot("r1"))).toEqual([shot("r1")]);
  });

  it("ignores a shot on an illegal ball", () => {
    expect(appendShot(setup, [], shot("black"))).toEqual([]);
    expect(appendShot(setup, line("r1", "black"), shot("r1"))).toEqual(
      line("r1", "black"),
    );
  });

  it("keeps the chosen strength and spin on the appended shot", () => {
    const chosen: Shot = {
      ball: "r1", strength: 85, spin: "low", pocket: "bottom-middle",
    };
    expect(appendShot(setup, [], chosen)).toEqual([chosen]);
  });
});

describe("undoTap", () => {
  it("removes the last shot", () => {
    expect(undoTap(line("r1", "black"))).toEqual(line("r1"));
  });

  it("is safe on an empty line", () => {
    expect(undoTap([])).toEqual([]);
  });
});

describe("isLineComplete", () => {
  it("is true only when the line matches the coached line length", () => {
    expect(isLineComplete(setup, line("r1", "black", "r2"))).toBe(false);
    expect(isLineComplete(setup, line("r1", "black", "r2", "blue"))).toBe(true);
  });
});
