-- ============================================
-- Fix RLS: Enable INSERT for authenticated users on "stores"
-- ============================================

-- 1. Drop existing insert policy if it exists (by any name)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON stores;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON stores;

-- 2. Create the insert policy
-- This allows authenticated users to insert rows into 'stores' only if the 'user_id' matches their own auth.uid()
-- It ensures that normal users can only register stores under their own account, preventing any spoofing.
CREATE POLICY "Enable insert for authenticated users"
    ON stores
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR is_current_user_super_admin());

-- 3. Verify policies on the stores table
SELECT
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'stores';
