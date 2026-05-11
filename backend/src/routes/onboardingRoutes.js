const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db/db');

router.post('/save', auth, async (req, res) => {
  try {
    const { step, profile } = req.body;
    await pool.query(
      'UPDATE workers SET onboarding_data = $1, onboarding_step = $2 WHERE user_id = $3',
      [JSON.stringify(profile), step, req.user.userId]
    );
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.post('/complete', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE workers SET profile_data = $1, profile_completed = true WHERE user_id = $2',
      [JSON.stringify(req.body), req.user.userId]
    );
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

module.exports = router;