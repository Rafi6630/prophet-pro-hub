import { calculateRiskScore, type RiskScorePropertyInput } from "@/lib/riskScore";

export function getFraudRiskLevel(input: RiskScorePropertyInput) {
  const riskLevel = calculateRiskScore(input);
  const explanation =
    riskLevel === "Low"
      ? "Listing documents and pricing signals look normal."
      : riskLevel === "Medium"
        ? "Some signals need review before buyer commitment."
        : "Multiple trust signals suggest caution and manual review.";

  return { riskLevel, explanation };
}
