'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import ImageGallery from '@/components/ImageGallery';
import { useI18n } from "@/context/I18nContext";
import ProductOptionsSelector from '@/components/ProductOptionsSelector';

export default function SimpleTemplate({ product, store }: { product?: any, store?: any }) {
    const { t, lang } = useI18n();

    const themeColor = store?.store_color || '#00a8cc';
    const announcementText = store?.announcement_text || t('t_ad0a6ea6');

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #fafafa;
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
            padding: 8px 0;
            display: flex;
            align-items: center;
        }

        .marquee-content {
            display: inline-block;
            animation: marquee 20s linear infinite;
            padding-left: 100%;
        }

        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(100%); }
        }
        
        html[dir="ltr"] .marquee-content {
            animation: marquee-ltr 20s linear infinite;
        }
        @keyframes marquee-ltr {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
        }

        .shadow-soft {
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
        }

        .simple-nav {
            border-bottom: 2px solid var(--theme-lighter);
        }

        .theme-text { color: var(--theme); }
        .theme-bg { background-color: var(--theme); }
        .theme-bg-light { background-color: var(--theme-light); }
        .theme-bg-lighter { background-color: var(--theme-lighter); }
        .theme-border { border-color: var(--theme); }

        .simple-footer {
            background: color-mix(in srgb, ${themeColor} 95%, #000);
        }
        .simple-footer-border {
            border-top: 6px solid var(--theme);
        }
        .simple-cta-icon {
            background: var(--theme-light);
            color: var(--theme-dark);
        }
    `}} />
            <div className="min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* 1. Announcement Bar (Marquee) - uses store color */}
                <div className="marquee-container text-sm font-bold tracking-wide">
                    <div className="marquee-content inline-flex gap-8">
                        {Array(10).fill(announcementText).map((txt, i) => (
                            <span key={i} className="mx-4">{txt}</span>
                        ))}
                    </div>
                </div>

                {/* 2. Navbar with Store Logo - uses store color border */}
                <nav className="bg-white simple-nav sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {product?.hide_branding && product?.logoUrl ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Store Logo'} className="h-10 md:h-12 object-contain" />
                            ) : product?.hide_branding ? (
                                <h1 className="text-2xl font-black tracking-tight text-gray-900">{product?.storeName}</h1>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-black tracking-tight text-gray-900">SOUQ <span className="theme-text">AI</span></h1>
                                </div>
                            )}
                        </div>
                        
                        <div className="hidden md:flex items-center gap-6">
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <span className="material-symbols-outlined theme-text text-lg">verified</span>
                                {t("secure_shopping_100")}
                            </span>
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <span className="material-symbols-outlined theme-text text-lg">local_shipping</span>
                                {t("t_b70da944")}
                            </span>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
                        <span>{t("t_772ff2da")}</span>
                        <span className="material-symbols-outlined text-xs">arrow_back_ios_new</span>
                        <span className="text-gray-900 font-medium">{product?.name || t("t_252217e0")}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        {/* Right Column: Product Image & Details */}
                        <div className="flex flex-col gap-6 lg:sticky lg:top-28">
                            
                            {/* Product Title and Price for Mobile */}
                            <div className="lg:hidden flex flex-col gap-2">
                                <h1 className="text-3xl font-black text-gray-900 leading-tight border-b pb-4 mb-2">
                                    {product?.name || t('t_5fa01adf')}
                                </h1>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-black theme-text">{product?.price || '99.00'} <span className="text-xl font-bold text-gray-600">{t('t_17422d')}</span></span>
                                    {product?.compareAtPrice && (
                                        <span className="text-lg text-gray-400 line-through">{product.compareAtPrice} {t('t_17422d')}</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Image Gallery */}
                            <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-soft border border-gray-100">
                                <ImageGallery
                                    images={product?.images || []}
                                    mainImage={product?.imageUrl || 'https://placehold.co/800x800'}
                                    productName={product?.name || 'Product'}
                                    variant="minimal"
                                />
                            </div>

                            {/* Product Description */}
                            <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 mt-2">
                                <h1 className="hidden lg:block text-3xl font-black text-gray-900 leading-tight mb-4 border-b pb-4">
                                    {product?.name || t('t_5fa01adf')}
                                </h1>
                                
                                <div className="hidden lg:flex flex-col gap-1 mb-6">
                                    <span className="text-sm text-gray-500 font-medium">{t("t_59a3ca6e")}</span>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black theme-text">{product?.price || '99.00'} <span className="text-xl font-bold text-gray-600">{t('t_17422d')}</span></span>
                                        {product?.compareAtPrice && (
                                            <span className="text-lg text-gray-400 line-through">{product.compareAtPrice} {t('t_17422d')}</span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined theme-text">info</span>
                                    {t("t_7568c6e1")}
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {product?.description || t('t_cc7d27cf')}
                                </p>

                                <div className="mt-8">
                                    <ProductOptionsSelector options={product?.options} variant="minimal" />
                                </div>
                            </div>
                        </div>

                        {/* Left Column: Checkout Form */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 simple-cta-icon rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">shopping_cart_checkout</span>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">{t("t_65b483ce")}</h2>
                                <p className="text-gray-500 text-sm">{t("t_5c8a3fb8")}</p>
                            </div>
                            
                            <div className="w-full">
                                <StorefrontCheckoutForm product={product} />
                            </div>
                            
                            <div className="w-full mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined theme-text text-lg">payments</span>
                                <span className="font-bold text-gray-500 text-sm">{t("t_52243fb5")}</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Big Info Footer - uses store color */}
                <footer className="simple-footer simple-footer-border text-white mt-20 pt-16 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        
                        {/* Store Info */}
                        <div>
                            {product?.hide_branding ? (
                                <div className="flex flex-col gap-3 mb-4">
                                    {product?.logoUrl && (
                                        <img src={product.logoUrl} alt={product?.storeName || 'Store'} className="h-14 md:h-16 object-contain rounded-lg" />
                                    )}
                                    <h2 className="text-2xl font-black">{product?.storeName}</h2>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 mb-4">
                                    <img src="/logo_dark.png" alt="SOUQ AI" className="h-10 md:h-12 object-contain" />
                                    <h2 className="text-2xl font-black">SOUQ <span style={{ color: 'var(--theme-light)' }}>AI</span></h2>
                                </div>
                            )}
                             <p className="text-white/60 text-sm leading-relaxed mb-6">
                                {t("simple_template_footer_desc")}
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">call</span>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                                </a>
                            </div>
                        </div>

                        {/* Customer Service */}
                        <div>
                            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2">{t("t_a456dd7a")}</h3>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">chevron_left</span>{t("t_1ae45109")}</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">chevron_left</span> {t("t_55e1133c")}</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">chevron_left</span>{t("t_84c239f5")}</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">chevron_left</span> {t("t_1d7a967b")}</a></li>
                            </ul>
                        </div>

                        {/* Guarantees */}
                        <div>
                            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2">{t("t_b2ea3dd2")}</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined mt-1" style={{ color: 'var(--theme-light)' }}>verified_user</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-white/90">{t("t_c8270f81")}</h4>
                                        <p className="text-xs text-white/40 mt-1">{t("t_d4c0b3e1")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined mt-1" style={{ color: 'var(--theme-light)' }}>local_shipping</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-white/90">{t("t_9af41cbc")}</h4>
                                        <p className="text-xs text-white/40 mt-1">{t("t_93965dd")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/40 text-sm">
                            © {new Date().getFullYear()} {product?.hide_branding ? (product?.storeName || 'Store') : 'SOUQ AI'}. {t("جميع الحقوق محفوظة")}
                        </p>
                    </div>
                </footer>

                {/* SOUQ AI Branding for free plans */}
                {!product?.hide_branding && (
                    <div style={{position:'fixed',bottom:'14px',left:'50%',transform:'translateX(-50%)',zIndex:9999,display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{fontSize:'10px',color:'#94a3b8',fontWeight:600,textShadow:'0 1px 2px rgba(0,0,0,0.1)'}}>Powered by</span>
                        <img src="/logo_dark.png" alt="SOUQ AI" style={{height:'18px',objectFit:'contain'}} className="hidden dark:block" />
                        <img src="/logo_cropped.png" alt="SOUQ AI" style={{height:'18px',objectFit:'contain'}} className="dark:hidden" />
                    </div>
                )}

            </div>
        </>
    );
}
