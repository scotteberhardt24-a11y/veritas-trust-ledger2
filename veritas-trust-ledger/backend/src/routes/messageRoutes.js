const express = require("express");
const router  = express.Router();
const db      = require("../db/db");
const auth    = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// Get message threads for current user
router.get("/threads", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT ON (m.thread_id)
         m.thread_id, m.content, m.created_at, m.sender_id,
         CASE WHEN m.sender_id = $1 THEN r.name ELSE s.name END as other_name,
         CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END as other_id
       FROM messages m
       LEFT JOIN users s ON m.sender_id = s.user_id
       LEFT JOIN users r ON m.recipient_id = r.user_id
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY m.thread_id, m.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Threads error:", err.message);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

// Get messages in a thread
router.get("/:threadId", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.user_id
       WHERE m.thread_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.threadId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message
router.post("/send", auth, async (req, res) => {
  try {
    const { thread_id, recipient_id, content } = req.body;
    if (!content || !recipient_id) return res.status(400).json({ error: "Content and recipient required" });

    const tid = thread_id || uuidv4();
    const result = await db.query(
      `INSERT INTO messages (thread_id, sender_id, recipient_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tid, req.user.userId, recipient_id, content]
    );

    // Real-time push
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${recipient_id}`).emit("message:new", result.rows[0]);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Send failed" });
  }
});

module.exports = router;
