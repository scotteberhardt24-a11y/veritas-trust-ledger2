const express = require('express');
const router = express.Router();
const { runLedger, encryptResult } = require('../services/cobol/cobolService');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'veritas',
  password: process.env.DB_PASS || 'password',
  port: process.env.DB_PORT || 5432,
});

router.get('/add', async (req, res) => {
  const a = parseInt(req.query.a) || 5;
  const b = parseInt(req.query.b) || 10;

  runLedger(a, b, async (err, result) => {
    if (err) return res.status(500).json({ error: 'Ledger error' });

    const encrypted = encryptResult(result);

    // Save to PostgreSQL
    try {
      await pool.query(
        'INSERT INTO ledger_results(a, b, result, iv, tag) VALUES($1, $2, $3, $4, $5)',
        [a, b, encrypted.data, encrypted.iv, encrypted.tag]
      );
    } catch (dbErr) {
      console.error(dbErr);
    }

    res.json({ result: encrypted });
  });
});

module.exports = router;
