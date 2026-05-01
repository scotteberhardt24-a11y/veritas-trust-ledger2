const db = require("../db/db");
const { calculateTruScore, getTierFromScore } = require("./truScore");

/**
 * Recalculate and persist a user's TruScore.
 * Pulls metrics from the database and updates both users and trust_scores tables.
 */
async function updateTruScore(userId) {
  const client = await db.connect();
  try {
    // Gather metrics
    const userRes = await client.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    if (userRes.rows.length === 0) return null;
    const user = userRes.rows[0];

    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const disputeRes = await client.query(
      "SELECT COUNT(*) as cnt FROM escrows WHERE (client_id=$1 OR worker_id=$1) AND status='disputed'",
      [userId]
    );

    const metrics = {
      identityVerified: user.is_verified,
      accountAgeMonths: accountAge,
      successfulTransactions: user.jobs_completed || 0,
      disputeRate: parseInt(disputeRes.rows[0].cnt) || 0,
      peerReviews: Math.round((user.avg_rating || 0) * (user.jobs_completed || 0)),
      verifiedEvidence: 0,
      truthConfirmations: 0,
      misinformationFlags: 0,
      networkTrust: user.success_rate ? user.success_rate / 10 : 0,
      ledgerIntegrity: 10,
    };

    const score = calculateTruScore(metrics);
    const tier  = getTierFromScore(score);

    // Update users table
    await client.query(
      "UPDATE users SET truscore = $1, tier = $2, updated_at = NOW() WHERE user_id = $3",
      [score, tier, userId]
    );

    // Upsert trust_scores table
    await client.query(
      `INSERT INTO trust_scores (user_id, score, tier, history, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         score = $2, tier = $3,
         history = trust_scores.history || $4::jsonb,
         updated_at = NOW()`,
      [userId, score, tier, JSON.stringify([{ date: new Date().toISOString(), score }])]
    );

    return { userId, score, tier };
  } finally {
    client.release();
  }
}

module.exports = { updateTruScore };
