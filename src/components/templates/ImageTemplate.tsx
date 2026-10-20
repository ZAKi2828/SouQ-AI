'use client';
import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

interface Product {
    id?: number | string;
    user_id?: string;
    name: string;
    description: string;
    price: string | number;
    compareAtPrice?: string | number;
    imageUrl: string;
    options?: any[];
    hide_branding?: boolean;
}

export default function ImageTemplate({ product }: { product: Product }) {
    const { t, lang } = useI18n();
    const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount
        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-cairo flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <main className="flex-1 w-full max-w-md mx-auto bg-white dark:bg-zinc-900 shadow-2xl relative pb-28">
                
                {/* 1. Full Width Image — This IS the landing page */}
                <div className="w-full relative bg-white dark:bg-zinc-900">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-auto block"
                        style={{ imageRendering: 'auto', maxWidth: '100%' }}
                        loading="eager"
                        decoding="sync"
                    />
                    {/* Floating Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white font-black px-4 py-2 rounded-2xl text-base shadow-lg z-20 flex items-center gap-1.5">
                            <span className="text-xl">��</span>
                            <span>{t('t_17f95e')} {discountPercent}%</span>
                        </div>
                    )}
                </div>

                {/* 2. Product Name & Price — Clean and Professional */}
                <div className="px-5 pt-6 pb-4">
                    {/* Product Name */}
                    <h1 className="text-2xl font-black text-[#111827] dark:text-white leading-snug mb-5">
                        {product.name}
                    </h1>

                    {/* Price Display */}
                    <div className="flex items-center gap-3 bg-gradient-to-l from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                        <div className="bg-green-500 text-white p-2.5 rounded-xl shadow-md shadow-green-500/20 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black text-green-700 uppercase tracking-widest mb-0.5">{t('t_59a3ca6e')}</p>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-3xl font-black text-green-600">{product.price}</span>
                                <span className="text-lg font-bold text-green-600/80">{t('t_17422d')}</span>
                                {hasDiscount && (
                                    <span className="text-base font-bold text-slate-400 line-through mr-1">
                                        {product.compareAtPrice}  {t('t_17422d')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trust Signal */}
                    <div className="flex items-center justify-center gap-6 mt-5 py-3 border-t border-b border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            <span className="text-xs font-bold">{t('t_addbc04b')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            <span className="text-xs font-bold">{t('t_b70da944')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            <span className="text-xs font-bold">{t('t_205d332b')}</span>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product.options || []} variant="form" />
                </div>

                {/* 3. Checkout Form */}
                <div id="checkout-target" className="px-5 pb-10">
                    <div className="bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-l from-slate-50 to-white py-5 px-6 border-b border-slate-100 dark:border-zinc-800 text-center">
                            <h2 className="text-xl font-black text-[#111827] dark:text-white flex items-center justify-center gap-2">
                                <span>��</span>
                                
                                {t('t_b9e01736')}
                            </h2>
                            <p className="text-slate-400 text-xs font-bold mt-1">
                                
                                {t('t_2066a33f1')}
                            </p>
                        </div>
                        <div className="p-5">
                            <StorefrontCheckoutForm product={product} />
                        </div>
                    </div>
                </div>

            </main>

            {/* 4. Fixed Sticky CTA for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-5 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none md:hidden">
                <div className="max-w-md mx-auto w-full pointer-events-auto">
                    <button
                        onClick={() => {
                            document.getElementById('checkout-target')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full bg-gradient-to-l from-[#E91E63] to-[#C2185B] text-white font-black text-lg py-4 rounded-2xl shadow-[0_8px_25px_rgba(233,30,99,0.35)] hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                    >
                        <span>��</span>
                        
                        {t('t_3e032e93')}
                        <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-lg">{product.price}  {t('t_17422d')}</span>
                    </button>
                </div>
            </div>

                {/* SOUQ AI Branding */}
                {!product?.hide_branding && (
                    <div style={{position:'fixed',bottom:'14px',left:'50%',transform:'translateX(-50%)',zIndex:9999,display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{fontSize:'10px',color:'#94a3b8',fontWeight:600,textShadow:'0 1px 2px rgba(0,0,0,0.1)'}}>Powered by</span>
                        <img src="/logo_dark.png" alt="SOUQ AI" style={{height:'18px',objectFit:'contain'}} className="hidden dark:block" />
                        <img src="/logo_cropped.png" alt="SOUQ AI" style={{height:'18px',objectFit:'contain'}} className="dark:hidden" />
                    </div>
                )}
        </div>
    );
}
