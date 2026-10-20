-- ============================================
-- إصلاح سياسات RLS للنماذج المتروكة
-- ============================================

-- 1. حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "Allow anonymous inserts" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can view own abandoned forms" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can update own abandoned forms" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can delete own abandoned forms" ON abandoned_forms;

-- 2. تعطيل RLS مؤقتاً
ALTER TABLE abandoned_forms DISABLE ROW LEVEL SECURITY;

-- 3. إعادة تفعيل RLS
ALTER TABLE abandoned_forms ENABLE ROW LEVEL SECURITY;

-- 4. إنشاء سياسة للسماح بالإدراج من أي مصدر (للمتجر)
CREATE POLICY "Allow all inserts"
    ON abandoned_forms
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 5. إنشاء سياسة للسماح بالتحديث من أي مصدر
CREATE POLICY "Allow all updates"
    ON abandoned_forms
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. سياسة للعرض - المستخدمون يرون نماذجهم فقط
CREATE POLICY "Users can view own forms"
    ON abandoned_forms
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 7. سياسة للحذف - المستخدمون يحذفون نماذجهم فقط
CREATE POLICY "Users can delete own forms"
    ON abandoned_forms
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 8. التحقق من السياسات
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'abandoned_forms';
