-- ============================================================
-- Her Ruby — Database Schema (Profiles + Wallet & Gift System)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 0. Profiles table — extended user data linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  age_range TEXT,
  work_context TEXT,
  menopause_stage TEXT,
  goals TEXT[],
  tracked_symptoms TEXT[],
  notification_prefs JSONB DEFAULT '{}'::jsonb,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending','submitted','verified','rejected')),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Auto-update updated_at on profile changes
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profile_updated_at ON profiles;
CREATE TRIGGER profile_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp();

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Backfill profiles for existing users
INSERT INTO profiles (id, name, email)
SELECT id,
       COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', ''),
       email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 1. Wallets table — one per user
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance INTEGER DEFAULT 0 NOT NULL CHECK (balance >= 0),
  funding_source TEXT DEFAULT 'self' CHECK (funding_source IN ('self', 'employer', 'gift')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Gift codes table — generated after Stripe payment
CREATE TABLE IF NOT EXISTS gift_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  pack_id TEXT NOT NULL,
  sender_email TEXT,
  recipient_email TEXT NOT NULL,
  gift_message TEXT,
  stripe_session_id TEXT,
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_by UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Transactions table — all credit movements
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topup', 'gift_received', 'gift_sent', 'redemption', 'employer')),
  credits INTEGER NOT NULL,
  description TEXT,
  gift_code_id UUID REFERENCES gift_codes(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_codes_code ON gift_codes(code);
CREATE INDEX IF NOT EXISTS idx_gift_codes_recipient ON gift_codes(recipient_email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- 5. Auto-create wallet when a new user signs up
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, funding_source)
  VALUES (NEW.id, 0, 'self')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_user();

-- 6. Auto-update updated_at on wallet changes
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wallet_updated_at ON wallets;
CREATE TRIGGER wallet_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_wallet_timestamp();

-- 7. Row Level Security (RLS)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Wallets: users can only see/update their own wallet
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Gift codes: anyone can view by code (for redemption), users can see their redeemed ones
CREATE POLICY "Anyone can view gift codes by code" ON gift_codes
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert gift codes" ON gift_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update gift codes" ON gift_codes
  FOR UPDATE USING (true);

-- Transactions: users can only see their own
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Create wallets for existing users (run once)
INSERT INTO wallets (user_id, balance, funding_source)
SELECT id, 0, 'self' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
