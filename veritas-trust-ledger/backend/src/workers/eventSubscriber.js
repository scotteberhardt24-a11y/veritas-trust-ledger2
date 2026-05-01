const Redis  = require("ioredis");
const db     = require("../db/db");

const subscriber = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

async function start() {
  console.log("📡 Event subscriber started — listening on veritas-events channel...");

  await subscriber.subscribe("veritas-events");

  subscriber.on("message", async (channel, message) => {
    try {
      const event = JSON.parse(message);
      console.log(`  Event received: ${event.event_type}`);

      await db.query(
        `INSERT INTO event_store (event_id, event_type, aggregate_id, payload, signature, node_id)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6)
         ON CONFLICT (event_id) DO NOTHING`,
        [event.event_id, event.event_type, event.aggregate_id || null, event.payload, event.signature || null, event.node_id || "primary"]
      );
    } catch (err) {
      console.error("  Subscriber error:", err.message);
    }
  });
}

start();
