import { describe, expect, it } from "vitest";
import { SPINS } from "../domain/types";
import { SPIN_WORD } from "./spinWords";

describe("SPIN_WORD", () => {
  it("speaks real snooker for every spin value", () => {
    expect(SPIN_WORD.low).toBe("screw");
    expect(SPIN_WORD.centre).toBe("stun");
    expect(SPIN_WORD.top).toBe("top");
  });

  it("covers every spin value", () => {
    for (const spin of SPINS) {
      expect(SPIN_WORD[spin].length).toBeGreaterThan(0);
    }
  });
});
