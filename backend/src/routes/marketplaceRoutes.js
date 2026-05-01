const express = require("express");
const router = express.Router();
const db = require("../db/db");
const auth = require("../middleware/auth");
const { findTopMatches } = require("../services/matchEngine");
const { v4: uuidv4 } = require("uuid");

// ─── Post a Job ───────────────────────────────────────────
router.post("/jobs", auth, async (req, res) => {
  try {
    const { title, description, category, budget, urgency } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description required" });

    const result = await db.query(
      `INSERT INTO marketplace_jobs (client_id, title, description, category, budget, urgency)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.userId, title, description, category || 'Other', budget || 0, urgency || 'standard']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Post job error:", err);
    res.status(500).json({ error: "Failed to post job" });
  }
});

// ─── AI Smart Match ───────────────────────────────────────
router.post("/match", auth, async (req, res) => {
  try {
    const { title, description, category, budget, urgency } = req.body;
    if (!description) return res.status(400).json({ error: "Description required for matching" });

    const matches = await findTopMatches(
      { title, description, category, budget: Number(budget) || 0, urgency: urgency || 'standard' },
      3
    );

    res.json({
      matches: matches.map(m => ({
        userId: m.user_id,
        name: m.name,
        score: Number(m.truscore),
        tier: m.tier,
        rating: Number(m.avg_rating),
        jobsCompleted: m.jobs_completed,
        successRate: Number(m.success_rate),
        totalEarned: Number(m.total_earned),
        hourlyRate: Number(m.hourly_rate || 0),
        skills: m.skills || [],
        avatarUrl: m.avatar_url,
        city: m.city,
        bio: m.bio,
        matchScore: m.matchScore,
        matchReasons: m.matchReasons,
      })),
      weightProfile: urgency || 'standard',
    });
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ error: "Match engine failed" });
  }
});

// ─── Browse Workers ───────────────────────────────────────
router.get("/workers", auth, async (req, res) => {
  try {
    const { category, search, sort = 'truscore', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `SELECT user_id, name, truscore, tier, avg_rating, jobs_completed,
                        success_rate, total_earned, avatar_url, skills, hourly_rate, city, bio
                 FROM users WHERE role = 'worker' AND truscore > 0`;
    const params = [];

    if (category && category !== 'All') {
      params.push(`%${category}%`);
      query += ` AND skills::text ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR bio ILIKE $${params.length})`;
    }

    const sortMap = { truscore: 'truscore DESC', rating: 'avg_rating DESC', jobs: 'jobs_completed DESC', rate: 'hourly_rate ASC' };
    query += ` ORDER BY ${sortMap[sort] || 'truscore DESC'}`;
    params.push(Number(limit), offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workers" });
  }
});

// ─── Send Invitations ─────────────────────────────────────
router.post("/invite", auth, async (req, res) => {
  try {
    const { jobId, workerIds, jobTitle, budget } = req.body;
    if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ error: "At least one worker required" });
    }
    if (workerIds.length > 3) {
      return res.status(400).json({ error: "Maximum 3 invitations per job" });
    }

    const results = [];
    const io = req.app.get("io");

    for (const workerId of workerIds) {
      const inviteId = uuidv4();

      // Create invitation record
      await db.query(
        `INSERT INTO marketplace_invitations (invitation_id, job_id, client_id, worker_id, status, expires_at)
         VALUES ($1, $2, $3, $4, 'pending', NOW() + INTERVAL '24 hours')`,
        [inviteId, jobId, req.user.userId, workerId]
      );

      // Send notification
      await db.query(
        `INSERT INTO notifications (user_id, type, title, body, data)
         VALUES ($1, 'job', $2, $3, $4)`,
        [
          workerId,
          `New Job Invitation: ${jobTitle || 'Untitled'}`,
          `You have been selected for a ${budget ? '$' + budget : ''} job. Respond within 24 hours.`,
          JSON.stringify({ inviteId, jobId, clientId: req.user.userId }),
        ]
      );

      // Real-time push
      if (io) {
        io.to(`user:${workerId}`).emit("invitation:new", { inviteId, jobTitle, budget });
      }

      results.push({ inviteId, workerId, status: 'sent' });
    }

    res.status(201).json({ invitations: results });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Failed to send invitations" });
  }
});

// ─── Respond to Invitation ────────────────────────────────
router.post("/invite/:inviteId/respond", auth, async (req, res) => {
  try {
    const { accept } = req.body;
    const { inviteId } = req.params;

    const invite = await db.query(
      "SELECT * FROM marketplace_invitations WHERE invitation_id = $1 AND worker_id = $2",
      [inviteId, req.user.userId]
    );
    if (invite.rows.length === 0) return res.status(404).json({ error: "Invitation not found" });
    if (invite.rows[0].status !== 'pending') return res.status(400).json({ error: "Already responded" });

    const newStatus = accept ? 'accepted' : 'declined';
    await db.query(
      "UPDATE marketplace_invitations SET status = $1, responded_at = NOW() WHERE invitation_id = $2",
      [newStatus, inviteId]
    );

    // Notify client
    const io = req.app.get("io");
    const clientId = invite.rows[0].client_id;
    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, 'job', $2, $3, $4)`,
      [clientId, `Invitation ${newStatus}`, `A worker has ${newStatus} your job invitation.`, JSON.stringify({ inviteId, workerId: req.user.userId, status: newStatus })]
    );
    if (io) io.to(`user:${clientId}`).emit("invitation:response", { inviteId, status: newStatus });

    // If declined without responding in time, reduce TruScore
    // (handled by a scheduled job, not here)

    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: "Response failed" });
  }
});

module.exports = router;
