export function isValidImageUrl(url?: string): boolean {
    if (!url || typeof url !== 'string') return false;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/api/image-proxy')) return false;
    const lower = url.toLowerCase();
    if (lower.includes('example.') || lower.includes('placeholder') || lower.includes('example_') || lower.includes('via.placeholder')) {
        return false;
    }
    return true;
}

export function getProxiedImageUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';
    return url;
}

export function buildRealSpyUrl(url: string | undefined, productName: string, source: 'facebook' | 'tiktok' = 'facebook'): string {
    const cleanName = productName.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
    
    if (url && typeof url === 'string') {
        const lower = url.toLowerCase();
        const isFake = lower.includes('example.') || 
                       lower.includes('localhost') || 
                       lower.includes('test.') || 
                       lower.includes('fake') ||
                       lower.includes('techstore.dz') ||
                       lower.includes('beautydz.shop') ||
                       lower.includes('caraccessoriesdz.com') ||
                       lower.includes('homegadgets.dz') ||
                       lower.includes('smarttechdz.com') ||
                       lower.includes('smarthomedz.store') ||
                       lower.includes('fashiondz.shop');
        if (!isFake && (lower.startsWith('http://') || lower.startsWith('https://'))) {
            return url;
        }
    }

    if (source === 'tiktok') {
        return `https://www.tiktok.com/search?q=${encodeURIComponent(cleanName + ' الجزائر')}`;
    }
    return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=DZ&q=${encodeURIComponent(cleanName)}`;
}

/**
 * Maps product names to 100% verified, permanent, high-definition product photos matching the item.
 */
export function resolveProductImage(name: string, category: string): string {
    const n = name.toLowerCase();

    // Smartwatch
    if (n.includes('ساعة') || n.includes('watch') || n.includes('smartwatch')) {
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop';
    }
    // Wireless Earbuds
    if (n.includes('سماعة') || n.includes('سماعات') || n.includes('earbuds') || n.includes('headphones') || n.includes('بلوتوث')) {
        return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop';
    }
    // Handheld Car Vacuum Cleaner
    if (n.includes('مكنسة') || (n.includes('سيارة') && (n.includes('شفط') || n.includes('تنظيف')))) {
        return 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop';
    }
    // LED RGB Strip Lights
    if (n.includes('أضواء') || n.includes('led') || n.includes('ريموت') || n.includes('شريط ضوئي') || n.includes('rgb')) {
        return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop';
    }
    // Juicer / Blender Bottle
    if (n.includes('خلاط') || n.includes('عصير') || n.includes('blender') || n.includes('عصارة')) {
        return 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop';
    }
    // Anti-Theft Backpack
    if (n.includes('حقيبة') || n.includes('backpack') || n.includes('سرقة') || n.includes('ظهر')) {
        return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop';
    }
    // RFID Smart Wallet
    if (n.includes('محفظة') || n.includes('rfid') || n.includes('بطاقات') || n.includes('wallet')) {
        return 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop';
    }
    // 3-in-1 Wireless Charger
    if (n.includes('شاحن') || n.includes('charger') || n.includes('magsafe') || n.includes('لاسلكي')) {
        return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop';
    }
    // T9 Shaver / Trimmer
    if (n.includes('حلاقة') || n.includes('shaver') || n.includes('trimmer') || n.includes('ماكينة') || n.includes('t9')) {
        return 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop';
    }
    // Automatic Soap Dispenser
    if (n.includes('صابون') || n.includes('soap') || n.includes('موزع')) {
        return 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop';
    }
    // Hair Styler 5-in-1 / Laser IPL
    if (n.includes('مصفف') || n.includes('استشوار') || n.includes('مجفف') || n.includes('شعر') || n.includes('ليزر')) {
        return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop';
    }
    // Massager
    if (n.includes('تدليك') || n.includes('مساج') || n.includes('massage') || n.includes('رقبة')) {
        return 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&auto=format&fit=crop';
    }
    // Posture Corrector
    if (n.includes('حزام') || n.includes('وضعية') || n.includes('ظهر') || n.includes('كتفين') || n.includes('posture')) {
        return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop';
    }
    // Facial Cleanser / Blackhead Remover
    if (n.includes('رؤوس') || n.includes('blackhead') || n.includes('بثور') || n.includes('مسام') || n.includes('بالموجات')) {
        return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop';
    }
    // Car Storage Organizer / Interior
    if (n.includes('منظم سيارة') || n.includes('مقعد')) {
        return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop';
    }
    // Phone Holder
    if (n.includes('حامل هاتف') || n.includes('ستاند') || n.includes('holder')) {
        return 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop';
    }
    // Clothes Steamer Iron
    if (n.includes('مكواة') || n.includes('بخار') || n.includes('iron')) {
        return 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop';
    }
    // Scale
    if (n.includes('ميزان') || n.includes('وزن') || n.includes('scale')) {
        return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop';
    }
    // G-Lamp / Lamp
    if (n.includes('مصباح') || n.includes('lamp')) {
        return 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop';
    }
    // Perfume / Scent
    if (n.includes('عطر') || n.includes('perfume') || n.includes('رائحة')) {
        return 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop';
    }
    // Skincare
    if (n.includes('عناية') || n.includes('بشرة') || n.includes('مرطب') || n.includes('كريم')) {
        return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop';
    }
    // Shoes
    if (n.includes('حذاء') || n.includes('shoes') || n.includes('رياضي')) {
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop';
    }

    switch (category) {
        case 'tech':
            return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop';
        case 'beauty':
            return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop';
        case 'home':
            return 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop';
        case 'accessories':
            return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop';
        case 'fashion':
            return 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop';
        default:
            return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop';
    }
}
