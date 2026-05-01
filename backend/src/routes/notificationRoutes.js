const express = require("express");
const router  = express.Router();
const db      = require("../db/db");
const auth    = require("../middleware/auth");

// Get notifications
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.user.userId]
    );
    const unread = result.rows.filter(n => !n.read).length;
    res.json({ notifications: result.rows, unread });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark all as read
router.post("/read-all", auth, async (req, res) => {
  try {
    await db.query("UPDATE notifications SET read = true WHERE user_id = $1", [req.user.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Save push token
router.post("/push-token", auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });
    await db.query("UPDATE users SET push_token = $1 WHERE user_id = $2", [token, req.user.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save push token" });
  }
});

module.exports = router;
