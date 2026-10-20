-- ============================================
-- SOUQ AI: Subscription Expiration System Migration
-- Run this SQL in your InsForge database console
-- ============================================

-- 1. Add expiration columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resend_notified BOOLEAN DEFAULT FALSE;

-- 2. Add Resend API key column to platform_settings
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS resend_key TEXT;

-- 3. Set initial expiration for existing free users (15 days from now)
UPDATE profiles 
SET plan_started_at = NOW(), 
    plan_expires_at = NOW() + INTERVAL '15 days'
WHERE (plan = 'free' OR plan IS NULL) 
  AND plan_expires_at IS NULL;

-- 4. Set initial expiration for existing paid users (30 days from now)
UPDATE profiles 
SET plan_started_at = NOW(), 
    plan_expires_at = NOW() + INTERVAL '30 days'
WHERE plan IN ('pro', 'vip') 
  AND plan_expires_at IS NULL;

-- 5. Update the activate_plan_webhook RPC to include expiration dates
CREATE OR REPLACE FUNCTION activate_plan_webhook(p_user_id UUID, p_plan TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET
    plan = p_plan,
    is_paid = CASE WHEN p_plan IN ('pro', 'vip') THEN true ELSE false END,
    plan_started_at = NOW(),
    plan_expires_at = CASE
      WHEN p_plan = 'free' THEN NOW() + INTERVAL '15 days'
      WHEN p_plan IN ('pro', 'vip') THEN NOW() + INTERVAL '30 days'
      ELSE NOW() + INTERVAL '15 days'
    END,
    resend_notified = FALSE
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create a new RPC for yearly plans
CREATE OR REPLACE FUNCTION activate_plan_yearly(p_user_id UUID, p_plan TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET
    plan = p_plan,
    is_paid = true,
    plan_started_at = NOW(),
    plan_expires_at = NOW() + INTERVAL '365 days',
    resend_notified = FALSE
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create RPC for renewing a plan (same plan, reset expiry)
CREATE OR REPLACE FUNCTION renew_plan(p_user_id UUID, p_plan TEXT, p_days INTEGER DEFAULT 30)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET
    plan = p_plan,
    is_paid = CASE WHEN p_plan IN ('pro', 'vip') THEN true ELSE false END,
    plan_started_at = NOW(),
    plan_expires_at = NOW() + (p_days || ' days')::INTERVAL,
    resend_notified = FALSE
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create RPC to expire overdue plans
CREATE OR REPLACE FUNCTION expire_overdue_plans()
RETURNS TABLE(user_id UUID, email TEXT, plan TEXT, store_name TEXT) AS $$
BEGIN
  RETURN QUERY
  UPDATE profiles 
  SET plan = 'expired', resend_notified = FALSE
  WHERE plan_expires_at < NOW() 
    AND plan NOT IN ('expired', 'blocked')
    AND plan_expires_at IS NOT NULL
  RETURNING id AS user_id, profiles.email, profiles.plan, profiles.store_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create RPC to get users nearing expiry (for warning emails)
CREATE OR REPLACE FUNCTION get_expiring_soon_users(p_days INTEGER DEFAULT 3)
RETURNS TABLE(user_id UUID, email TEXT, plan TEXT, store_name TEXT, expires_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id AS user_id, p.email, p.plan, p.store_name, p.plan_expires_at AS expires_at
  FROM profiles p
  WHERE p.plan_expires_at IS NOT NULL
    AND p.plan NOT IN ('expired', 'blocked')
    AND p.plan_expires_at BETWEEN NOW() AND NOW() + (p_days || ' days')::INTERVAL
    AND p.resend_notified = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
