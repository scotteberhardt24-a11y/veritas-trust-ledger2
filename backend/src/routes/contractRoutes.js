const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db/db");
const { v4: uuidv4 } = require("uuid");

/*
---------------------------------------------------
GET ALL CONTRACTS
---------------------------------------------------
*/
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT *
      FROM contracts
      ORDER BY created_at DESC
      `
    );

    res.json({
      success: true,
      contracts: result.rows,
    });
  } catch (err) {
    console.error("Get contracts error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch contracts",
    });
  }
});

/*
---------------------------------------------------
CREATE CONTRACT
---------------------------------------------------
*/
router.post("/", auth, async (req, res) => {
  try {
    const {
      client_id,
      worker_id,
      job_id,
      title,
      description,
      contract_terms,
      total_amount,
    } = req.body;

    if (!client_id || !worker_id || !title) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const contractId = uuidv4();

    const result = await db.query(
      `
      INSERT INTO contracts (
        contract_id,
        client_id,
        worker_id,
        job_id,
        title,
        description,
        contract_terms,
        total_amount
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        contractId,
        client_id,
        worker_id,
        job_id || null,
        title,
        description || "",
        contract_terms || "",
        total_amount || 0,
      ]
    );

    res.status(201).json({
      success: true,
      contract: result.rows[0],
    });
  } catch (err) {
    console.error("Create contract error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to create contract",
    });
  }
});

module.exports = router;
