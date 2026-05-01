const express = require("express"), router = express.Router(), db = require("../db/db"), auth = require("../middleware/auth")
router.get("/truscore/:userId", async (req, res) => {
  try { const { userId } = req.params; const result = await db.query("SELECT * FROM trust_scores WHERE user_id=$1", [userId]); if (result.rows.length === 0) return res.json({ userId, truScore: 0, tier: "Starter", message: "No score yet" }); res.json(result.rows[0]) } catch (err) { res.status(500).json({ error: "Failed to fetch TruScore" }) }
})
router.get("/badge/:userId", async (req, res) => {
  try { const result = await db.query("SELECT serial, name, truscore, tier, created_at FROM users WHERE user_id=$1", [req.params.userId]); if (result.rows.length === 0) return res.status(404).json({ error: "User not found" }); const u = result.rows[0]; res.json({ serial: u.serial, user: u.name, truScore: u.truscore, tier: u.tier, issuedAt: u.created_at }) } catch (err) { res.status(500).json({ error: "Failed to fetch badge" }) }
})
router.get("/verify/:serial", async (req, res) => {
  try { const result = await db.query("SELECT user_id, name, tier FROM users WHERE serial=$1", [req.params.serial]); if (result.rows.length === 0) return res.json({ verified: false, serial: req.params.serial, message: "Serial not found" }); res.json({ verified: true, serial: req.params.serial, message: "Verified: " + result.rows[0].name + " (" + result.rows[0].tier + ")" }) } catch (err) { res.status(500).json({ error: "Verification failed" }) }
})
module.exports = router
