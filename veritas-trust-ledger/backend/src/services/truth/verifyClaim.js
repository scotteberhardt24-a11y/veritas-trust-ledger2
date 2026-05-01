/**
 * Claim Verification — scores a claim against collected evidence.
 * Returns a truth score from 0 (false) to 1 (verified true).
 */

function verifyClaim(claim, evidence) {
  if (!evidence || evidence.length === 0) {
    return { score: 0.5, confidence: 0, label: "unverified", details: "No evidence available" };
  }

  let supportWeight = 0;
  let contradictWeight = 0;
  let totalWeight = 0;

  for (const e of evidence) {
    const cred = e.credibility || 0.5;
    if (e.supportsClaim) {
      supportWeight += cred;
    }
    if (e.contradictsClaim) {
      contradictWeight += cred;
    }
    totalWeight += cred;
  }

  if (totalWeight === 0) {
    return { score: 0.5, confidence: 0, label: "unverified", details: "No weighted evidence" };
  }

  const rawScore = (supportWeight - contradictWeight) / totalWeight;
  const score = Math.max(0, Math.min((rawScore + 1) / 2, 1)); // normalize to 0–1
  const confidence = Math.min(evidence.length / 10, 1); // more evidence = more confident

  let label;
  if (score >= 0.8) label = "verified";
  else if (score >= 0.6) label = "likely_true";
  else if (score >= 0.4) label = "uncertain";
  else if (score >= 0.2) label = "likely_false";
  else label = "false";

  return {
    score: Math.round(score * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    label,
    evidenceCount: evidence.length,
    supportWeight: Math.round(supportWeight * 100) / 100,
    contradictWeight: Math.round(contradictWeight * 100) / 100,
  };
}

module.exports = { verifyClaim };
