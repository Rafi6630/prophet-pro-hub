import { describe, it, expect } from "vitest";
import { estimateFairPrice, type FairPricePropertyInput } from "@/lib/fairPrice";

const base: FairPricePropertyInput = {
  size:          200,
  marketAverage: 1200,
  condition:     "average",
  areaDemand:    50,
};

describe("estimateFairPrice", () => {
  it("returns a positive number for valid inputs", () => {
    const result = estimateFairPrice(base);
    expect(result).toBeGreaterThan(0);
  });

  it("base case: 200 m² × $1200/m² × avg demand × average condition", () => {
    const result = estimateFairPrice(base);
    // demandMultiplier = 0.9 + 50/500 = 1.0
    // conditionMultiplier = 1.0
    // base = 200 * 1200 = 240_000
    expect(result).toBeCloseTo(240_000, -2);
  });

  it("excellent condition increases price", () => {
    const excellent = estimateFairPrice({ ...base, condition: "excellent" });
    const average   = estimateFairPrice({ ...base, condition: "average" });
    expect(excellent).toBeGreaterThan(average);
  });

  it("poor condition decreases price", () => {
    const poor    = estimateFairPrice({ ...base, condition: "poor" });
    const average = estimateFairPrice({ ...base, condition: "average" });
    expect(poor).toBeLessThan(average);
  });

  it("condition multipliers are in correct order: poor < average < good < excellent", () => {
    const poor      = estimateFairPrice({ ...base, condition: "poor" });
    const average   = estimateFairPrice({ ...base, condition: "average" });
    const good      = estimateFairPrice({ ...base, condition: "good" });
    const excellent = estimateFairPrice({ ...base, condition: "excellent" });
    expect(poor).toBeLessThan(average);
    expect(average).toBeLessThan(good);
    expect(good).toBeLessThan(excellent);
  });

  it("areaDemand clamped at 0 — does not go negative", () => {
    const result = estimateFairPrice({ ...base, areaDemand: -50 });
    // Should treat areaDemand as 0 → demandMultiplier = 0.9
    expect(result).toBeGreaterThan(0);
    expect(result).toBeCloseTo(200 * 1200 * 0.9, -2);
  });

  it("areaDemand clamped at 100 — max demand multiplier is 1.1", () => {
    const high = estimateFairPrice({ ...base, areaDemand: 200 });
    const cap  = estimateFairPrice({ ...base, areaDemand: 100 });
    expect(high).toBeCloseTo(cap, -2);
  });

  it("returns a whole number (no decimals)", () => {
    const result = estimateFairPrice(base);
    expect(result).toBe(Math.round(result));
  });

  it("zero market average returns 0", () => {
    const result = estimateFairPrice({ ...base, marketAverage: 0 });
    expect(result).toBe(0);
  });

  it("larger area produces proportionally larger price", () => {
    const small = estimateFairPrice({ ...base, size: 100 });
    const large = estimateFairPrice({ ...base, size: 200 });
    expect(large / small).toBeCloseTo(2, 1);
  });
});
