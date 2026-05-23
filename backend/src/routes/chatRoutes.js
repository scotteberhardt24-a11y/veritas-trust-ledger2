const express = require("express");
const router = express.Router();

const db = require("../db/db");
const auth = require("../middleware/auth");

const { v4: uuidv4 } = require("uuid");

const { getIO } = require("../services/socketService");

/*
|--------------------------------------------------------------------------
| Get Messages For Job
|--------------------------------------------------------------------------
*/

router.get("/:jobId", auth, async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT *
      FROM messages
      WHERE job_id = $1
      ORDER BY created_at ASC
      `,
      [req.params.jobId]
    );

    res.json({
      success: true,
      messages: result.rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch messages"
    });

  }

});

/*
|--------------------------------------------------------------------------
| Send Message
|--------------------------------------------------------------------------
*/

router.post("/:jobId", auth, async (req, res) => {

  try {

    const { receiver_id, message } = req.body;

    if (!message) {

      return res.status(400).json({
        success: false,
        error: "Message required"
      });

    }

    const newMessage = {
      message_id: uuidv4(),
      job_id: req.params.jobId,
      sender_id: req.user.userId,
      receiver_id,
      message
    };

    /*
    |--------------------------------------------------------------------------
    | Save Message
    |--------------------------------------------------------------------------
    */

    await db.query(
      `
      INSERT INTO messages (
        message_id,
        job_id,
        sender_id,
        receiver_id,
        message
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        newMessage.message_id,
        newMessage.job_id,
        newMessage.sender_id,
        newMessage.receiver_id,
        newMessage.message
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | Emit Socket Event
    |--------------------------------------------------------------------------
    */

    const io = getIO();

    io.to(`job:${req.params.jobId}`).emit(
      "message:receive",
      newMessage
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(201).json({
      success: true,
      message: newMessage
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to send message"
    });

  }

});

module.exports = router;