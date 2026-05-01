/**
 * Trust Score Engine — user-level reputation calculator.
 * Used by the truth subsystem specifically.
 */

function calculateTruScore(user) {
  let score = 0;

  score += (user.identityVerified ? 1 : 0) * 50;
  score += Math.min(user.transactionSuccess || 0, 100) * 5;
  score -= (user.disputes || 0) * 30;
  score += Math.min(user.peerReviews || 0, 50) * 10;
  score += Math.min(user.verifiedEvidence || 0, 20) * 20;

  return Math.max(0, Math.min(Math.round(score), 1000));
}

module.exports = { calculateTruScore };
