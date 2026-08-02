import { describe, expect, it } from "vitest";
import { parseSetup } from "./schema";

const valid = {
  id: "s1",
  ladderIndex: 0,
  balls: [
    { id: "r1", kind: "red", x: 100, y: 100 },
    { id: "r2", kind: "red", x: 200, y: 200 },
    { id: "black", kind: "colour", colour: "black", x: 300, y: 300 },
    { id: "cue", kind: "cue", x: 400, y: 400 },
  ],
  coachedLine: [
    { ball: "r1" }, { ball: "black" }, { ball: "r2" }, { ball: "black" },
  ],
};

describe("parseSetup", () => {
  it("accepts a well-formed setup", () => {
    expect(parseSetup(valid).id).toBe("s1");
  });

  it("rejects duplicate ball ids", () => {
    const bad = {
      ...valid,
      balls: [...valid.balls, { id: "r1", kind: "red", x: 1, y: 1 }],
    };
    expect(() => parseSetup(bad)).toThrow(/duplicate/i);
  });

  it("rejects a coached line referencing a ball not on the table", () => {
    const bad = { ...valid, coachedLine: [{ ball: "ghost" }] };
    expect(() => parseSetup(bad)).toThrow(/not on the table/i);
  });

  it("rejects a coached line that does not alternate red then colour", () => {
    const bad = {
      ...valid,
      coachedLine: [{ ball: "r1" }, { ball: "r2" }],
    };
    expect(() => parseSetup(bad)).toThrow(/alternate/i);
  });

  it("rejects a coached line that does not start with a red", () => {
    const bad = { ...valid, coachedLine: [{ ball: "black" }, { ball: "r1" }] };
    expect(() => parseSetup(bad)).toThrow(/alternate/i);
  });

  it("rejects an acceptable entry not on the table", () => {
    const bad = {
      ...valid,
      coachedLine: [
        { ball: "r1", acceptable: ["ghost"] },
        { ball: "black" }, { ball: "r2" }, { ball: "black" },
      ],
    };
    expect(() => parseSetup(bad)).toThrow(/not on the table/i);
  });

  it("rejects a colour ball with no colour field", () => {
    const bad = {
      ...valid,
      balls: [
        { id: "r1", kind: "red", x: 1, y: 1 },
        { id: "r2", kind: "red", x: 2, y: 2 },
        { id: "black", kind: "colour", x: 3, y: 3 },
        { id: "cue", kind: "cue", x: 4, y: 4 },
      ],
    };
    expect(() => parseSetup(bad)).toThrow();
  });

  it("rejects a setup without exactly one cue ball", () => {
    const bad = { ...valid, balls: valid.balls.filter((b) => b.kind !== "cue") };
    expect(() => parseSetup(bad)).toThrow(/cue/i);
  });
});
