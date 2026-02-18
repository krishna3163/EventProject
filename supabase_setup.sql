-- ═══════════════════════════════════════════════════════════════
-- SUPABASE SETUP SQL — EventHub Platform
-- Run this in Supabase SQL Editor (https://app.supabase.com)
-- ═══════════════════════════════════════════════════════════════

-- 1. PARTICIPATIONS TABLE
-- Tracks every time a user participates in a quiz or contest
CREATE TABLE IF NOT EXISTS participations (
    id              BIGSERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL,          -- MongoDB User ID
    user_email      TEXT,
    user_name       TEXT,
    event_id        TEXT NOT NULL,          -- MongoDB Event/Contest ID
    event_title     TEXT,
    event_type      TEXT DEFAULT 'QUIZ',    -- 'QUIZ' or 'CONTEST'
    org_id          TEXT,                   -- MongoDB Organization ID
    score           INTEGER DEFAULT 0,
    max_score       INTEGER DEFAULT 100,
    rank            INTEGER,
    participated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)               -- One entry per user per event
);

-- 2. INDEXES for fast lookups
CREATE INDEX IF NOT EXISTS idx_participations_user_id   ON participations(user_id);
CREATE INDEX IF NOT EXISTS idx_participations_event_id  ON participations(event_id);
CREATE INDEX IF NOT EXISTS idx_participations_org_id    ON participations(org_id);
CREATE INDEX IF NOT EXISTS idx_participations_score     ON participations(score DESC);

-- 3. ROW LEVEL SECURITY (RLS) — allow anon reads, authenticated writes
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for leaderboards)
CREATE POLICY "Allow public read" ON participations
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update their own records
CREATE POLICY "Allow authenticated insert" ON participations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON participations
    FOR UPDATE USING (true);

-- 4. SAMPLE DATA (optional — remove in production)
-- INSERT INTO participations (user_id, user_email, user_name, event_id, event_title, event_type, score, max_score)
-- VALUES
--   ('user1', 'alice@demo.com', 'Alice Smith', 'event1', 'Java Basics Quiz', 'QUIZ', 85, 100),
--   ('user2', 'bob@demo.com', 'Bob Jones', 'event1', 'Java Basics Quiz', 'QUIZ', 72, 100),
--   ('user1', 'alice@demo.com', 'Alice Smith', 'contest1', 'Coding Challenge', 'CONTEST', 95, 100);

-- 5. USEFUL VIEWS

-- Leaderboard view per event
CREATE OR REPLACE VIEW event_leaderboard AS
SELECT
    event_id,
    event_title,
    user_id,
    user_name,
    user_email,
    score,
    max_score,
    ROUND((score::DECIMAL / NULLIF(max_score, 0)) * 100, 1) AS percentage,
    RANK() OVER (PARTITION BY event_id ORDER BY score DESC) AS rank,
    participated_at
FROM participations;

-- User summary view
CREATE OR REPLACE VIEW user_summary AS
SELECT
    user_id,
    user_name,
    user_email,
    COUNT(*) AS total_participations,
    COUNT(*) FILTER (WHERE event_type = 'QUIZ') AS quiz_count,
    COUNT(*) FILTER (WHERE event_type = 'CONTEST') AS contest_count,
    ROUND(AVG(score), 1) AS avg_score,
    SUM(score) AS total_score,
    MIN(participated_at) AS first_participation,
    MAX(participated_at) AS last_participation
FROM participations
GROUP BY user_id, user_name, user_email;

-- Organization analytics view
CREATE OR REPLACE VIEW org_analytics AS
SELECT
    org_id,
    COUNT(*) AS total_participations,
    COUNT(DISTINCT user_id) AS unique_participants,
    COUNT(DISTINCT event_id) AS events_with_participation,
    ROUND(AVG(score), 1) AS avg_score,
    MAX(score) AS highest_score
FROM participations
WHERE org_id IS NOT NULL
GROUP BY org_id;
