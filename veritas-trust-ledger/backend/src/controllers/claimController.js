const { batchRank } = require("../services/truth/batchRank");
const { parseClaim } = require("../services/truth/claimParser");
const db = require("../db/db");

async function getFeed(req, res) {
  try {
    // Get recent ledger events as feed items
    const result = await db.query(
      `SELECT le.id, le.type, le.payload, le.user_id, le.hash, le.created_at,
              u.name as author_name, u.truscore, u.tier, u.is_verified
       FROM ledger_events le
       LEFT JOIN users u ON le.user_id = u.user_id
       ORDER BY le.created_at DESC LIMIT 50`
    );

    const claims = result.rows.map((row) => {
      const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
      return {
        id: row.id,
        type: row.type,
        payload,
        hash: row.hash,
        created_at: row.created_at,
        author: {
          name: row.author_name,
          truScore: row.truscore || 0,
          tier: row.tier || "Starter",
          isVerified: row.is_verified || false,
        },
        credibility: (row.truscore || 0) / 1000,
        evidenceScore: 0.5,
        communityVotes: 1,
        recency: Math.max(0, 1 - (Date.now() - new Date(row.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      };
    });

    const ranked = batchRank(claims);
    res.json(ranked);
  } catch (err) {
    console.error("Feed error:", err.message);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
}

async function analyzeClaim(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Claim text required" });
    const analysis = parseClaim(text);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: "Analysis failed" });
  }
}

module.exports = { getFeed, analyzeClaim };
