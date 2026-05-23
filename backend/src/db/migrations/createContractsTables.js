const db = require("../db");

async function createContractsTables() {
  try {

    // CONTRACTS
    await db.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        contract_id UUID PRIMARY KEY,
        job_id UUID NOT NULL,
        client_id UUID NOT NULL,
        worker_id UUID NOT NULL,

        title TEXT NOT NULL,
        description TEXT,

        total_amount NUMERIC(12,2) DEFAULT 0,

        status TEXT DEFAULT 'pending',

        contract_text TEXT,

        client_signed BOOLEAN DEFAULT false,
        worker_signed BOOLEAN DEFAULT false,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // MILESTONES
    await db.query(`
      CREATE TABLE IF NOT EXISTS contract_milestones (
        milestone_id UUID PRIMARY KEY,
        contract_id UUID NOT NULL,

        title TEXT NOT NULL,
        description TEXT,

        amount NUMERIC(12,2) DEFAULT 0,

        due_date TIMESTAMP,

        status TEXT DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // SIGNATURES
    await db.query(`
      CREATE TABLE IF NOT EXISTS contract_signatures (
        signature_id UUID PRIMARY KEY,

        contract_id UUID NOT NULL,
        user_id UUID NOT NULL,

        signed_at TIMESTAMP DEFAULT NOW(),

        ip_address TEXT,
        user_agent TEXT
      )
    `);

    // EVENTS / AUDIT LOG
    await db.query(`
      CREATE TABLE IF NOT EXISTS contract_events (
        event_id UUID PRIMARY KEY,

        contract_id UUID NOT NULL,
        user_id UUID,

        event_type TEXT NOT NULL,

        details JSONB,

        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("✅ Contract tables created");

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }
}

createContractsTables();