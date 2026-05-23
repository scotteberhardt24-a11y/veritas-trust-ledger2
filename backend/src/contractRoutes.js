const express = require("express");
const router = express.Router();
const db = require("../db/db");
const auth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

/*
|--------------------------------------------------------------------------
| CREATE CONTRACT
|--------------------------------------------------------------------------
*/

router.post("/", auth, async (req, res) => {
  try {
    const {
      worker_id,
      job_id,
      title,
      description,
      contract_terms,
      total_amount,
    } = req.body;

    if (!worker_id || !title) {
      return res.status(400).json({
        error: "worker_id and title are required",
      });
    }

    const contract_id = uuidv4();

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
        contract_id,
        req.user.userId,
        worker_id,
        job_id || null,
        title,
        description || "",
        contract_terms || "",
        total_amount || 0,
      ]
    );

    const io = req.app.get("io");

    io.to(`user:${worker_id}`).emit("contract:new", {
      contract: result.rows[0],
    });

    res.status(201).json({
      success: true,
      contract: result.rows[0],
    });
  } catch (err) {
    console.error("Create contract error:", err);

    res.status(500).json({
      error: "Failed to create contract",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL CONTRACTS FOR USER
|--------------------------------------------------------------------------
*/

router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT *
      FROM contracts
      WHERE client_id = $1
         OR worker_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.userId]
    );

    res.json({
      success: true,
      contracts: result.rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch contracts",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE CONTRACT
|--------------------------------------------------------------------------
*/

router.get("/:contractId", auth, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT *
      FROM contracts
      WHERE contract_id = $1
      `,
      [req.params.contractId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Contract not found",
      });
    }

    res.json({
      success: true,
      contract: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch contract",
    });
  }
});

/*
|--------------------------------------------------------------------------
| APPROVE CONTRACT
|--------------------------------------------------------------------------
*/

router.post("/:contractId/approve", auth, async (req, res) => {
  try {
    const result = await db.query(
      `
      UPDATE contracts
      SET ai_approved = true,
          admin_approved = true,
          status = 'approved'
      WHERE contract_id = $1
      RETURNING *
      `,
      [req.params.contractId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Contract not found",
      });
    }

    const io = req.app.get("io");

    io.to(`user:${result.rows[0].worker_id}`).emit(
      "contract:approved",
      {
        contract: result.rows[0],
      }
    );

    res.json({
      success: true,
      contract: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to approve contract",
    });
  }
});

module.exports = router;
