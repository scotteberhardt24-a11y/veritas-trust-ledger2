const crypto = require("crypto");
const { v4: uuid } = require("uuid");

let previousHash = "GENESIS";

function createEvent(type, payload, userId) {
  const event = {
    id: uuid(),
    type,
    payload: typeof payload === "string" ? payload : JSON.stringify(payload),
    user_id: userId,
    created_at: new Date().toISOString(),
  };

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(event) + previousHash)
    .digest("hex");

  event.previous_hash = previousHash;
  event.hash = hash;
  previousHash = hash;

  return event;
}

function verifyChain(events) {
  let prevHash = "GENESIS";
  for (const event of events) {
    const data = { id: event.id, type: event.type, payload: event.payload, user_id: event.user_id, created_at: event.created_at };
    const computed = crypto.createHash("sha256").update(JSON.stringify(data) + prevHash).digest("hex");
    if (computed !== event.hash) return { valid: false, brokenAt: event.id };
    prevHash = event.hash;
  }
  return { valid: true };
}

module.exports = { createEvent, verifyChain };
