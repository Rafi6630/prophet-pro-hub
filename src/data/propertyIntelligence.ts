export interface AreaIntelligence {
  schools: string[];
  hospitals: string[];
  roads: string[];
  electricity: "Reliable" | "Improving" | "Mixed";
  water: "Reliable" | "Improving" | "Mixed";
  safety: "High" | "Medium" | "Watch";
  investorSummary: string;
  legalCheckStatus: string;
  nearbyScore: number;
  exitLiquidityScore: number;
  parking: number;
  propertyAge: number;
  videoUrl: string;
}

export const propertyIntelligence: Record<string, AreaIntelligence> = {
  "prop-baghdad-jadriya-villa": {
    schools: ["Baghdad International School", "Al Nibras Private School"],
    hospitals: ["Baghdad Medical City", "Al Yarmouk Specialist Center"],
    roads: ["Al Jadriya Bridge", "Airport Road Connector"],
    electricity: "Reliable",
    water: "Reliable",
    safety: "High",
    investorSummary: "High-trust villa inventory in Jadriya is scarce, which supports resale pricing and strong buyer urgency.",
    legalCheckStatus: "Ownership deed, seller identity, and municipal map reference have all been reviewed.",
    nearbyScore: 91,
    exitLiquidityScore: 84,
    parking: 3,
    propertyAge: 8,
    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
  },
  "prop-erbil-ankawa-apartment": {
    schools: ["Classical School of the Medes", "Ankawa Private School"],
    hospitals: ["CMC Hospital", "Rizgari Hospital"],
    roads: ["100 Meter Road", "Erbil Airport Road"],
    electricity: "Reliable",
    water: "Reliable",
    safety: "High",
    investorSummary: "Verified Ankawa apartments remain one of the easiest products to resell to professionals and diaspora buyers.",
    legalCheckStatus: "Agency verification and tower ownership file are fully approved.",
    nearbyScore: 89,
    exitLiquidityScore: 87,
    parking: 2,
    propertyAge: 5,
    videoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
  },
  "prop-basra-shop-ashar": {
    schools: ["Al Fao Commercial College", "Basra Model School"],
    hospitals: ["Basra Teaching Hospital", "Al Sadr Hospital"],
    roads: ["Corniche Road", "Al Ashar Main Street"],
    electricity: "Improving",
    water: "Mixed",
    safety: "Medium",
    investorSummary: "This corridor is strongest for owner-operators and service retail seeking daily footfall and fast resale liquidity.",
    legalCheckStatus: "Ownership file reviewed, tax clearance refreshed, price benchmark manually checked.",
    nearbyScore: 83,
    exitLiquidityScore: 89,
    parking: 1,
    propertyAge: 10,
    videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
  },
};
