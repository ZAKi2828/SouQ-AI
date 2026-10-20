'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function ClassicTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    const descriptionLines = (product?.description || '').split('\n').filter((l: string) => l.trim());
    const hasDiscount = product?.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100) : 0;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                body { font-family: 'Cairo', sans-serif; }
                .hero-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .float-animation { animation: float 6s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
                @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}} />
            <div className="min-h-screen bg-white dark:bg-zinc-900 text-slate-900 dark:text-white overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* Sticky Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800 shadow-sm ">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        {product?.hide_branding ? (
                            product?.logoUrl ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Store'} className="h-8 md:h-10 object-contain" />
                            ) : (
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{product?.storeName}</h2>
                            )
                        ) : (
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">SOUQ AI</h2>
                        )}
                        <a href="#checkout-section" className="bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20">
                            <span>{t('t_3e032e93')}</span>
                            <span className="material-symbols-outlined !text-[18px]">shopping_cart</span>
                        </a>
                    </div>
                </nav>

                <main className="pt-16">
                    {/* Hero Section */}
                    <section className="py-12 lg:py-20 px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                                {/* Product Image */}
                                <div className="w-full lg:w-1/2 relative">
                                    <ImageGallery
                                        images={product?.images || []}
                                        mainImage={product?.imageUrl || 'https://placehold.co/800x800'}
                                        productName={product?.name || 'Product'}
                                        variant="light"
                                    />
                                    {hasDiscount && (
                                        <div className="absolute top-6 right-6 bg-red-500 text-white font-black px-4 py-2 rounded-2xl text-sm shadow-lg shadow-red-500/30 flex items-center gap-1.5">
                                            <span>��</span>
                                            <span>{t('t_17f95e')} {discountPercent}%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full w-fit text-sm font-bold">
                                        <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot"></span>
                                        
                                        {t('t_15848f8b8')}
                                    </div>
                                    
                                    <h1 className="text-3xl lg:text-5xl font-black leading-tight text-slate-900 dark:text-white">
                                        {product?.name || t('t_2d8944b9')}
                                    </h1>

                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                        {descriptionLines[0] || t('t_1016feb2e')}
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('t_15bdc29a2')}</span>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-4xl font-black text-slate-900 dark:text-white">{product?.price || '0'}</span>
                                                <span className="text-xl font-bold text-slate-400">{t('t_17422d')}</span>
                                                {hasDiscount && (
                                                    <span className="text-lg text-red-400 line-through font-bold">{product.compareAtPrice}  {t('t_17422d')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="classic" />

                                    {/* CTA */}
                                    <a href="#checkout-section" className="w-full bg-slate-900 text-white text-lg font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0">
                                        <span className="material-symbols-outlined">shopping_cart</span>
                                        <span>{t('t_1f5d00c14')}</span>
                                    </a>

                                    {/* Trust */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-blue-600">local_shipping</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('t_b70da944')}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-green-600">payments</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('t_8c4b14b8')}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-purple-600">verified</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('t_1f8ee0bf')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features / Description */}
                    {descriptionLines.length > 1 && (
                        <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-zinc-800">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-2xl lg:text-3xl font-black text-center mb-10">{t('t_be787486')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {descriptionLines.map((line: string, i: number) => (
                                        <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-start gap-4 shadow-sm  hover:shadow-md transition-shadow">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-lg">
                                                {i + 1}
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-1.5">{line}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Reviews */}
                    <section className="py-16 px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{t('t_7775366f')}</h2>
                                <p className="text-slate-400 mt-2">{t('t_2a7287595')}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { name: t('t_85e59bb5'), city: t('t_14062ecbd'), text: t('t_1563ad951') },
                                    { name: t('t_371057c6'), city: t('t_5b762591'), text: t('t_1a67ec66f') },
                                    { name: t('t_3de9fd41'), city: t('t_7d33f75'), text: t('t_175440dee') },
                                ].map((review, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
                                        <div className="flex gap-0.5 text-amber-400">
                                            {'★★★★★'.split('').map((s, j) => <span key={j} className="text-lg">{s}</span>)}
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">&ldquo;{review.text}&rdquo;</p>
                                        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-zinc-800">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{review.name}</p>
                                            <p className="text-xs text-slate-400">{review.city}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Checkout */}
                    <section id="checkout-section" className="py-16 px-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-zinc-800">
                        <div className="max-w-xl mx-auto">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                                <div className="bg-slate-900 text-white text-center py-5 px-6">
                                    <h2 className="text-xl font-black flex items-center justify-center gap-2">
                                        <span>��</span>  {t('t_1f5d00c14')}
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">{t('t_2066a33f1')}</p>
                                </div>
                                <div className="p-6">
                                    <StorefrontCheckoutForm product={product} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-slate-900 text-white py-10 px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        <p className="text-slate-400 text-sm">{t('t_5a3d6ac1')}</p>
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

                {/* Mobile Sticky CTA */}
                <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-5 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none md:hidden">
                    <div className="max-w-md mx-auto w-full pointer-events-auto flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400">{t('t_59a3ca6e')}</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white">{product?.price || '0'}  {t('t_17422d')}</span>
                        </div>
                        <a href="#checkout-section" className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined !text-[18px]">shopping_cart</span>
                            <span>{t('t_3e032e93')}</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
