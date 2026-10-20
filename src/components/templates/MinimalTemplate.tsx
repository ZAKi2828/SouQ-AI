'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function MinimalTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    const descriptionLines = (product?.description || '').split('\n').filter((l: string) => l.trim());
    const hasDiscount = product?.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100) : 0;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                body { font-family: 'Cairo', 'Inter', sans-serif; }
                .line-reveal { position: relative; }
                .line-reveal::after { content: ''; position: absolute; bottom: 0; right: 0; width: 60px; height: 3px; background: #000; }
            `}} />
            <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a] overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* Minimal Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf9]/80 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-[#e5e5e5]/50">
                        {product?.hide_branding ? (
                            product?.logoUrl ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Store'} className="h-8 md:h-10 object-contain" />
                            ) : (
                                <h2 className="text-2xl font-black tracking-tight text-[#1a1a1a]">{product?.storeName}</h2>
                            )
                        ) : (
                            <h2 className="text-2xl font-black tracking-tight text-[#1a1a1a]">SOUQ AI</h2>
                        )}
                        <a href="#checkout-section" className="text-sm font-bold border-b-2 border-[#1a1a1a] pb-0.5 hover:border-[#666] hover:text-[#666] transition-colors">
                            
                            {t('t_c9f1b063')}
                        </a>
                    </div>
                </nav>

                <main className="pt-20">
                    {/* Hero — Full Width Image */}
                    <section className="px-6 py-8 lg:py-16">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col lg:flex-row gap-0 items-stretch">
                                {/* Image - Takes Full Space */}
                                <div className="w-full lg:w-3/5 relative">
                                    <ImageGallery
                                        images={product?.images || []}
                                        mainImage={product?.imageUrl || 'https://placehold.co/800x1000'}
                                        productName={product?.name || 'Product'}
                                        variant="minimal"
                                    />
                                    {hasDiscount && (
                                        <div className="absolute top-6 left-6 bg-[#1a1a1a] text-white font-bold px-4 py-2 text-xs tracking-wider uppercase">
                                            
                                            {t('t_17f95e')} {discountPercent}%
                                        </div>
                                    )}
                                </div>

                                {/* Product Details — Right Side */}
                                <div className="w-full lg:w-2/5 bg-white dark:bg-zinc-900 p-8 lg:p-12 flex flex-col justify-center border-r border-[#e5e5e5]/50">
                                    <div className="space-y-8">
                                        {/* Breadcrumb */}
                                        <div className="flex items-center gap-2 text-xs text-[#999] font-medium tracking-wider uppercase">
                                            <span>{t('t_88d00d26')}</span>
                                            <span>/</span>
                                            <span className="text-[#1a1a1a]">{t('t_252217e0')}</span>
                                        </div>

                                        {/* Title */}
                                        <div className="line-reveal pb-6">
                                            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-[#1a1a1a]">
                                                {product?.name || t('t_2d8944b9')}
                                            </h1>
                                        </div>

                                        {/* Short Description */}
                                        <p className="text-[#888] text-base leading-relaxed font-light">
                                            {descriptionLines[0] || t('t_264bd7a')}
                                        </p>

                                        {/* Price */}
                                        <div className="border-t border-b border-[#e5e5e5] py-6">
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-4xl font-black text-[#1a1a1a]">{product?.price || '0'}</span>
                                                <span className="text-lg font-medium text-[#999]">{t('t_17422d')}</span>
                                                {hasDiscount && (
                                                    <span className="text-base text-[#ccc] line-through mr-2">{product.compareAtPrice}  {t('t_17422d')}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#999] mt-2 tracking-wide">{t('t_174d1a292')}</p>
                                        </div>

                                        <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="minimal" />

                                        {/* CTA */}
                                        <a href="#checkout-section" className="w-full bg-[#1a1a1a] text-white text-base font-bold py-4 flex items-center justify-center gap-3 hover:bg-[#333] transition-all active:scale-[0.98]">
                                            <span>{t('t_3e032e93')}</span>
                                            <span className="text-sm">←</span>
                                        </a>

                                        {/* Minimal Trust */}
                                        <div className="flex items-center gap-6 text-[#aaa] text-xs font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined !text-[16px]">local_shipping</span>
                                                <span>{t('t_b70da944')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined !text-[16px]">payments</span>
                                                <span>{t('t_8c4b14b8')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined !text-[16px]">verified</span>
                                                <span>{t('t_2e23878')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Product Details Accordion Style */}
                    {descriptionLines.length > 1 && (
                        <section className="py-20 px-6 border-t border-[#e5e5e5]">
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#999] mb-10">{t('t_7568c6e1')}</h2>
                                <div className="divide-y divide-[#e5e5e5]">
                                    {descriptionLines.map((line: string, i: number) => (
                                        <div key={i} className="py-6 flex items-start gap-6 group">
                                            <span className="text-[#ccc] text-sm font-mono mt-1">{String(i + 1).padStart(2, '0')}</span>
                                            <p className="text-[#555] text-base leading-relaxed font-medium group-hover:text-[#1a1a1a] transition-colors">{line}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Testimonials — Minimal */}
                    <section className="py-20 px-6 bg-white dark:bg-zinc-900 border-t border-[#e5e5e5]">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#999] mb-10">{t('t_2f0dc8de')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { name: t('t_85e59bb5'), text: t('t_2c8aa185') },
                                    { name: t('t_371057c6'), text: t('t_3c1ac2d4') },
                                    { name: t('t_3de9fd41'), text: t('t_24cc00596') },
                                    { name: t('t_23957851'), text: t('t_1796cd5eb') },
                                ].map((r, i) => (
                                    <div key={i} className="border-r-2 border-[#1a1a1a] pr-6">
                                        <p className="text-[#555] leading-relaxed mb-4 font-light italic">&ldquo;{r.text}&rdquo;</p>
                                        <p className="text-sm font-bold text-[#1a1a1a]">— {r.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Checkout */}
                    <section id="checkout-section" className="py-20 px-6 border-t border-[#e5e5e5] bg-[#fafaf9]">
                        <div className="max-w-xl mx-auto">
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] overflow-hidden">
                                <div className="bg-[#1a1a1a] text-white text-center py-6 px-6">
                                    <h2 className="text-lg font-black tracking-tight">{t('t_10d0aa348')}</h2>
                                    <p className="text-white/50 text-xs mt-1 tracking-wide">{t('t_8998ad1d')}</p>
                                </div>
                                <div className="p-6 lg:p-8">
                                    <StorefrontCheckoutForm product={product} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-[#e5e5e5] py-12 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-[#bbb]">© 2024 SOUQ AI</p>
                        <p className="text-xs text-[#bbb] tracking-wider">{t('t_ce770afc')}</p>
                    </div>
                </footer>

                {/* SOUQ AI Branding */}
                {!product?.hide_branding && (
                    <div style={{position:'fixed',bottom:'14px',left:'50%',transform:'translateX(-50%)',zIndex:9999,display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{fontSize:'10px',color:'#94a3b8',fontWeight:600,textShadow:'0 1px 2px rgba(0,0,0,0.1)'}}>Powered by</span>
                        <img src="/logo_dark.png" alt="SOUQ AI" style={{height:'18px',objectFit:'contain'}} className="hidden dark:block" />
                        <img src="/logo_cropped.png" alt="SOUQ AI" style={{height:'18px',objectFit:'contain'}} className="dark:hidden" />
                    </div>
                )}

                {/* Mobile CTA */}
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-[#e5e5e5] p-4 md:hidden">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#999] uppercase tracking-wider">{t('t_59a3ca6e')}</span>
                            <span className="text-lg font-black">{product?.price || '0'}  {t('t_17422d')}</span>
                        </div>
                        <a href="#checkout-section" className="flex-1 bg-[#1a1a1a] text-white font-bold py-3.5 flex items-center justify-center text-sm">
                            
                            {t('t_c9f1b063')}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
