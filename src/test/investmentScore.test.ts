import { describe, it, expect } from "vitest";
import { calculateInvestmentScore, type InvestmentPropertyInput } from "@/lib/investmentScore";

const base: InvestmentPropertyInput = {
  pricePerSqm:    1000,
  marketAverage:  1200,
  locationGrowth: 60,
  liquidity:      70,
  condition:      75,
};

describe("calculateInvestmentScore", () => {
  it("returns a number between 0 and 100", () => {
    const score = calculateInvestmentScore(base);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns a whole integer", () => {
    const score = calculateInvestmentScore(base);
    expect(score).toBe(Math.round(score));
  });

  it("below-market price raises score", () => {
    const cheap     = calculateInvestmentScore({ ...base, pricePerSqm: 800 });
    const expensive = calculateInvestmentScore({ ...base, pricePerSqm: 1400 });
    expect(cheap).toBeGreaterThan(expensive);
  });

  it("higher location growth raises score", () => {
    const highGrowth = calculateInvestmentScore({ ...base, locationGrowth: 90 });
    const lowGrowth  = calculateInvestmentScore({ ...base, locationGrowth: 20 });
    expect(highGrowth).toBeGreaterThan(lowGrowth);
  });

  it("zero market average falls back without division error", () => {
    const score = calculateInvestmentScore({ ...base, marketAverage: 0 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("perfect inputs approach but do not exceed 100", () => {
    const perfect = calculateInvestmentScore({
      pricePerSqm:    500,
      marketAverage:  1200,
      locationGrowth: 100,
      liquidity:      100,
      condition:      100,
    });
    expect(perfect).toBeLessThanOrEqual(100);
    expect(perfect).toBeGreaterThan(70);
  });

  it("worst-case inputs approach but do not go below 0", () => {
    const worst = calculateInvestmentScore({
      pricePerSqm:    9999,
      marketAverage:  1200,
      locationGrowth: 0,
      liquidity:      0,
      condition:      0,
    });
    expect(worst).toBeGreaterThanOrEqual(0);
    expect(worst).toBeLessThan(30);
  });

  it("liquidity has 20% weight — higher liquidity raises score", () => {
    const high = calculateInvestmentScore({ ...base, liquidity: 100 });
    const low  = calculateInvestmentScore({ ...base, liquidity: 0 });
    expect(high - low).toBeCloseTo(20, 0);
  });

  it("condition has 20% weight — higher condition raises score", () => {
    const high = calculateInvestmentScore({ ...base, condition: 100 });
    const low  = calculateInvestmentScore({ ...base, condition: 0 });
    expect(high - low).toBeCloseTo(20, 0);
  });
});
