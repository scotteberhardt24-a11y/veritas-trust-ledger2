const express = require("express");
const router = express.Router();

const db = require("../db/db");
const auth = require("../middleware/auth");

const { v4: uuidv4 } = require("uuid");

const { getIO } = require("../services/socketService");

/*
=====================================================
CREATE CONVERSATION
=====================================================
*/

router.post("/conversation", auth, async (req, res) => {
  try {
    const { participant_id } = req.body;

    if (!participant_id) {
      return res.status(400).json({
        error: "participant_id required",
      });
    }

    const conversationId = uuidv4();

    await db.query(
      `
      INSERT INTO conversations (
        conversation_id
      )
      VALUES ($1)
      `,
      [conversationId]
    );

    await db.query(
      `
      INSERT INTO conversation_participants (
        conversation_id,
        user_id
      )
      VALUES
      ($1, $2),
      ($1, $3)
      `,
      [
        conversationId,
        req.user.userId,
        participant_id,
      ]
    );

    res.status(201).json({
      success: true,
      conversation_id: conversationId,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to create conversation",
    });
  }
});

/*
=====================================================
SEND MESSAGE
=====================================================
*/

router.post("/:conversationId", auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message required",
      });
    }

    const messageId = uuidv4();

    const result = await db.query(
      `
      INSERT INTO messages (
        message_id,
        conversation_id,
        sender_id,
        message
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        messageId,
        req.params.conversationId,
        req.user.userId,
        message,
      ]
    );

    const io = getIO();

    io.to(`chat:${req.params.conversationId}`).emit(
      "new_message",
      result.rows[0]
    );

    res.status(201).json({
      success: true,
      message: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to send message",
    });
  }
});

/*
=====================================================
GET MESSAGES
=====================================================
*/

router.get("/:conversationId", auth, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT *
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      `,
      [req.params.conversationId]
    );

    res.json({
      success: true,
      messages: result.rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch messages",
    });
  }
});

module.exports = router;
