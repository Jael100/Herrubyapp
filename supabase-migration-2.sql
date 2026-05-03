-- ============================================================
-- Her Ruby — Migration v2 (Body Logs, Bookings, Circles, Hub, Employer)
-- Run in Supabase SQL Editor after the v1 migration.
-- ============================================================

-- 1. Body symptom logs (one row per user per day)
CREATE TABLE IF NOT EXISTS body_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  symptoms JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, log_date)
);
CREATE INDEX IF NOT EXISTS idx_body_logs_user_date ON body_logs(user_id, log_date DESC);

-- 2. Bookings (programs / experiences / sessions)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id TEXT NOT NULL,
  program_name TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('free','wallet','stripe')),
  credits_spent INTEGER DEFAULT 0,
  amount_cents INTEGER DEFAULT 0,
  stripe_session_id TEXT UNIQUE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  report TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id, created_at DESC);

-- 3. Circles
CREATE TABLE IF NOT EXISTS circle_members (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  circle_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, circle_id)
);

CREATE TABLE IF NOT EXISTS circle_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle ON circle_posts(circle_id, created_at DESC);

CREATE TABLE IF NOT EXISTS circle_post_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES circle_posts(id) ON DELETE CASCADE NOT NULL,
  liked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS circle_event_rsvps (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going','maybe','not_going')),
  rsvp_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);

-- 4. Hub
CREATE TABLE IF NOT EXISTS hub_registrations (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

CREATE TABLE IF NOT EXISTS hub_saves (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

-- 5. Employer credits
CREATE TABLE IF NOT EXISTS employer_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  employer_name TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  max_uses INTEGER DEFAULT 1,
  uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_employer_codes_code ON employer_codes(code);

CREATE TABLE IF NOT EXISTS employer_activations (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employer_code_id UUID REFERENCES employer_codes(id) ON DELETE CASCADE NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, employer_code_id)
);

-- 6. Trigger to keep body_logs.updated_at fresh
CREATE OR REPLACE FUNCTION update_body_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS body_log_updated_at ON body_logs;
CREATE TRIGGER body_log_updated_at
  BEFORE UPDATE ON body_logs
  FOR EACH ROW EXECUTE FUNCTION update_body_log_timestamp();

-- 7. Extend transactions.type to include booking/employer-credit categories
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('topup','gift_received','gift_sent','redemption','employer','booking_wallet','booking_refund'));

-- 8. RLS
ALTER TABLE body_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_activations ENABLE ROW LEVEL SECURITY;

-- body_logs: users see/manage own only
CREATE POLICY "body_logs select own" ON body_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "body_logs insert own" ON body_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "body_logs update own" ON body_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "body_logs delete own" ON body_logs FOR DELETE USING (auth.uid() = user_id);

-- bookings: users see/manage own only
CREATE POLICY "bookings select own" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings insert own" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings update own" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- circle_members: users see/manage own only
CREATE POLICY "circle_members select own" ON circle_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "circle_members insert own" ON circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "circle_members delete own" ON circle_members FOR DELETE USING (auth.uid() = user_id);

-- circle_posts: any authenticated user can read all posts; only owner can write
CREATE POLICY "circle_posts select authed" ON circle_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "circle_posts insert own" ON circle_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "circle_posts delete own" ON circle_posts FOR DELETE USING (auth.uid() = user_id);

-- circle_post_likes: any authed user can read counts; only owner toggles
CREATE POLICY "circle_post_likes select authed" ON circle_post_likes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "circle_post_likes insert own" ON circle_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "circle_post_likes delete own" ON circle_post_likes FOR DELETE USING (auth.uid() = user_id);

-- circle_event_rsvps: own only
CREATE POLICY "circle_event_rsvps select own" ON circle_event_rsvps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "circle_event_rsvps insert own" ON circle_event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "circle_event_rsvps update own" ON circle_event_rsvps FOR UPDATE USING (auth.uid() = user_id);

-- hub: own only
CREATE POLICY "hub_registrations select own" ON hub_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "hub_registrations insert own" ON hub_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hub_registrations delete own" ON hub_registrations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "hub_saves select own" ON hub_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "hub_saves insert own" ON hub_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hub_saves delete own" ON hub_saves FOR DELETE USING (auth.uid() = user_id);

-- employer_codes: any authed can read by code (validation); admin/service inserts
CREATE POLICY "employer_codes select authed" ON employer_codes FOR SELECT USING (auth.role() = 'authenticated');

-- employer_activations: own only
CREATE POLICY "employer_activations select own" ON employer_activations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "employer_activations insert own" ON employer_activations FOR INSERT WITH CHECK (auth.uid() = user_id);
