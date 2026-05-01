/**
 * Claim Parser — extracts structured data from claim text.
 * Identifies entities, topics, numerical claims, and citations.
 */

function extractEntities(text) {
  const entities = [];
  // Match capitalized multi-word names (simple NER)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  let match;
  while ((match = namePattern.exec(text)) !== null) {
    entities.push({ type: "name", value: match[1], position: match.index });
  }
  // Match organization-like patterns
  const orgPattern = /\b(?:Inc\.|Corp\.|LLC|Ltd\.|Co\.)\b/gi;
  while ((match = orgPattern.exec(text)) !== null) {
    entities.push({ type: "organization", value: match[0], position: match.index });
  }
  return entities;
}

function detectTopics(text) {
  const topicKeywords = {
    finance: ["payment", "money", "fund", "invest", "bank", "escrow", "salary", "wage"],
    work: ["job", "work", "contract", "hire", "employ", "gig", "freelance", "project"],
    trust: ["trust", "reputation", "verify", "credible", "reliable", "honest", "fraud"],
    legal: ["law", "legal", "court", "sue", "contract", "agreement", "liability"],
    technology: ["software", "code", "develop", "build", "platform", "api", "data"],
  };
  const lower = text.toLowerCase();
  const detected = [];
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const hits = keywords.filter((kw) => lower.includes(kw));
    if (hits.length > 0) detected.push({ topic, confidence: Math.min(hits.length / 3, 1), keywords: hits });
  }
  return detected;
}

function findNumbers(text) {
  const claims = [];
  // Match dollar amounts
  const dollarPattern = /\$[\d,]+(?:\.\d{2})?/g;
  let match;
  while ((match = dollarPattern.exec(text)) !== null) {
    claims.push({ type: "currency", value: match[0], position: match.index });
  }
  // Match percentages
  const pctPattern = /\d+(?:\.\d+)?%/g;
  while ((match = pctPattern.exec(text)) !== null) {
    claims.push({ type: "percentage", value: match[0], position: match.index });
  }
  // Match general numbers with context
  const numPattern = /\b(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\b/g;
  while ((match = numPattern.exec(text)) !== null) {
    if (!claims.some(c => c.position === match.index)) {
      claims.push({ type: "number", value: match[1], position: match.index });
    }
  }
  return claims;
}

function detectLinks(text) {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const citations = [];
  let match;
  while ((match = urlPattern.exec(text)) !== null) {
    citations.push({ url: match[0], position: match.index });
  }
  return citations;
}

function parseClaim(text) {
  if (!text || typeof text !== "string") {
    return { entities: [], topics: [], numericalClaims: [], citations: [], wordCount: 0, confidence: 0 };
  }
  const entities = extractEntities(text);
  const topics = detectTopics(text);
  const numericalClaims = findNumbers(text);
  const citations = detectLinks(text);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Base confidence from available evidence
  let confidence = 0.3; // baseline
  if (citations.length > 0) confidence += 0.2;
  if (numericalClaims.length > 0) confidence += 0.1;
  if (entities.length > 0) confidence += 0.1;
  if (wordCount > 20) confidence += 0.1;

  return { entities, topics, numericalClaims, citations, wordCount, confidence: Math.min(confidence, 1) };
}

module.exports = { parseClaim, extractEntities, detectTopics, findNumbers, detectLinks };
