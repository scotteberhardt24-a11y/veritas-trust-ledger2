/**
 * Veritas Trust Ledger — Stripe Routes
 * Works in TEST MODE with no live keys.
 * Swap STRIPE_SECRET_KEY to live key to go live.
 *
 * Test cards:
 *   4242 4242 4242 4242  — success
 *   4000 0000 0000 9995  — card declined
 *   4000 0025 0000 3155  — requires 3DS auth
 */

const express = require('express');
const router  = express.Router();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Lazy-init Stripe so server starts even without a key
let _stripe = null;
function stripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.includes('YOUR_SECRET')) {
      // Return a mock in demo mode
      return null;
    }
    _stripe = require('stripe')(key);
  }
  return _stripe;
}

const PLATFORM_FEE_PCT = 0.025; // 2.5%

// ─── Auth middleware ──────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── DEMO MODE helper ─────────────────────────────────────────────────────────
// When no Stripe key is set, simulate the full flow in-DB without real money.
function demoMode() {
  return !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('YOUR_SECRET');
}

// ─── 1. Create Payment Intent (fund an escrow) ────────────────────────────────
// POST /api/stripe/create-payment-intent
// Body: { escrow_id }
// Returns: { clientSecret, amount, currency, demo }
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { escrow_id } = req.body;
    if (!escrow_id) return res.status(400).json({ error: 'escrow_id required' });

    // Fetch escrow
    const { rows } = await pool.query(
      'SELECT * FROM escrows WHERE escrow_id = $1 AND client_id = $2',
      [escrow_id, req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Escrow not found' });
    const escrow = rows[0];
    if (escrow.status !== 'pending') return res.status(400).json({ error: 'Escrow already funded' });

    const amountCents = Math.round(parseFloat(escrow.amount) * 100);
    const feeCents    = Math.round(amountCents * PLATFORM_FEE_PCT);

    if (demoMode()) {
      // Demo: mark escrow as active without Stripe
      await pool.query(
        `UPDATE escrows SET status='active', funded_at=NOW(),
         stripe_payment_intent_id='demo_pi_' || LEFT(gen_random_uuid()::text,8)
         WHERE escrow_id=$1`,
        [escrow_id]
      );
      return res.json({
        clientSecret: 'demo_secret_' + escrow_id,
        amount: amountCents,
        fee: feeCents,
        currency: 'usd',
        demo: true,
        message: 'Demo mode — no real payment processed',
      });
    }

    // Real Stripe
    const s = stripe();
    const intent = await s.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: {
        escrow_id,
        client_id:  req.user.userId,
        worker_id:  escrow.worker_id,
        platform_fee_cents: feeCents,
      },
      description: `Veritas Escrow: ${escrow.title || escrow_id}`,
    });

    // Save intent id on escrow row
    await pool.query(
      'UPDATE escrows SET stripe_payment_intent_id=$1 WHERE escrow_id=$2',
      [intent.id, escrow_id]
    );

    res.json({
      clientSecret: intent.client_secret,
      amount: amountCents,
      fee: feeCents,
      currency: 'usd',
      demo: false,
    });
  } catch (err) {
    console.error('create-payment-intent error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 2. Confirm funding (webhook or manual confirm) ───────────────────────────
// POST /api/stripe/confirm-funding
// Body: { payment_intent_id }
router.post('/confirm-funding', auth, async (req, res) => {
  try {
    const { payment_intent_id } = req.body;
    if (!payment_intent_id) return res.status(400).json({ error: 'payment_intent_id required' });

    const { rows } = await pool.query(
      'SELECT * FROM escrows WHERE stripe_payment_intent_id=$1',
      [payment_intent_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Escrow not found for this payment intent' });
    const escrow = rows[0];

    if (demoMode() || payment_intent_id.startsWith('demo_')) {
      await pool.query(
        `UPDATE escrows SET status='active', funded_at=NOW() WHERE escrow_id=$1`,
        [escrow.escrow_id]
      );
      return res.json({ success: true, escrow_id: escrow.escrow_id, status: 'active', demo: true });
    }

    // Verify with Stripe
    const s = stripe();
    const intent = await s.paymentIntents.retrieve(payment_intent_id);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: `Payment not succeeded: ${intent.status}` });
    }

    await pool.query(
      `UPDATE escrows SET status='active', funded_at=NOW() WHERE escrow_id=$1`,
      [escrow.escrow_id]
    );

    // Log ledger event
    await pool.query(
      `INSERT INTO ledger_events (type, payload, user_id, created_at)
       VALUES ('escrow_funded', $1::jsonb, $2, NOW())`,
      [JSON.stringify({ escrow_id: escrow.escrow_id, amount: escrow.amount }), escrow.client_id]
    );

    res.json({ success: true, escrow_id: escrow.escrow_id, status: 'active' });
  } catch (err) {
    console.error('confirm-funding error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 3. Release escrow → pay worker ──────────────────────────────────────────
// POST /api/stripe/release/:escrowId
// Requires: client auth OR admin
router.post('/release/:escrowId', auth, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM escrows WHERE escrow_id=$1',
      [escrowId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Escrow not found' });
    const escrow = rows[0];

    if (escrow.client_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the client can release this escrow' });
    }
    if (escrow.status !== 'active') {
      return res.status(400).json({ error: `Cannot release escrow in status: ${escrow.status}` });
    }

    const amountCents = Math.round(parseFloat(escrow.amount) * 100);
    const feeCents    = Math.round(amountCents * PLATFORM_FEE_PCT);
    const workerCents = amountCents - feeCents;

    if (demoMode()) {
      // Demo: credit worker balance directly
      await pool.query(
        `UPDATE account_balances
         SET balance = balance + $1, total_earned = total_earned + $1, updated_at = NOW()
         WHERE user_id = $2`,
        [workerCents / 100, escrow.worker_id]
      );
      await pool.query(
        `UPDATE escrows SET status='released', released_at=NOW(),
         platform_fee=$1, worker_payout=$2
         WHERE escrow_id=$3`,
        [feeCents / 100, workerCents / 100, escrowId]
      );
      await pool.query(
        `INSERT INTO ledger_events (type, payload, user_id, created_at)
         VALUES ('escrow_released', $1::jsonb, $2, NOW())`,
        [JSON.stringify({ escrow_id: escrowId, worker_payout: workerCents / 100, fee: feeCents / 100 }), req.user.userId]
      );
      return res.json({ success: true, worker_payout: workerCents / 100, platform_fee: feeCents / 100, demo: true });
    }

    // Real Stripe — transfer to worker's Connect account
    const s = stripe();
    const worker = await pool.query('SELECT stripe_account_id FROM users WHERE user_id=$1', [escrow.worker_id]);
    const workerStripeId = worker.rows[0]?.stripe_account_id;

    if (!workerStripeId) {
      return res.status(400).json({ error: 'Worker has not completed Stripe payout setup' });
    }

    const transfer = await s.transfers.create({
      amount: workerCents,
      currency: 'usd',
      destination: workerStripeId,
      metadata: { escrow_id: escrowId },
    });

    await pool.query(
      `UPDATE escrows
       SET status='released', released_at=NOW(),
           stripe_transfer_id=$1, platform_fee=$2, worker_payout=$3
       WHERE escrow_id=$4`,
      [transfer.id, feeCents / 100, workerCents / 100, escrowId]
    );

    // Credit worker balance in DB
    await pool.query(
      `UPDATE account_balances
       SET balance = balance + $1, total_earned = total_earned + $1, updated_at = NOW()
       WHERE user_id = $2`,
      [workerCents / 100, escrow.worker_id]
    );

    await pool.query(
      `INSERT INTO ledger_events (type, payload, user_id, created_at)
       VALUES ('escrow_released', $1::jsonb, $2, NOW())`,
      [JSON.stringify({ escrow_id: escrowId, transfer_id: transfer.id, worker_payout: workerCents / 100 }), req.user.userId]
    );

    res.json({ success: true, transfer_id: transfer.id, worker_payout: workerCents / 100, platform_fee: feeCents / 100 });
  } catch (err) {
    console.error('release error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 4. Worker Connect onboarding ─────────────────────────────────────────────
// POST /api/stripe/connect/onboard
// Returns: { url } — redirect worker to Stripe Express onboarding
router.post('/connect/onboard', auth, async (req, res) => {
  try {
    if (demoMode()) {
      // Demo: save a fake connect ID
      await pool.query(
        `UPDATE users SET stripe_account_id='demo_acct_' || LEFT(gen_random_uuid()::text,8) WHERE user_id=$1`,
        [req.user.userId]
      );
      return res.json({
        url: null,
        demo: true,
        message: 'Demo mode — Stripe account simulated. Add real keys for live onboarding.',
        stripe_account_id: 'demo_acct_simulated',
      });
    }

    const s = stripe();

    // Check if already has a Connect account
    const { rows } = await pool.query('SELECT stripe_account_id FROM users WHERE user_id=$1', [req.user.userId]);
    let accountId = rows[0]?.stripe_account_id;

    if (!accountId) {
      const account = await s.accounts.create({
        type: 'express',
        metadata: { veritas_user_id: req.user.userId },
      });
      accountId = account.id;
      await pool.query('UPDATE users SET stripe_account_id=$1 WHERE user_id=$2', [accountId, req.user.userId]);
    }

    const link = await s.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/settings?stripe=refresh`,
      return_url:  `${process.env.FRONTEND_URL}/settings?stripe=complete`,
      type: 'account_onboarding',
    });

    res.json({ url: link.url, demo: false });
  } catch (err) {
    console.error('connect/onboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 5. Check Connect status ──────────────────────────────────────────────────
// GET /api/stripe/connect/status
router.get('/connect/status', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT stripe_account_id FROM users WHERE user_id=$1', [req.user.userId]);
    const accountId = rows[0]?.stripe_account_id;

    if (!accountId) return res.json({ connected: false, demo: false });

    if (demoMode() || accountId.startsWith('demo_')) {
      return res.json({ connected: true, demo: true, account_id: accountId });
    }

    const s = stripe();
    const account = await s.accounts.retrieve(accountId);
    res.json({
      connected: account.charges_enabled && account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_id: accountId,
      demo: false,
    });
  } catch (err) {
    console.error('connect/status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 6. Stripe Webhook ────────────────────────────────────────────────────────
// POST /api/stripe/webhook
// Raw body required — mount BEFORE express.json() in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (demoMode()) return res.json({ received: true, demo: true });

  const sig = req.headers['stripe-signature'];
  const s   = stripe();
  let event;

  try {
    event = s.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook sig failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      await pool.query(
        `UPDATE escrows SET status='active', funded_at=NOW()
         WHERE stripe_payment_intent_id=$1 AND status='pending'`,
        [pi.id]
      );
      console.log(`✓ Escrow funded via webhook: ${pi.id}`);
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.warn(`✗ Payment failed: ${pi.id} — ${pi.last_payment_error?.message}`);
      break;
    }
    case 'account.updated': {
      const acct = event.data.object;
      if (acct.charges_enabled && acct.payouts_enabled) {
        await pool.query(
          `UPDATE users SET stripe_onboarded=true WHERE stripe_account_id=$1`,
          [acct.id]
        );
        console.log(`✓ Worker onboarded: ${acct.id}`);
      }
      break;
    }
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
