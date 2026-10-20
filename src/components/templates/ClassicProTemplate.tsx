'use client';

import React, { useState, useEffect } from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import ImageGallery from '@/components/ImageGallery';
import { useI18n } from "@/context/I18nContext";
import { useProductOptions } from '@/components/ProductOptionsProvider';

export default function ClassicProTemplate({ product, store }: { product?: any, store?: any }) {
    const { t, lang } = useI18n();
    const { selectedOptions, setSelectedOptions } = useProductOptions();

    const themeColor = store?.store_color || '#f27c1c';
    const announcementText = store?.announcement_text || 'عروض حصرية في متجرنا، الدفع عند الاستلام، اسرع واطلب الآن! 🚀';

    // Helper for fake reviews rating stars
    const rating = 5.0;
    const reviewsCount = 5;

    // Handle accordion toggle for order summary
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // Initial selected options
    useEffect(() => {
        if (product?.options && Array.isArray(product.options) && product.options.length > 0) {
            const initial: Record<string, string> = {};
            product.options.forEach((opt: any) => {
                if (opt.name && opt.values && opt.values.length > 0) {
                    initial[opt.name] = opt.values[0];
                }
            });
            setSelectedOptions(initial);
        }
    }, [product, setSelectedOptions]);

    const handleOptionSelect = (optionName: string, value: string) => {
        setSelectedOptions((prev: any) => ({
            ...prev,
            [optionName]: value
        }));
    };

    const isColorOption = (name: string) => {
        const lower = name.toLowerCase();
        return lower.includes('اللون') || lower.includes('color') || lower.includes('couleur');
    };

    const getColorHex = (colorName: string) => {
        const lower = colorName.toLowerCase().trim();
        if (lower.includes('noir') || lower.includes('أسود') || lower.includes('black')) return '#010101';
        if (lower.includes('beige') || lower.includes('بيج')) return '#f7eccf';
        if (lower.includes('gris') || lower.includes('رمادي') || lower.includes('grey') || lower.includes('gray')) return '#d4d4d4';
        if (lower.includes('vert') || lower.includes('أخضر') || lower.includes('green')) return '#264d00';
        if (lower.includes('rouge') || lower.includes('أحمر') || lower.includes('red')) return '#dc2626';
        if (lower.includes('bleu') || lower.includes('أزرق') || lower.includes('blue')) return '#2563eb';
        if (lower.includes('blanc') || lower.includes('أبيض') || lower.includes('white')) return '#ffffff';
        // default fallback to slate-300
        return '#cbd5e1';
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;700;800;900&display=swap');
                
                body {
                    font-family: 'Cairo', sans-serif;
                    background-color: #FAF9F6;
                    color: #111827;
                }

                :root {
                    --theme: ${themeColor};
                    --theme-dark: color-mix(in srgb, ${themeColor} 85%, #000);
                    --theme-light: color-mix(in srgb, ${themeColor} 15%, #fff);
                    --theme-lighter: color-mix(in srgb, ${themeColor} 8%, #fff);
                }

                .marquee-container {
                    width: 100%;
                    overflow: hidden;
                    background: var(--theme);
                    color: white;
                    white-space: nowrap;
                    padding: 10px 0;
                    display: flex;
                    align-items: center;
                }

                .marquee-content {
                    display: inline-block;
                    animation: marquee 25s linear infinite;
                    padding-left: 100%;
                }

                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
                
                html[dir="ltr"] .marquee-content {
                    animation: marquee-ltr 25s linear infinite;
                }
                @keyframes marquee-ltr {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }

                .shadow-soft {
                    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 15px -3px rgba(0, 0, 0, 0.02);
                }

                .pulsing-btn {
                    animation: pulse-glow 2s infinite;
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(242, 124, 28, 0.4), 0 4px 15px rgba(0,0,0,0.15);
                    }
                    50% {
                        box-shadow: 0 0 35px rgba(242, 124, 28, 0.7), 0 6px 20px rgba(0,0,0,0.25);
                    }
                }
            `}} />
            <div className="min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* 1. Top Announcement Bar */}
                <div className="marquee-container text-sm sm:text-base font-bold">
                    <div className="marquee-content inline-flex gap-8">
                        {Array(8).fill(announcementText).map((txt, i) => (
                            <span key={i} className="mx-4">{txt}</span>
                        ))}
                    </div>
                </div>

                {/* 2. Classic Header */}
                <header className="bg-white border-b border-[#e5dce3] sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="text-gray-700 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 md:hidden">
                                <span className="material-symbols-outlined text-[24px]">menu</span>
                            </button>
                            {product?.hide_branding && product?.logoUrl ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Logo'} className="h-10 md:h-12 object-contain" />
                            ) : product?.hide_branding ? (
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {product?.storeName}
                                </h1>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-black tracking-tight text-gray-900">SOUQ <span className="text-[#f27c1c]">AI</span></h1>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <a href="#checkout-form-container" className="flex items-center gap-2 py-2 px-4 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-sm font-bold text-gray-800">{t("السلة")}</span>
                                <span className="material-symbols-outlined text-[20px] text-gray-800">shopping_cart</span>
                            </a>
                        </div>
                    </div>
                </header>

                {/* 3. Hero Section (Split View) */}
                <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        
                        {/* Right Column: Image Gallery (Desktop: 7 cols) */}
                        <div className="lg:col-span-7 flex flex-col gap-6 lg:sticky lg:top-28">
                            <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-soft border border-gray-100/50">
                                <ImageGallery
                                    images={product?.images || []}
                                    mainImage={product?.imageUrl || 'https://placehold.co/800x800'}
                                    productName={product?.name || 'Product'}
                                    variant="minimal"
                                />
                            </div>
                        </div>

                        {/* Left Column: Product Info & Direct Form (Desktop: 5 cols) */}
                        <div className="lg:col-span-5 flex flex-col gap-6" id="checkout-form-container">
                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border-2 border-slate-900/10 flex flex-col gap-5">
                                
                                {/* Product Title */}
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider">
                                            PROMOTION/تخفيضات
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                                        {product?.name}
                                    </h1>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-1.5 -mt-2">
                                    <div className="flex text-amber-400">
                                        {'★★★★★'.split('').map((char, index) => (
                                            <span key={index} className="text-[16px]">{char}</span>
                                        ))}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500">
                                        ({rating.toFixed(1)}) • {reviewsCount} {t("مراجعات")}
                                    </span>
                                </div>

                                {/* Description Subtitle */}
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                                    {product?.description?.split('\n')[0]}
                                </p>

                                {/* Pricing Box */}
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <span className="text-sm font-bold text-slate-400">{t("سعر المنتج")}:</span>
                                    <div className="flex items-center gap-3" dir="rtl">
                                        <div className="flex items-center text-primary font-black text-2xl sm:text-3xl" style={{ color: themeColor }}>
                                            <span>{product?.price}</span>
                                            <span className="text-sm font-bold mr-1">{t("دج")}</span>
                                        </div>
                                        {product?.compareAtPrice && (
                                            <div className="flex items-center text-slate-400 line-through text-sm sm:text-base">
                                                <span>{product.compareAtPrice}</span>
                                                <span className="text-xs mr-0.5">{t("دج")}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Product Options Selectors */}
                                {product?.options && Array.isArray(product.options) && product.options.map((opt: any) => (
                                    <div key={opt.name} className="flex flex-col gap-2.5">
                                        <label className="text-sm font-bold text-slate-800">{opt.name}</label>
                                        
                                        {isColorOption(opt.name) ? (
                                            // Circular swatch style for colors
                                            <div className="flex flex-wrap gap-3">
                                                {opt.values && opt.values.map((val: string) => {
                                                    const isSelected = selectedOptions[opt.name] === val;
                                                    const hex = getColorHex(val);
                                                    return (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => handleOptionSelect(opt.name, val)}
                                                            className={`group relative flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all ${
                                                                isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <div 
                                                                className={`w-12 h-8 rounded-xl border-2 shadow-sm transition-transform duration-200 ${
                                                                    isSelected ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-slate-200 hover:scale-105'
                                                                }`} 
                                                                style={{ backgroundColor: hex, borderColor: isSelected ? themeColor : '#e2e8f0' }}
                                                            />
                                                            <span className="text-[10px] font-bold text-slate-700">{val}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            // Regular tag style for sizes / other options
                                            <div className="flex flex-wrap gap-2.5">
                                                {opt.values && opt.values.map((val: string) => {
                                                    const isSelected = selectedOptions[opt.name] === val;
                                                    return (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => handleOptionSelect(opt.name, val)}
                                                            className={`px-4 py-2 text-sm font-black rounded-xl border-2 transition-all shadow-sm ${
                                                                isSelected 
                                                                    ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-md' 
                                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            {val}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Order Form */}
                                <div className="border-t border-slate-100 pt-5">
                                    <StorefrontCheckoutForm product={product} />
                                </div>

                                {/* Order Summary Accordion */}
                                <div className="border-t border-slate-100 pt-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                                        className="w-full flex items-center justify-between text-slate-800 font-bold py-2 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="material-symbols-outlined text-slate-500">list_alt</span>
                                            <span className="text-sm">{t("ملخص الطلبية")}</span>
                                        </div>
                                        <span className={`material-symbols-outlined transition-transform duration-300 ${isSummaryOpen ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </button>
                                    
                                    {isSummaryOpen && (
                                        <div className="mt-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3 text-sm font-medium animate-fadeIn">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">{product?.name}</span>
                                                <span className="font-bold text-slate-900">{product?.price} {t("دج")}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-slate-200/60 pt-2">
                                                <span className="text-slate-500">{t("التوصيل")}</span>
                                                <span className="font-bold text-emerald-600">{t("مجاني")}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-base">
                                                <span className="text-slate-900">{t("المجموع")}</span>
                                                <span style={{ color: themeColor }}>{product?.price} {t("دج")}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* 4. Product Details / Long Description (Below the fold) */}
                    <div className="max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-200/60">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                                {t("تفاصيل المنتج")}
                            </h2>
                            <div className="w-16 h-1 bg-primary mx-auto mt-3 rounded-full" style={{ backgroundColor: themeColor }}></div>
                        </div>

                        {/* Rich Text / Description Area */}
                        <div 
                            className="prose prose-slate max-w-none text-slate-800 font-medium leading-relaxed text-center flex flex-col gap-6"
                            dangerouslySetInnerHTML={{ __html: product?.description?.replace(/\n/g, '<br/>') || '' }}
                        />
                    </div>
                </main>

                {/* 5. Responsive Dark Footer */}
                <footer className="bg-slate-900 text-white mt-20 pt-12 pb-6 border-t-[6px]" style={{ borderTopColor: themeColor }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
                        {/* Footer Logo */}
                        {product?.hide_branding ? (
                            <div className="flex flex-col items-center gap-3">
                                {product?.logoUrl && (
                                    <img src={product.logoUrl} alt={product?.storeName || 'Store'} className="h-14 md:h-16 object-contain rounded-lg" />
                                )}
                                <h2 className="text-2xl font-black">{product?.storeName || 'Store'}</h2>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <img src="/logo_dark.png" alt="SOUQ AI" className="h-10 md:h-12 object-contain" />
                                <h2 className="text-2xl font-black">SOUQ <span style={{ color: themeColor }}>AI</span></h2>
                            </div>
                        )}
                        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                            متجركم الموثوق لتقديم أفضل المنتجات بأعلى جودة وأفضل الأسعار، الدفع دائماً بعد استلام المنتج ومعاينته.
                        </p>
                        <div className="w-full h-px bg-slate-800 my-2"></div>
                        <p className="text-slate-500 text-xs">
                            © {new Date().getFullYear()} {product?.hide_branding ? (product?.storeName || 'Store') : 'SOUQ AI'}. {t("جميع الحقوق محفوظة")}
                        </p>
                    </div>
                </footer>

                {/* 6. Sticky Mobile CTA (Footer CTA) */}
                <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur border-t border-slate-100 pointer-events-none md:hidden flex justify-between items-center gap-4">
                    <div className="pointer-events-auto flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400">{t("السعر الإجمالي")}</span>
                        <span className="text-xl font-black text-slate-900">{product?.price} {t("دج")}</span>
                    </div>
                    <a 
                        href="#checkout-form-container" 
                        className="pointer-events-auto flex-grow max-w-[70%] text-center text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-transform duration-200 active:scale-95 flex items-center justify-center gap-2 pulsing-btn"
                        style={{ backgroundColor: themeColor }}
                    >
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                        <span>{t("اطلب الآن")}</span>
                    </a>
                </div>

                {/* SOUQ AI Branding */}
                {!product?.hide_branding && (
                    <div style={{ position: 'fixed', bottom: '80px', left: '20px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>Powered by</span>
                        <img src="/logo_cropped.png" alt="SOUQ AI" style={{ height: '14px', objectFit: 'contain' }} />
                    </div>
                )}
            </div>
        </>
    );
}
