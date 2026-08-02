import { describe, expect, it } from "vitest";
import {
  appendTap, expectedKindAt, isLineComplete, tappableBalls, undoTap,
} from "./planning";
import type { Setup } from "./types";

const setup: Setup = {
  id: "s1",
  ladderIndex: 0,
  balls: [
    { id: "r1", kind: "red", x: 1, y: 1 },
    { id: "r2", kind: "red", x: 2, y: 2 },
    { id: "black", kind: "colour", colour: "black", x: 3, y: 3 },
    { id: "blue", kind: "colour", colour: "blue", x: 4, y: 4 },
    { id: "cue", kind: "cue", x: 5, y: 5 },
  ],
  coachedLine: [
    { ball: "r1" }, { ball: "black" }, { ball: "r2" }, { ball: "blue" },
  ],
};

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
    expect(tappableBalls(setup, ["r1"])).toEqual(["black", "blue"]);
  });

  it("excludes reds already taken", () => {
    expect(tappableBalls(setup, ["r1", "black"])).toEqual(["r2"]);
  });

  it("offers colours again because they re-spot", () => {
    expect(tappableBalls(setup, ["r1", "black", "r2"])).toEqual([
      "black", "blue",
    ]);
  });

  it("never offers the cue ball", () => {
    expect(tappableBalls(setup, []).includes("cue")).toBe(false);
  });

  it("offers nothing once the line is complete", () => {
    expect(tappableBalls(setup, ["r1", "black", "r2", "blue"])).toEqual([]);
  });
});

describe("appendTap", () => {
  it("appends a legal tap", () => {
    expect(appendTap(setup, [], "r1")).toEqual(["r1"]);
  });

  it("ignores an illegal tap", () => {
    expect(appendTap(setup, [], "black")).toEqual([]);
    expect(appendTap(setup, ["r1", "black"], "r1")).toEqual(["r1", "black"]);
  });
});

describe("undoTap", () => {
  it("removes the last tap", () => {
    expect(undoTap(["r1", "black"])).toEqual(["r1"]);
  });

  it("is safe on an empty line", () => {
    expect(undoTap([])).toEqual([]);
  });
});

describe("isLineComplete", () => {
  it("is true only when the line matches the coached line length", () => {
    expect(isLineComplete(setup, ["r1", "black", "r2"])).toBe(false);
    expect(isLineComplete(setup, ["r1", "black", "r2", "blue"])).toBe(true);
  });
});
