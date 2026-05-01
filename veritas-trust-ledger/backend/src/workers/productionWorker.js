const redis = require("../redis/redis");
const db    = require("../db/db");

async function startProjection() {
  console.log("📊 Projection worker started — listening for ledger events...");
  let lastId = "$";

  while (true) {
    try {
      const response = await redis.xread("BLOCK", 5000, "STREAMS", "ledger_stream", lastId);
      if (!response) continue;

      const stream = response[0][1];
      for (const entry of stream) {
        const id = entry[0];
        let data;
        try { data = JSON.parse(entry[1][1]); } catch { continue; }

        if (data.type === "deposit" && data.payload) {
          const payload = typeof data.payload === "string" ? JSON.parse(data.payload) : data.payload;
          await db.query(
            `INSERT INTO account_balances (user_id, balance) VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE SET balance = account_balances.balance + $2, updated_at = NOW()`,
            [data.user_id, payload.amount]
          );
          console.log(`  💰 Deposit: ${payload.amount} → ${data.user_id}`);
        }

        if (data.type === "withdraw" && data.payload) {
          const payload = typeof data.payload === "string" ? JSON.parse(data.payload) : data.payload;
          await db.query(
            "UPDATE account_balances SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2",
            [payload.amount, data.user_id]
          );
          console.log(`  💸 Withdraw: ${payload.amount} ← ${data.user_id}`);
        }

        if (data.type === "escrow_released" && data.payload) {
          console.log(`  ✅ Escrow released: ${data.type}`);
        }

        lastId = id;
      }
    } catch (err) {
      console.error("Projection error:", err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

startProjection();
