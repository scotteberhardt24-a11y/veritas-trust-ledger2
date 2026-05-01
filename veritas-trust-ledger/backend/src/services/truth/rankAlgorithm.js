/**
 * Post/Claim Ranking Algorithm
 * Combines author trust, evidence quality, community votes, and recency.
 */

function rankPost(post) {
  const authorScore   = (post.author?.truScore || 0) / 1000; // normalize to 0–1
  const evidence      = post.evidenceScore || 0;
  const votes         = Math.log2(Math.max(post.communityVotes || 1, 1)) / 10; // log scale
  const recency       = post.recency || 0;
  const verifiedBonus = post.author?.isVerified ? 0.1 : 0;

  const rank = (authorScore * 0.35) + (evidence * 0.3) + (votes * 0.2) + (recency * 0.1) + verifiedBonus;
  return Math.round(rank * 10000) / 10000;
}

module.exports = { rankPost };
