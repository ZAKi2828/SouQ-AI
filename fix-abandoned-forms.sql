-- ============================================
-- إصلاح وتحديث جدول النماذج المتروكة
-- ============================================

-- 1. حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Allow anonymous inserts" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can view own abandoned forms" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can update own abandoned forms" ON abandoned_forms;
DROP POLICY IF EXISTS "Users can delete own abandoned forms" ON abandoned_forms;

-- 2. إنشاء الجدول إن لم يكن موجوداً
CREATE TABLE IF NOT EXISTS abandoned_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    store_domain TEXT NOT NULL,
    product_id UUID,
    product_name TEXT,
    customer_phone TEXT NOT NULL,
    customer_name TEXT,
    customer_address TEXT,
    customer_state TEXT,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2),
    form_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'abandoned')),
    phone_call_count INTEGER DEFAULT 0,
    last_call_attempt TIMESTAMP WITH TIME ZONE,
    converted_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إضافة UNIQUE constraint على customer_phone إن لم يكن موجوداً
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'abandoned_forms_customer_phone_key'
    ) THEN
        ALTER TABLE abandoned_forms ADD CONSTRAINT abandoned_forms_customer_phone_key UNIQUE (customer_phone);
    END IF;
END $$;

-- 4. إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_user_id ON abandoned_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_phone ON abandoned_forms(customer_phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_status ON abandoned_forms(status);
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_created_at ON abandoned_forms(created_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_store_domain ON abandoned_forms(store_domain);

-- 5. تفعيل RLS
ALTER TABLE abandoned_forms ENABLE ROW LEVEL SECURITY;

-- 6. إنشاء السياسات الجديدة
CREATE POLICY "Allow anonymous inserts"
    ON abandoned_forms
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own abandoned forms"
    ON abandoned_forms
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own abandoned forms"
    ON abandoned_forms
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own abandoned forms"
    ON abandoned_forms
    FOR DELETE
    USING (auth.uid() = user_id);

-- 7. إنشاء الدالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_abandoned_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. إنشاء Trigger
DROP TRIGGER IF EXISTS trigger_update_abandoned_forms_updated_at ON abandoned_forms;
CREATE TRIGGER trigger_update_abandoned_forms_updated_at
    BEFORE UPDATE ON abandoned_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_abandoned_forms_updated_at();

-- 9. دالة لتحديد النماذج القديمة كمتروكة
CREATE OR REPLACE FUNCTION mark_old_forms_as_abandoned()
RETURNS void AS $$
BEGIN
    UPDATE abandoned_forms
    SET status = 'abandoned'
    WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 10. إضافة الأعمدة إلى store_pixels
ALTER TABLE store_pixels
ADD COLUMN IF NOT EXISTS abandoned_forms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS abandoned_forms_retention_days TEXT DEFAULT '7',
ADD COLUMN IF NOT EXISTS abandoned_forms_notification TEXT DEFAULT 'false';

-- 11. التحقق من النتائج
SELECT
    'abandoned_forms table' as check_item,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'abandoned_forms')
        THEN '✅ موجود'
        ELSE '❌ غير موجود'
    END as status
UNION ALL
SELECT
    'RLS enabled',
    CASE WHEN relrowsecurity THEN '✅ مفعّل' ELSE '❌ غير مفعّل' END
FROM pg_class WHERE relname = 'abandoned_forms'
UNION ALL
SELECT
    'Policies count',
    COUNT(*)::text || ' سياسات'
FROM pg_policies WHERE tablename = 'abandoned_forms'
UNION ALL
SELECT
    'store_pixels columns',
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'store_pixels'
        AND column_name = 'abandoned_forms_enabled'
    ) THEN '✅ موجودة' ELSE '❌ غير موجودة' END;
