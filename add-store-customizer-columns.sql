-- SQL Migration: Add Storefront Customization columns to stores table

ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS storefront_theme VARCHAR(100) DEFAULT 'classic';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS storefront_font VARCHAR(100) DEFAULT 'Cairo';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS announcement_animation BOOLEAN DEFAULT true;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS announcement_bg_color VARCHAR(100);
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS announcement_text_color VARCHAR(100) DEFAULT '#FFFFFF';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS hero_background_type VARCHAR(100) DEFAULT 'gradient';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS hero_gradient_preset VARCHAR(100) DEFAULT 'blue';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS hero_cta_text TEXT DEFAULT 'تسوق الآن';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS hero_cta_style VARCHAR(100) DEFAULT 'pill';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS products_card_style VARCHAR(100) DEFAULT 'classic';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS products_mobile_columns INTEGER DEFAULT 2;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS products_desktop_columns INTEGER DEFAULT 4;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS whatsapp_tooltip TEXT DEFAULT 'تواصل معنا مباشرة 💬';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS whatsapp_pulse BOOLEAN DEFAULT true;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS trust_badges_json JSONB DEFAULT '[
  {"icon": "local_shipping", "title": "توصيل سريع ومجاني", "description": "توصيل آمن وسريع لجميع الولايات"},
  {"icon": "payments", "title": "الدفع عند الاستلام", "description": "لا تدفع شيئاً حتى تستلم طلبك بيدك"},
  {"icon": "verified", "title": "ضمان جودة المنتج", "description": "منتجات أصلية 100% عالية الجودة"}
]'::jsonb;
