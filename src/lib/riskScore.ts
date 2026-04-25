export interface RiskScorePropertyInput {
  hasMissingDocuments: boolean;
  sellerVerified: boolean;
  suspiciouslyLowPrice: boolean;
  hasLegalIssues: boolean;
}

export type PropertyRiskLevel = "Low" | "Medium" | "High";

export function calculateRiskScore(property: RiskScorePropertyInput): PropertyRiskLevel {
  let score = 0;

  if (property.hasMissingDocuments) score += 35;
  if (!property.sellerVerified) score += 20;
  if (property.suspiciouslyLowPrice) score += 20;
  if (property.hasLegalIssues) score += 40;

  if (score >= 55) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}
