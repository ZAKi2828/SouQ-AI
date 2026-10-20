-- 1. Create the templates table
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'مجاني',
    is_active BOOLEAN NOT NULL DEFAULT true,
    users_count INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert the predefined awesome templates (Default Data)
INSERT INTO templates (name, slug, category, plan, is_active, users_count, image_url)
VALUES 
    ('القالب الافتراضي (Default)', 'default', 'عام', 'مجاني', true, 342, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'),
    ('قالب الإلكترونيات (Tech)', 'tech', 'تكنولوجيا', 'برو', true, 156, 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=800&q=80'),
    ('قالب الموضة (Fashion)', 'fashion', 'أزياء', 'برو', true, 89, 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80'),
    ('قالب العطور (Perfume)', 'perfume', 'تجميل وعطور', 'VIP', true, 24, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'),
    ('قالب الفخامة (Elegance)', 'elegance', 'مجوهرات وساعات', 'VIP', false, 0, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (slug) DO NOTHING;

-- 3. Set up Row Level Security (RLS) so the Super Admin app can read/edit them
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/merchants) to read the templates
CREATE POLICY "Public profiles are viewable by everyone" ON templates FOR SELECT USING (true);

-- Allow everyone to update templates (Temporary rule for your Super Admin dashboard, since you are currently accessing it via client-side directly)
CREATE POLICY "Super Admins can insert/update templates" ON templates FOR ALL USING (true) WITH CHECK (true);
