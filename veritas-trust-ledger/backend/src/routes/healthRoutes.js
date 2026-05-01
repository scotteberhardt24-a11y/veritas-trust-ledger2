const express = require("express");
const router  = express.Router();
const db      = require("../db/db");
const redis   = require("../redis/redis");

router.get("/", async (req, res) => {
  let dbStatus = "disconnected";
  let redisStatus = "disconnected";

  try { await db.query("SELECT 1"); dbStatus = "connected"; } catch { }
  try { await redis.ping(); redisStatus = "connected"; } catch { }

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
