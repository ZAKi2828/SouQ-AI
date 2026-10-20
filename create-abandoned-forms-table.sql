-- ============================================
-- جدول النماذج المتروكة (Abandoned Forms)
-- ============================================

-- Create abandoned_forms table
CREATE TABLE IF NOT EXISTS abandoned_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    store_domain TEXT NOT NULL,
    product_id UUID,
    product_name TEXT,
    customer_phone TEXT NOT NULL UNIQUE,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_user_id ON abandoned_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_phone ON abandoned_forms(customer_phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_status ON abandoned_forms(status);
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_created_at ON abandoned_forms(created_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_forms_store_domain ON abandoned_forms(store_domain);

-- Add RLS policies
ALTER TABLE abandoned_forms ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for storefront forms)
CREATE POLICY "Allow anonymous inserts"
    ON abandoned_forms
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can view their own abandoned forms
CREATE POLICY "Users can view own abandoned forms"
    ON abandoned_forms
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own abandoned forms
CREATE POLICY "Users can update own abandoned forms"
    ON abandoned_forms
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own abandoned forms
CREATE POLICY "Users can delete own abandoned forms"
    ON abandoned_forms
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_abandoned_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_abandoned_forms_updated_at ON abandoned_forms;
CREATE TRIGGER trigger_update_abandoned_forms_updated_at
    BEFORE UPDATE ON abandoned_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_abandoned_forms_updated_at();

-- Create a function to mark old pending forms as abandoned (after 7 days)
CREATE OR REPLACE FUNCTION mark_old_forms_as_abandoned()
RETURNS void AS $$
BEGIN
    UPDATE abandoned_forms
    SET status = 'abandoned'
    WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE abandoned_forms IS 'Stores abandoned form data for phone call recovery campaigns';
COMMENT ON COLUMN abandoned_forms.user_id IS 'Store owner/merchant user ID';
COMMENT ON COLUMN abandoned_forms.store_domain IS 'Store domain name';
COMMENT ON COLUMN abandoned_forms.product_id IS 'Product ID if applicable';
COMMENT ON COLUMN abandoned_forms.customer_phone IS 'Customer phone number (unique identifier)';
COMMENT ON COLUMN abandoned_forms.customer_name IS 'Customer name (optional)';
COMMENT ON COLUMN abandoned_forms.form_data IS 'JSON data of the incomplete form';
COMMENT ON COLUMN abandoned_forms.status IS 'Form status: pending, contacted, converted, or abandoned';
COMMENT ON COLUMN abandoned_forms.phone_call_count IS 'Number of phone call attempts';
COMMENT ON COLUMN abandoned_forms.last_call_attempt IS 'Timestamp of last phone call attempt';
COMMENT ON COLUMN abandoned_forms.converted_order_id IS 'Order ID if form was converted to order';

-- Add columns to store_pixels table for abandoned forms settings
ALTER TABLE store_pixels
ADD COLUMN IF NOT EXISTS abandoned_forms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS abandoned_forms_retention_days TEXT DEFAULT '7',
ADD COLUMN IF NOT EXISTS abandoned_forms_notification TEXT DEFAULT 'false';
