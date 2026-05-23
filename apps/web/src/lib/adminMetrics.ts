// src/lib/adminMetrics.ts

export type AdminUserMetrics = {
  completed_jobs?: number;
  disputes_lost?: number;
  avg_rating?: number;
  verification_level?: string;
};

export function trustScore(user: AdminUserMetrics): number {
  let score = 300;

  score += (user.completed_jobs || 0) * 15;

  score -= (user.disputes_lost || 0) * 40;

  score += Math.floor((user.avg_rating || 0) * 50);

  if (user.verification_level === "advanced") {
    score += 120;
  }

  if (user.verification_level === "basic") {
    score += 40;
  }

  if (score > 1000) score = 1000;

  if (score < 0) score = 0;

  return score;
}

export function calculateRisk(user: AdminUserMetrics): number {
  let risk = 50;

  risk += (user.disputes_lost || 0) * 15;

  risk -= (user.completed_jobs || 0) * 2;

  risk -= Math.floor((user.avg_rating || 0) * 5);

  if (risk < 0) risk = 0;

  if (risk > 100) risk = 100;

  return risk;
}

export function getTrustTier(score: number): string {
  if (score >= 900) return "Diamond";

  if (score >= 750) return "Platinum";

  if (score >= 600) return "Gold";

  if (score >= 450) return "Silver";

  if (score >= 300) return "Bronze";

  return "Starter";
}

export function getRiskLevel(risk: number): string {
  if (risk <= 20) return "LOW";

  if (risk <= 50) return "MEDIUM";

  if (risk <= 75) return "HIGH";

  return "CRITICAL";
}
