import { describe, expect, it } from "vitest";
import { ballNamer } from "./ballNames";
import type { Setup } from "../domain/types";

const setup: Setup = {
  id: "s1",
  ladderIndex: 0,
  balls: [
    { id: "a", kind: "red", x: 1, y: 1 },
    { id: "black", kind: "colour", colour: "black", x: 2, y: 2 },
    { id: "b", kind: "red", x: 3, y: 3 },
    { id: "cue", kind: "cue", x: 4, y: 4 },
  ],
  coachedLine: [
    { ball: "a", strength: "medium", spin: "centre" },
    { ball: "black", strength: "soft", spin: "centre" },
  ],
};

describe("ballNamer", () => {
  const name = ballNamer(setup);

  it("numbers reds by their order in setup.balls", () => {
    expect(name("a")).toBe("red 1");
    expect(name("b")).toBe("red 2");
  });

  it("names colours by their colour", () => {
    expect(name("black")).toBe("black");
  });

  it("names the cue ball and unknown ids sensibly", () => {
    expect(name("cue")).toBe("cue ball");
    expect(name("ghost")).toBe("ghost");
  });
});
