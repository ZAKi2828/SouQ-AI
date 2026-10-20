-- ============================================
-- فحص حالة قاعدة البيانات
-- ============================================

-- 1. التحقق من وجود الجدول
SELECT
    'الجدول abandoned_forms' as item,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'abandoned_forms')
        THEN 'موجود ✅'
        ELSE 'غير موجود ❌'
    END as status;

-- 2. التحقق من الأعمدة في abandoned_forms
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'abandoned_forms'
ORDER BY ordinal_position;

-- 3. التحقق من السياسات
SELECT
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'abandoned_forms';

-- 4. التحقق من الأعمدة في store_pixels
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'store_pixels'
AND column_name LIKE 'abandoned%';

-- 5. عد السجلات في abandoned_forms
SELECT
    'عدد النماذج المتروكة' as item,
    COUNT(*)::text as count
FROM abandoned_forms;
