-- 1. Create the platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    platform_name TEXT NOT NULL DEFAULT 'SOUQ AI',
    allow_registration BOOLEAN NOT NULL DEFAULT true,
    pro_price NUMERIC NOT NULL DEFAULT 15,
    vip_price NUMERIC NOT NULL DEFAULT 45,
    commission_rate NUMERIC NOT NULL DEFAULT 0,
    openai_key TEXT,
    gemini_key TEXT,
    stripe_key TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert the single configuration row if it doesn't exist
INSERT INTO platform_settings (id, platform_name, allow_registration, pro_price, vip_price, commission_rate)
VALUES (1, 'SOUQ AI', true, 15, 45, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Row Level Security (RLS)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read public settings (like platform name, registration status, pricing)
-- For maximum security later, you can restrict the view of secret keys to super admins only.
-- For local development, we allow all access:
CREATE POLICY "Super Admins have full access to settings" ON platform_settings FOR ALL USING (true) WITH CHECK (true);
