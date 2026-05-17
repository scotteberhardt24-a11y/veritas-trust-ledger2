import express from "express";
import { db } from "../db.js";

const router = express.Router();

// --------------------------
// TOP WORKERS
// --------------------------
router.get("/top-workers", async (req, res) => {
  const result = await db.query(`
    SELECT *
    FROM workers
    WHERE flagged = false
    ORDER BY trust_score DESC
    LIMIT 20
  `);

  res.json(result.rows);
});

// --------------------------
// RISKY WORKERS
// --------------------------
router.get("/flagged-workers", async (req, res) => {
  const result = await db.query(`
    SELECT *
    FROM workers
    WHERE flagged = true
    ORDER BY risk_score DESC
  `);

  res.json(result.rows);
});

export default router;