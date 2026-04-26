import { describe, it, expect } from "vitest";
import { calculateRiskScore, type RiskScorePropertyInput } from "@/lib/riskScore";
import { getFraudRiskLevel } from "@/lib/fraudRisk";

const clean: RiskScorePropertyInput = {
  hasMissingDocuments:    false,
  sellerVerified:         true,
  suspiciouslyLowPrice:   false,
  hasLegalIssues:         false,
};

describe("calculateRiskScore", () => {
  it("clean listing returns Low", () => {
    expect(calculateRiskScore(clean)).toBe("Low");
  });

  it("unverified seller alone → Medium (score = 20)", () => {
    expect(calculateRiskScore({ ...clean, sellerVerified: false })).toBe("Medium");
  });

  it("missing documents alone → Medium (score = 35)", () => {
    expect(calculateRiskScore({ ...clean, hasMissingDocuments: true })).toBe("Medium");
  });

  it("legal issues alone → High (score = 40)", () => {
    expect(calculateRiskScore({ ...clean, hasLegalIssues: true })).toBe("High");
  });

  it("all flags set → High (score ≥ 115)", () => {
    const all: RiskScorePropertyInput = {
      hasMissingDocuments:  true,
      sellerVerified:       false,
      suspiciouslyLowPrice: true,
      hasLegalIssues:       true,
    };
    expect(calculateRiskScore(all)).toBe("High");
  });

  it("suspiciously low price alone → Low (score = 20, below Medium threshold)", () => {
    // 20 points < 25 threshold → still Low
    expect(calculateRiskScore({ ...clean, suspiciouslyLowPrice: true })).toBe("Low");
  });

  it("low price + unverified → Medium (score = 40)", () => {
    expect(calculateRiskScore({
      ...clean,
      suspiciouslyLowPrice: true,
      sellerVerified: false,
    })).toBe("Medium");
  });

  it("missing docs + unverified → High (score = 55 → exactly at High threshold)", () => {
    expect(calculateRiskScore({
      ...clean,
      hasMissingDocuments: true,
      sellerVerified: false,
    })).toBe("High");
  });
});

describe("getFraudRiskLevel", () => {
  it("returns riskLevel and explanation for Low", () => {
    const result = getFraudRiskLevel(clean);
    expect(result.riskLevel).toBe("Low");
    expect(typeof result.explanation).toBe("string");
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it("returns High risk with explanation for worst case", () => {
    const result = getFraudRiskLevel({
      hasMissingDocuments:  true,
      sellerVerified:       false,
      suspiciouslyLowPrice: true,
      hasLegalIssues:       true,
    });
    expect(result.riskLevel).toBe("High");
    expect(result.explanation).toContain("caution");
  });

  it("explanation differs for each risk level", () => {
    const low  = getFraudRiskLevel(clean).explanation;
    const high = getFraudRiskLevel({ ...clean, hasLegalIssues: true }).explanation;
    expect(low).not.toBe(high);
  });
});
