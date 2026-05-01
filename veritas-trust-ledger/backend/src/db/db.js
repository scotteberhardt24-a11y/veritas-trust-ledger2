require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host:     process.env.PGHOST || "localhost",
  port:     parseInt(process.env.PGPORT || "5432", 10),
  max:      20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => console.log("✓ PostgreSQL connected"));
pool.on("error", (err) => console.error("✗ PostgreSQL pool error:", err.message));

module.exports = pool;
