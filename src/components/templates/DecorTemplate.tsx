'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function DecorTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=Noto+Serif+Arabic:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Readex Pro', sans-serif;
            background-color: #faf9f6; /* Off-white linen */
            color: #2b2a28; /* Charcoal / Dark warm gray */
        }
        .font-classic {
            font-family: 'Noto Serif Arabic', serif;
        }
        .bg-taupe {
            background-color: #8c7d70;
        }
        .text-taupe {
            color: #8c7d70;
        }
        .border-taupe {
            border-color: #8c7d70;
        }
        .bg-olive {
            background-color: #4a5d4e;
        }
        .text-olive {
            color: #4a5d4e;
        }
        
        /* Smooth reveal animation classes */
        .reveal-up {
            animation: revealUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            opacity: 0;
            transform: translateY(30px);
        }
        
        @keyframes revealUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        
        .image-mask {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
            transition: clip-path 1.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .hover-trigger:hover .image-mask {
            clip-path: polygon(5% 5%, 95% 5%, 95% 95%, 5% 95%);
        }
    `}} />
            <div className="min-h-screen overflow-x-hidden selection:bg-[#8c7d70] selection:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

                {/* Minimalist Header */}
                <header className="absolute top-0 w-full z-50 px-6 py-8 md:px-16 flex justify-between items-center bg-transparent mix-blend-difference text-white">
                    <div className="font-classic text-2xl md:text-3xl font-bold tracking-widest uppercase">
                        SOUQ<span className="font-light">AI</span>
                    </div>
                    <nav className="hidden md:flex gap-10 text-sm font-medium tracking-widest uppercase">
                        <a href="#" className="hover:opacity-70 transition-opacity">{t('t_665c8cc9')}</a>
                        <a href="#" className="hover:opacity-70 transition-opacity">{t('t_4fafea18')}</a>
                        <a href="#" className="hover:opacity-70 transition-opacity">{t('t_40a64a10')}</a>
                        <a href="#" className="hover:opacity-70 transition-opacity">{t('t_3232e334')}</a>
                    </nav>
                    <button className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                        <span className="material-symbols-outlined">menu</span>
                        <span className="hidden md:block text-sm tracking-widest uppercase">{t('t_80a6b808')}</span>
                    </button>
                </header>

                {/* Architectural Hero */}
                <section className="relative h-screen min-h-[600px] flex items-center bg-[#2b2a28]">
                    <div className="absolute inset-0 z-0 opacity-80 mix-blend-luminosity hover-trigger overflow-hidden">
                        <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none"></div>
                        <div className="w-full h-full object-cover object-center image-mask scale-105 transition-transform duration-[2s] ease-out hover:scale-100 [&_img]:min-h-screen">
                            <ImageGallery
                                images={product?.images || []}
                                mainImage={product?.imageUrl || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000'}
                                productName={product?.name || 'Interior Design'}
                                variant="minimal"
                            />
                        </div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 w-full flex flex-col justify-end h-full pb-32">
                        <div className="max-w-3xl">
                            <span className="block text-white/70 tracking-[0.3em] text-xs font-semibold uppercase mb-6 reveal-up">
                                
                                {t('t_8344c626')}
                            </span>
                            <h1 className="font-classic text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-[1.1] mb-8 reveal-up delay-100 drop-shadow-lg">
                                {product?.name || t('t_4e9b87db')}
                            </h1>
                            <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed max-w-xl mb-8 reveal-up delay-200">
                                {product?.description || t('t_505bfcf83')}
                            </p>

                            <div className="mb-8 reveal-up delay-300">
                                <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="decor" />
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 reveal-up delay-400">
                                <a href="#checkout" className="bg-white dark:bg-zinc-900 text-[#2b2a28] px-12 py-5 text-sm font-bold tracking-widest uppercase hover:bg-[#8c7d70] hover:text-white transition-colors duration-300">
                                    
                                    {t('t_2b171705')}
                                </a>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-xs tracking-widest uppercase mb-1">{t('t_59a3ca6e')}</span>
                                    <span className="font-classic text-3xl text-white">
                                        {product?.price || '125,000'}  {t('t_17422d')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 z-10 animate-pulse">
                        <span className="text-[10px] tracking-widest uppercase">{t('t_59a333bb')}</span>
                        <div className="w-[1px] h-12 bg-white/50"></div>
                    </div>
                </section>

                {/* Details & Specs */}
                <section className="py-24 md:py-32 px-6 md:px-16 bg-[#faf9f6]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">

                            <div className="lg:col-span-5 flex flex-col gap-12 sticky top-24">
                                <div>
                                    <h2 className="font-classic text-3xl md:text-4xl text-[#2b2a28] mb-6">{t('t_840b089b')}</h2>
                                    <p className="text-[#64625e] leading-relaxed font-light">
                                        
                                        {t('t_2f8425911')}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="border-b border-[#e1ded8] pb-4 flex justify-between items-end">
                                        <span className="text-[#8c7d70] font-medium">{t('t_7ef2977f')}</span>
                                        <span className="text-[#2b2a28] font-classic text-lg">{t('t_546a257e')}</span>
                                    </div>
                                    <div className="border-b border-[#e1ded8] pb-4 flex justify-between items-end">
                                        <span className="text-[#8c7d70] font-medium">{t('t_252cfd86')}</span>
                                        <span className="text-[#2b2a28] font-classic text-lg">{t('t_e85f58a')}</span>
                                    </div>
                                    <div className="border-b border-[#e1ded8] pb-4 flex justify-between items-end">
                                        <span className="text-[#8c7d70] font-medium">{t('t_2531dafd')}</span>
                                        <span className="text-[#2b2a28] font-classic text-lg">{t('t_690eea96')}</span>
                                    </div>
                                    <div className="border-b border-[#e1ded8] pb-4 flex justify-between items-end">
                                        <span className="text-[#8c7d70] font-medium">{t('t_ab9ba456')}</span>
                                        <span className="text-[#2b2a28] font-classic text-lg">{t('t_7b6c8dd3')}</span>
                                    </div>
                                </div>

                                <div className="bg-[#f0ede6] p-8 mt-4">
                                    <h3 className="text-sm tracking-widest uppercase text-[#8c7d70] font-bold mb-4">{t('t_17819e2b3')}</h3>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#e8dccb] border-2 border-[#8c7d70] cursor-pointer shadow-md" title={t('t_bf019ad0')}></div>
                                        <div className="w-12 h-12 rounded-full bg-[#4a5d4e] border-2 border-transparent cursor-pointer shadow-md hover:border-[#8c7d70] transition-colors" title={t('t_f4c9f932')}></div>
                                        <div className="w-12 h-12 rounded-full bg-[#8c4646] border-2 border-transparent cursor-pointer shadow-md hover:border-[#8c7d70] transition-colors" title={t('t_bfe3cef9')}></div>
                                        <div className="w-12 h-12 rounded-full bg-[#2a2d34] border-2 border-transparent cursor-pointer shadow-md hover:border-[#8c7d70] transition-colors" title={t('t_b0fcbada')}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 flex flex-col gap-8">
                                <div className="aspect-[4/3] overflow-hidden bg-[#e1ded8]">
                                    <img
                                        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000"
                                        alt="Furniture detail"
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="aspect-square overflow-hidden bg-[#e1ded8]">
                                        <img
                                            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800"
                                            alt="Material detail"
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
                                        />
                                    </div>
                                    <div className="aspect-square flex items-center justify-center p-8 bg-taupe text-white text-center">
                                        <p className="font-classic text-xl md:text-2xl leading-relaxed italic">
                                            
                                            {t('t_545e3400a')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Banner */}
                <section className="py-24 bg-olive text-white text-center px-6">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <span className="material-symbols-outlined text-5xl opacity-80">chair</span>
                        <h2 className="font-classic text-3xl md:text-5xl leading-tight">{t('t_114683e90')}</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            
                            {t('t_6506db17f')}
                        </p>
                    </div>
                </section>

                {/* Elegant Checkout */}
                <section id="checkout" className="py-24 md:py-32 px-6 md:px-16 bg-[#f0ede6]">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        <div className="w-full lg:w-5/12">
                            <h2 className="font-classic text-4xl lg:text-5xl text-[#2b2a28] mb-6">{t('t_153283a37')}</h2>
                            <p className="text-[#64625e] mb-10 leading-relaxed font-light">
                                
                                {t('t_72b963da')}
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-[#8c7d70]">local_shipping</span>
                                    <div>
                                        <h4 className="font-bold text-[#2b2a28]">{t('t_127f44f02')}</h4>
                                        <p className="text-sm text-[#64625e] mt-1">{t('t_85e27733')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-[#8c7d70]">handshake</span>
                                    <div>
                                        <h4 className="font-bold text-[#2b2a28]">{t('t_733fdd4f')}</h4>
                                        <p className="text-sm text-[#64625e] mt-1">{t('t_b9c8d82f')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-[#8c7d70]">workspace_premium</span>
                                    <div>
                                        <h4 className="font-bold text-[#2b2a28]">{t('t_8a46024f')}</h4>
                                        <p className="text-sm text-[#64625e] mt-1">{t('t_bb250a06')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-7/12 bg-white dark:bg-zinc-900 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                            <StorefrontCheckoutForm product={product} />
                        </div>
                    </div>
                </section>

                {/* Minimalist Footer */}
                <footer className="bg-[#2b2a28] text-white/50 py-16 px-6 md:px-16 text-sm">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="md:col-span-2">
                            <div className="font-classic text-2xl font-bold tracking-widest uppercase text-white mb-6">
                                SOUQ<span className="font-light">AI</span>
                            </div>
                            <p className="max-w-sm leading-relaxed mb-8">
                                
                                {t('t_3028df7b')}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-widest uppercase">{t('t_7fc62902')}</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-white transition-colors">{t('t_3bec79ad')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('t_609b57e7')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('t_65ddc295')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('t_1d7a967b')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-widest uppercase">{t('t_59cfb4f8')}</h4>
                            <ul className="space-y-4">
                                <li>contact@souqai.net</li>
                                <li dir="ltr" className="text-right">+213 555 12 34 56</li>
                                <li>{t('t_25c9a0de')}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>{t('t_237f03d00')}</p>
                        <div className="flex gap-6 uppercase tracking-widest text-xs font-bold text-white">
                            <a href="#" className="hover:text-[#8c7d70] transition-colors">Instagram</a>
                            <a href="#" className="hover:text-[#8c7d70] transition-colors">Pinterest</a>
                        </div>
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
