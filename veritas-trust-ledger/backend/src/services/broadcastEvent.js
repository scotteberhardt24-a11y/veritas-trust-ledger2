const redis = require("../redis/redis");
const db    = require("../db/db");

async function broadcastEvent(event, io = null) {
  // Persist to PostgreSQL
  await db.query(
    `INSERT INTO ledger_events (type, payload, user_id, signature, hash, previous_hash)
     VALUES ($1, $2::jsonb, $3, $4, $5, $6)`,
    [event.type, event.payload, event.user_id, event.signature || null, event.hash, event.previous_hash]
  );

  // Publish to Redis stream
  await redis.xadd("ledger_stream", "*", "event", JSON.stringify(event));

  // Real-time push via Socket.io if available
  if (io) {
    io.to(`user:${event.user_id}`).emit("ledger:event", event);
  }

  console.log(`✓ Event stored + published: ${event.type}`);
}

module.exports = broadcastEvent;
