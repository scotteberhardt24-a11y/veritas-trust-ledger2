/**
 * TruScore Calculation Engine
 * Composite reputation score from 0–1000 based on 10 weighted factors.
 */

const WEIGHTS = {
  identityVerified:       40,   // KYC / ID verification
  accountAgeMonths:        2,   // per month, capped at 24
  successfulTransactions:  5,   // per successful tx
  disputeRate:           -20,   // per dispute (penalty)
  peerReviews:             3,   // per positive review
  verifiedEvidence:        6,   // per verified evidence submission
  truthConfirmations:      8,   // per confirmed truth claim
  misinformationFlags:   -30,   // per misinformation flag (penalty)
  networkTrust:           10,   // network-wide trust multiplier
  ledgerIntegrity:        25,   // hash-chain integrity score
};

function calculateTruScore(metrics) {
  let score = 0;
  score += (metrics.identityVerified ? 1 : 0) * WEIGHTS.identityVerified;
  score += Math.min(metrics.accountAgeMonths || 0, 24) * WEIGHTS.accountAgeMonths;
  score += (metrics.successfulTransactions || 0) * WEIGHTS.successfulTransactions;
  score += (metrics.disputeRate || 0) * WEIGHTS.disputeRate;
  score += (metrics.peerReviews || 0) * WEIGHTS.peerReviews;
  score += (metrics.verifiedEvidence || 0) * WEIGHTS.verifiedEvidence;
  score += (metrics.truthConfirmations || 0) * WEIGHTS.truthConfirmations;
  score += (metrics.misinformationFlags || 0) * WEIGHTS.misinformationFlags;
  score += (metrics.networkTrust || 0) * WEIGHTS.networkTrust;
  score += (metrics.ledgerIntegrity || 0) * WEIGHTS.ledgerIntegrity;
  return Math.max(0, Math.min(Math.round(score), 1000));
}

function getTierFromScore(score) {
  if (score >= 900) return "Diamond";
  if (score >= 750) return "Platinum";
  if (score >= 550) return "Gold";
  if (score >= 350) return "Silver";
  if (score >= 150) return "Bronze";
  return "Starter";
}

module.exports = { calculateTruScore, getTierFromScore, WEIGHTS };
