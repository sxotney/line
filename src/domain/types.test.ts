import { describe, expect, it } from "vitest";
import { COLOURS, TABLE } from "./types";

describe("domain constants", () => {
  it("lists the six colours in ascending value order", () => {
    expect(COLOURS).toEqual([
      "yellow", "green", "brown", "blue", "pink", "black",
    ]);
  });

  it("describes a full-size play area in millimetres", () => {
    expect(TABLE).toEqual({ width: 3569, height: 1778 });
  });
});
