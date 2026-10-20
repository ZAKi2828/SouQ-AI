export interface LocalizedProductData {
  name: string;
  description: string;
  marketing_hook?: string;
  wholesale_market?: string;
  trend_badge: string;
  sourceLabel: string;
  currency: string;
  viewsLabel: string;
  likesLabel: string;
  salesAngleLabel: string;
}

interface ProductTranslation {
  name: string;
  description: string;
  marketing_hook: string;
  wholesale_market: string;
  trend_badge: string;
}

export const staticProductTranslationsEn: Record<string, ProductTranslation> = {
  'trend-1': {
    name: 'Automatic Smart Infrared Soap & Sanitizer Dispenser',
    description: 'Touchless automatic soap dispenser powered by infrared sensor. Water-resistant, soap-saving, and modern design for kitchens and bathrooms.',
    marketing_hook: 'Stop wasting soap and creating bathroom mess! Touchless smart sensor dispensing with fast home delivery and cash on delivery.',
    wholesale_market: 'El Eulma Wholesale Market (Setif)',
    trend_badge: 'Trending Facebook Ad 📈'
  },
  'trend-2': {
    name: 'Portable USB Rechargeable Bladeless Neck Sports Fan',
    description: 'Hands-free wearable neck cooler with 3 quiet speeds and long battery life. Lightweight, flexible, and essential for Algerian hot summers.',
    marketing_hook: 'Beat the scorching Algerian summer heat everywhere! Hands-free neck breeze at work, driving, or outdoors.',
    wholesale_market: 'Belfort (El Harrach) / El Eulma',
    trend_badge: 'Algeria TikTok Trend ☀️'
  },
  'trend-3': {
    name: '5-in-1 Professional Hair Styler, Curler & Hot Air Dryer',
    description: 'Complete negative-ion multi-styler that dries, straightens, and volumizes without heat damage, giving salon-grade smooth hair.',
    marketing_hook: 'A full beauty salon in your hands! 5 interchangeable styling heads for silky frizz-free hair with zero heat damage.',
    wholesale_market: 'El Hamiz Wholesale Market (Algiers)',
    trend_badge: 'Top Seller This Week 🔥'
  },
  'trend-4': {
    name: '3-in-1 Fast Wireless Magnetic Charging Station (MagSafe)',
    description: 'Foldable 15W wireless charging dock for smartphone, smartwatch, and wireless earbuds simultaneously with over-heat protection.',
    marketing_hook: 'Say goodbye to messy cables on your nightstand! Fast, elegant 3-in-1 wireless dock for phone, watch, and pods.',
    wholesale_market: 'Belfort Electronics Market (El Harrach)',
    trend_badge: 'Sponsored Facebook Ad ⚡'
  },
  'trend-5': {
    name: '360° Rotating Lazy Susan Kitchen Spice & Storage Organizer',
    description: 'Smooth 360-degree rotating turntable organizer for spices, condiments, and cosmetics. Non-slip base and maximizes cabinet space.',
    marketing_hook: 'Declutter your kitchen cabinets with one smooth spin! Fits any corner, easy to wash, pay on delivery at your doorstep.',
    wholesale_market: 'El Eulma Wholesale Market (Setif)',
    trend_badge: 'High Demand Essential ✅'
  },
  'trend-6': {
    name: 'Smart Anti-Theft Water-Resistant Laptop Backpack with USB Port',
    description: 'Durable anti-theft business backpack with TSA combination lock, hidden pockets, waterproof fabric, and built-in USB charging port.',
    marketing_hook: 'Commute and travel with 100% peace of mind! Waterproof, anti-theft laptop bag with external USB charging. Inspect before paying.',
    wholesale_market: 'Ain Fakroun / El Hamiz Market',
    trend_badge: 'TikTok Viral Trend 🎒'
  },
  'trend-7': {
    name: 'Ice-Cooling IPL Permanent Laser Hair Removal Device',
    description: 'Clinical-grade IPL pulsed light handset with ice-cooling contact plate for painless, long-lasting hair removal with 999,000 flashes.',
    marketing_hook: 'Skip expensive beauty clinic sessions! Pain-free ice cooling IPL handset with permanent results from the comfort of home.',
    wholesale_market: 'El Eulma / El Hamiz Wholesale',
    trend_badge: 'Top Rated Product ⭐'
  },
  'trend-8': {
    name: 'High-Power Wireless Handheld Car & Home Vacuum Cleaner',
    description: 'Cordless 120W portable cyclone vacuum with washable HEPA filter and multi-nozzles for seats, trunk, keyboards, and hard-to-reach nooks.',
    marketing_hook: 'Keep your car interior spotless in 2 minutes! Strong suction, cordless convenience, and rechargeable via car USB.',
    wholesale_market: 'El Hamiz Wholesale Market (Algiers)',
    trend_badge: 'Must-Have Car Gadget 🚗'
  },
  'trend-9': {
    name: 'Adjustable Orthopedic Back & Shoulder Posture Corrector Brace',
    description: 'Ergonomic breathable posture support brace for spine alignment, relieving upper back pain and shoulder slouching for desk workers and drivers.',
    marketing_hook: 'Get rid of chronic back and neck pain! Wear under clothes comfortably while working or driving. Cash on delivery nationwide.',
    wholesale_market: 'Ain Fakroun Wholesale Market',
    trend_badge: 'Best Health Seller 🔥'
  },
  'trend-10': {
    name: 'Smart RGB LED Atmosphere Light Strip with Bluetooth & App',
    description: 'Music-syncing RGB LED neon strip with remote and smartphone app control. Flexible adhesive backing for gaming rooms, TV setups, and ceilings.',
    marketing_hook: 'Transform your room into a luxury studio! 16 million colors sync with your music via smartphone app. Free delivery options available.',
    wholesale_market: 'El Eulma / Belfort Wholesale',
    trend_badge: 'Viral Youth Trend 🎧'
  },
  'trend-11': {
    name: 'Slim Carbon Fiber RFID-Blocking Pop-Up Cardholder Wallet',
    description: 'Ultra-thin aerospace aluminum and carbon-fiber smart wallet with pop-up ejector mechanism and RFID protection against card theft.',
    marketing_hook: 'Ditch bulky old wallets! Sleek pop-up cardholder with RFID anti-theft protection. Quick access to cards with one flick.',
    wholesale_market: 'Ain Fakroun Wholesale Market',
    trend_badge: 'Men Fashion Trend 💳'
  },
  'trend-12': {
    name: 'Intelligent Electric Pulse Neck & Shoulder Massager with Heat',
    description: 'U-shaped cordless cervical vertebrae massager utilizing low-frequency electrical pulses and soothing 42°C constant temperature heating.',
    marketing_hook: 'A relaxing massage therapy session after a long tiring day! Relieves tension and stiff neck in just 15 minutes a day.',
    wholesale_market: 'El Hamiz Wholesale Market (Algiers)',
    trend_badge: 'High Engagement Ad 💆'
  },
  'trend-13': {
    name: 'Ultra Series 8 Smartwatch with Bluetooth Calls & Health Sensors',
    description: 'Full-touch HD screen smartwatch with Bluetooth calling, heart rate, blood oxygen monitor, multi-sport modes, and wireless charging.',
    marketing_hook: 'Luxury flagship watch design without the crazy price tag! Take calls, track fitness, and receive WhatsApp notifications on your wrist.',
    wholesale_market: 'Belfort Electronics Market (El Harrach)',
    trend_badge: 'Best Tech Seller ⌚'
  },
  'trend-14': {
    name: 'Portable USB Electric Smoothie Blender & Juice Maker',
    description: 'Cordless 6-blade personal blender bottle with magnetic safety lock for smoothies, protein shakes, and baby food on the go.',
    marketing_hook: 'Fresh natural juice anywhere, anytime! Rechargeable blender bottle for gym, office, or university. Pay after inspection.',
    wholesale_market: 'El Eulma Wholesale Market (Setif)',
    trend_badge: 'Healthy Living Trend 🍹'
  },
  'trend-15': {
    name: 'Electric Visual Blackhead Vacuum Remover & Deep Pore Cleanser',
    description: 'Rechargeable facial pore extractor with micro-camera and 3 adjustable suction levels to clear stubborn blackheads and excess oils safely.',
    marketing_hook: 'Clear skin and blackhead-free pores without skin damage! Deep pore suction cleaner with USB charging. Delivery to 58 provinces.',
    wholesale_market: 'El Hamiz / El Eulma Wholesale',
    trend_badge: 'Skincare Trend 🌸'
  },
  'trend-16': {
    name: 'Wireless Bluetooth 5.3 Earbuds with LED Power Display & ANC',
    description: 'True wireless stereo earbuds with digital battery display case, intelligent noise reduction, touch controls, and deep bass performance.',
    marketing_hook: 'Crystal-clear sound and heavy bass without interruptions! Fast pairing, long battery life, and comfortable ergonomic fit.',
    wholesale_market: 'Belfort Electronics Market (El Harrach)',
    trend_badge: 'TikTok Youth Favorite 🎵'
  },
  'trend-17': {
    name: 'Multi-Pocket Premium Car Backseat Organizer & Tablet Holder',
    description: 'Durable PU leather car seat protector and organizer featuring a transparent iPad holder, foldable dining tray, and umbrella pockets.',
    marketing_hook: 'Keep your car neat and organized during family road trips! Tablet holder keeps kids entertained while protecting seat backs.',
    wholesale_market: 'El Hamiz Wholesale Market (Algiers)',
    trend_badge: 'Family Travel Must-Have 🚙'
  },
  'trend-18': {
    name: 'Multifunctional G-Lamp Smart Atmosphere Light & Bluetooth Speaker',
    description: 'All-in-one RGB sunrise wake-up ambient night lamp, 15W wireless fast charger, and high-fidelity Bluetooth speaker with alarm clock.',
    marketing_hook: 'The viral G-Lamp that everyone is talking about! Ambient RGB lamp, fast phone charger, and Bluetooth sound all in one device.',
    wholesale_market: 'Belfort / El Eulma Wholesale',
    trend_badge: 'Exclusive & Innovative 💡'
  },
  'trend-19': {
    name: 'Vintage T9 Professional Cordless Hair & Beard Detail Trimmer',
    description: 'Zero-gapped carbon-steel precision hair clipper with antique engraved metallic body, rechargeable battery, and guide combs for barbers.',
    marketing_hook: 'Barbershop-level sharp edges at home! Precision zero-gap T9 trimmer for beard sculpting and crisp hair outlines.',
    wholesale_market: 'El Eulma Wholesale Market (Setif)',
    trend_badge: 'Top Men Grooming Seller 💈'
  },
  'trend-20': {
    name: '360° Magnetic Car Air Vent Phone Mount Holder',
    description: 'Ultra-strong neodymium magnetic smartphone cradle with 360-degree ball joint, securely clamping into any vehicle air conditioning vent.',
    marketing_hook: 'Your phone stays rock-solid even on bumpy roads! Instant one-hand snap mounting with 360-degree viewing angle.',
    wholesale_market: 'Belfort Electronics Market (El Harrach)',
    trend_badge: 'High Conversion Product 📱'
  }
};

export function translateWholesaleMarket(market?: string): string {
  if (!market) return 'El Eulma / El Hamiz Wholesale Market';
  const m = market.toLowerCase();
  if (m.includes('علمة') && m.includes('حميز')) return 'El Eulma / El Hamiz Wholesale Market';
  if (m.includes('علمة')) return 'El Eulma Wholesale Market (Setif)';
  if (m.includes('حميز')) return 'El Hamiz Wholesale Market (Algiers)';
  if (m.includes('بلفور')) return 'Belfort Electronics Market (El Harrach)';
  if (m.includes('فكرون')) return 'Ain Fakroun Wholesale Market';
  return market;
}

export function translateTrendBadge(badge?: string): string {
  if (!badge) return 'Active Ad in Algeria 🔥';
  const b = badge.toLowerCase();
  if (b.includes('فيسبوك') && (b.includes('رائج') || b.includes('نشط') || b.includes('ممول'))) return 'Active Facebook Ad 📈';
  if (b.includes('تيك توك')) return 'Algeria TikTok Trend 🔥';
  if (b.includes('الأكثر طلباً') || b.includes('الأكثر مبيعا')) return 'Top Seller This Week 🔥';
  if (b.includes('عملي') || b.includes('مطلوب')) return 'High Demand Essential ✅';
  if (b.includes('سيارة')) return 'Must-Have Car Gadget 🚗';
  if (b.includes('رجالي')) return 'Top Men\'s Seller 💈';
  if (b.includes('تقييم')) return 'Top Rated Product ⭐';
  if (b.includes('مبتكر')) return 'Innovative Product 💡';
  return badge;
}

export function translateDynamicName(name: string, category: string): string {
  if (!name) return 'Trending Winning Product';
  // Common keyword translations for dynamically discovered products
  const n = name.toLowerCase();
  if (n.includes('ساعة') || n.includes('watch')) return 'Smart Ultra Calling Watch & Fitness Tracker';
  if (n.includes('سماعة') || n.includes('earbuds')) return 'Wireless ANC Noise-Canceling Bluetooth Earbuds';
  if (n.includes('مكنسة') || n.includes('vacuum')) return 'Cordless Handheld High-Power Car Vacuum Cleaner';
  if (n.includes('شاحن') || n.includes('charger')) return 'Fast Wireless 3-in-1 Foldable Charging Station';
  if (n.includes('مصفف') || n.includes('شعر')) return '5-in-1 Ionic Hot Air Hair Styler & Dryer';
  if (n.includes('صابون') || n.includes('soap')) return 'Touchless Smart Automatic Infrared Soap Dispenser';
  if (n.includes('ليزر') || n.includes('laser')) return 'Ice-Cooling IPL Permanent Laser Hair Removal Device';
  if (n.includes('مصباح') || n.includes('lamp')) return 'Multifunctional RGB Atmosphere Smart Night Lamp';
  if (n.includes('خلاط') || n.includes('blender')) return 'Portable Cordless USB Electric Fruit Smoothie Blender';
  if (n.includes('حزام') || n.includes('ظهر')) return 'Orthopedic Ergonomic Spine Posture Corrector Brace';
  if (n.includes('ماكينة') || n.includes('حلاقة')) return 'Precision Cordless Vintage T9 Hair & Beard Trimmer';
  if (n.includes('حقيبة') || n.includes('backpack')) return 'Anti-Theft Waterproof Laptop Backpack with USB Port';
  if (n.includes('منظم') && n.includes('مطبخ')) return '360° Rotating Lazy Susan Kitchen Spice Organizer';
  if (n.includes('منظم') && n.includes('سيارة')) return 'Multi-Pocket Luxury Car Backseat Seatback Organizer';
  if (n.includes('حامل') && n.includes('هاتف')) return '360° Magnetic Air Vent Car Smartphone Mount';
  if (n.includes('مروحة') || n.includes('fan')) return 'Portable Bladeless USB Rechargeable Neck Sports Fan';
  if (n.includes('محفظة') || n.includes('wallet')) return 'Slim Pop-Up Carbon Fiber RFID-Blocking Smart Wallet';
  if (n.includes('رؤوس') || n.includes('مسام')) return 'Visual Electric Vacuum Blackhead Pore Cleanser';
  if (n.includes('مساج') || n.includes('تدليك')) return 'Intelligent Cordless Electric Pulse Heated Neck Massager';
  if (n.includes('أضواء') || n.includes('led')) return 'Smart RGB Bluetooth Music Sync LED Atmosphere Strips';
  
  if (category === 'tech') return `${name} (High-Converting Tech Gadget)`;
  if (category === 'beauty') return `${name} (Trending Beauty & Care)`;
  if (category === 'home') return `${name} (Smart Home Essential)`;
  if (category === 'accessories') return `${name} (Trending Lifestyle Item)`;
  return name;
}

export function translateDynamicDescription(desc: string, category: string): string {
  if (!desc) return 'High-converting trending product with verified active paid ad campaigns and strong COD margins in Algeria.';
  return desc;
}

export function translateDynamicHook(hook: string): string {
  if (!hook) return 'Fast 58-province home delivery with inspection and cash payment upon arrival.';
  return 'Fast home delivery across all 58 Algerian provinces with Cash on Delivery (COD) payment upon inspection.';
}

export function getLocalizedProduct(product: any, lang: string): LocalizedProductData {
  const isEn = lang !== 'ar';
  const id = product.id || '';
  const staticEn = staticProductTranslationsEn[id];

  const currency = isEn ? 'DZD' : 'د.ج';
  const viewsLabel = isEn ? 'Views' : 'مشاهدة';
  const likesLabel = isEn ? 'Likes' : 'تفاعل';
  const salesAngleLabel = isEn ? 'Sales Angle:' : 'زاوية البيع:';
  const sourceLabel = product.source === 'tiktok' 
    ? (isEn ? 'TikTok' : 'تيك توك') 
    : (isEn ? 'Facebook' : 'فيسبوك');

  if (!isEn) {
    return {
      name: product.name,
      description: product.description,
      marketing_hook: product.marketing_hook,
      wholesale_market: product.wholesale_market,
      trend_badge: product.trend_badge,
      sourceLabel,
      currency,
      viewsLabel,
      likesLabel,
      salesAngleLabel,
    };
  }

  // English localization
  const name = product.name_en || (staticEn ? staticEn.name : translateDynamicName(product.name, product.category));
  const description = product.description_en || (staticEn ? staticEn.description : translateDynamicDescription(product.description, product.category));
  const marketing_hook = product.marketing_hook_en || (staticEn ? staticEn.marketing_hook : (product.marketing_hook ? translateDynamicHook(product.marketing_hook) : undefined));
  const wholesale_market = product.wholesale_market_en || (staticEn ? staticEn.wholesale_market : translateWholesaleMarket(product.wholesale_market));
  const trend_badge = product.trend_badge_en || (staticEn ? staticEn.trend_badge : translateTrendBadge(product.trend_badge));

  return {
    name,
    description,
    marketing_hook,
    wholesale_market,
    trend_badge,
    sourceLabel,
    currency,
    viewsLabel,
    likesLabel,
    salesAngleLabel,
  };
}
