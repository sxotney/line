import { describe, expect, it } from "vitest";
import { nextIndex } from "./ladder";

describe("nextIndex", () => {
  it("advances through the ladder", () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(1, 3)).toBe(2);
  });

  it("stops at the last setup rather than wrapping", () => {
    expect(nextIndex(2, 3)).toBe(2);
  });

  it("is safe for an empty ladder", () => {
    expect(nextIndex(0, 0)).toBe(0);
  });
});
