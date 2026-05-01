const db    = require("../db/db");
const redis = require("../redis/redis");

async function rebuild() {
  console.log("🔄 Rebuilding Redis stream from PostgreSQL ledger events...");
  try {
    // Clear existing stream
    await redis.del("ledger_stream");

    const result = await db.query("SELECT * FROM ledger_events ORDER BY id ASC");

    for (const row of result.rows) {
      await redis.xadd("ledger_stream", "*", "event", JSON.stringify(row));
    }

    console.log(`✓ Redis stream rebuilt with ${result.rows.length} events`);
    process.exit(0);
  } catch (err) {
    console.error("✗ Rebuild error:", err.message);
    process.exit(1);
  }
}

rebuild();
