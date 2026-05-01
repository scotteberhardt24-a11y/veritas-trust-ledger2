const { rankPost } = require("./rankAlgorithm");

/**
 * Batch-ranks an array of posts/claims and returns them sorted by rank.
 */
function batchRank(claims) {
  if (!Array.isArray(claims)) return [];

  return claims
    .map((claim) => ({
      ...claim,
      rank: rankPost(claim),
    }))
    .sort((a, b) => b.rank - a.rank);
}

module.exports = { batchRank };
