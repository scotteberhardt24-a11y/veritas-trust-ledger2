-- Veritas Trust Ledger — Migration v3: Marketplace
-- Run with: psql $DATABASE_URL -f migration_v3.sql

-- Marketplace Jobs (separate from the basic jobs table — this is the full marketplace)
CREATE TABLE IF NOT EXISTS marketplace_jobs (
  job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(user_id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  budget NUMERIC DEFAULT 0,
  urgency TEXT DEFAULT 'standard' CHECK (urgency IN ('standard', 'priority', 'emergency')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matching', 'invited', 'in_progress', 'completed', 'cancelled')),
  match_mode TEXT DEFAULT 'ai' CHECK (match_mode IN ('ai', 'browse')),
  ai_matches JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace Invitations (the 3-pick system)
CREATE TABLE IF NOT EXISTS marketplace_invitations (
  invitation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES marketplace_jobs(job_id),
  client_id UUID REFERENCES users(user_id),
  worker_id UUID REFERENCES users(user_id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  response_message TEXT,
  proposed_rate NUMERIC,
  proposed_timeline TEXT,
  responded_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Smart pricing reference data
CREATE TABLE IF NOT EXISTS pricing_benchmarks (
  category TEXT PRIMARY KEY,
  low_budget NUMERIC,
  mid_budget NUMERIC,
  high_budget NUMERIC,
  hourly_range TEXT,
  sample_size INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert pricing benchmarks
INSERT INTO pricing_benchmarks (category, low_budget, mid_budget, high_budget, hourly_range) VALUES
  ('Web Development', 2000, 5000, 15000, '$50-$120/hr'),
  ('Mobile App', 5000, 15000, 50000, '$60-$150/hr'),
  ('Graphic Design', 200, 800, 3000, '$30-$90/hr'),
  ('UI/UX Design', 500, 2000, 8000, '$40-$100/hr'),
  ('Writing', 50, 300, 1500, '$20-$60/hr'),
  ('Marketing', 500, 2000, 10000, '$40-$100/hr'),
  ('Video', 300, 1500, 8000, '$35-$80/hr'),
  ('Photography', 200, 800, 3000, '$30-$75/hr'),
  ('Plumbing', 150, 500, 2000, '$50-$100/hr'),
  ('Electrical', 200, 800, 3000, '$60-$120/hr'),
  ('HVAC', 200, 600, 2500, '$55-$110/hr'),
  ('Carpentry', 200, 1000, 5000, '$40-$90/hr'),
  ('Cleaning', 50, 200, 800, '$25-$50/hr'),
  ('Moving', 200, 800, 2500, '$30-$60/hr'),
  ('Landscaping', 100, 500, 2000, '$30-$70/hr'),
  ('Auto Repair', 100, 500, 2000, '$50-$100/hr'),
  ('Personal Training', 50, 200, 800, '$40-$100/hr'),
  ('Tutoring', 30, 100, 500, '$25-$80/hr')
ON CONFLICT (category) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mj_client ON marketplace_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_mj_status ON marketplace_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mj_category ON marketplace_jobs(category);
CREATE INDEX IF NOT EXISTS idx_mi_worker ON marketplace_invitations(worker_id);
CREATE INDEX IF NOT EXISTS idx_mi_job ON marketplace_invitations(job_id);
CREATE INDEX IF NOT EXISTS idx_mi_status ON marketplace_invitations(status);
CREATE INDEX IF NOT EXISTS idx_mi_expires ON marketplace_invitations(expires_at);

-- Scheduled: expire invitations that weren't responded to
-- Run via cron or pg_cron:
-- UPDATE marketplace_invitations SET status = 'expired' WHERE status = 'pending' AND expires_at < NOW();
