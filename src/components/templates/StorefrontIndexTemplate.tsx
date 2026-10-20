'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from "@/context/I18nContext";
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ThemeToggle from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function StorefrontIndexTemplate({ store, products }: { store: any, products: any[] }) {
    const { lang, setLang, t } = useI18n();

    useEffect(() => {
        const targetLang = store?.store_lang || 'ar';
        if (targetLang !== lang) {
            setLang(targetLang as any);
        }
    }, [store?.store_lang, lang, setLang]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(t('t_2e4421e'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // Semantic search state
    const [semanticResults, setSemanticResults] = useState<any[] | null>(null);
    const [isSemanticSearching, setIsSemanticSearching] = useState(false);
    const [isSemanticMode, setIsSemanticMode] = useState(false);
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

    const themeColor = store?.store_color || '#008096';
    const announcementText = store?.announcement_text || t('t_ad0a6ea6');
    const heroImage = store?.hero_image_url || null;

    // Custom storefront design options
    const storefrontTheme = store?.storefront_theme || 'classic';
    const storefrontFont = store?.storefront_font || 'Cairo';
    const announcementAnimation = store?.announcement_animation ?? true;
    const announcementBgColor = store?.announcement_bg_color || themeColor;
    const announcementTextColor = store?.announcement_text_color || '#FFFFFF';
    const heroBackgroundType = store?.hero_background_type || 'gradient';
    const heroGradientPreset = store?.hero_gradient_preset || 'blue';
    const heroTitle = store?.hero_title || store?.store_name || '';
    const heroSubtitle = store?.hero_subtitle || store?.description || '';
    const heroCtaText = store?.hero_cta_text || t('t_df3c581e');
    const heroCtaStyle = store?.hero_cta_style || 'pill';
    const productsCardStyle = store?.products_card_style || 'classic';
    const productsMobileColumns = store?.products_mobile_columns ?? 2;
    const productsDesktopColumns = store?.products_desktop_columns ?? 4;
    const whatsappTooltip = store?.whatsapp_tooltip || t('t_a3a01fb7');
    const whatsappPulse = store?.whatsapp_pulse ?? true;
    const trustBadges = store?.trust_badges_json || [
      { icon: 'local_shipping', title: t('t_c13563e0'), description: t('t_6e189c4a') },
      { icon: 'payments', title: t('t_52243fb5'), description: t('t_a0dc650a') },
      { icon: 'verified', title: t('t_ce0705f8'), description: t('t_2420ff21') }
    ];

    // Debounced semantic search
    useEffect(() => {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        // Only use semantic search for queries with 3+ characters
        if (searchQuery.trim().length < 3) {
            setSemanticResults(null);
            setIsSemanticMode(false);
            setIsSemanticSearching(false);
            return;
        }

        setIsSemanticSearching(true);

        searchTimerRef.current = setTimeout(async () => {
            try {
                const res = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: searchQuery.trim(),
                        storeDomain: store?.store_domain,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.results && data.results.length > 0) {
                        setSemanticResults(data.results);
                        setIsSemanticMode(true);
                    } else {
                        setSemanticResults(null);
                        setIsSemanticMode(false);
                    }
                } else {
                    setSemanticResults(null);
                    setIsSemanticMode(false);
                }
            } catch {
                setSemanticResults(null);
                setIsSemanticMode(false);
            } finally {
                setIsSemanticSearching(false);
            }
        }, 400);

        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [searchQuery, store?.store_domain]);

    // Extract unique categories from products
    const categories = useMemo(() => {
        const cats = new Set<string>();
        products?.forEach(p => { if (p.category) cats.add(p.category); });
        return [t('t_2e4421e'), ...Array.from(cats)];
    }, [products]);

    // Filter products - hybrid: semantic results when available, fallback to text search
    const filteredProducts = useMemo(() => {
        // If we have semantic results, use them (already filtered by store + active)
        if (isSemanticMode && semanticResults && semanticResults.length > 0) {
            const catFiltered = selectedCategory === t('t_2e4421e')
                ? semanticResults
                : semanticResults.filter((p: any) => p.category === selectedCategory);
            return catFiltered;
        }

        // Fallback: classic text filter
        if (!products) return [];
        return products.filter(p => {
            const matchesSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === t('t_2e4421e') || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory, isSemanticMode, semanticResults]);

    const hasDiscount = (p: any) => p.compare_at_price && p.compare_at_price > p.price;
    const discountPercent = (p: any) => {
        if (!hasDiscount(p)) return 0;
        return Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100);
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Almarai:wght@300;400;700;800&family=Tajawal:wght@300;400;500;700;800;900&family=El+Messiri:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
                
                :root {
                    --theme: ${themeColor};
                    --theme-dark: color-mix(in srgb, ${themeColor} 85%, #000);
                    --theme-light: color-mix(in srgb, ${themeColor} 12%, #fff);
                    --cta: ${themeColor};
                    --cta-hover: color-mix(in srgb, ${themeColor} 85%, #000);
                    --discount: #e53935;
                    --price-green: #2e7d32;
                }
                
                /* Footer Customization styling overrides */
                .sf-footer-title {
                    color: var(--footer-text, #ffffff) !important;
                }
                .sf-footer-link {
                    color: color-mix(in srgb, var(--footer-text, #ffffff) 70%, transparent) !important;
                    transition: color 0.2s ease;
                }
                .sf-footer-link:hover {
                    color: var(--footer-text, #ffffff) !important;
                }
                .sf-footer-muted {
                    color: color-mix(in srgb, var(--footer-text, #ffffff) 45%, transparent) !important;
                }
                .sf-footer-social {
                    background-color: color-mix(in srgb, var(--footer-text, #ffffff) 10%, transparent) !important;
                    color: color-mix(in srgb, var(--footer-text, #ffffff) 60%, transparent) !important;
                }
                .sf-footer-social:hover {
                    background-color: color-mix(in srgb, var(--footer-text, #ffffff) 20%, transparent) !important;
                    color: var(--footer-text, #ffffff) !important;
                }
                .sf-footer-border {
                    border-color: color-mix(in srgb, var(--footer-text, #ffffff) 15%, transparent) !important;
                }

                ${store?.custom_css || ''}
                
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                .sf-root { 
                    font-family: '${storefrontFont}', 'Cairo', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }

                /* ── Product Card ── */
                .sf-card {
                    ${productsCardStyle === 'flat' ? `
                        background: transparent;
                        border-radius: 0px;
                        border: none;
                        box-shadow: none;
                    ` : productsCardStyle === 'bold' ? `
                        background: #ffffff;
                        border-radius: 0px;
                        border: 3px solid #000000;
                        box-shadow: 6px 6px 0px 0px #000000;
                    ` : productsCardStyle === 'glass' ? `
                        background: rgba(255, 255, 255, 0.45);
                        border-radius: 20px;
                        border: 1px solid rgba(255, 255, 255, 0.4);
                        backdrop-filter: blur(16px) saturate(120%);
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.04);
                    ` : `
                        background: #ffffff;
                        border-radius: 16px;
                        border: 1px solid #f0f0f0;
                    `}
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }
                
                ${productsCardStyle === 'bold' ? `
                .sf-card:hover {
                    transform: translate(-3px, -3px);
                    box-shadow: 9px 9px 0px 0px #000000;
                }
                ` : productsCardStyle === 'flat' ? `
                .sf-card:hover {
                    transform: translateY(-4px);
                    box-shadow: none;
                }
                ` : `
                .sf-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
                }
                `}
                
                .sf-card:hover .sf-card-img {
                    transform: scale(1.06);
                }
                .sf-card-img {
                    transition: transform 0.5s ease;
                }

                /* ── Buttons ── */
                .sf-btn-cta {
                    background: var(--cta);
                    color: #fff;
                    border: none;
                    font-family: '${storefrontFont}', 'Cairo', sans-serif;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .sf-btn-cta:hover {
                    filter: brightness(0.9);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                }
                .sf-btn-buy {
                    background: var(--theme);
                    color: #fff;
                    border: none;
                    font-family: '${storefrontFont}', 'Cairo', sans-serif;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    width: 100%;
                    border-radius: 10px;
                }
                .sf-btn-buy:hover {
                    filter: brightness(1.1);
                    transform: scale(1.02);
                }

                /* ── Badge ── */
                .sf-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: var(--discount);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 3px 10px;
                    border-radius: 20px;
                    z-index: 2;
                    animation: sfPulse 2s infinite;
                }
                @keyframes sfPulse { 0%,100%{opacity:1} 50%{opacity:0.75} }

                /* ── Marquee Animation ── */
                @keyframes sfMarquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .sf-marquee-wrap {
                    overflow: hidden;
                    width: 100%;
                }
                .sf-marquee-text {
                    display: inline-block;
                    white-space: nowrap;
                    animation: sfMarquee 18s linear infinite;
                }

                /* ── Category Pill ── */
                .sf-pill {
                    padding: 8px 22px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 700;
                    border: 2px solid #e8e8e8;
                    background: #fff;
                    color: #555;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    white-space: nowrap;
                    font-family: '${storefrontFont}', 'Cairo', sans-serif;
                }
                .sf-pill:hover {
                    border-color: #ccc;
                    background: #fafafa;
                }
                .sf-pill.active {
                    background: var(--theme);
                    color: #fff;
                    border-color: var(--theme);
                    box-shadow: 0 3px 12px color-mix(in srgb, var(--theme) 30%, transparent);
                }

                /* ── Trust Card ── */
                .sf-trust {
                    background: #fff;
                    border: 1px solid #f0f0f0;
                    border-radius: 16px;
                    padding: 24px;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                .sf-trust:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
                }

                /* ── Scrollbar hide ── */
                .sf-noscroll::-webkit-scrollbar { display: none; }
                .sf-noscroll { -ms-overflow-style: none; scrollbar-width: none; }

                /* ── Stars ── */
                .sf-stars { display: flex; align-items: center; gap: 1px; }
                .sf-star { color: #ffc107; font-size: 14px; }
                .sf-star-empty { color: #e0e0e0; font-size: 14px; }

                /* ── WhatsApp Ripple ── */
                @keyframes sfWaRipple {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
                .sf-wa-pulse {
                    animation: sfWaRipple 2s infinite !important;
                }
                
                /* ── Theme Overrides ── */
                ${storefrontTheme === 'modern' ? `
                    /* Modern Theme - Sleek, Rounded, Glassmorphism, Modern Gradients */
                    .sf-root {
                        font-family: 'Tajawal', 'Cairo', sans-serif !important;
                        background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 50%), 
                                    radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.03) 0%, transparent 50%) !important;
                        background-color: #fafbfc !important;
                    }
                    .sf-btn-cta, .sf-btn-buy, .sf-pill, .sf-category-btn {
                        border-radius: 9999px !important;
                        font-weight: 700 !important;
                        box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.05) !important;
                        transition: all 0.3s ease !important;
                    }
                    .sf-btn-cta:hover, .sf-btn-buy:hover {
                        transform: translateY(-2px) !important;
                        box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.08) !important;
                    }
                    .sf-card {
                        border-radius: 24px !important;
                        border: 1px solid rgba(241, 245, 249, 0.9) !important;
                        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04) !important;
                        background: #ffffff !important;
                    }
                    .sf-card:hover {
                        transform: translateY(-5px) !important;
                        box-shadow: 0 20px 35px -15px rgba(0,0,0,0.08) !important;
                    }
                    .sf-trust {
                        border-radius: 24px !important;
                        background: rgba(255, 255, 255, 0.7) !important;
                        backdrop-filter: blur(8px) !important;
                        border: 1px solid rgba(241, 245, 249, 0.9) !important;
                    }
                ` : storefrontTheme === 'elegant' ? `
                    /* Luxurious Design - Serif, Elegant Spacing, Gold Accent, Flat borders */
                    .sf-root {
                        font-family: 'El Messiri', 'Cairo', serif !important;
                        background-color: #faf8f5 !important;
                    }
                    h1, h2, h3, h4, .sf-marquee-text, .sf-product-title {
                        font-family: 'El Messiri', 'Cairo', serif !important;
                        letter-spacing: 0.3px !important;
                        font-weight: 700 !important;
                    }
                    .sf-btn-cta, .sf-btn-buy, .sf-pill {
                        border-radius: 2px !important;
                        font-weight: 500 !important;
                        letter-spacing: 1px !important;
                        border: 1px solid var(--theme) !important;
                        background: var(--theme) !important;
                        box-shadow: none !important;
                        text-transform: uppercase !important;
                    }
                    .sf-btn-cta:hover, .sf-btn-buy:hover {
                        background: transparent !important;
                        color: var(--theme) !important;
                        border-color: var(--theme) !important;
                    }
                    .sf-card {
                        border-radius: 4px !important;
                        border: 1px solid #eae5df !important;
                        background-color: #ffffff !important;
                        box-shadow: none !important;
                        transition: all 0.4s ease !important;
                    }
                    .sf-card:hover {
                        border-color: #c5a880 !important;
                        transform: translateY(-2px) !important;
                        box-shadow: 0 12px 24px -10px rgba(197, 168, 128, 0.12) !important;
                    }
                    .sf-trust {
                        border-radius: 4px !important;
                        border: 1px solid #eae5df !important;
                        background-color: #ffffff !important;
                        box-shadow: none !important;
                    }
                    .sf-badge {
                        background-color: #8c2d19 !important;
                        border-radius: 2px !important;
                    }
                ` : storefrontTheme === 'bold' ? `
                    /* Free / Bold Style - Brutalist, offset solid shadows, thick borders */
                    .sf-root {
                        font-family: 'Montserrat', 'Cairo', sans-serif !important;
                        background-color: #fcfcfc !important;
                    }
                    .sf-btn-cta, .sf-btn-buy, .sf-pill, .sf-category-btn {
                        border-radius: 0px !important;
                        border: 3px solid #000000 !important;
                        box-shadow: 4px 4px 0px 0px #000000 !important;
                        background: var(--theme) !important;
                        color: #ffffff !important;
                        transition: all 0.15s ease !important;
                    }
                    .sf-btn-cta:hover, .sf-btn-buy:hover {
                        transform: translate(-2px, -2px) !important;
                        box-shadow: 6px 6px 0px 0px #000000 !important;
                    }
                    .sf-btn-cta:active, .sf-btn-buy:active {
                        transform: translate(2px, 2px) !important;
                        box-shadow: 2px 2px 0px 0px #000000 !important;
                    }
                    .sf-card, .sf-trust {
                        border-radius: 0px !important;
                        border: 3px solid #000000 !important;
                        box-shadow: 6px 6px 0px 0px #000000 !important;
                        background-color: #ffffff !important;
                        transition: all 0.2s ease !important;
                    }
                    .sf-card:hover {
                        transform: translate(-3px, -3px) !important;
                        box-shadow: 9px 9px 0px 0px #000000 !important;
                    }
                    .sf-badge {
                        border-radius: 0px !important;
                        border: 2px solid #000000 !important;
                        background-color: #ffde43 !important;
                        color: #000000 !important;
                        font-weight: 900 !important;
                    }
                ` : ''}
            ` }} />

            <div className="sf-root bg-[#fafafa] text-gray-900 min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

                {/* ═══════════════ ANNOUNCEMENT BAR ═══════════════ */}
                <div 
                    style={{ background: announcementBgColor }} 
                    className="h-[40px] flex items-center px-4 sf-marquee-wrap"
                >
                    <p 
                        className={`text-[13px] sm:text-[14px] font-bold tracking-wide ${announcementAnimation ? 'sf-marquee-text' : 'w-full text-center'}`}
                        style={{ color: announcementTextColor }}
                    >
                        {announcementText}
                    </p>
                </div>

                {/* ═══════════════ NAVIGATION ═══════════════ */}
                <nav className={`z-50 transition-all duration-300 ${
                    store?.header_transparent && !mobileMenuOpen
                        ? 'absolute top-[40px] left-0 right-0 bg-transparent text-white border-b border-white/10 shadow-none' 
                        : 'sticky top-0 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-gray-100 dark:border-zinc-800'
                }`}>
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-[70px] sm:h-[80px]">
                            
                            {/* Right: Nav Links (desktop) */}
                            <div className="hidden md:flex items-center gap-8">
                                <a 
                                    href="#" 
                                    className="text-[15px] font-bold transition-colors" 
                                    style={{ color: store?.header_transparent && !mobileMenuOpen ? '#ffffff' : themeColor }}
                                >
                                    {t("t_772ff2da")}
                                </a>
                                <a 
                                    href="#products" 
                                    className={`text-[15px] font-bold transition-colors ${
                                        store?.header_transparent && !mobileMenuOpen 
                                            ? 'text-white/80 hover:text-white' 
                                            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                                    }`}
                                >{t("t_9b052503")}</a>
                                {store?.phone_number && (
                                    <a 
                                        href={`https://wa.me/${store.phone_number.replace(/[^0-9]/g, '')}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={`text-[15px] font-bold transition-colors ${
                                            store?.header_transparent && !mobileMenuOpen 
                                                ? 'text-white/80 hover:text-white' 
                                                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                                        }`}
                                    >
                                        {t("t_1d7a967b")}
                                    </a>
                                )}
                            </div>

                            {/* Center: Logo & Store Name */}
                            <Link href="/" className="flex items-center gap-3 group absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0">
                                {store?.hide_branding ? (
                                    store?.logo_url ? (
                                        <div className="w-[44px] h-[44px] rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-gray-200 transition-colors shadow-sm">
                                            <img src={store.logo_url} alt={store?.store_name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-white text-lg font-black shadow-md" style={{ background: themeColor }}>
                                            {(store?.store_name || 'M')[0]}
                                        </div>
                                    )
                                ) : (
                                    <img src="/logo.png" alt="SOUQ AI" className={`h-[40px] object-contain ${store?.header_transparent && !mobileMenuOpen ? 'brightness-0 invert' : ''}`} />
                                )}
                                <span className={`text-[18px] sm:text-[20px] font-black tracking-tight hidden sm:block ${
                                    store?.header_transparent && !mobileMenuOpen ? 'text-white' : 'text-gray-900 dark:text-white'
                                }`}>
                                    {store?.store_name || t('t_5b3e9ec0')}
                                </span>
                            </Link>

                            {/* Left: Actions */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setSearchOpen(!searchOpen)} 
                                    className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all ${
                                        store?.header_transparent && !mobileMenuOpen 
                                            ? 'text-white hover:bg-white/10' 
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[22px]">{searchOpen ? 'close' : 'search'}</span>
                                </button>
                                
                                {(!store || store.show_dark_mode_toggle !== false) && (
                                    <ThemeToggle className={`!w-[40px] !h-[40px] !rounded-full !border-none !bg-transparent transition-all ${
                                        store?.header_transparent && !mobileMenuOpen 
                                            ? '!text-white hover:!bg-white/10' 
                                            : '!text-gray-500 hover:!text-gray-800 hover:!bg-gray-100 dark:!text-gray-400 dark:hover:!text-white dark:hover:!bg-zinc-800'
                                    }`} />
                                )}

                                <button 
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                                    className={`md:hidden w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all ${
                                        store?.header_transparent && !mobileMenuOpen 
                                            ? 'text-white hover:bg-white/10' 
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[22px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Search Bar (expandable) */}
                        {searchOpen && (
                            <div className="pb-4">
                                <div className="relative max-w-[500px] mx-auto">
                                    <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                                        {isSemanticSearching ? (
                                            <span className="w-[20px] h-[20px] border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                        ) : isSemanticMode ? (
                                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: themeColor }}>
                                                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                                AI
                                            </span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[20px]">search</span>
                                        )}
                                    </span>
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="w-full h-[46px] pr-12 pl-4 text-[14px] bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-gray-400 transition-all placeholder:text-gray-400"
                                        placeholder={t('t_56e39c79')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Mobile Menu */}
                        {mobileMenuOpen && (
                            <div className="md:hidden pb-5 border-t border-gray-100 pt-4 space-y-1">
                                <a href="#" className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold rounded-xl hover:bg-gray-50 transition-colors" style={{ color: themeColor }}>
                                    <span className="material-symbols-outlined text-[20px]">home</span>
                                    {t("t_772ff2da")}
                                </a>
                                <a href="#products" className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>{t("t_9b052503")}</a>
                                {store?.phone_number && (
                                    <a href={`https://wa.me/${store.phone_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">chat</span>
                                        {t("t_1d7a967b")}
                                    </a>
                                )}
                                {/* Mobile Search */}
                                <div className="px-4 pt-2">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </span>
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-[44px] pr-10 pl-4 text-[13px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-all placeholder:text-gray-400"
                                            placeholder={t('t_56e39c79')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                <main className="flex-grow">
                    {/* ═══════════════ HERO SECTION ═══════════════ */}
                    <section 
                        className="relative w-full overflow-hidden" 
                        style={{ 
                            minHeight: heroImage || heroBackgroundType === 'image' ? '420px' : '380px',
                            background: heroBackgroundType === 'image' && heroImage
                                ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${heroImage}') center/cover`
                                : heroBackgroundType === 'solid'
                                    ? themeColor
                                    : heroGradientPreset === 'purple' ? 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)'
                                    : heroGradientPreset === 'orange' ? 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
                                    : heroGradientPreset === 'green' ? 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)'
                                    : heroGradientPreset === 'gold' ? 'linear-gradient(135deg, #d97706 0%, #78350f 100%)'
                                    : heroGradientPreset === 'dark' ? 'linear-gradient(135deg, #27272a 0%, #09090b 100%)'
                                    : `linear-gradient(135deg, ${themeColor} 0%, #0a3d47 100%)`
                        }}
                    >
                        {/* Background Decoration (Only for non-image backgrounds) */}
                        {heroBackgroundType !== 'image' && (
                            <>
                                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
                                <div className="absolute top-[10%] right-[5%] w-[200px] h-[200px] rounded-full border-2 border-white/10 animate-pulse"></div>
                                <div className="absolute bottom-[15%] left-[10%] w-[150px] h-[150px] rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-[40%] left-[30%] w-[80px] h-[80px] rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '2s' }}></div>
                            </>
                        )}
                        {heroBackgroundType === 'image' && !heroImage && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                        )}

                        {/* Hero Content */}
                        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center" style={{ minHeight: heroImage || heroBackgroundType === 'image' ? '420px' : '380px' }}>
                            <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 w-full py-10 md:py-0">
                                
                                {/* Text Content */}
                                <div className="flex-1 text-center md:text-right">
                                    <h1 className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] font-black text-white leading-[1.2] mb-4 drop-shadow-sm">
                                        {heroTitle || store?.store_name || t('t_5b3e9ec0')}
                                    </h1>
                                    <p className="text-[14px] sm:text-[16px] md:text-[18px] text-white/80 max-w-[480px] leading-[1.7] mx-auto md:mx-0 mb-8 drop-shadow-sm">
                                        {heroSubtitle || store?.description || t('t_ea17738c')}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                        <a 
                                            href="#products" 
                                            style={{ 
                                                background: heroCtaStyle === 'outline' ? 'transparent' : themeColor,
                                                color: '#FFFFFF',
                                                border: heroCtaStyle === 'outline' ? '2.5px solid #FFFFFF' : 'none',
                                                borderRadius: heroCtaStyle === 'pill' ? '9999px' : heroCtaStyle === 'rounded' ? '12px' : '0px'
                                            }}
                                            className="px-8 py-3.5 text-[15px] font-black shadow-lg hover:scale-[1.03] transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                                            {heroCtaText || t('t_df3c581e')}
                                        </a>
                                        {store?.phone_number && (
                                            <a 
                                                href={`https://wa.me/${store.phone_number.replace(/[^0-9]/g, '')}`}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="px-8 py-3.5 bg-white/15 text-white font-bold rounded-full text-[15px] flex items-center gap-2 border border-white/30 hover:bg-white/25 transition-all backdrop-blur-sm"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">chat</span>
                                                {t('t_bc38ada3')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ═══════════════ CATEGORIES ═══════════════ */}
                    {categories.length > 2 && (
                        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-2">
                            <div className="flex items-center gap-3 overflow-x-auto sf-noscroll pb-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`sf-pill ${selectedCategory === cat ? 'active' : ''}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ═══════════════ PRODUCTS GRID ═══════════════ */}
                    <section id="products" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Section Title */}
                        <div className="text-center mb-10">
                            <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-black" style={{ color: themeColor }}>
                                {t('t_1b240e7')}
                            </h2>
                            <p className="text-[13px] sm:text-[14px] text-gray-400 mt-2">{filteredProducts.length} {t('t_169100f6')}</p>
                        </div>

                        {/* Grid */}
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 }
                                }
                            }}
                            className={`grid grid-cols-${productsMobileColumns} md:grid-cols-3 lg:grid-cols-${productsDesktopColumns} gap-4 sm:gap-5 lg:gap-6`}
                        >
                            {filteredProducts.length > 0 ? filteredProducts.map((product, i) => (
                                <motion.div 
                                    key={product.id} 
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } }
                                    }}
                                    className="sf-card"
                                >
                                    {/* Image Container */}
                                    <Link href={`/${product.product_slug}`} className="relative block overflow-hidden bg-white">
                                        <div className="aspect-square">
                                            <img
                                                src={product.image_url || t('t_295c8ae12')}
                                                alt={product.name}
                                                className="sf-card-img w-full h-full object-cover"
                                            />
                                        </div>
                                        {hasDiscount(product) && (
                                            <div className="sf-badge">
                                                -{discountPercent(product)}%
                                            </div>
                                        )}
                                        {product.similarity !== undefined && (
                                            <div className="absolute top-[10px] right-[10px] bg-[#008096]/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-10" style={{ backgroundColor: themeColor }}>
                                                <span className="material-symbols-outlined text-[12px] text-yellow-300">auto_awesome</span>
                                                {Math.round(product.similarity * 100)}% {lang === 'ar' ? 'تطابق' : 'match'}
                                            </div>
                                        )}
                                    </Link>

                                    {/* Card Body */}
                                    <div className="p-3 sm:p-4 flex flex-col flex-1 text-center">
                                        {/* Product Name */}
                                        <Link href={`/${product.product_slug}`}>
                                            <h3 className="text-[13px] sm:text-[15px] font-bold line-clamp-2 leading-snug mb-2 hover:opacity-70 transition-opacity" style={{ color: themeColor }}>
                                                {product.name}
                                            </h3>
                                        </Link>

                                        {/* Category Chip */}
                                        {product.category && (
                                            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 mb-2">
                                                {product.category}
                                            </span>
                                        )}

                                        {/* Spacer */}
                                        <div className="mt-auto"></div>

                                        {/* Inline Rating */}
                                        {store?.show_reviews_homepage !== false && (
                                            <div className="flex items-center justify-center gap-0.5 mt-1">
                                                <span className="sf-star text-amber-400">★</span>
                                                <span className="sf-star text-amber-400">★</span>
                                                <span className="sf-star text-amber-400">★</span>
                                                <span className="sf-star text-amber-400">★</span>
                                                <span className="sf-star text-amber-400">★</span>
                                                <span className="text-[10px] text-gray-400 mr-1 font-bold">(+99)</span>
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="flex flex-col items-center gap-1 mb-3 mt-2">
                                            {hasDiscount(product) && (
                                                <span className="text-[12px] sm:text-[13px] text-red-400 line-through font-semibold">
                                                    {product.compare_at_price} {t('t_17422d')}
                                                </span>
                                            )}
                                            <span className="text-[16px] sm:text-[20px] font-black text-[#2e7d32]">
                                                {product.price} <span className="text-[11px] sm:text-[12px] font-semibold text-gray-400">{t('t_17422d')}</span>
                                            </span>
                                        </div>

                                        {/* Buy Button */}
                                        <Link
                                            href={`/${product.product_slug}`}
                                            className="sf-btn-buy h-[40px] sm:h-[44px] text-[12px] sm:text-[14px]"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>{t("t_d028c48a")}</Link>
                                    </div>
                                </motion.div>
                            )) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4"
                                >
                                    <div className="w-[80px] h-[80px] rounded-full bg-gray-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[40px] text-gray-300">inventory_2</span>
                                    </div>
                                    <h4 className="text-[18px] font-bold text-gray-400">{t('t_1e5ed8d8')}</h4>
                                    <p className="text-[14px] text-gray-400">
                                        {searchQuery ? t('t_45f966ba') : t('t_2ba43da78')}
                                    </p>
                                    {searchQuery && (
                                        <button 
                                            onClick={() => { setSearchQuery(''); setSelectedCategory(t('t_2e4421e')); }} 
                                            className="px-6 py-2.5 text-[14px] font-bold text-white rounded-xl transition-all hover:opacity-90"
                                            style={{ background: themeColor }}
                                        >
                                            {t('t_133f04058')}
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </section>

                    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-10">
                        <div className="w-full overflow-hidden flex justify-center">
                            <img 
                                src={store?.trust_image_url || '/images/trust-banner.jpg'} 
                                alt={t("t_4b02b7d3")} 
                                className="w-full max-w-5xl h-auto object-contain rounded-3xl" 
                            />
                        </div>
                    </section>
                </main>

                {/* ═══════════════ FOOTER ═══════════════ */}
                <footer 
                    className="mt-auto transition-colors duration-300" 
                    style={{ 
                        backgroundColor: store?.footer_bg_color || undefined,
                        backgroundImage: store?.footer_bg_color ? 'none' : undefined,
                        background: !store?.footer_bg_color ? `linear-gradient(180deg, color-mix(in srgb, ${themeColor} 90%, #000) 0%, color-mix(in srgb, ${themeColor} 75%, #000) 100%)` : undefined,
                        color: store?.footer_text_color || '#ffffff',
                        '--footer-text': store?.footer_text_color || '#ffffff'
                    } as React.CSSProperties}
                >
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                        
                        {/* Footer Top: Logo centered */}
                        <div className="flex justify-center pt-10 pb-6 border-b sf-footer-border">
                            <div className="flex flex-col items-center gap-3">
                                {store?.hide_branding ? (
                                    store?.logo_url ? (
                                        <div className="w-[56px] h-[56px] rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg">
                                            <img src={store.logo_url} alt={store?.store_name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-[56px] h-[56px] rounded-full bg-white/10 flex items-center justify-center text-white text-[20px] font-black">
                                            {(store?.store_name || 'M')[0]}
                                        </div>
                                    )
                                ) : (
                                    <img src="/logo.png" alt="SOUQ AI" className="h-[40px] object-contain brightness-0 invert" />
                                )}
                                <span className="text-[18px] font-bold sf-footer-title">{store?.store_name || t('t_5b3e9ec0')}</span>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
                            {/* About */}
                            <div className="text-center sm:text-right">
                                <h4 className="text-[14px] font-bold mb-4 sf-footer-title">{t('t_5042603b')}</h4>
                                <ul className="space-y-2.5 text-[13px] text-white/60">
                                    <li><a href="#" className="sf-footer-link">{t('t_88d00d26')}</a></li>
                                    <li><a href="#products" className="sf-footer-link">{t('t_64fadafd')}</a></li>
                                    <li><a href="#" className="sf-footer-link">{t('t_b606e80')}</a></li>
                                </ul>
                            </div>

                            {/* Policies */}
                            <div className="text-center sm:text-right">
                                <h4 className="text-[14px] font-bold mb-4 sf-footer-title">{t('t_a456dd7a')}</h4>
                                <ul className="space-y-2.5 text-[13px] text-white/60">
                                    <li><a href="#" className="sf-footer-link">{t('t_216c1be4a')}</a></li>
                                    <li><a href="#" className="sf-footer-link">{t('t_113e290f8')}</a></li>
                                    <li><a href="#" className="sf-footer-link">{t('t_4ec5bf24')}</a></li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div className="text-center sm:text-right">
                                <h4 className="text-[14px] font-bold mb-4 sf-footer-title">{t('t_bc38ada3')}</h4>
                                <ul className="space-y-3 text-[13px] text-white/60 animate-scaleIn">
                                    {store?.phone_number && (
                                        <li className="flex items-center gap-2 justify-center sm:justify-start">
                                            <span className="material-symbols-outlined text-[16px] sf-footer-muted">call</span>
                                            <a href={`tel:${store.phone_number}`} className="sf-footer-link" dir="ltr">{store.phone_number}</a>
                                        </li>
                                    )}
                                    {store?.support_email && (
                                        <li className="flex items-center gap-2 justify-center sm:justify-start">
                                            <span className="material-symbols-outlined text-[16px] sf-footer-muted">mail</span>
                                            <a href={`mailto:${store.support_email}`} className="sf-footer-link">{store.support_email}</a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Social Icons */}
                        <div className="flex justify-center gap-3 pb-6">
                            {store?.facebook_url && (
                                <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" className="w-[40px] h-[40px] rounded-full sf-footer-social flex items-center justify-center transition-all">
                                    <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                            )}
                            {store?.instagram_url && (
                                <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="w-[40px] h-[40px] rounded-full sf-footer-social flex items-center justify-center transition-all">
                                    <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468.99c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
                                </a>
                            )}
                            {store?.tiktok_url && (
                                <a href={store.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-[40px] h-[40px] rounded-full sf-footer-social flex items-center justify-center transition-all">
                                    <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.95v7.4c-.01 1.94-.68 3.86-1.93 5.3-1.25 1.45-3 2.39-4.93 2.62-1.92.23-3.89-.13-5.54-1.1-1.64-.96-2.89-2.52-3.41-4.33-.53-1.82-.36-3.81.5-5.5 1.05-2.07 3.02-3.64 5.3-4.14 2.22-.49 4.56-.16 6.55 1.05v4.22c-1.27-.85-2.91-1.09-4.38-.63-1.46.46-2.6 1.62-3.1 3.07-.49 1.46-.32 3.09.47 4.41.8 1.33 2.2 2.25 3.76 2.45 1.55.2 3.14-.23 4.35-1.16 1.21-.93 2.01-2.33 2.23-3.88.22-1.55-.13-3.14-1.02-4.43-.88-1.29-2.22-2.18-3.72-2.45V.02z"/></svg>
                                </a>
                            )}
                        </div>

                        {/* Copyright */}
                        <div className="border-t sf-footer-border py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-[12px] sf-footer-muted">© {new Date().getFullYear()} {store?.store_name || t('t_5b3e9ec0')}{t('t_c7dec240')}</p>
                            {!store?.hide_branding && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] sf-footer-muted font-semibold">Powered by</span>
                                    <img src="/logo_dark.png" alt="SOUQ AI" className="h-[22px] object-contain opacity-60 hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>
                    </div>
                </footer>
                
                {/* Floating WhatsApp Button */}
                {store?.phone_number && store?.checkout_show_whatsapp !== false && (
                    <div className="fixed bottom-6 right-5 z-[9999] group md:bottom-10">
                        {whatsappTooltip && (
                            <div className="absolute right-[68px] top-1/2 -translate-y-1/2 bg-white text-gray-800 text-[12.5px] font-black py-2.5 px-4 rounded-xl shadow-xl border border-gray-100/80 whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                                {whatsappTooltip}
                                <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2 h-2 bg-white border-b border-l border-gray-100/80 rotate-[45deg]"></div>
                            </div>
                        )}
                        <a
                            href={`https://wa.me/213${store.phone_number.replace(/[^0-9]/g, '').replace(/^213|^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-500/40 hover:scale-110 transition-transform ${whatsappPulse ? 'sf-wa-pulse' : ''}`}
                            title={whatsappTooltip}
                        >
                            <svg className="w-8 h-8 text-white relative right-[1px]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </a>
                    </div>
                )}
            </div>
        </>
    );
}
