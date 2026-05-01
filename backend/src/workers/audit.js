const db = require("../db/db");
const { verifyChain } = require("../services/eventschema");

async function verifyLedger() {
  console.log("🔍 Starting ledger integrity audit...");
  try {
    const result = await db.query(
      "SELECT id, type, payload, user_id, created_at, hash, previous_hash FROM ledger_events ORDER BY id ASC"
    );

    if (result.rows.length === 0) {
      console.log("✓ Ledger empty — nothing to verify");
      process.exit(0);
    }

    const verification = verifyChain(result.rows);

    if (verification.valid) {
      console.log(`✓ Ledger verified: ${result.rows.length} events, no tampering detected`);
      process.exit(0);
    } else {
      console.error(`✗ Ledger corruption detected at event: ${verification.brokenAt}`);
      process.exit(1);
    }
  } catch (err) {
    console.error("✗ Audit error:", err.message);
    process.exit(1);
  }
}

verifyLedger();
