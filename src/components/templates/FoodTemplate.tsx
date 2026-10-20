'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function FoodTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Lemonada:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Almarai', sans-serif;
            background-color: #fff9f0;
        }
        .font-food {
            font-family: 'Lemonada', cursive;
        }
        .primary-drop-shadow {
            filter: drop-shadow(0 20px 30px rgba(239, 68, 68, 0.4));
        }
        .food-pattern {
            background-image: radial-gradient(#ef4444 2px, transparent 2px), radial-gradient(#fcd34d 2px, transparent 2px);
            background-size: 40px 40px;
            background-position: 0 0, 20px 20px;
            opacity: 0.05;
        }
        .custom-shape-divider-top-1736000000 {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            overflow: hidden;
            line-height: 0;
            transform: rotate(180deg);
        }

        .custom-shape-divider-top-1736000000 svg {
            position: relative;
            display: block;
            width: calc(100% + 1.3px);
            height: 60px;
        }

        .custom-shape-divider-top-1736000000 .shape-fill {
            fill: #fff9f0;
        }
    `}} />
            <div className="min-h-screen text-slate-800 dark:text-slate-100 overflow-x-hidden selection:bg-red-500 selection:text-white relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

                {/* Global Pattern background */}
                <div className="absolute inset-0 food-pattern z-0 pointer-events-none fixed"></div>

                {/* Navbar */}
                <nav className="relative z-50 flex justify-between items-center px-6 lg:px-12 py-6">
                    <div className="flex items-center gap-2">
                        {product?.logoUrl && product?.hide_branding ? (
                            <img src={product.logoUrl} alt={product?.storeName || 'Store Logo'} className="size-10 profile-circle object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                                <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
                            </div>
                        )}
                        {product?.hide_branding ? (
                            <h2 className="font-food text-2xl font-bold text-red-600">{product?.storeName}</h2>
                        ) : (
                            <h2 className="font-food text-2xl font-bold text-red-600">{t('t_2f2e4e5')}<span className="text-amber-500">{t('t_5b33b1d7')}</span></h2>
                        )}
                    </div>
                </nav>

                {/* Hero */}
                <header className="relative z-10 pt-16 pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-8">

                    <div className="lg:w-1/2 flex flex-col gap-6 relative">
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-400 rounded-full mix-blend-multiply blur-xl opacity-50 animate-blob"></div>
                        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-red-400 rounded-full mix-blend-multiply blur-xl opacity-50 animate-blob animation-delay-2000"></div>

                        <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full shadow-sm  shadow-red-100 w-fit border border-red-50">
                            <span className="text-xl">��</span>
                            <span className="text-red-600 font-bold text-sm">{t('t_46d7f41d')}</span>
                        </div>

                        <h1 className="font-food text-5xl md:text-7xl font-bold leading-tight text-slate-900 dark:text-white mt-2">
                            {product?.name || t('t_be9bb73e')}
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {product?.description || t('t_31e4caf38')}
                        </p>

                        <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="food" />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6">
                            <div className="flex flex-col items-start bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl shadow-sm  border border-slate-100 dark:border-zinc-800">
                                <span className="text-sm text-slate-400 font-bold mb-1">{t('t_59a3ca6e')}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-food text-4xl font-bold text-red-500">{product?.price || '850'}</span>
                                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('t_17422d')}</span>
                                </div>
                            </div>

                            <a href="#order" className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
                                <span className="material-symbols-outlined text-[28px]">local_shipping</span>
                                
                                {t('t_1d72203f')}
                            </a>
                        </div>

                        <div className="flex items-center gap-4 mt-6 text-slate-600 dark:text-slate-400 font-bold bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white">
                            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-md">
                                <span className="material-symbols-outlined text-[18px]">timer</span>
                                <span>{t("t_bd53e1f5")}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-md">
                                <span className="material-symbols-outlined text-[18px]">star</span>
                                <span>{t('t_2008624c')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative flex justify-center w-full">
                        {/* Circle Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-amber-400 rounded-full -z-10 shadow-[inset_0_-40px_60px_rgba(0,0,0,0.1)]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] md:w-[540px] md:h-[540px] border-2 border-amber-400/30 rounded-full border-dashed animate-[spin_20s_linear_infinite] -z-20"></div>

                        {/* Img */}
                        <div className="w-[85%] max-w-[500px] primary-drop-shadow relative z-10 transition-transform duration-700 hover:scale-105">
                            <ImageGallery
                                images={product?.images || []}
                                mainImage={product?.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800'}
                                productName={product?.name || 'Food Product'}
                                variant="light"
                            />
                        </div>

                        {/* Floating elements */}
                        <div className="absolute top-0 right-10 bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-lg font-bold text-red-500 animate-[bounce_3s_ease-in-out_infinite] rotate-12">
                            
                            {t('t_2d9c4e2a')}
                        </div>
                        <div className="absolute bottom-10 left-10 bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-lg font-bold text-amber-500 animate-[bounce_4s_ease-in-out_infinite] -rotate-6">
                            
                            {t('t_36467a04')}
                        </div>
                    </div>
                </header>

                <section className="bg-white dark:bg-zinc-900 relative z-20">
                    <div className="custom-shape-divider-top-1736000000">
                        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                        </svg>
                    </div>

                    <div id="order" className="max-w-3xl mx-auto px-6 py-32 flex flex-col gap-16 items-center">
                        <div className="bg-red-50 rounded-[3rem] p-10 lg:p-14 shadow-inner border border-red-100 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-amber-400"></div>

                            <h2 className="font-food text-red-600 text-3xl font-bold mb-4 flex items-center gap-3">
                                <span className="bg-red-100 p-2 rounded-lg">��</span>{t("t_52243fb5")}</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">{t("t_174be21d")}</p>

                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-red-50/50">
                                <StorefrontCheckoutForm product={product} />
                            </div>
                        </div>

                        </div></section>

                <footer className="bg-slate-900 text-white py-12 text-center border-b-[8px] border-red-500">
                    {product?.hide_branding ? (
                        <h2 className="font-food text-2xl font-bold text-red-600 mb-4">{product?.storeName}</h2>
                    ) : (
                        <h2 className="font-food text-2xl text-red-500 mb-4">SOUQ <span className="text-amber-400">AI</span></h2>
                    )}
                    <p className="text-slate-400 font-medium">{t("t_bdfd47")}</p>
                    <div className="flex justify-center gap-4 mt-6 text-slate-300">
                        <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors">facebook</span>
                        <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors">camera_alt</span>
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
