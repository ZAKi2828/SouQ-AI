'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function DigitalTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #0f172a; /* slate-900 */
        }
        .font-mono-arabic {
            font-family: 'IBM Plex Sans Arabic', sans-serif;
        }
        .gradient-text {
            background: linear-gradient(135deg, #38bdf8, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .course-card {
            background: rgba(30, 41, 59, 0.5); /* slate-800/50 */
            backdrop-filter: blur(12px);
            border: 1px solid rgba(148, 163, 184, 0.1);
        }
    `}} />
            <div className="min-h-screen text-slate-300 overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

                {/* Background Glows */}
                <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

                {/* Navbar */}
                <nav className="border-b border-slate-800 sticky top-0 bg-slate-900/80 backdrop-blur-md z-50">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                {'</>'}
                            </div>
                            <h2 className="font-bold text-xl text-white tracking-wide">{t('t_1c1447e4b')}</h2>
                        </div>
                        <a href="#enroll" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors border border-white/5">
                            
                            {t('t_2ba35216')}
                        </a>
                    </div>
                </nav>

                {/* Hero */}
                <header className="pt-20 pb-32 px-6 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="flex flex-col gap-6 order-2 lg:order-1 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 w-fit text-sm font-semibold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                            </span>
                            
                            {t('t_d84c612c')}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.2]">
                            <span className="block">{product?.name || t('t_367e2772')}</span>
                            <span className="gradient-text mt-2 block">{t('t_301a7a7e')}</span>
                        </h1>

                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-6">
                            {product?.description || t('t_25ce4763d')}
                        </p>

                        <div className="mb-6">
                            <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="tech" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#enroll" className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-xl font-bold text-center transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transform hover:-translate-y-1">
                                
                                {t('t_15b921e06')}
                            </a>
                        </div>

                        <div className="flex items-center gap-6 mt-4 opacity-80">
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t('t_5e1ed67d')}</span>
                                <span className="text-2xl font-bold text-white">{product?.price || '9,900'}  {t('t_17422d')}</span>
                            </div>
                            <div className="h-10 w-px bg-slate-700"></div>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2 space-x-reverse">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700`}></div>
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-slate-400">{t('t_4101c7a4')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative order-1 lg:order-2 perspective-1000">
                        {/* 3D Floating Mockup Effect */}
                        <div className="relative transform md:rotate-y-[-10deg] md:rotate-x-[5deg] md:rotate-z-[2deg] transition-transform duration-500 hover:rotate-0">
                            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-2xl p-1 blur-xl opacity-50"></div>
                            <div className="relative bg-slate-800 p-2 rounded-2xl border border-slate-700 shadow-2xl">
                                <div className="flex gap-1.5 px-3 py-2 border-b border-slate-700/50 mb-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="w-full aspect-video rounded-xl overflow-hidden relative">
                                    <ImageGallery
                                        images={product?.images || []}
                                        mainImage={product?.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000'}
                                        productName={product?.name || 'Product preview'}
                                        variant="dark"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-slate-900/20 rounded-2xl flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white pl-1 shadow-xl cursor-pointer hover:bg-white/20 transition-all hover:scale-110">
                                        <span className="material-symbols-outlined text-3xl">play_arrow</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating badges */}
                        <div className="absolute -left-6 top-1/4 bg-slate-800/80 backdrop-blur border border-slate-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-[bounce_3s_ease-in-out_infinite]">
                            <span className="material-symbols-outlined text-green-400 text-3xl">task_alt</span>
                            <div className="text-sm">
                                <p className="text-white font-bold">{t('t_11f98756e')}</p>
                                <p className="text-slate-400 text-xs">{t('t_1237d20a9')}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Features */}
                <section className="border-y border-slate-800/50 bg-slate-900/50 py-16 px-6 relative z-20">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-800">
                        <div className="flex flex-col items-center gap-3 p-4">
                            <span className="material-symbols-outlined text-4xl text-sky-400 mb-2">all_inclusive</span>
                            <h3 className="text-white font-bold text-xl">{t('t_e606ac0c')}</h3>
                            <p className="text-slate-400 text-sm">{t('t_e5298121')}</p>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-4">
                            <span className="material-symbols-outlined text-4xl text-indigo-400 mb-2">workspace_premium</span>
                            <h3 className="text-white font-bold text-xl">{t('t_471de765')}</h3>
                            <p className="text-slate-400 text-sm">{t('t_47ceeb76')}</p>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-4">
                            <span className="material-symbols-outlined text-4xl text-purple-400 mb-2">forum</span>
                            <h3 className="text-white font-bold text-xl">{t('t_f4092e21')}</h3>
                            <p className="text-slate-400 text-sm">{t('t_17df2d66c')}</p>
                        </div>
                    </div>
                </section>

                {/* Checkout Section */}
                <section id="enroll" className="py-24 px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('t_aa279ca5')}</h2>
                            <p className="text-slate-400">{t('t_39e07a2d')}</p>
                        </div>

                        <div className="course-card rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            {/* Decorative grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                            <div className="relative z-10">
                                <StorefrontCheckoutForm product={product} />
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-slate-800 py-12 text-center px-6">
                    <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                            {'</>'}
                        </div>
                        <span className="font-bold text-white tracking-widest uppercase text-sm">{t('t_1c1447e4b')}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t('t_2e50e968f')}</p>
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
