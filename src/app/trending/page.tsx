'use client';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';
import { resolveProductImage, buildRealSpyUrl, getProxiedImageUrl } from '@/lib/imageResolver';
import { getLocalizedProduct } from '@/lib/productLocalization';
import { 
  TrendingUp, Search, Eye, Heart, Calculator, Plus, 
  Check, X, ShieldAlert, Sparkles, Clipboard,
  RefreshCw, Facebook, Video, ExternalLink, Bot, MapPin, 
  Copy
} from 'lucide-react';

interface TrendingProduct {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  price: number;
  cost_price: number;
  category: string;
  image_url: string;
  extra_images?: string[];
  spy_url?: string;
  wholesale_market?: string;
  wholesale_market_en?: string;
  marketing_hook?: string;
  marketing_hook_en?: string;
  ad_views: string;
  ad_likes: string;
  yalidine_rate: number;
  trend_badge: string;
  trend_badge_en?: string;
  source: 'tiktok' | 'facebook';
  options: { name: string; values: string[] }[];
}

const fallbackProductsData: TrendingProduct[] = [
  {
    id: 'trend-1',
    name: 'موزع الصابون الأوتوماتيكي الذكي بالأشعة تحت الحمراء',
    description: 'موزع صابون ذكي يشتغل بدون لمس بحساس الأشعة تحت الحمراء، موفر للصابون ومقاوم للماء بتصميم عصري راقي للمطبخ والحمام.',
    marketing_hook: 'تهنّى من تضييع الصابون والوسخ! موزع أوتوماتيكي ذكي يخدم بالحساس بلا لمس والتوصيل لباب دارك والدفع كي توصلك.',
    wholesale_market: 'سوق الجملة العلمة (سطيف)',
    price: 2900,
    cost_price: 1100,
    category: 'home',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FSbfd35ad33423405c93c4ba7e4c278c2eP.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=موزع%20صابون',
    ad_views: '120K',
    ad_likes: '9.4K',
    yalidine_rate: 94,
    trend_badge: 'إعلان فيسبوك رائج 📈',
    source: 'facebook',
    options: [{ name: 'اللون', values: ['أبيض', 'أسود'] }]
  },
  {
    id: 'trend-2',
    name: 'مروحة الرقبة الرياضية المحمولة القابلة للشحن USB',
    description: 'مروحة رقبة ذكية بدون شفرات بتصميم طوق رياضي مريح وخفيف، تدفق هواء هادئ بـ 3 سرعات يدوم طويلاً ومثالي لصيف الجزائر.',
    marketing_hook: 'السخانة والصيف ما يخلعوكش! مروحة رقبة محمولة تبرد عليك وين ما رحت في الخدمة وفي الطريق.',
    wholesale_market: 'بلفور (الحراش) / العلمة',
    price: 3400,
    cost_price: 1300,
    category: 'tech',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS8fc979ed45034279a68a96b0d469c609A.jpg',
    spy_url: 'https://www.tiktok.com/search?q=مروحة%20الرقبة%20الجزائر',
    ad_views: '210K',
    ad_likes: '18.2K',
    yalidine_rate: 92,
    trend_badge: 'تريند تيك توك الجزائر ☀️',
    source: 'tiktok',
    options: [{ name: 'السرعة', values: ['3 سرعات'] }]
  },
  {
    id: 'trend-3',
    name: 'مصفف ومجفف الشعر الاحترافي 5 في 1',
    description: 'مجموعة متكاملة لتصفيف وتمليس وتجعيد الشعر بتقنية الأيونات السالبة لحماية الشعر من الاحتراق ومنحه لمعاناً كالصالونات.',
    marketing_hook: 'صالون حلاقة وتصفيف كامل في دارك! 5 رؤوس احترافية لشعر حريري بدون حرق وبأقل جهد.',
    wholesale_market: 'سوق الجملة الحميز (العاصمة)',
    price: 6800,
    cost_price: 2400,
    category: 'beauty',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FSa95d7aafeaf1461bb75de512dec42747s.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=مصفف%20شعر',
    ad_views: '340K',
    ad_likes: '29.5K',
    yalidine_rate: 89,
    trend_badge: 'الأكثر طلباً هذا الأسبوع 🔥',
    source: 'tiktok',
    options: [{ name: 'الملحقات', values: ['طقم كامل 5 رؤوس'] }]
  },
  {
    id: 'trend-4',
    name: 'قاعدة شحن مغناطيسية لاسلكية سريعة 3 في 1 (MagSafe)',
    description: 'شاحن لاسلكي ذكي قابل للطي يشحن الهاتف، الساعة الذكية، وسماعات الأذن في نفس الوقت بقوة 15 واط مع حماية من الحرارة.',
    marketing_hook: 'وداعاً لكثرة الخيوط والروينة! شارجور واحد أنيق يشحنلك تيليفونك وساعتك وسماعاتك ضربة وحدة.',
    wholesale_market: 'سوق بلفور (الهواتف والإلكترونيات)',
    price: 4200,
    cost_price: 1600,
    category: 'tech',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS70db64627d354a8da9863c0abf19a0833.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=شاحن%20لاسلكي',
    ad_views: '88K',
    ad_likes: '6.1K',
    yalidine_rate: 93,
    trend_badge: 'إعلان فيسبوك ممول ⚡',
    source: 'facebook',
    options: [{ name: 'اللون', values: ['أسود فحم', 'أبيض ناصع'] }]
  },
  {
    id: 'trend-5',
    name: 'منظم توابل ومستلزمات المطبخ الدوار 360 درجة',
    description: 'حامل ومنظم مطبخ دوار ذكي يوفر المساحة وينظم التوابل والصلصات وسهل الدوران 360 درجة مع قاعدة مانعة للانزلاق.',
    marketing_hook: 'نظمي كوزينتك وتوابلك بحركة خفيفة! يدور 360 درجة وساهل للتنظيف، والتوصيل باطل حتى لباب دارك.',
    wholesale_market: 'سوق الجملة العلمة (سطيف)',
    price: 2400,
    cost_price: 950,
    category: 'home',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FHdd3e2c34d3ef46ecbb281896791cae79x.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=منظم%20مطبخ',
    ad_views: '75K',
    ad_likes: '5.8K',
    yalidine_rate: 95,
    trend_badge: 'عملي ومطلوب جداً ✅',
    source: 'facebook',
    options: [{ name: 'الموديل', values: ['طبقة واحدة', 'طبقتين'] }]
  },
  {
    id: 'trend-6',
    name: 'حقيبة ظهر ذكية مضادة للسرقة مع منفذ شحن USB',
    description: 'حقيبة ظهر عملية متينة ضد الماء ومزودة بقفل أرقام سري وجيوب مخفية لحماية اللابتوب ومنفذ خارجي لشحن الهاتف أثناء التنقل.',
    marketing_hook: 'سافر وتنقل في أمان تام! حقيبة مضادة للسرقة ومقاومة للماء وبشاحن USB، الدفع عند الاستلام بعد المعاينة.',
    wholesale_market: 'سوق عين فكرون / الحميز',
    price: 4800,
    cost_price: 1900,
    category: 'accessories',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS6ab7d2d3a39e4a8da427cf63a6a9b40dE.jpg',
    spy_url: 'https://www.tiktok.com/search?q=حقيبة%20ظهر%20الجزائر',
    ad_views: '145K',
    ad_likes: '11.8K',
    yalidine_rate: 91,
    trend_badge: 'تريند تيك توك 🎒',
    source: 'tiktok',
    options: [{ name: 'الحجم', values: ['لابتوب 15.6 بوصة'] }]
  },
  {
    id: 'trend-7',
    name: 'جهاز إزالة الشعر المنزلي بالليزر المبرد بتقنية IPL',
    description: 'جهاز ليزر منزلي بنبضات ضوئية مكثفة مع خاصية التبريد الثلجي لإزالة الشعر نهائياً وبدون أي ألم مع 999 ألف ومضة.',
    marketing_hook: 'تهناي من جلسات العيادات الغالية! جهاز ليزر ثلجي بدون وجع ونتائج احترافية في دارك، والتوصيل 58 ولاية.',
    wholesale_market: 'سوق الجملة العلمة / الحميز',
    price: 8900,
    cost_price: 3200,
    category: 'beauty',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS03dc0eeb904f43479e19574bfd4e0408j.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=ليزر%20منزلي%20IPL',
    ad_views: '450K',
    ad_likes: '38K',
    yalidine_rate: 90,
    trend_badge: 'أعلى مبيعات في الجزائر 🏆',
    source: 'facebook',
    options: [{ name: 'اللون', values: ['أبيض ذهبي', 'وردي ناعم'] }]
  },
  {
    id: 'trend-8',
    name: 'مكنسة سيارة لاسلكية محمولة بقوة شفط توربينية عالية',
    description: 'مكنسة كهربائية صغيرة للسيارة والمنزل قابلة للشحن عبر USB مع ملحقات للأماكن الضيقة ومحرك جبار لتنظيف الغبار والفتات.',
    marketing_hook: 'سيارتك نقية تشعل دايماً! مكنسة لاسلكية صغيرة وقوية تشفط كلش في ثواني وخفيفة الوزن.',
    wholesale_market: 'سوق بلفور / الحميز',
    price: 3600,
    cost_price: 1400,
    category: 'accessories',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS0c4dc3c6f0594f8ca8eb1989ea4a3d21A.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=مكنسة%20سيارة',
    ad_views: '190K',
    ad_likes: '14.5K',
    yalidine_rate: 93,
    trend_badge: 'مطلوب بشدة لأصحاب السيارات 🚗',
    source: 'facebook',
    options: [{ name: 'القوة', values: ['توربو 9000PA'] }]
  },
  {
    id: 'trend-9',
    name: 'حزام تصحيح استقامة الظهر والكتفين الطبي الذكي',
    description: 'مشد طبي ذكي لتعديل وضعية العمود الفقري وتخفيف آلام الظهر والرقبة والكتفين، مريح للارتداء تحت الملابس طوال اليوم.',
    marketing_hook: 'تجلس بزاف في الخدمة وضهرك يوجعك؟ حزام طبي يرجعلك الاستقامة ويقضي على آلام الظهر نهائياً.',
    wholesale_market: 'سوق الجملة العلمة',
    price: 2800,
    cost_price: 950,
    category: 'home',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FH8d5507a213e246e7b165bf2d8e68cfb9Z.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=حزام%20ظهر%20طبي',
    ad_views: '160K',
    ad_likes: '12K',
    yalidine_rate: 94,
    trend_badge: 'صحي وموصى به 🩺',
    source: 'facebook',
    options: [{ name: 'المقاس', values: ['قابل للتعديل Free Size'] }]
  },
  {
    id: 'trend-10',
    name: 'شريط أضواء LED ذكي متعدد الألوان RGB مع ريموت تحكم',
    description: 'شريط إضاءة ليد 5 أمتار متغير الألوان بتقنية RGB مع لاصق قوي وجهاز تحكم عن بعد للغرف، التلفزيون، وخلفيات المكاتب.',
    marketing_hook: 'بدّل جو شمبرتك للأفخم! إضاءة ليد ألوان خيالية تتحكم فيها بالريموت وساهلة تلصقها وحدك.',
    wholesale_market: 'سوق بلفور / العلمة',
    price: 2200,
    cost_price: 750,
    category: 'home',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS4237fc625d924151bce768ce80e121e7W.jpg',
    spy_url: 'https://www.tiktok.com/search?q=أضواء%20LED%20الجزائر',
    ad_views: '310K',
    ad_likes: '25.6K',
    yalidine_rate: 95,
    trend_badge: 'تريند شبابي تيك توك 💡',
    source: 'tiktok',
    options: [{ name: 'الطول', values: ['5 أمتار مع ريموت'] }]
  },
  {
    id: 'trend-11',
    name: 'محفظة رجالية ذكية مضادة للسرقة بتقنية حجب RFID',
    description: 'محفظة بطاقات من ألياف الكربون ومعدن الألومنيوم بخاصية الزر المنبثق تمنع سرقة بيانات البطاقات البنكية وسهلة الحمل.',
    marketing_hook: 'صغيرة وأنيقة وتحمي بطاقاتك من السرقة! بضغطة زر تخرج البطاقات مرتبة وما تعمرلكش جيبك.',
    wholesale_market: 'سوق عين فكرون (أم البواقي)',
    price: 2600,
    cost_price: 900,
    category: 'fashion',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FSef2c82cf19aa45f3964ce2f03f56e9c40.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=محفظة%20RFID',
    ad_views: '95K',
    ad_likes: '8.2K',
    yalidine_rate: 92,
    trend_badge: 'أناقة وعملية 💼',
    source: 'facebook',
    options: [{ name: 'اللون', values: ['كاربون أسود', 'بني فاخر'] }]
  },
  {
    id: 'trend-12',
    name: 'جهاز تدليك الرقبة والكتفين الذكي بالنبضات والحرارة',
    description: 'جهاز مساج كهربائي يحيط بالرقبة ويوفر نبضات كهرومغناطيسية وتدفئة ذكية لتخفيف التشنجات العضلية والإرهاق بعد يوم عمل طويل.',
    marketing_hook: 'ريّح رقبتك وعضلاتك من التعب والضغط! مساج ذكي بالحرارة يرجعلك النشاط في 15 دقيقة فقط.',
    wholesale_market: 'سوق الحميز (الجزائر العاصمة)',
    price: 4500,
    cost_price: 1700,
    category: 'beauty',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS7a5dfeb1aeb049c394c86cb3fe6ca5d8x.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=مساج%20رقبة',
    ad_views: '180K',
    ad_likes: '15.3K',
    yalidine_rate: 89,
    trend_badge: 'استرخاء فوري 💆',
    source: 'facebook',
    options: [{ name: 'الأوضاع', values: ['6 مستويات نبض وتدفئة'] }]
  },
  {
    id: 'trend-13',
    name: 'ساعة ذكية رياضية مقاومة للماء مع قياس النبض والأكسجين',
    description: 'ساعة ذكية بشاشة لمس AMOLED متوافقة مع أندرويد وآيفون، تستقبل المكالمات والرسائل مع تتبع الخطوات والنوم ودقات القلب.',
    marketing_hook: 'كلشي في معصمك! تستقبل المكالمات وتحسب خطواتك ونبضك وشاشتها شابة بزاف، توصيل 58 ولاية.',
    wholesale_market: 'سوق بلفور (الهواتف والإلكترونيات)',
    price: 4900,
    cost_price: 1950,
    category: 'tech',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FSbcce6f5e227d42cf89823520cfc34537y.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=ساعة%20ذكية',
    ad_views: '290K',
    ad_likes: '22.4K',
    yalidine_rate: 91,
    trend_badge: 'أكثر الساعات طلباً ⌚',
    source: 'facebook',
    options: [{ name: 'لون الحزام', values: ['أسود سيليكون', 'برتقالي رياضي'] }]
  },
  {
    id: 'trend-14',
    name: 'خلاط عصائر محمول رياضي قابل للشحن USB 6 شفرات',
    description: 'خلاط شخصي محمول لطحن الفواكه والبروتين وصنع العصائر الطازجة في الجيم، العمل، أو السفر ببطارية تدوم لأكثر من 15 كوباً.',
    marketing_hook: 'عصيرك فريش وين ما تكون! خلاط محمول بشفرات قوية يشحن بالـ USB وساهل للغسيل والحمل.',
    wholesale_market: 'سوق العلمة / الحميز',
    price: 3200,
    cost_price: 1150,
    category: 'home',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS2cecb6c3c5284bf78e7c10b7a421b9201.jpg',
    spy_url: 'https://www.tiktok.com/search?q=خلاط%20محمول%20الجزائر',
    ad_views: '230K',
    ad_likes: '19.7K',
    yalidine_rate: 93,
    trend_badge: 'صيفي ورياضي 🍓',
    source: 'tiktok',
    options: [{ name: 'اللون', values: ['أخضر باستيل', 'وردي', 'أزرق سماوي'] }]
  },
  {
    id: 'trend-15',
    name: 'جهاز إزالة الرؤوس السوداء وتنظيف المسام بالموجات والشفط',
    description: 'جهاز تنظيف الوجه والعناية بالبشرة بالشفط الهوائي لإزالة الدهون والرؤوس السوداء وتقشير الخلايا الميتة برؤوس متعددة.',
    marketing_hook: 'بشرة صافية ونقية بدون حبوب ودهون! ينظف المسامات بعمق في دقائق، الدفع عند الاستلام.',
    wholesale_market: 'سوق الجملة العلمة',
    price: 3100,
    cost_price: 1100,
    category: 'beauty',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS389e13d11b3341858c9c03798544e390F.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=إزالة%20الرؤوس%20السوداء',
    ad_views: '175K',
    ad_likes: '13.2K',
    yalidine_rate: 92,
    trend_badge: 'عناية بالبشرة رائج ✨',
    source: 'facebook',
    options: [{ name: 'المرفقات', values: ['4 رؤوس تنظيف'] }]
  },
  {
    id: 'trend-16',
    name: 'سماعات أذن لاسلكية بلوتوث 5.3 مع خاصية عزل الضوضاء',
    description: 'سماعات TWS عصرية بصوت نقي وجهير مضخم مع شاشة ديجيتال لبيان نسبة الشحن، ومقاومة للتعرق ومريحة للأذن.',
    marketing_hook: 'صوت خيالي وعزل للضوضاء وبطارية تدوم معاك أيام! أنيقة وسعرها مناسب جداً، التوصيل سريع.',
    wholesale_market: 'سوق بلفور (الحراش)',
    price: 2900,
    cost_price: 1050,
    category: 'tech',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS6283b54432244955b99eeea66f7f3299o.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=سماعات%20بلوتوث',
    ad_views: '260K',
    ad_likes: '21K',
    yalidine_rate: 94,
    trend_badge: 'إعلان فيسبوك قوي 🎧',
    source: 'facebook',
    options: [{ name: 'اللون', values: ['أسود ملكي', 'أبيض نقي'] }]
  },
  {
    id: 'trend-17',
    name: 'منظم مقعد السيارة الخلفي الجلدي المتعدد الجيوب',
    description: 'منظم مقاعد سيارة فاخر من الجلد المضاد للخدش مع حامل للتابلت والمناديل وقوارير الماء، يحافظ على نظافة وترتيب صالون السيارة.',
    marketing_hook: 'رتّب سيارتك وخلي ولادك مرتاحين في السفر! جلد فاخر بجيوب واسعة ويحمي المقاعد من التوساخ.',
    wholesale_market: 'سوق الحميز (العاصمة)',
    price: 3500,
    cost_price: 1350,
    category: 'accessories',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS1b6eb764c8d54c16a127a6599e0a2908g.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=منظم%20سيارة',
    ad_views: '110K',
    ad_likes: '8.7K',
    yalidine_rate: 95,
    trend_badge: 'مطلوب للعائلات 🚘',
    source: 'facebook',
    options: [{ name: 'اللون', values: ['جلد أسود', 'بيج فاخر'] }]
  },
  {
    id: 'trend-18',
    name: 'مصباح ذكي G-Lamp مع شاحن لاسلكي وسماعة بلوتوث',
    description: 'مصباح ليلي ديكوري بتصميم حرف G يجمع بين إضاءة RGB مريحة، شاحن سريع للهاتف، وسماعة بلوتوث عالية النقاوة.',
    marketing_hook: '3 في 1! ضوء ساحر للشمبرة وسماعة وشارجور لاسلكي في قطعة ديكور وحدة ولا أروع، التوصيل باطل.',
    wholesale_market: 'سوق العلمة / بلفور',
    price: 5400,
    cost_price: 2100,
    category: 'home',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FSf510250df7ee43cdb7ff7041ca0d39e2Y.jpg',
    spy_url: 'https://www.tiktok.com/search?q=مصباح%20G-Lamp%20الجزائر',
    ad_views: '390K',
    ad_likes: '34K',
    yalidine_rate: 90,
    trend_badge: 'فيرال تيك توك الجزائر 🎵',
    source: 'tiktok',
    options: [{ name: 'الموديل', values: ['G-Speaker RGB Charger'] }]
  },
  {
    id: 'trend-19',
    name: 'ماكينة حلاقة وتشذيب اللحية والشعر الاحترافية T9 الذهبية',
    description: 'ماكينة حلاقة كهربائية بمحرك توربو وشفرات تيتانيوم حادة ونقوش عتيقة فاخرة لتحديد اللحية والشارع وحلاقة الرأس بدقة متناهية.',
    marketing_hook: 'طراساج ودقة صالونات الحلاقة في يدك! ماكينة T9 الأصلية شفرات ما تحفاش وشحن يدوم بالساعات.',
    wholesale_market: 'سوق الجملة العلمة',
    price: 2500,
    cost_price: 850,
    category: 'beauty',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS4237fc625d924151bce768ce80e121e7W.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=ماكينة%20حلاقة%20T9',
    ad_views: '280K',
    ad_likes: '23K',
    yalidine_rate: 96,
    trend_badge: 'أعلى مبيعات رجالية 💈',
    source: 'facebook',
    options: [{ name: 'الشكل', values: ['ذهبي تنين', 'فضي جمجمة'] }]
  },
  {
    id: 'trend-20',
    name: 'حامل هاتف مغناطيسي ذكي لفتحات تهوية السيارة 360',
    description: 'قاعدة تثبيت مغناطيسية قوية للهاتف في السيارة بمفصل كروي للدوران 360 درجة، تثبيت آمن حتى في الطرق الوعرة والمنعطفات.',
    marketing_hook: 'تيليفونك ما يطيح ما يتحرك في الطريق! ماغنتيك قوي وساهل التثبيت في دقيقة وحدة، الدفع عند التسليم.',
    wholesale_market: 'سوق بلفور (الهواتف)',
    price: 1800,
    cost_price: 600,
    category: 'accessories',
    image_url: '/api/image-proxy?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FS70db64627d354a8da9863c0abf19a0833.jpg',
    spy_url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=حامل%20هاتف%20سيارة',
    ad_views: '85K',
    ad_likes: '6.9K',
    yalidine_rate: 96,
    trend_badge: 'سهل وسريع البيع 📱',
    source: 'facebook',
    options: [{ name: 'النوع', values: ['مغناطيسي معدني'] }]
  }
];

export default function TrendingProductsPage() {
  const { lang } = useI18n();
  const router = useRouter();
  const { planExpired, currentPlan } = useExpiredPlanGuard();

  const [loading, setLoading] = useState(true);
  const [storeContext, setStoreContext] = useState<any>(null);
  
  // Trending products state from database (at least 20 products)
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // ProFind Agent State
  const [agentTheme, setAgentTheme] = useState('');
  const [agentCategory, setAgentCategory] = useState('all');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentStep, setAgentStep] = useState('');

  // Scraper State
  const [scraperUrl, setScraperUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedProduct, setScrapedProduct] = useState<any>(null);
  const [scraperError, setScraperError] = useState('');

  // Selected Product for Margin Calculator Modal
  const [selectedProduct, setSelectedProduct] = useState<TrendingProduct | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [customStock, setCustomStock] = useState<number>(100);
  const [adCostPerSale, setAdCostPerSale] = useState<number>(300);
  const [yalidineHomeCost, setYalidineHomeCost] = useState<number>(650);
  const [isImporting, setIsImporting] = useState(false);

  // Filter state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch trending products from database
  const loadTrendingProducts = async (autoSyncIfEmpty = false) => {
    try {
      const { data, error } = await insforge.database
        .from('trending_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if ((!data || data.length === 0) && autoSyncIfEmpty) {
        await handleAgentScan();
      } else if (data && data.length > 0) {
        setTrendingProducts(data);
      } else {
        setTrendingProducts(fallbackProductsData);
      }
    } catch (err) {
      console.error('Error loading trending products:', err);
      setTrendingProducts(fallbackProductsData);
    }
  };

  useEffect(() => {
    async function loadContext() {
      setLoading(true);
      try {
        const ctx = await getStoreContext();
        setStoreContext(ctx);
      } catch (err) {
        console.warn('Optional storeContext error', err);
      }
      await loadTrendingProducts(false);
      setLoading(false);
    }
    loadContext();
  }, [router]);

  // Run the ProFind Autonomous Algerian Market Agent (20 products)
  const handleAgentScan = async () => {
    setIsAgentRunning(true);
    setIsSyncing(true);
    setAgentStep(lang === 'ar' ? 'ProFind يبحث في إعلانات Meta و TikTok بالجزائر (20 منتج)...' : 'ProFind scanning Meta & TikTok Algeria ads (20 products)...');

    try {
      setTimeout(() => setAgentStep(lang === 'ar' ? 'تحليل هوامش الربح ومصادر الجملة (العلمة / بلفور)...' : 'Analyzing profit margins & wholesale markets (El Eulma / Belfort)...'), 2000);
      setTimeout(() => setAgentStep(lang === 'ar' ? 'تجهيز الصور والمطابقة مع مكتبات الإعلانات...' : 'Matching HD photos & verifying ad library links...'), 4500);

      const response = await fetch('/api/trending/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: agentCategory !== 'all' ? agentCategory : undefined,
          customQuery: agentTheme.trim() || undefined,
          count: 20
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل تشغيل ProFind');
      }

      // Reload products from database
      const { data: freshProducts } = await insforge.database
        .from('trending_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (freshProducts && freshProducts.length > 0) {
        setTrendingProducts(freshProducts);
      } else if (data.products && data.products.length > 0) {
        setTrendingProducts(data.products);
      }

      showToast(lang === 'ar' ? '✅ اكتشف ProFind أكثر من 20 منتجاً رابحاً بنجاح!' : 'ProFind discovered 20+ winning products!', 'success');
      setAgentTheme('');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'فشل الاتصال بمحرك البحث. تم عرض البيانات المحفوظة.', 'error');
      if (trendingProducts.length === 0) {
        setTrendingProducts(fallbackProductsData);
      }
    } finally {
      setIsAgentRunning(false);
      setIsSyncing(false);
      setAgentStep('');
    }
  };

  // Scrape Handler calling our API route
  const handleScrape = async () => {
    if (!scraperUrl.trim()) return;
    setIsScraping(true);
    setScraperError('');
    setScrapedProduct(null);

    try {
      const response = await fetch('/api/trending/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scraperUrl })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل استخراج المنتج');
      }

      setScrapedProduct(data);
    } catch (err: any) {
      setScraperError(err.message || 'حدث خطأ أثناء فحص الرابط.');
    } finally {
      setIsScraping(false);
    }
  };

  // Copy ad copy hook to clipboard
  const copyHookToClipboard = (hook: string) => {
    if (!hook) return;
    navigator.clipboard.writeText(hook);
    showToast(lang === 'ar' ? '📋 تم نسخ زاوية البيع الإعلانية!' : 'Ad hook copied!', 'success');
  };

  // Open import calculator
  const openImportCalculator = (product: any) => {
    setSelectedProduct(product);
    setCustomPrice(product.price);
    setCustomStock(100);
  };

  // Database Import Handler
  const handleImportToStore = async () => {
    if (!selectedProduct) return;
    if (!storeContext) {
      showToast(lang === 'ar' ? 'يرجى تسجيل الدخول إلى لوحة التحكم لاستيراد هذا المنتج' : 'Please log in to import product to your store', 'error');
      router.push('/login');
      return;
    }
    setIsImporting(true);

    try {
      const slug = selectedProduct.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

      const allImages = [
        selectedProduct.image_url,
        ...(selectedProduct.extra_images || [])
      ].filter(Boolean);

      const productData = {
        product_slug: slug,
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: customPrice,
        compare_at_price: Math.round(customPrice * 1.3),
        cost_price: selectedProduct.cost_price,
        stock_quantity: customStock,
        template: selectedProduct.category === 'beauty' ? 'skincare' : selectedProduct.category,
        status: 'active',
        image_url: selectedProduct.image_url,
        images: allImages,
        category: selectedProduct.category,
        shipping_free: false,
        shipping_office_free: false,
        shipping_home_price: yalidineHomeCost,
        shipping_office_price: Math.max(0, yalidineHomeCost - 200),
        options: selectedProduct.options || []
      };

      const { error } = await insforge.database
        .from('products')
        .insert({
          user_id: storeContext.targetUserId,
          store_domain: storeContext.storeDomain,
          ...productData
        });

      if (error) throw error;

      showToast(lang === 'ar' ? '✅ تم استيراد المنتج لمتجرك بنجاح!' : 'Product imported successfully!', 'success');
      setSelectedProduct(null);
      setScrapedProduct(null);
      setScraperUrl('');
    } catch (err: any) {
      console.error(err);
      showToast(lang === 'ar' ? '❌ عذرًا، فشل استيراد المنتج. حاول مجددًا.' : 'Failed to import product.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredProducts = trendingProducts.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.marketing_hook && p.marketing_hook.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.wholesale_market && p.wholesale_market.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F3F4F6] dark:bg-zinc-950">
        <SOUQAILoader size="lg" text="" />
      </div>
    );
  }

  // Margin Calculations (Algerian COD Model)
  const calculateCODNetProfit = (price: number, cost: number, rtsRate: number) => {
    const successRate = rtsRate / 100;
    const failedRate = 1 - successRate;
    
    const expectedRevenue = price * successRate;
    const expectedProductCost = cost * successRate;
    const expectedAdCost = adCostPerSale;
    
    const expectedShippingCost = (yalidineHomeCost * successRate) + (yalidineHomeCost * 0.5 * failedRate);
    const netProfit = expectedRevenue - (expectedProductCost + expectedAdCost + expectedShippingCost);
    return Math.round(netProfit);
  };

  const netProfit = selectedProduct 
    ? calculateCODNetProfit(customPrice, selectedProduct.cost_price, selectedProduct.yalidine_rate) 
    : 0;
  const netProfitPercentage = selectedProduct && customPrice > 0 
    ? Math.round((netProfit / (customPrice * (selectedProduct.yalidine_rate / 100))) * 100) 
    : 0;

  return (
    <>
      {planExpired && <PlanExpiredOverlay planName={currentPlan} />}
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-xs font-bold transition-all duration-300 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/80 dark:text-emerald-400' 
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-800/80 dark:text-rose-400'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex h-screen bg-[#F3F4F6] dark:bg-zinc-950 text-gray-900 dark:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Sidebar activePage="Trending" />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="h-20 bg-white dark:bg-zinc-950 border-b border-gray-150 dark:border-zinc-800/50 flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5.5 h-5.5" />
              </div>
              <div className="text-start">
                <h1 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <span>ProFind 🤖</span>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">|</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {lang === 'ar' ? 'صائد المنتجات الرابحة بالجزائر' : 'DZ Winning Products Hunter'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {filteredProducts.length} {lang === 'ar' ? 'منتج رابح' : 'Products'}
                  </span>
                </h1>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {lang === 'ar' ? 'رصد آلي ومعاينة ذكية لإعلانات فيسبوك وتيك توك الرائجة في الجزائر' : 'Autonomous AI agent scouting winning Algerian COD ads & stores'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Agent Trigger Button */}
              <button
                onClick={handleAgentScan}
                disabled={isAgentRunning || isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                <Bot className={`w-4 h-4 ${isAgentRunning ? 'animate-bounce' : ''}`} />
                {isAgentRunning ? (lang === 'ar' ? 'ProFind يبحث الآن...' : 'ProFind scanning...') : (lang === 'ar' ? 'تشغيل ProFind (20 منتج) 🚀' : 'Run ProFind (20 items)')}
              </button>

              <StoreLinkButton />
              <NotificationsDropdown />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50 dark:bg-zinc-900/10">
            
            {/* ProFind Agent Control Box */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/15 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-start">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      {lang === 'ar' ? 'ProFind - رادار اقتناص إعلانات ومبيعات التجارة الإلكترونية بالجزائر' : 'ProFind - Algerian E-Commerce Market Scanner'}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      {lang === 'ar' 
                        ? 'يبحث ProFind في مكتبة إعلانات فيسبوك وتيك توك النشطة بالجزائر، يستخرج صور المنتجات، أسعار الجملة (العلمة/بلفور)، وروابط المعاينة الحية لأكثر من 20 منتجاً رابحاً.'
                        : 'ProFind discovers active Algerian COD ads, wholesale prices, and live competitor preview links for 20+ products.'}
                    </p>
                  </div>

                  {agentStep && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {agentStep}
                    </div>
                  )}
                </div>

                {/* Agent Filters & Search */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                  <div className="sm:col-span-5 relative">
                    <input
                      type="text"
                      value={agentTheme}
                      onChange={(e) => setAgentTheme(e.target.value)}
                      placeholder={lang === 'ar' ? 'نيتش أو فكرة معينة؟ (مثال: مستلزمات الصيف، أدوات مطبخ، إلكترونيات سيارات)' : 'Specific niche or theme? (e.g. Summer essentials, Car gadgets)'}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-primary font-medium text-start"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      value={agentCategory}
                      onChange={(e) => setAgentCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-primary font-medium text-start"
                    >
                      <option value="all">{lang === 'ar' ? 'جميع التصنيفات الرائجة (20+ منتج)' : 'All Categories (20+ items)'}</option>
                      <option value="tech">{lang === 'ar' ? 'إلكترونيات وهواتف' : 'Tech & Gadgets'}</option>
                      <option value="beauty">{lang === 'ar' ? 'عناية وتجميل' : 'Beauty & Personal Care'}</option>
                      <option value="home">{lang === 'ar' ? 'مستلزمات منزلية ومطبخ' : 'Home & Kitchen'}</option>
                      <option value="accessories">{lang === 'ar' ? 'حقائب وإكسسوارات' : 'Accessories'}</option>
                      <option value="fashion">{lang === 'ar' ? 'أزياء وملابس' : 'Fashion'}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      onClick={handleAgentScan}
                      disabled={isAgentRunning}
                      className="w-full py-3 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAgentRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                          {lang === 'ar' ? 'ProFind يبحث...' : 'Scanning...'}
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          {lang === 'ar' ? 'فحص 20 منتجاً رابحاً ⚡' : 'Scan 20 Winning Products ⚡'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct URL Scraper Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-800 p-5 shadow-xs relative text-start">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-500 flex items-center justify-center font-bold">
                    <Clipboard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {lang === 'ar' ? 'سحب منتج برابط:' : 'Scrape via URL:'}
                  </span>
                </div>

                <div className="relative flex-1 w-full">
                  <input
                    type="url"
                    value={scraperUrl}
                    onChange={(e) => setScraperUrl(e.target.value)}
                    placeholder={lang === 'ar' ? 'ضع رابط أي منتج أو متجر منافس (AliExpress, YouCan, Storeino, Shopify)...' : 'Paste competitor or AliExpress URL...'}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-primary text-start font-medium"
                  />
                  {scraperUrl && (
                    <button 
                      onClick={() => setScraperUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleScrape}
                  disabled={isScraping || !scraperUrl.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {isScraping ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {lang === 'ar' ? 'جاري الكشط...' : 'Scraping...'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'استخراج 🔍' : 'Scrape'}
                    </>
                  )}
                </button>
              </div>

              {scraperError && (
                <p className="text-[11px] text-rose-500 font-bold mt-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {scraperError}
                </p>
              )}
            </div>

            {/* Scraped Product Preview */}
            {scrapedProduct && (
              <div className="bg-gradient-to-l from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 border-2 border-dashed border-primary/40 rounded-3xl p-6 shadow-md flex flex-col md:flex-row gap-6 relative text-start">
                <button 
                  onClick={() => setScrapedProduct(null)} 
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-zinc-700 shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden border border-gray-150 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-950">
                  <img 
                    src={getProxiedImageUrl(scrapedProduct.image_url)} 
                    alt={scrapedProduct.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = resolveProductImage(scrapedProduct.name, scrapedProduct.category);
                    }}
                  />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black mb-2">
                      <Sparkles className="w-3 h-3" />
                      {lang === 'ar' ? 'تم استخراج وتخصيص المنتج بنجاح' : 'Product localized'}
                    </span>
                    <h3 className="text-base font-black text-gray-900 dark:text-white">{scrapedProduct.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-3xl">{scrapedProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-gray-150/40 dark:border-zinc-800/40">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block mb-0.5">{lang === 'ar' ? 'سعر الجملة المقدر' : 'Estimated Wholesale'}</span>
                      <span className="text-xs font-black text-slate-700 dark:text-white">{scrapedProduct.cost_price?.toLocaleString()} {lang === 'ar' ? 'د.ج' : 'DZD'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block mb-0.5">{lang === 'ar' ? 'سعر البيع المقترح' : 'Suggested Retail'}</span>
                      <span className="text-xs font-black text-primary">{scrapedProduct.price?.toLocaleString()} {lang === 'ar' ? 'د.ج' : 'DZD'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block mb-0.5">{lang === 'ar' ? 'معدل تسليم ياليدين' : 'Est. Delivery Rate'}</span>
                      <span className="text-xs font-black text-emerald-500">{scrapedProduct.yalidine_rate}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block mb-0.5">{lang === 'ar' ? 'الطلب المتوقع' : 'Estimated Demand'}</span>
                      <span className="text-xs font-black text-indigo-500">{scrapedProduct.ad_views} {lang === 'ar' ? 'مشاهدات' : 'views'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openImportCalculator(scrapedProduct)}
                    className="px-6 py-3.5 bg-gradient-to-r from-primary to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'ar' ? 'تهيئة واستيراد هذا المنتج للمتجر 🚀' : 'Configure and Import Product'}
                  </button>
                </div>
              </div>
            )}

            {/* Filter and Search controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
              {/* Category tabs */}
              <div className="flex flex-wrap bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-gray-150 dark:border-zinc-800 text-[12px] font-bold w-full md:w-auto">
                {[
                  { id: 'all', key: lang === 'ar' ? 'الكل' : 'All' },
                  { id: 'tech', key: lang === 'ar' ? 'إلكترونيات' : 'Tech' },
                  { id: 'beauty', key: lang === 'ar' ? 'عناية وتجميل' : 'Beauty' },
                  { id: 'home', key: lang === 'ar' ? 'مستلزمات منزلية' : 'Home' },
                  { id: 'accessories', key: lang === 'ar' ? 'إكسسوارات' : 'Accessories' },
                  { id: 'fashion', key: lang === 'ar' ? 'أزياء' : 'Fashion' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`flex-1 md:flex-none px-4 py-2 text-center rounded-xl transition-colors ${activeCategory === tab.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    {tab.key}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'بحث عن منتج، سوق جملة، أو زاوية بيع...' : 'Search by product, market, or angle...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-primary text-start font-bold"
                />
              </div>
            </div>

            {/* Trending Products Grid (20+ Items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-start">
              {filteredProducts.map((product) => {
                const profit = calculateCODNetProfit(product.price, product.cost_price, product.yalidine_rate);
                const guaranteedSpyUrl = buildRealSpyUrl(product.spy_url, product.name, product.source);
                const proxiedImg = getProxiedImageUrl(product.image_url);
                const loc = getLocalizedProduct(product, lang);
                
                return (
                  <div 
                    key={product.id} 
                    className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:border-primary/40 hover:shadow-lg transition-all flex flex-col group h-full"
                  >
                    {/* Image Container with Badges */}
                    <div className="h-52 relative overflow-hidden bg-gray-100 dark:bg-zinc-950 shrink-0">
                      <img 
                        src={proxiedImg} 
                        alt={loc.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = resolveProductImage(product.name, product.category);
                        }}
                      />
                      
                      {/* Trend Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#E91E63] text-white shadow-md">
                          {loc.trend_badge}
                        </span>
                      </div>

                      {/* Source Indicator Badge */}
                      <div className="absolute top-3 right-3">
                        {product.source === 'tiktok' ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black bg-black text-white border border-zinc-700 shadow-md">
                            <Video className="w-3 h-3 text-cyan-400" />
                            {loc.sourceLabel}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black bg-[#1877F2] text-white shadow-md">
                            <Facebook className="w-3 h-3 text-white fill-white" />
                            {loc.sourceLabel}
                          </span>
                        )}
                      </div>

                      {/* Views & Likes Bar */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/70 dark:bg-zinc-900/80 backdrop-blur-xs rounded-xl p-2 flex justify-between text-white text-[10px] font-bold">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          {product.ad_views} {loc.viewsLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {product.ad_likes} {loc.likesLabel}
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-black text-gray-900 dark:text-white leading-snug line-clamp-2">
                            {loc.name}
                          </h3>
                        </div>

                        {/* Wholesale Market Badge */}
                        {loc.wholesale_market && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg w-fit">
                            <MapPin className="w-3 h-3" />
                            <span>{loc.wholesale_market}</span>
                          </div>
                        )}

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                          {loc.description}
                        </p>

                        {/* Marketing Angle Hook */}
                        {loc.marketing_hook && (
                          <div className="bg-indigo-50/70 dark:bg-zinc-950/60 border border-indigo-100 dark:border-zinc-800 p-2.5 rounded-xl flex items-start justify-between gap-2">
                            <p className="text-[10px] text-indigo-900 dark:text-indigo-300 font-semibold leading-relaxed line-clamp-2">
                              💡 <span className="font-bold">{loc.salesAngleLabel}</span> {loc.marketing_hook}
                            </p>
                            <button
                              onClick={() => copyHookToClipboard(loc.marketing_hook!)}
                              title={lang === 'ar' ? 'نسخ السكريبت الإعلاني' : 'Copy ad script'}
                              className="text-indigo-500 hover:text-indigo-700 dark:hover:text-white p-1 shrink-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-1">
                        {/* Metrics Bar */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-2 rounded-2xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-150/50 dark:border-zinc-800/40 text-center">
                          <div>
                            <span className="text-[8px] font-bold text-gray-400 block mb-0.5">{lang === 'ar' ? 'سعر الجملة' : 'Wholesale'}</span>
                            <span className="text-[11px] font-black text-slate-700 dark:text-white">{product.cost_price?.toLocaleString()} {loc.currency}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-gray-400 block mb-0.5">{lang === 'ar' ? 'سعر المبيع' : 'Retail'}</span>
                            <span className="text-[11px] font-black text-primary">{product.price?.toLocaleString()} {loc.currency}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-gray-400 block mb-0.5">{lang === 'ar' ? 'توصيل ياليدين' : 'Yalidine'}</span>
                            <span className="text-[11px] font-black text-emerald-500">{product.yalidine_rate}%</span>
                          </div>
                        </div>

                        {/* Profit preview */}
                        <div className="flex items-center justify-between px-1 text-xs">
                          <span className="text-gray-500 dark:text-gray-400 font-bold">{lang === 'ar' ? 'صافي الربح التقديري (COD):' : 'Est. Net Profit:'}</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">+{profit.toLocaleString()} {loc.currency}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                          {/* Live Preview Link Button */}
                          <a
                            href={guaranteedSpyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                            title={lang === 'ar' ? 'معاينة الإعلانات النشطة للمنتج في الجزائر' : 'Preview active product ads in Algeria'}
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-primary" />
                            <span className="hidden sm:inline">{lang === 'ar' ? 'معاينة 👁️' : 'Preview'}</span>
                          </a>

                          {/* Import Button */}
                          <button
                            onClick={() => openImportCalculator(product)}
                            className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 hover:scale-[1.01]"
                          >
                            <Plus className="w-4 h-4" />
                            {lang === 'ar' ? 'أضف لمتجري وتعديل السعر' : 'Add to My Store'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Calculator Modal Drawer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Overlay */}
          <div 
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-s border-gray-150 dark:border-zinc-800 text-start">
              {/* Header */}
              <div className="p-5 border-b border-gray-150 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-gray-900 dark:text-white text-sm">
                    {lang === 'ar' ? 'حاسبة الأرباح والاستيراد' : 'Profit Calculator & Import'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Calculator Body */}
              {(() => {
                const modalLoc = getLocalizedProduct(selectedProduct, lang);
                return (
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Product Summary */}
                    <div className="flex gap-4">
                      <img 
                        src={getProxiedImageUrl(selectedProduct.image_url)} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-gray-150 dark:border-zinc-800 shrink-0" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = resolveProductImage(selectedProduct.name, selectedProduct.category);
                        }}
                      />
                      <div>
                        <h4 className="font-black text-xs text-gray-900 dark:text-white leading-tight">{modalLoc.name}</h4>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black">
                          {selectedProduct.yalidine_rate}% {lang === 'ar' ? 'نسبة تسليم ياليدين مقدرة' : 'Est. Delivery'}
                        </span>
                      </div>
                    </div>

                    <hr className="border-gray-150 dark:border-zinc-800" />

                    {/* Import parameters form */}
                    <div className="space-y-4">
                      {/* Selling Price */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                          <span>{lang === 'ar' ? 'سعر المبيع المقترح (للزبون)' : 'Selling Price'}</span>
                          <span className="font-black text-primary">{customPrice.toLocaleString()} {modalLoc.currency}</span>
                        </div>
                        <input
                          type="range"
                          min={selectedProduct.cost_price + 500}
                          max={selectedProduct.price * 2}
                          step={100}
                          value={customPrice}
                          onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                          className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                          <span>{lang === 'ar' ? 'سعر الجملة:' : 'Cost:'} {selectedProduct.cost_price.toLocaleString()} {modalLoc.currency}</span>
                          <span>{lang === 'ar' ? 'الأقصى الموصى به:' : 'Max limit:'} {(selectedProduct.price * 2).toLocaleString()} {modalLoc.currency}</span>
                        </div>
                      </div>

                      {/* Stock Quantity */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">{lang === 'ar' ? 'كمية المخزون الأولية' : 'Initial Stock'}</label>
                        <input
                          type="number"
                          value={customStock}
                          onChange={(e) => setCustomStock(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white text-start font-bold"
                        />
                      </div>

                      {/* COD Expense Tuning (Yalidine, Ads) */}
                      <div className="space-y-3 bg-gray-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-gray-150/50 dark:border-zinc-800/40">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{lang === 'ar' ? 'مصاريف الدفع عند الاستلام المقدرة' : 'COD Expenses'}</h5>
                        
                        {/* Ad Cost slider */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            <span>{lang === 'ar' ? 'تكلفة الإعلان لكل مبيعة مؤكدة' : 'Ad cost per purchase'}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{adCostPerSale.toLocaleString()} {modalLoc.currency}</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={1500}
                            step={50}
                            value={adCostPerSale}
                            onChange={(e) => setAdCostPerSale(parseInt(e.target.value) || 0)}
                            className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>

                        {/* Shipping Cost slider */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            <span>{lang === 'ar' ? 'تكلفة التوصيل الفعلية (ياليدين)' : 'Yalidine home delivery cost'}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{yalidineHomeCost.toLocaleString()} {modalLoc.currency}</span>
                          </div>
                          <input
                            type="range"
                            min={350}
                            max={1500}
                            step={50}
                            value={yalidineHomeCost}
                            onChange={(e) => setYalidineHomeCost(parseInt(e.target.value) || 0)}
                            className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-150 dark:border-zinc-800" />

                    {/* Profit Outcomes Card */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between text-start">
                      <div>
                        <h5 className="text-[11px] font-black text-emerald-800 dark:text-emerald-400">{lang === 'ar' ? 'صافي الربح المتوقع' : 'Projected Net Profit'}</h5>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1 leading-snug">
                          {lang === 'ar' 
                            ? `بناءً على نسبة استلام ${selectedProduct.yalidine_rate}% وخصم مصاريف المرتجعات والإعلانات.`
                            : `Adjusted for ${selectedProduct.yalidine_rate}% success and RTS costs.`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{netProfit.toLocaleString()} {modalLoc.currency}</p>
                        <span className="text-[10px] font-bold text-emerald-500 block mt-0.5">{netProfitPercentage}% {lang === 'ar' ? 'عائد استثمار' : 'ROI'}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Drawer footer */}
              <div className="p-4 border-t border-gray-150 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-950 flex gap-3 shrink-0">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold text-center hover:bg-gray-50"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleImportToStore}
                  disabled={isImporting}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold text-center shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  {isImporting ? (
                    <>
                      <SOUQAILoader size="sm" text="" />
                      {lang === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {lang === 'ar' ? 'استورد للمتجر الآن' : 'Import to Store'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
