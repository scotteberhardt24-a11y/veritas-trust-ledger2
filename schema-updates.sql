-- DATABASE SCHEMA UPDATES - Run this to upgrade your database
-- Run: psql -U veritas -d veritas -f schema-updates.sql

-- ═══════════════════════════════════════════════════════════════
-- USERS TABLE UPDATES
-- ═══════════════════════════════════════════════════════════════

-- Email verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Worker profile completion
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completion INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Service information
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_categories TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_experience JSONB; -- {category: years}
ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications JSONB;

-- Rate structure
ALTER TABLE users ADD COLUMN IF NOT EXISTS rate_structure JSONB;
-- Example: {"hasBaseRate": true, "baseRateHourly": 85, "travelFee": 25, "emergencyMultiplier": 1.5}

-- Service area
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_area JSONB;
-- Example: {"zipCode": "98101", "radiusMiles": 25, "coords": {"lat": 47.6, "lng": -122.3}}

-- Portfolio
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio JSONB;
-- Example: [{"url": "...", "description": "...", "beforeAfter": true}]

-- Schedule & availability
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_schedule JSONB;
-- Example: {"monday": ["9:00", "17:00"], "tuesday": ["9:00", "17:00"], ...}

-- Verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status JSONB;
-- Example: {"idVerified": true, "licenseVerified": false, "insuranceVerified": true}

-- Preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_preferences JSONB;
-- Example: {"minJobSize": 100, "maxJobSize": 5000, "preferredClientTypes": ["residential"]}

-- ═══════════════════════════════════════════════════════════════
-- NEW TABLES
-- ═══════════════════════════════════════════════════════════════

-- Regional rate data
CREATE TABLE IF NOT EXISTS regional_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  rate_data JSONB NOT NULL,
  -- Example: {"min": 50, "max": 120, "median": 85, "mean": 87, "p25": 70, "p75": 95}
  sample_size INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_category, zip_code)
);

CREATE INDEX IF NOT EXISTS idx_regional_rates_zip ON regional_rates(zip_code);
CREATE INDEX IF NOT EXISTS idx_regional_rates_category ON regional_rates(service_category);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  urgency VARCHAR(20) DEFAULT 'standard', -- standard, urgent, emergency
  status VARCHAR(20) DEFAULT 'posted', -- posted, matched, accepted, in_progress, completed, cancelled, disputed
  
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  budget_flexible BOOLEAN DEFAULT TRUE,
  
  location JSONB NOT NULL, -- {address, city, state, zip, coords}
  photos JSONB, -- array of URLs
  
  preferred_date TIMESTAMP,
  estimated_duration DECIMAL(5,2), -- hours
  
  ai_match_scores JSONB, -- stores top 3 worker matches with scores
  selected_worker_score DECIMAL(5,2), -- what was the match score of hired worker
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  final_price DECIMAL(10,2),
  client_satisfaction INT, -- 1-5
  worker_satisfaction INT -- 1-5
);

CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_worker ON jobs(worker_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);

-- AI Learning Events
CREATE TABLE IF NOT EXISTS ai_learning_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL, -- job_match, price_suggestion, dispute, review
  job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE,
  event_data JSONB NOT NULL,
  outcome JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_events_type ON ai_learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_events_job ON ai_learning_events(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_created ON ai_learning_events(created_at DESC);

-- A/B Experiments
CREATE TABLE IF NOT EXISTS experiments (
  experiment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  hypothesis TEXT,
  config JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'running', -- running, paused, completed
  results JSONB,
  winner VARCHAR(50), -- control or variant name
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- Experiment assignments (which users see which variant)
CREATE TABLE IF NOT EXISTS experiment_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(experiment_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  variant VARCHAR(50) NOT NULL, -- control, test_a, test_b, etc
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(experiment_id, user_id)
);

-- Worker availability calendar
CREATE TABLE IF NOT EXISTS worker_availability (
  availability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slots JSONB NOT NULL, -- [{"start": "09:00", "end": "12:00", "available": true}]
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(worker_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_worker ON worker_availability(worker_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON worker_availability(date);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB, -- URLs to files
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_job ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  dispute_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE,
  filed_by UUID REFERENCES users(user_id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL, -- work_quality, payment, scope_change, other
  description TEXT NOT NULL,
  evidence JSONB, -- photos, docs, etc
  status VARCHAR(20) DEFAULT 'open', -- open, investigating, resolved, closed
  resolution TEXT,
  resolved_by UUID REFERENCES users(user_id) ON DELETE SET NULL, -- admin who resolved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disputes_job ON disputes(job_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT, -- reviewee can respond
  photos JSONB, -- proof of work photos
  helpful_count INT DEFAULT 0,
  verified BOOLEAN DEFAULT TRUE, -- AI verified as legitimate
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_job ON reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INT AS $$
DECLARE
  completion INT := 0;
  user_record RECORD;
BEGIN
  SELECT * INTO user_record FROM users WHERE user_id = user_id_param;
  
  -- Basic info (20%)
  IF user_record.name IS NOT NULL THEN completion := completion + 5; END IF;
  IF user_record.email IS NOT NULL THEN completion := completion + 5; END IF;
  IF user_record.phone IS NOT NULL THEN completion := completion + 5; END IF;
  IF user_record.email_verified THEN completion := completion + 5; END IF;
  
  -- Service categories (15%)
  IF user_record.service_categories IS NOT NULL AND array_length(user_record.service_categories, 1) > 0 THEN
    completion := completion + 15;
  END IF;
  
  -- Rates (15%)
  IF user_record.rate_structure IS NOT NULL THEN
    completion := completion + 15;
  END IF;
  
  -- Service area (10%)
  IF user_record.service_area IS NOT NULL THEN
    completion := completion + 10;
  END IF;
  
  -- Portfolio (15%)
  IF user_record.portfolio IS NOT NULL AND jsonb_array_length(user_record.portfolio) >= 3 THEN
    completion := completion + 15;
  END IF;
  
  -- Availability schedule (10%)
  IF user_record.availability_schedule IS NOT NULL THEN
    completion := completion + 10;
  END IF;
  
  -- Verification (15%)
  IF user_record.verification_status IS NOT NULL THEN
    completion := completion + 15;
  END IF;
  
  RETURN completion;
END;
$$ LANGUAGE plpgsql;

-- Update profile completion on user changes
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion := calculate_profile_completion(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profile_completion ON users;
CREATE TRIGGER update_user_profile_completion
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- ═══════════════════════════════════════════════════════════════
-- VIEWS FOR ANALYTICS
-- ═══════════════════════════════════════════════════════════════

-- Admin dashboard metrics
CREATE OR REPLACE VIEW admin_metrics AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'worker') as total_workers,
  (SELECT COUNT(*) FROM users WHERE role = 'client') as total_clients,
  (SELECT COUNT(*) FROM jobs WHERE status = 'posted') as active_jobs,
  (SELECT COUNT(*) FROM jobs WHERE status IN ('accepted', 'in_progress')) as jobs_in_progress,
  (SELECT COUNT(*) FROM jobs WHERE status = 'completed' AND DATE(completed_at) = CURRENT_DATE) as jobs_completed_today,
  (SELECT COALESCE(SUM(final_price), 0) FROM jobs WHERE status = 'completed') as total_escrow_volume,
  (SELECT COALESCE(SUM(final_price * 0.025), 0) FROM jobs WHERE status = 'completed' AND DATE(completed_at) = CURRENT_DATE) as revenue_today,
  (SELECT COUNT(*) FROM disputes WHERE status = 'open') as open_disputes,
  (SELECT AVG(rating) FROM reviews WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days') as avg_rating_30d;

-- Worker leaderboard
CREATE OR REPLACE VIEW worker_leaderboard AS
SELECT
  u.user_id,
  u.name,
  u.truscore,
  u.tier,
  COUNT(DISTINCT j.job_id) as jobs_completed,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(DISTINCT r.review_id) as review_count,
  COALESCE(SUM(j.final_price), 0) as total_earnings
FROM users u
LEFT JOIN jobs j ON u.user_id = j.worker_id AND j.status = 'completed'
LEFT JOIN reviews r ON u.user_id = r.reviewee_id
WHERE u.role = 'worker'
GROUP BY u.user_id, u.name, u.truscore, u.tier
ORDER BY u.truscore DESC, jobs_completed DESC;

-- Job matching analytics
CREATE OR REPLACE VIEW job_match_analytics AS
SELECT
  j.job_id,
  j.category,
  j.urgency,
  j.budget_min,
  j.budget_max,
  j.final_price,
  (j.ai_match_scores->0->>'score')::DECIMAL as top_match_score,
  j.selected_worker_score,
  CASE 
    WHEN j.worker_id = (j.ai_match_scores->0->>'workerId')::UUID THEN 'hired_top_match'
    WHEN j.worker_id IN (
      SELECT (jsonb_array_elements(j.ai_match_scores)->>'workerId')::UUID
    ) THEN 'hired_suggested'
    ELSE 'hired_other'
  END as match_outcome,
  j.client_satisfaction,
  j.worker_satisfaction
FROM jobs j
WHERE j.status = 'completed' AND j.ai_match_scores IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- SEED SOME SAMPLE DATA
-- ═══════════════════════════════════════════════════════════════

-- Sample regional rates (Seattle area)
INSERT INTO regional_rates (service_category, zip_code, rate_data, sample_size) VALUES
('Plumbing', '98101', '{"min": 70, "max": 120, "median": 85, "mean": 88, "p25": 75, "p75": 95}', 45),
('Electrical', '98101', '{"min": 75, "max": 130, "median": 90, "mean": 92, "p25": 80, "p75": 100}', 38),
('HVAC', '98101', '{"min": 80, "max": 140, "median": 95, "mean": 98, "p25": 85, "p75": 110}', 32),
('Plumbing', '98102', '{"min": 65, "max": 115, "median": 82, "mean": 85, "p25": 72, "p75": 92}', 41),
('Carpentry', '98101', '{"min": 60, "max": 110, "median": 75, "mean": 78, "p25": 65, "p75": 85}', 52)
ON CONFLICT (service_category, zip_code) DO NOTHING;

-- All done!
SELECT 'Schema updated successfully! ✓' as status;
