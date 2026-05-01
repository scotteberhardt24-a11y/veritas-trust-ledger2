const express = require("express");
const router  = express.Router();
const db      = require("../db/db");
const redis   = require("../redis/redis");

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

router.get("/", async (req, res) => {
  let dbStatus = "disconnected";
  let redisStatus = "disconnected";

  try { await withTimeout(db.query("SELECT 1"), 3000); dbStatus = "connected"; } catch { }
  try { await withTimeout(redis.ping(), 3000); redisStatus = "connected"; } catch { }

  res.json({
    status: "ok",
    version: "1.0.0",
    service: "veritas-trust-ledger",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    infrastructure: { postgres: dbStatus, redis: redisStatus },
  });
});

module.exports = router;
