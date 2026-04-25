/**
 * usePlanLimits — single source of truth for all plan-enforced limits.
 *
 * Free:  5 favorites max · 3 offers/month · basic search only
 * Pro:   unlimited favorites & offers · analytics · CRM · priority alerts
 * Elite: everything in Pro + investor tools · deposit verification · proof-of-funds
 */
import { useSubscription } from "@/hooks/useSubscription";
import { useMyOffers } from "@/hooks/useOffers";
import { useFavorites } from "@/hooks/useFavorites";

export const PLAN_LIMITS = {
  free:  { maxFavorites: 5,        maxOffersPerMonth: 3   },
  pro:   { maxFavorites: Infinity, maxOffersPerMonth: Infinity },
  elite: { maxFavorites: Infinity, maxOffersPerMonth: Infinity },
} as const;

export function usePlanLimits() {
  const { tier } = useSubscription();
  const { data: favorites = [] } = useFavorites();
  const { data: offers = [] } = useMyOffers();

  const limits = PLAN_LIMITS[tier];

  // Count offers made this calendar month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const offersThisMonth = offers.filter(
    (o) => new Date(o.created_at) >= monthStart
  ).length;

  return {
    tier,

    // Favorites
    favoritesUsed:       favorites.length,
    maxFavorites:        limits.maxFavorites,
    canSaveFavorite:     favorites.length < limits.maxFavorites,
    favoritesRemaining:  Math.max(0, limits.maxFavorites === Infinity ? Infinity : limits.maxFavorites - favorites.length),

    // Offers
    offersThisMonth,
    maxOffersPerMonth:   limits.maxOffersPerMonth,
    canSendOffer:        offersThisMonth < limits.maxOffersPerMonth,
    offersRemaining:     Math.max(0, limits.maxOffersPerMonth === Infinity ? Infinity : limits.maxOffersPerMonth - offersThisMonth),

    // Feature flags
    canAccessAnalytics:     tier === "pro" || tier === "elite",
    canAccessCRM:           tier === "pro" || tier === "elite",
    canAccessPriorityAlerts:tier === "pro" || tier === "elite",
    canAccessInvestorTools: tier === "elite",
    canUseDepositVerification: tier === "elite",
    canUploadProofOfFunds:  tier === "elite",
    hasDedicatedSupport:    tier === "elite",
  };
}
