-- ═══════════════════════════════════════════════════════════════════════════
-- VERITAS STRIPE PAYMENTS MIGRATION
-- Run with: psql -U boss -d veritas_ledger -f stripe-migration.sql
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Stripe customers (maps Veritas user → Stripe customer ID) ────────────────
CREATE TABLE IF NOT EXISTS stripe_customers (
  user_id           uuid PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE NOT NULL,
  created_at        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Payment intents (each escrow funding = one payment intent) ───────────────
CREATE TABLE IF NOT EXISTS payment_intents (
  intent_id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  escrow_id           uuid NOT NULL REFERENCES escrows(escrow_id) ON DELETE CASCADE,
  stripe_intent_id    text UNIQUE NOT NULL,
  stripe_client_secret text NOT NULL,
  amount_cents        integer NOT NULL,
  platform_fee_cents  integer NOT NULL DEFAULT 0,
  currency            text NOT NULL DEFAULT 'usd',
  status              text NOT NULL DEFAULT 'requires_payment_method'
                      CHECK (status IN (
                        'requires_payment_method','requires_confirmation',
                        'requires_action','processing','requires_capture',
                        'canceled','succeeded'
                      )),
  captured_at         timestamp,
  created_at          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payment_intents_escrow  ON payment_intents(escrow_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe  ON payment_intents(stripe_intent_id);

-- ── Payouts (worker receiving released funds) ────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  payout_id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  escrow_id           uuid NOT NULL REFERENCES escrows(escrow_id) ON DELETE RESTRICT,
  worker_id           uuid NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  stripe_transfer_id  text UNIQUE,
  amount_cents        integer NOT NULL,
  currency            text NOT NULL DEFAULT 'usd',
  status              text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','in_transit','paid','failed','canceled')),
  failure_reason      text,
  paid_at             timestamp,
  created_at          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payouts_worker ON payouts(worker_id);
CREATE INDEX IF NOT EXISTS idx_payouts_escrow ON payouts(escrow_id);

-- ── Stripe Connect accounts (workers get paid via Stripe Connect) ────────────
CREATE TABLE IF NOT EXISTS stripe_connect_accounts (
  user_id             uuid PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  stripe_account_id   text UNIQUE NOT NULL,
  onboarding_complete boolean NOT NULL DEFAULT false,
  payouts_enabled     boolean NOT NULL DEFAULT false,
  charges_enabled     boolean NOT NULL DEFAULT false,
  created_at          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Webhook events log (idempotency — never process same event twice) ────────
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  stripe_event_id   text PRIMARY KEY,
  event_type        text NOT NULL,
  processed         boolean NOT NULL DEFAULT false,
  processed_at      timestamp,
  error             text,
  payload           jsonb,
  created_at        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON stripe_webhook_events(event_type);

-- ── Add Stripe fields to escrows ─────────────────────────────────────────────
ALTER TABLE escrows
  ADD COLUMN IF NOT EXISTS stripe_intent_id   text,
  ADD COLUMN IF NOT EXISTS funded_at          timestamp,
  ADD COLUMN IF NOT EXISTS amount_cents       integer;

COMMIT;
