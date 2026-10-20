-- ============================================
-- Fix RLS: Allow owners, super admins, and authorized team members (managers/editors) to manage shipping rates
-- ============================================

-- 1. Drop existing policy
DROP POLICY IF EXISTS "Users can manage their own shipping rates" ON shipping_rates;

-- 2. Create the new policy allowing the owner, super admin, or authorized team members
CREATE POLICY "Users can manage their own shipping rates"
    ON shipping_rates
    FOR ALL
    TO public
    USING (
        auth.uid() = user_id 
        OR is_current_user_super_admin() 
        OR EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.store_owner_id = shipping_rates.user_id 
              AND team_members.member_email = auth.email()
              AND team_members.status = 'active'
              AND team_members.role IN ('manager', 'editor')
        )
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR is_current_user_super_admin() 
        OR EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.store_owner_id = shipping_rates.user_id 
              AND team_members.member_email = auth.email()
              AND team_members.status = 'active'
              AND team_members.role IN ('manager', 'editor')
        )
    );

-- 3. Verify policies on the shipping_rates table
SELECT
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'shipping_rates';
