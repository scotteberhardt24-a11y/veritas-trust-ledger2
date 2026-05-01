const express = require("express"), router = express.Router(), db = require("../db/db"), auth = require("../middleware/auth"), { v4: uuidv4 } = require("uuid")
router.post("/create", auth, async (req, res) => {
  try { const { worker_id, title, amount, milestones } = req.body; const escrowId = uuidv4(); const result = await db.query(`INSERT INTO escrows (escrow_id, client_id, worker_id, title, amount, milestones, status) VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`, [escrowId, req.user.userId, worker_id, title, amount, JSON.stringify(milestones || [])]); res.status(201).json(result.rows[0]) } catch (err) { res.status(500).json({ error: "Failed to create escrow" }) }
})
router.get("/user/:userId", auth, async (req, res) => {
  try { const result = await db.query("SELECT * FROM escrows WHERE client_id=$1 OR worker_id=$1 ORDER BY created_at DESC", [req.params.userId]); res.json(result.rows) } catch (err) { res.status(500).json({ error: "Failed to fetch escrows" }) }
})
router.post("/:escrowId/release", auth, async (req, res) => {
  try { const result = await db.query("UPDATE escrows SET status='released', released_at=NOW() WHERE escrow_id=$1 AND client_id=$2 RETURNING *", [req.params.escrowId, req.user.userId]); if (result.rows.length === 0) return res.status(404).json({ error: "Escrow not found" }); res.json({ success: true, escrow: result.rows[0] }) } catch (err) { res.status(500).json({ error: "Release failed" }) }
})
router.post("/:escrowId/dispute", auth, async (req, res) => {
  try { await db.query("UPDATE escrows SET status='disputed', dispute_reason=$1 WHERE escrow_id=$2", [req.body.reason, req.params.escrowId]); res.json({ success: true }) } catch (err) { res.status(500).json({ error: "Dispute failed" }) }
})
module.exports = router
