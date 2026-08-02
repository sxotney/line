import { describe, expect, it } from "vitest";
import { strengthBand } from "./leave";

describe("strengthBand", () => {
  it("maps the soft band: 0–33", () => {
    expect(strengthBand(0)).toBe("soft");
    expect(strengthBand(33)).toBe("soft");
  });

  it("maps the medium band: 34–66", () => {
    expect(strengthBand(34)).toBe("medium");
    expect(strengthBand(66)).toBe("medium");
  });

  it("maps the firm band: 67–100", () => {
    expect(strengthBand(67)).toBe("firm");
    expect(strengthBand(100)).toBe("firm");
  });
});
