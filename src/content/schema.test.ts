import { describe, expect, it } from "vitest";
import { parseSetup, parseSetups } from "./schema";

const valid = {
  id: "s1",
  ladderIndex: 0,
  lesson: "positional-play",
  balls: [
    { id: "r1", kind: "red", x: 100, y: 100 },
    { id: "r2", kind: "red", x: 200, y: 200 },
    { id: "black", kind: "colour", colour: "black", x: 300, y: 300 },
    { id: "cue", kind: "cue", x: 400, y: 400 },
  ],
  coachedLine: [
    { ball: "r1", strength: "medium", spin: "centre" }, { ball: "black", strength: "soft", spin: "centre" }, { ball: "r2", strength: "medium", spin: "centre" }, { ball: "black", strength: "soft", spin: "centre" },
  ],
};

describe("parseSetup", () => {
  it("accepts a well-formed setup", () => {
    expect(parseSetup(valid).id).toBe("s1");
  });

  it("accepts every Lesson in the fixed set", () => {
    for (const lesson of [
      "positional-play", "cluster", "cushion-work",
      "awkward-ball-first", "colour-choice",
    ]) {
      expect(parseSetup({ ...valid, lesson }).lesson).toBe(lesson);
    }
  });

  it("rejects a lesson outside the fixed set", () => {
    expect(() => parseSetup({ ...valid, lesson: "trick-shots" })).toThrow();
  });

  it("rejects a setup with no lesson", () => {
    const { lesson: _lesson, ...noLesson } = valid;
    expect(() => parseSetup(noLesson)).toThrow();
  });

  it("accepts an authored pocket and acceptable pockets", () => {
    const withPocket = {
      ...valid,
      coachedLine: [
        { ...valid.coachedLine[0], pocket: "top-right", acceptablePocket: ["top-middle"] },
        ...valid.coachedLine.slice(1),
      ],
    };
    expect(parseSetup(withPocket).coachedLine[0].pocket).toBe("top-right");
  });

  it("rejects a pocket outside the fixed six, in either field", () => {
    const badPocket = {
      ...valid,
      coachedLine: [
        { ...valid.coachedLine[0], pocket: "side" },
        ...valid.coachedLine.slice(1),
      ],
    };
    expect(() => parseSetup(badPocket)).toThrow();
    const badAcceptable = {
      ...valid,
      coachedLine: [
        { ...valid.coachedLine[0], pocket: "top-right", acceptablePocket: ["side"] },
        ...valid.coachedLine.slice(1),
      ],
    };
    expect(() => parseSetup(badAcceptable)).toThrow();
  });

  it("rejects duplicate ball ids", () => {
    const bad = {
      ...valid,
      balls: [...valid.balls, { id: "r1", kind: "red", x: 1, y: 1 }],
    };
    expect(() => parseSetup(bad)).toThrow(/duplicate/i);
  });

  it("rejects a coached line referencing a ball not on the table", () => {
    const bad = { ...valid, coachedLine: [{ ball: "ghost", strength: "medium", spin: "centre" }] };
    expect(() => parseSetup(bad)).toThrow(/not on the table/i);
  });

  it("rejects a coached line that does not alternate red then colour", () => {
    const bad = {
      ...valid,
      coachedLine: [{ ball: "r1", strength: "medium", spin: "centre" }, { ball: "r2", strength: "medium", spin: "centre" }],
    };
    expect(() => parseSetup(bad)).toThrow(/alternate/i);
  });

  it("rejects a coached line that does not start with a red", () => {
    const bad = { ...valid, coachedLine: [{ ball: "black", strength: "soft", spin: "centre" }, { ball: "r1", strength: "medium", spin: "centre" }] };
    expect(() => parseSetup(bad)).toThrow(/alternate/i);
  });

  it("rejects an acceptable entry not on the table", () => {
    const bad = {
      ...valid,
      coachedLine: [
        { ball: "r1", acceptable: ["ghost"], strength: "medium", spin: "centre" },
        { ball: "black", strength: "soft", spin: "centre" }, { ball: "r2", strength: "medium", spin: "centre" }, { ball: "black", strength: "soft", spin: "centre" },
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

  it("rejects a setup with two cue balls", () => {
    const bad = {
      ...valid,
      balls: [...valid.balls, { id: "cue2", kind: "cue", x: 500, y: 500 }],
    };
    expect(() => parseSetup(bad)).toThrow(/cue/i);
  });

  it("rejects an empty coached line", () => {
    const bad = { ...valid, coachedLine: [] };
    expect(() => parseSetup(bad)).toThrow();
  });

  it("rejects a step with no strength or spin", () => {
    const bad = {
      ...valid,
      coachedLine: [
        { ball: "r1" },
        { ball: "black", strength: "soft", spin: "centre" },
      ],
    };
    expect(() => parseSetup(bad)).toThrow();
  });

  it("rejects a strength or spin outside the allowed values", () => {
    const badStrength = {
      ...valid,
      coachedLine: [{ ball: "r1", strength: "smash", spin: "centre" }],
    };
    expect(() => parseSetup(badStrength)).toThrow();

    const badSpin = {
      ...valid,
      coachedLine: [{ ball: "r1", strength: "medium", spin: "side" }],
    };
    expect(() => parseSetup(badSpin)).toThrow();
  });

  it("accepts acceptableStrength and acceptableSpin variants", () => {
    const withVariants = {
      ...valid,
      coachedLine: [
        {
          ball: "r1", strength: "medium", acceptableStrength: ["firm"],
          spin: "low", acceptableSpin: ["centre"],
        },
        { ball: "black", strength: "soft", spin: "centre" },
      ],
    };
    const parsed = parseSetup(withVariants);
    expect(parsed.coachedLine[0].acceptableStrength).toEqual(["firm"]);
    expect(parsed.coachedLine[0].acceptableSpin).toEqual(["centre"]);
  });
});

describe("parseSetups", () => {
  it("parses an array of valid setups", () => {
    const other = { ...valid, id: "s2" };
    const result = parseSetups([valid, other]);
    expect(result.map((s) => s.id)).toEqual(["s1", "s2"]);
  });

  it("rejects an array containing an invalid setup", () => {
    const bad = { ...valid, coachedLine: [] };
    expect(() => parseSetups([valid, bad])).toThrow();
  });
});
