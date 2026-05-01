const redis = require("../redis/redis");
const { exec } = require("child_process");
const path = require("path");

const COBOL_PATH = path.resolve(__dirname, "../../cobol/cobol_engine");

async function startWorker() {
  console.log("⚙️  COBOL queue worker started...");
  let lastId = "$";

  while (true) {
    try {
      const result = await redis.xread("BLOCK", 5000, "STREAMS", "ledger_stream", lastId);
      if (!result) continue;

      const events = result[0][1];
      for (const event of events) {
        lastId = event[0];
        let data;
        try { data = JSON.parse(event[1][1]); } catch { continue; }

        console.log(`  Processing event: ${data.type}`);
        // COBOL engine would process here if binary exists
      }
    } catch (err) {
      console.error("COBOL queue error:", err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

startWorker();
