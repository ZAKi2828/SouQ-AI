-- ============================================
-- تعطيل RLS مؤقتاً للاختبار
-- ============================================

-- تعطيل RLS تماماً
ALTER TABLE abandoned_forms DISABLE ROW LEVEL SECURITY;

-- التحقق
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'abandoned_forms';
