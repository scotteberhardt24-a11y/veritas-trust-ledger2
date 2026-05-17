const express = require('express');
const router = express.Router();

const pool = require('../db/db');

const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(auth);
router.use(requireRole('admin'));

// ═══════════════════════════════════════════════════════════════
// DASHBOARD METRICS
// ═══════════════════════════════════════════════════════════════

router.get('/metrics', async (req, res) => {
  try {
    const metrics = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'worker') as workers,
        (SELECT COUNT(*) FROM users WHERE role = 'client') as clients,
        (SELECT COUNT(*) FROM users WHERE is_verified = true) as verified_users,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
        (SELECT COALESCE(SUM(amount), 0) FROM escrows WHERE status = 'held') as escrow_volume,
        (SELECT COALESCE(SUM(amount * 0.025), 0)
          FROM escrows
          WHERE status = 'released'
        ) as total_revenue
    `);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(metrics.rows[0].total_users || 0),
        workers: parseInt(metrics.rows[0].workers || 0),
        clients: parseInt(metrics.rows[0].clients || 0),
        verifiedUsers: parseInt(metrics.rows[0].verified_users || 0),
        activeJobs: parseInt(metrics.rows[0].active_jobs || 0),
        escrowVolume: parseFloat(metrics.rows[0].escrow_volume || 0),
        totalRevenue: parseFloat(metrics.rows[0].total_revenue || 0)
      }
    });

  } catch (error) {
    console.error('Admin metrics error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════

router.get('/users', async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        user_id,
        name,
        email,
        role,
        tier,
        truscore,
        is_verified,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Admin users error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// JOBS
// ═══════════════════════════════════════════════════════════════

router.get('/jobs', async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        job_id,
        title,
        description,
        status,
        created_at,
        amount
      FROM jobs
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Admin jobs error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

router.get('/health', async (req, res) => {
  res.json({
    success: true,
    message: 'Admin API operational'
  });
});

module.exports = router;