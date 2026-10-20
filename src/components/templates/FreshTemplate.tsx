'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function FreshTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    const descriptionLines = (product?.description || '').split('\n').filter((l: string) => l.trim());
    const hasDiscount = product?.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100) : 0;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                body { font-family: 'Cairo', sans-serif; }
                .fresh-gradient { background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 50%, #faf5ff 100%); }
                .fresh-card { background: white; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
                .bounce-in { animation: bounceIn 0.6s ease-out; }
                @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
            `}} />
            <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-[#f0f9ff] to-[#faf5ff] text-slate-800 dark:text-slate-100 overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100 dark:border-zinc-800/50">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        {product?.hide_branding ? (
                            product?.logoUrl ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Store'} className="h-8 md:h-10 object-contain" />
                            ) : (
                                <h2 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{product?.storeName}</h2>
                            )
                        ) : (
                            <h2 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">SOUQ AI</h2>
                        )}
                        <a href="#checkout-section" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2">
                            <span>{t('t_3e032e93')}</span>
                            <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
                        </a>
                    </div>
                </nav>

                <main className="pt-16">
                    {/* Hero */}
                    <section className="py-10 lg:py-20 px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                                {/* Image */}
                                <div className="w-full lg:w-1/2 relative bounce-in">
                                    <div className="fresh-card p-3 overflow-hidden">
                                        <ImageGallery
                                            images={product?.images || []}
                                            mainImage={product?.imageUrl || 'https://placehold.co/800x800'}
                                            productName={product?.name || 'Product'}
                                            variant="light"
                                        />
                                    </div>
                                    {hasDiscount && (
                                        <div className="absolute top-6 right-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black px-4 py-2 rounded-2xl text-sm shadow-lg z-20 flex items-center gap-1.5">
                                            <span>��</span>  {t('t_17f95e')} {discountPercent}%
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full w-fit text-sm font-bold border border-emerald-100">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        
                                        {t('t_c4e0436e')}
                                    </div>
                                    
                                    <h1 className="text-3xl lg:text-5xl font-black leading-tight text-slate-900 dark:text-white">
                                        {product?.name || t('t_2d8944b9')}
                                    </h1>

                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                        {descriptionLines[0] || t('t_1ce1c3e53')}
                                    </p>

                                    {/* Price Card */}
                                    <div className="fresh-card p-6 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('t_15bdc29a2')}</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-slate-900 dark:text-white">{product?.price || '0'}</span>
                                                <span className="text-lg font-bold text-slate-400">{t('t_17422d')}</span>
                                                {hasDiscount && (
                                                    <span className="text-base text-rose-400 line-through">{product.compareAtPrice}  {t('t_17422d')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="fresh" />

                                    {/* CTA */}
                                    <a href="#checkout-section" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3">
                                        <span className="material-symbols-outlined">shopping_cart</span>
                                        
                                        {t('t_1f5d00c14')}
                                    </a>

                                    {/* Trust Badges */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { icon: 'local_shipping', label: t('t_b70da944'), emoji: '��' },
                                            { icon: 'payments', label: t('t_8c4b14b8'), emoji: '��' },
                                            { icon: 'verified', label: t('t_205d332b'), emoji: '✅' },
                                        ].map((item, i) => (
                                            <div key={i} className="fresh-card p-3 text-center">
                                                <span className="text-2xl block mb-1">{item.emoji}</span>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    {descriptionLines.length > 1 && (
                        <section className="py-16 px-4">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-3xl font-black text-center mb-10 text-slate-900 dark:text-white">{t('t_f53229d3')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {descriptionLines.map((line: string, i: number) => (
                                        <div key={i} className="fresh-card p-5 flex items-center gap-4 hover:scale-[1.01] transition-transform">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-md">
                                                ✓
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium">{line}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Reviews */}
                    <section className="py-16 px-4">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-black text-center mb-10 text-slate-900 dark:text-white">{t('t_11c34d555')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {[
                                    { name: t('t_27b072e'), city: t('t_7f75b30f'), text: t('t_f4f8caf1') },
                                    { name: t('t_103bc869'), city: t('t_5b762591'), text: t('t_c3dd9760') },
                                    { name: t('t_67cf3dd'), city: t('t_7d33f75'), text: t('t_11ae39451') },
                                ].map((r, i) => (
                                    <div key={i} className="fresh-card p-6 flex flex-col gap-3">
                                        <div className="flex gap-0.5 text-amber-400 text-lg">★★★★★</div>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-zinc-800">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{r.name}</p>
                                            <p className="text-xs text-slate-400">{r.city}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Checkout */}
                    <section id="checkout-section" className="py-16 px-4">
                        <div className="max-w-xl mx-auto">
                            <div className="fresh-card overflow-hidden border border-slate-100 dark:border-zinc-800">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-5 px-6">
                                    <h2 className="text-xl font-black flex items-center justify-center gap-2">
                                        <span>��</span>  {t('t_e6fc0de5')}
                                    </h2>
                                    <p className="text-emerald-100 text-sm mt-1">{t('t_1540cf15a')}</p>
                                </div>
                                <div className="p-6">
                                    <StorefrontCheckoutForm product={product} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 py-10 px-4 text-center">
                    <p className="text-slate-400 text-sm">{t('t_5a3d6ac1')}</p>
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
                <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-5 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none md:hidden">
                    <div className="max-w-md mx-auto w-full pointer-events-auto flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400">{t('t_59a3ca6e')}</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white">{product?.price || '0'}  {t('t_17422d')}</span>
                        </div>
                        <a href="#checkout-section" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2">
                            <span>��</span>  {t('t_3e032e93')}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
