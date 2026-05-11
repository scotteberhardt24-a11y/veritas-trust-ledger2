const express = require('express');
const router = express.Router();
const aiMatcher = require('../services/aiMatcher');
const auth = require('../middleware/auth');

router.post('/match-workers', auth, async (req, res) => {
  try {
    const { jobDetails, location } = req.body;
    const pool = require('../db/db');
    const result = await pool.query('SELECT * FROM workers WHERE status = $1 AND email_verified = true', ['active']);
    const matches = await aiMatcher.matchWorkersToJob(jobDetails, result.rows, location);
    res.json({ status: 'ok', matches });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.post('/analyze-job', auth, async (req, res) => {
  try {
    const { description } = req.body;
    const categories = {
      'leak': 'Plumbing', 'faucet': 'Plumbing', 'pipe': 'Plumbing',
      'electrical': 'Electrical', 'wiring': 'Electrical',
      'hvac': 'HVAC', 'ac': 'HVAC', 'paint': 'Painting'
    };
    let category = 'General';
    for (const [keyword, cat] of Object.entries(categories)) {
      if (description.toLowerCase().includes(keyword)) {
        category = cat;
        break;
      }
    }
    res.json({ status: 'ok', category, estimatedCost: { min: 100, max: 300 } });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

module.exports = router;