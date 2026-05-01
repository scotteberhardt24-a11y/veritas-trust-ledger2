/**
 * Consensus Engine — requires 2/3 supermajority for approval.
 * Used for dispute resolution and multi-party verification.
 */

function consensus(votes) {
  if (!Array.isArray(votes) || votes.length === 0) return false;
  const approvals = votes.filter((v) => v === true).length;
  const threshold = Math.ceil(votes.length * 0.66);
  return approvals >= threshold;
}

function weightedConsensus(votes) {
  // votes = [{ approved: bool, weight: number }]
  if (!Array.isArray(votes) || votes.length === 0) return false;
  const totalWeight    = votes.reduce((sum, v) => sum + (v.weight || 1), 0);
  const approvalWeight = votes.filter(v => v.approved).reduce((sum, v) => sum + (v.weight || 1), 0);
  return approvalWeight / totalWeight >= 0.66;
}

module.exports = { consensus, weightedConsensus };
