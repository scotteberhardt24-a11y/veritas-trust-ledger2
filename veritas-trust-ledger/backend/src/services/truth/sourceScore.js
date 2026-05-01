/**
 * Source Scoring — evaluates the credibility of an information source.
 */

const KNOWN_DOMAINS = {
  "gov": 0.95, "edu": 0.9, "org": 0.7,
  "reuters.com": 0.95, "apnews.com": 0.95,
  "nature.com": 0.95, "science.org": 0.95,
};

function scoreSource(source) {
  let score = 0;

  // Domain authority (0–1)
  const domainAuth = source.domainAuthority || 0;
  score += domainAuth * 0.3;

  // Citation count from other sources
  const citations = Math.min(source.citations || 0, 100) / 100;
  score += citations * 0.2;

  // Peer review status
  const peerReviewed = source.peerReviews || 0;
  score += Math.min(peerReviewed, 1) * 0.3;

  // Historical accuracy track record
  const accuracy = source.historicalAccuracy || 0;
  score += accuracy * 0.2;

  return Math.min(Math.round(score * 100) / 100, 1);
}

function scoreDomain(url) {
  if (!url) return 0.3;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    // Check known domains
    for (const [domain, score] of Object.entries(KNOWN_DOMAINS)) {
      if (hostname.endsWith(domain)) return score;
    }
    // TLD-based scoring
    if (hostname.endsWith(".gov")) return 0.9;
    if (hostname.endsWith(".edu")) return 0.85;
    if (hostname.endsWith(".org")) return 0.6;
    return 0.4; // default for unknown
  } catch {
    return 0.3;
  }
}

module.exports = { scoreSource, scoreDomain };
