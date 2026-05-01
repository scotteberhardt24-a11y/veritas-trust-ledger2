CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, role TEXT DEFAULT 'worker' CHECK (role IN ('worker','client','admin')),
  tier TEXT DEFAULT 'Starter', truscore NUMERIC DEFAULT 0,
  serial TEXT UNIQUE DEFAULT ('VTL-' || encode(gen_random_bytes(6), 'hex')),
  jobs_completed INTEGER DEFAULT 0, success_rate NUMERIC DEFAULT 0, avg_rating NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0, total_earned NUMERIC DEFAULT 0, is_verified BOOLEAN DEFAULT false,
  avatar_url TEXT, push_token TEXT, public_key TEXT, stripe_account_id TEXT, stripe_onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS trust_scores (
  user_id UUID PRIMARY KEY REFERENCES users(user_id), score NUMERIC DEFAULT 0, tier TEXT DEFAULT 'Starter',
  history JSONB DEFAULT '[]', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS escrows (
  escrow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), client_id UUID REFERENCES users(user_id),
  worker_id UUID REFERENCES users(user_id), title TEXT NOT NULL, amount NUMERIC NOT NULL,
  milestones JSONB DEFAULT '[]', status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending','active','funded','released','disputed','cancelled')),
  dispute_reason TEXT, stripe_payment_intent_id TEXT, stripe_transfer_id TEXT,
  platform_fee NUMERIC, worker_payout NUMERIC, funded_at TIMESTAMP, released_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS jobs (
  job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), client_id UUID REFERENCES users(user_id),
  title TEXT NOT NULL, description TEXT, category TEXT, budget NUMERIC,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS job_applications (
  application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), job_id UUID REFERENCES jobs(job_id),
  worker_id UUID REFERENCES users(user_id), cover_note TEXT, status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS messages (
  message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), thread_id UUID NOT NULL,
  sender_id UUID REFERENCES users(user_id), recipient_id UUID REFERENCES users(user_id),
  content TEXT NOT NULL, read BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(user_id),
  type TEXT NOT NULL, title TEXT, body TEXT, data JSONB DEFAULT '{}', read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ledger_events (
  id BIGSERIAL PRIMARY KEY, type TEXT NOT NULL, payload JSONB NOT NULL, user_id UUID,
  signature TEXT, hash TEXT NOT NULL, previous_hash TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS event_store (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), event_type TEXT NOT NULL, aggregate_id UUID,
  payload JSONB, signature TEXT, node_id TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS account_balances (user_id UUID PRIMARY KEY REFERENCES users(user_id), balance NUMERIC DEFAULT 0, total_earned NUMERIC DEFAULT 0, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS ledger_results (id SERIAL PRIMARY KEY, a INTEGER, b INTEGER, result TEXT, iv TEXT, tag TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_escrows_client ON escrows(client_id);
CREATE INDEX IF NOT EXISTS idx_escrows_worker ON escrows(worker_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_events_type ON ledger_events(type);
CREATE INDEX IF NOT EXISTS idx_event_store_type ON event_store(event_type);
CREATE INDEX IF NOT EXISTS idx_event_store_aggregate ON event_store(aggregate_id);
