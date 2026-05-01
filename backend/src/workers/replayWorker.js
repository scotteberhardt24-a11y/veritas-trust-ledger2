const redis = require("../redis/redis");

async function replay() {
  console.log("▶ Replaying all events from veritas-stream...");
  try {
    const data = await redis.xrange("veritas-stream", "-", "+");
    console.log(`  Found ${data.length} events to replay`);

    for (const entry of data) {
      try {
        const event = JSON.parse(entry[1][1]);
        console.log(`  Recovered event: ${event.event_id} (${event.event_type})`);
      } catch { /* skip malformed */ }
    }

    console.log("✓ Replay complete");
    process.exit(0);
  } catch (err) {
    console.error("✗ Replay error:", err.message);
    process.exit(1);
  }
}

replay();
