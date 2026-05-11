// Admin API Routes
// backend/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

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
        (SELECT COUNT(*) FROM users WHERE email_verified = true) as verified_users,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
        (SELECT COALESCE(SUM(amount), 0) FROM escrow WHERE status = 'held') as escrow_volume,
        (SELECT COALESCE(SUM(amount * 0.025), 0) FROM escrow 
         WHERE status = 'released' AND DATE(created_at) = CURRENT_DATE) as today_revenue,
        (SELECT COUNT(*) FROM disputes WHERE status = 'pending') as pending_disputes
    `);

    res.json({
      status: 'success',
      data: {
        totalUsers: parseInt(metrics.rows[0].total_users),
        workers: parseInt(metrics.rows[0].workers),
        clients: parseInt(metrics.rows[0].clients),
        verifiedUsers: parseInt(metrics.rows[0].verified_users),
        activeJobs: parseInt(metrics.rows[0].active_jobs),
        escrowVolume: parseFloat(metrics.rows[0].escrow_volume),
        todayRevenue: parseFloat(metrics.rows[0].today_revenue),
        pendingDisputes: parseInt(metrics.rows[0].pending_disputes)
      }
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch metrics' });
  }
});

// ═══════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

router.get('/users', async (req, res) => {
  try {
    const { role, verified, suspended, search, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT user_id, name, email, role, truscore, tier, email_verified, 
             suspended, suspension_reason, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount++}`;
      params.push(role);
    }
    if (verified !== undefined) {
      query += ` AND email_verified = $${paramCount++}`;
      params.push(verified === 'true');
    }
    if (suspended !== undefined) {
      query += ` AND suspended = $${paramCount++}`;
      params.push(suspended === 'true');
    }
    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch users' });
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT user_id, name, email, phone, role, truscore, tier, 
             email_verified, suspended, suspension_reason,
             created_at, updated_at, last_login
      FROM users
      WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch user' });
  }
});

router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, truscore, tier } = req.body;

    const result = await pool.query(`
      UPDATE users
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          truscore = COALESCE($4, truscore),
          tier = COALESCE($5, tier),
          updated_at = NOW()
      WHERE user_id = $6
      RETURNING user_id, name, email, role, truscore, tier
    `, [name, email, role, truscore, tier, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to update user' });
  }
});

router.post('/users/:userId/suspend', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ status: 'error', error: 'Reason required' });
    }

    const result = await pool.query(`
      UPDATE users
      SET suspended = true,
          suspension_reason = $1,
          updated_at = NOW()
      WHERE user_id = $2
      RETURNING user_id, name, email
    `, [reason, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    res.json({
      status: 'success',
      message: 'User suspended successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to suspend user' });
  }
});

router.post('/users/:userId/unsuspend', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      UPDATE users
      SET suspended = false,
          suspension_reason = NULL,
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING user_id, name, email
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    res.json({
      status: 'success',
      message: 'User unsuspended successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to unsuspend user' });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // This should cascade delete related records
    const result = await pool.query(`
      DELETE FROM users
      WHERE user_id = $1
      RETURNING user_id, name, email
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to delete user' });
  }
});

// ═══════════════════════════════════════════════════════════════
// JOB MANAGEMENT
// ═══════════════════════════════════════════════════════════════

router.get('/jobs', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT j.job_id, j.title, j.description, j.status, j.amount, j.created_at,
             c.name as client_name, c.email as client_email,
             w.name as worker_name, w.email as worker_email
      FROM jobs j
      LEFT JOIN users c ON j.client_id = c.user_id
      LEFT JOIN users w ON j.worker_id = w.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND j.status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY j.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch jobs' });
  }
});

router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const result = await pool.query(`
      SELECT j.*,
             c.name as client_name, c.email as client_email,
             w.name as worker_name, w.email as worker_email
      FROM jobs j
      LEFT JOIN users c ON j.client_id = c.user_id
      LEFT JOIN users w ON j.worker_id = w.user_id
      WHERE j.job_id = $1
    `, [jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Job not found' });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch job' });
  }
});

router.post('/jobs/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    const result = await pool.query(`
      UPDATE jobs
      SET status = 'cancelled',
          admin_notes = $1,
          updated_at = NOW()
      WHERE job_id = $2
      RETURNING job_id, title, status
    `, [reason, jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Job not found' });
    }

    res.json({
      status: 'success',
      message: 'Job cancelled successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to cancel job' });
  }
});

// ═══════════════════════════════════════════════════════════════
// DISPUTES
// ═══════════════════════════════════════════════════════════════

router.get('/disputes', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const result = await pool.query(`
      SELECT d.dispute_id, d.job_id, d.raised_by, d.reason, d.status, d.created_at,
             j.title as job_title,
             u.name as raised_by_name
      FROM disputes d
      JOIN jobs j ON d.job_id = j.job_id
      JOIN users u ON d.raised_by = u.user_id
      WHERE d.status = $1
      ORDER BY d.created_at ASC
    `, [status]);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch disputes' });
  }
});

router.post('/disputes/:disputeId/resolve', async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { resolution, favorParty } = req.body;

    if (!resolution || !favorParty) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Resolution and favor party required' 
      });
    }

    const result = await pool.query(`
      UPDATE disputes
      SET status = 'resolved',
          resolution = $1,
          resolved_in_favor = $2,
          resolved_at = NOW(),
          resolved_by = $3
      WHERE dispute_id = $4
      RETURNING dispute_id, job_id, status
    `, [resolution, favorParty, req.user.userId, disputeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Dispute not found' });
    }

    res.json({
      status: 'success',
      message: 'Dispute resolved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to resolve dispute' });
  }
});

// ═══════════════════════════════════════════════════════════════
// SYSTEM LOGS
// ═══════════════════════════════════════════════════════════════

router.get('/logs', async (req, res) => {
  try {
    const { type, limit = 100 } = req.query;

    let query = 'SELECT * FROM system_logs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND log_type = $${paramCount++}`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch logs' });
  }
});

module.exports = router;
