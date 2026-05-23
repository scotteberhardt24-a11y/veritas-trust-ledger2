const express = require("express");
const router = express.Router();

const db = require("../db/db");
const auth = require("../middleware/auth");

const { v4: uuidv4 } = require("uuid");
const { rankWorkers } = require("../services/matchingEngine");
/* =========================================================
   LIST JOBS
========================================================= */

router.get("/", async (req, res) => {
  try {
    const { category, search, status } = req.query;

    let query = `
      SELECT 
        j.*, 
        u.name AS client_name
      FROM jobs j
      LEFT JOIN users u 
        ON j.client_id = u.user_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      params.push(status);
      query += ` AND j.status = $${params.length}`;
    } else {
      query += ` AND j.status = 'open'`;
    }

    if (category) {
      params.push(category);
      query += ` AND j.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += `
        AND (
          j.title ILIKE $${params.length}
          OR j.description ILIKE $${params.length}
        )
      `;
    }

    query += `
      ORDER BY j.created_at DESC
      LIMIT 50
    `;

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      jobs: result.rows,
    });
  } catch (err) {
    console.error("Jobs fetch error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch jobs",
    });
  }
});

/* =========================================================
   JOB MATCHING ROUTE
========================================================= */

router.post("/match", async (req, res) => {
  try {
    const { skills = [], budget = 0, category } = req.body;

    let query = `
      SELECT
        j.*,
        u.name AS client_name
      FROM jobs j
      LEFT JOIN users u
        ON j.client_id = u.user_id
      WHERE j.status = 'open'
    `;

    const params = [];

    if (category) {
      params.push(category);

      query += `
        AND j.category = $${params.length}
      `;
    }

    query += `
      ORDER BY j.created_at DESC
      LIMIT 20
    `;

    const result = await db.query(query, params);

    // Simple matching logic
    const matches = result.rows.map((job) => {
      let score = 0;

      const text = `
        ${job.title || ""}
        ${job.description || ""}
      `.toLowerCase();

      skills.forEach((skill) => {
        if (text.includes(skill.toLowerCase())) {
          score += 1;
        }
      });

      if (budget && Number(job.budget) >= budget) {
        score += 2;
      }

      return {
        ...job,
        match_score: score,
      };
    });

    matches.sort((a, b) => b.match_score - a.match_score);

    res.json({
      success: true,
      total_matches: matches.length,
      matches,
    });
  } catch (err) {
    console.error("Job match error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to match jobs",
    });
  }
});

/* =========================================================
   GET SINGLE JOB
========================================================= */

router.get("/:jobId", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        j.*,
        u.name AS client_name,
        u.truscore,
        u.tier
      FROM jobs j
      LEFT JOIN users u
        ON j.client_id = u.user_id
      WHERE j.job_id = $1
      `,
      [req.params.jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.json({
      success: true,
      job: result.rows[0],
    });
  } catch (err) {
    console.error("Single job fetch error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch job",
    });
  }
});

/* =========================================================
   CREATE JOB
========================================================= */

router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      budget,
      skills
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Title required",
      });
    }

    const result = await db.query(
      `
      INSERT INTO jobs (
        job_id,
        client_id,
        title,
        description,
        category,
        budget
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
  uuidv4(),
  req.user.userId,
  title,
  description || "",
  category || "general",
  budget || 0,
  JSON.stringify(skills || [])
]
    );

    res.status(201).json({
      success: true,
      job: result.rows[0],
    });
  } catch (err) {
    console.error("Create job error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to create job",
    });
  }
});

/* =========================================================
   APPLY TO JOB
========================================================= */

router.post("/:jobId/apply", auth, async (req, res) => {
  try {
    const exists = await db.query(
      `
      SELECT job_id
      FROM jobs
      WHERE job_id = $1
      AND status = 'open'
      `,
      [req.params.jobId]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Job not found or closed",
      });
    }

    const already = await db.query(
      `
      SELECT application_id
      FROM job_applications
      WHERE job_id = $1
      AND worker_id = $2
      `,
      [req.params.jobId, req.user.userId]
    );

    if (already.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Already applied",
      });
    }

    await db.query(
      `
      NSERT INTO jobs (
  job_id,
  client_id,
  title,
  description,
  category,
  budget,
  skills
)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        req.params.jobId,
        req.user.userId,
        req.body.cover_note || "",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Application submitted",
    });
  } catch (err) {
    console.error("Apply job error:", err);

    res.status(500).json({
      success: false,
      error: "Application failed",
    });
  }
});
router.post("/:jobId/accept/:workerId", auth, async (req, res) => {
  try {
    // Verify job ownership
    const jobCheck = await db.query(
      `SELECT * FROM jobs
       WHERE job_id = $1
       AND client_id = $2`,
      [req.params.jobId, req.user.userId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(403).json({
        error: "Not authorized for this job"
      });
    }

    // Verify application exists
    const appCheck = await db.query(
      `SELECT * FROM job_applications
       WHERE job_id = $1
       AND worker_id = $2`,
      [req.params.jobId, req.params.workerId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Application not found"
      });
    }

    // Mark job hired
    await db.query(
      `UPDATE jobs
       SET status = 'in_progress',
           hired_worker_id = $1
       WHERE job_id = $2`,
      [req.params.workerId, req.params.jobId]
    );

    // Reject others automatically
    await db.query(
      `UPDATE job_applications
       SET status = 'rejected'
       WHERE job_id = $1
       AND worker_id != $2`,
      [req.params.jobId, req.params.workerId]
    );

    // Accept selected worker
    await db.query(
      `UPDATE job_applications
       SET status = 'accepted'
       WHERE job_id = $1
       AND worker_id = $2`,
      [req.params.jobId, req.params.workerId]
    );

    // Emit realtime event
    const io = req.app.get("io");

    io.to(`user:${req.params.workerId}`).emit("job:hired", {
      jobId: req.params.jobId
    });

    res.json({
      success: true,
      hired_worker: req.params.workerId,
      job_id: req.params.jobId
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to hire worker"
    });
  }
});
/* =========================================================
   GET APPLICATIONS
========================================================= */

router.get("/:jobId/applications", auth, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        ja.*,
        u.name,
        u.truscore,
        u.tier,
        u.is_verified
      FROM job_applications ja
      JOIN users u
        ON ja.worker_id = u.user_id
      WHERE ja.job_id = $1
      ORDER BY ja.created_at DESC
      `,
      [req.params.jobId]
    );

    res.json({
      success: true,
      applications: result.rows,
    });
  } catch (err) {
    console.error("Applications fetch error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch applications",
    });
  }
});
/*
|--------------------------------------------------------------------------
| Select Top Workers For Job
|--------------------------------------------------------------------------
*/

router.post("/:jobId/select-workers", auth, async (req, res) => {

  try {

    /*
    |--------------------------------------------------------------------------
    | Get Job
    |--------------------------------------------------------------------------
    */

    const jobResult = await db.query(
      "SELECT * FROM jobs WHERE job_id = $1",
      [req.params.jobId]
    );

    if (jobResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        error: "Job not found"
      });

    }

    const job = jobResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Rank Workers
    |--------------------------------------------------------------------------
    */

    const selectedWorkers = await rankWorkers(job);

    /*
    |--------------------------------------------------------------------------
    | Save Selected Workers
    |--------------------------------------------------------------------------
    */

    await db.query(
      `
      UPDATE jobs
      SET
        selected_workers = $1,
        workflow_stage = 'workers_selected'
      WHERE job_id = $2
      `,
      [
        JSON.stringify(selectedWorkers),
        req.params.jobId
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | Return Response
    |--------------------------------------------------------------------------
    */

    res.json({
      success: true,
      workflow_stage: "workers_selected",
      total_selected: selectedWorkers.length,
      selected_workers: selectedWorkers
    });

  } catch (err) {

    console.error("Worker selection error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to select workers"
    });

  }

});
module.exports = router;