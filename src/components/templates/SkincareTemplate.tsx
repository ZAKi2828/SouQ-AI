'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function SkincareTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
        
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #fdfbf7;
        }
        .font-elegant {
            font-family: 'Playfair Display', serif;
        }
        .soft-shadow {
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        .skincare-bg {
            background-image: 
            radial-gradient(circle at 15% 50%, rgba(244, 233, 226, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(243, 232, 235, 0.6) 0%, transparent 50%);
        }
    `}} />
            <div className="min-h-screen text-slate-800 dark:text-slate-100 overflow-x-hidden selection:bg-rose-200 selection:text-rose-900 skincare-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

                {/* Navbar */}
                <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-lg border-b border-rose-100/30">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-rose-400 text-3xl">spa</span>
                            <h2 className="font-elegant text-2xl font-bold tracking-wide text-rose-900 border-b-2 border-rose-300 pb-1">{t('t_2f24e96')}</h2>
                        </div>
                        <div className="hidden md:flex gap-10">
                            <a href="#" className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors">{t('t_3be4738d')}</a>
                            <a href="#" className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors">{t('t_65171cc4')}</a>
                            <a href="#" className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors">{t('t_50138230')}</a>
                        </div>
                        <a href="#order" className="bg-rose-900 hover:bg-rose-800 text-rose-50 px-6 py-2.5 rounded-none tracking-widest text-sm transition-all shadow-md">
                            
                            {t('t_20c3a7e2')}
                        </a>
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div className="flex flex-col gap-8 order-2 lg:order-1">
                            <div>
                                <span className="uppercase tracking-[0.2em] text-xs font-bold text-rose-500 mb-4 block">{t('t_12c49c840')}</span>
                                <h1 className="font-elegant text-5xl md:text-6xl lg:text-7xl leading-tight text-slate-900 dark:text-white">
                                    {product?.name || t('t_1804685b8')}
                                </h1>
                            </div>
                            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-lg">
                                {product?.description || t('t_3da2627f')}
                            </p>
                            <div className="flex items-end gap-4 mt-2">
                                <span className="text-4xl font-elegant text-rose-900">{product?.price || '3,500'}  {t('t_17422d')}</span>
                                {product?.compareAtPrice && <span className="text-lg text-slate-400 line-through mb-1">{product.compareAtPrice}  {t('t_17422d')}</span>}
                            </div>
                            
                            <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="skincare" />

                            <div className="flex gap-4">
                                <a href="#order" className="bg-rose-900 hover:bg-rose-800 text-rose-50 px-10 py-4 rounded-none tracking-widest text-sm transition-all shadow-xl shadow-rose-900/20 flex-1 text-center font-bold">
                                    
                                    {t('t_69be0cd6')}
                                </a>
                                <button className="border border-rose-200 text-rose-900 px-6 py-4 hover:bg-rose-50 transition-colors flex items-center justify-center">
                                    <span className="material-symbols-outlined">favorite_border</span>
                                </button>
                            </div>

                            <div className="flex gap-6 mt-8 pt-6 border-t border-rose-100 max-w-lg">
                                <div className="flex flex-col gap-1">
                                    <span className="material-symbols-outlined text-rose-400">local_florist</span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('t_31b8982a')}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="material-symbols-outlined text-rose-400">cruelty_free</span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('t_1840ee1eb')}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="material-symbols-outlined text-rose-400">science</span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('t_a2470847')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative order-1 lg:order-2 flex justify-center items-center">
                            {/* Decorative background shapes */}
                            <div className="absolute w-[120%] h-[120%] bg-rose-50 rounded-full -z-10 blur-3xl opacity-60"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[500px] border border-rose-200 rounded-t-full -z-10"></div>

                            <div className="w-full max-w-[450px] relative z-10 soft-shadow rounded-t-[100px] rounded-b-lg overflow-hidden bg-white dark:bg-zinc-900">
                                <ImageGallery
                                    images={product?.images || []}
                                    mainImage={product?.imageUrl || '/images/beauty_product.png'}
                                    productName={product?.name || 'Skincare Product'}
                                    variant="light"
                                />
                            </div>

                            <div className="absolute -bottom-8 -left-8 bg-white dark:bg-zinc-900 p-6 soft-shadow rounded-lg z-20 animate-[pulse_4s_ease-in-out_infinite]">
                                <p className="font-elegant text-3xl text-rose-900">98%</p>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{t('t_c97dd317')}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="py-24 bg-white dark:bg-zinc-900 px-6">
                    <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
                        <span className="material-symbols-outlined text-rose-300 text-4xl mb-6">eco</span>
                        <h2 className="font-elegant text-3xl md:text-4xl text-slate-900 dark:text-white mb-6">{t('t_1886ef5ec')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                            
                            {t('t_2279ff75f')}
                        </p>
                    </div>
                </section>

                <section id="order" className="py-24 px-6 bg-rose-50/50 border-t border-rose-100">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-8 md:p-12 soft-shadow border border-rose-100 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-full -z-10 opacity-50"></div>
                        <div className="mb-10 text-center">
                            <h2 className="font-elegant text-3xl text-rose-900 mb-3">{t('t_4186fd5')}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('t_71b93661')}</p>
                        </div>
                        <StorefrontCheckoutForm product={product} />
                    </div>
                </section>

                <footer className="bg-rose-950 text-rose-100 py-16 px-6 text-center">
                    <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-rose-400">spa</span>
                            <h2 className="font-elegant text-2xl font-bold tracking-wide text-white">{t('t_2f24e96')}</h2>
                        </div>
                        <p className="text-rose-300/60 max-w-md text-sm leading-loose">
                            
                            {t('t_1af998318')}
                        </p>
                        <div className="flex gap-6 mt-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-rose-800 flex items-center justify-center hover:bg-rose-900 hover:text-white transition-colors">
                                IG
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-rose-800 flex items-center justify-center hover:bg-rose-900 hover:text-white transition-colors">
                                FB
                            </a>
                        </div>
                        <p className="text-xs text-rose-500/50 mt-8 border-t border-rose-900/50 pt-8 w-full">
                            
                            {t('t_56d8b5a07')}
                        </p>
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
            </div>
        </>
    );
}
