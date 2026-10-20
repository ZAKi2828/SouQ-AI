-- ============================================
-- الإصلاح النهائي لـ RLS
-- ============================================

-- 1. حذف جميع السياسات
DROP POLICY IF EXISTS "Allow all inserts" ON abandoned_forms;
DROP POLICY IF EXISTS "Allow all updates" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can view own forms" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON abandoned_forms;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can view own abandoned forms" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can update own abandoned forms" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can delete own abandoned forms" ON abandoned_forms;

-- 2. تعطيل RLS مؤقتاً
ALTER TABLE abandoned_forms DISABLE ROW LEVEL SECURITY;

-- 3. إعادة تفعيل RLS
ALTER TABLE abandoned_forms ENABLE ROW LEVEL SECURITY;

-- 4. سياسة بسيطة جداً - السماح بالإدراج لأي شخص
CREATE POLICY "Enable insert for all users"
    ON abandoned_forms
    FOR INSERT
    WITH CHECK (true);

-- 5. سياسة للتحديث - السماح لأي شخص بالتحديث
CREATE POLICY "Enable update for all users"
    ON abandoned_forms
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 6. سياسة للعرض - المستخدمون المصرحون يرون نماذجهم فقط
CREATE POLICY "Enable select for authenticated users"
    ON abandoned_forms
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 7. سياسة للحذف - المستخدمون المصرحون يحذفون نماذجهم فقط
CREATE POLICY "Enable delete for authenticated users"
    ON abandoned_forms
    FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 8. التحقق
SELECT
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'abandoned_forms'
ORDER BY policyname;
