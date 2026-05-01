/**
 * Evidence Collector — gathers supporting and contradicting evidence for claims.
 * In production, this would integrate with external APIs. For now, it provides
 * a framework for scoring evidence from internal platform data.
 */

const db = require("../../db/db");

async function collectInternalEvidence(claim) {
  const sources = [];

  try {
    // Check if similar claims have been verified before
    const ledgerRes = await db.query(
      `SELECT type, payload, hash, created_at FROM ledger_events
       WHERE type IN ('claim_verified', 'claim_rejected')
       ORDER BY created_at DESC LIMIT 20`
    );

    for (const event of ledgerRes.rows) {
      try {
        const payload = typeof event.payload === "string" ? JSON.parse(event.payload) : event.payload;
        sources.push({
          type: "internal_ledger",
          supportsClaim: event.type === "claim_verified",
          contradictsClaim: event.type === "claim_rejected",
          credibility: 0.8,
          timestamp: event.created_at,
          hash: event.hash,
        });
      } catch { /* skip malformed */ }
    }

    // Check user trust scores of claim participants
    const trustRes = await db.query(
      `SELECT u.user_id, u.truscore, u.tier, u.is_verified
       FROM users u WHERE u.truscore > 0 ORDER BY u.truscore DESC LIMIT 10`
    );

    for (const user of trustRes.rows) {
      sources.push({
        type: "user_reputation",
        userId: user.user_id,
        credibility: user.truscore / 1000,
        tier: user.tier,
        isVerified: user.is_verified,
      });
    }
  } catch (err) {
    console.error("Evidence collection error:", err.message);
  }

  return sources;
}

async function collectEvidence(claim) {
  const allSources = [];

  // Internal platform evidence
  const internal = await collectInternalEvidence(claim);
  allSources.push(...internal);

  return allSources;
}

module.exports = { collectEvidence, collectInternalEvidence };
