'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function FashionTemplate({ product }: { product?: any }) {
    const { t } = useI18n();
    // This is a template component that will accept dynamic product data later

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        body {
            font-family: 'Tajawal', sans-serif;
        }
        /* Custom scrollbar for ultra-premium feel */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #fff;
        }
        ::-webkit-scrollbar-thumb {
            background: #e5e5e5;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #141414;
        }
    
`}} />
            <div className="bg-background-light text-primary antialiased selection:bg-primary selection:text-white">

                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">

                    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border-light/50 bg-white/80 backdrop-blur-md px-6 py-4 lg:px-12 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            {product?.logoUrl ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Store Logo'} className="size-10 profile-circle border border-border-light" />
                            ) : (
                                <div className="size-6 text-primary">
                                    <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                            )}
                            <h2 className="text-primary text-xl font-bold tracking-tight">{product?.storeName || 'SOUQ AI'}</h2>
                        </div>
                        <nav className="hidden md:flex items-center gap-10">
                            <a className="text-primary/70 hover:text-primary text-sm font-medium transition-colors" href="#">{t('t_88d00d26')}</a>
                            <a className="text-primary/70 hover:text-primary text-sm font-medium transition-colors" href="#">{t('t_665c8cc9')}</a>
                            <a className="text-primary/70 hover:text-primary text-sm font-medium transition-colors" href="#">{t('t_5b195338')}</a>
                        </nav>
                        <a href="#checkout-section" className="group flex cursor-pointer items-center justify-center rounded-full bg-background-subtle p-2 hover:bg-border-light transition-all animate-attention">
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform" style={{ "fontSize": "24px" }}>shopping_bag</span>
                        </a>
                    </header>

                    <main className="flex-grow pt-20">

                        <div className="layout-container px-4 lg:px-12 pb-12 pt-6">
                            <div className="@container">
                                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

                                    <div className="w-full lg:w-1/2 order-1 lg:order-1 relative">
                                        <ImageGallery
                                            images={product?.images || []}
                                            mainImage={product?.imageUrl || '/images/fashion_product.png'}
                                            productName={product?.name || 'Product'}
                                            variant="light"
                                        />
                                    </div>

                                    <div className="w-full lg:w-1/2 flex flex-col gap-8 lg:pt-12 order-2 lg:order-2">
                                        <div className="space-y-4">

                                            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-primary font-display">
                                                {product?.name || t('t_b8fede34')}
                                            </h1>
                                            <p className="text-lg text-primary/70 leading-relaxed max-w-lg font-light mt-4">
                                                {product?.description || t('t_1476a013c')}
                                            </p>
                                            <div className="text-3xl font-bold text-primary mt-2">
                                                {product?.price || '899'}  {t('t_17422d')}
                                            </div>
                                        </div>
                                        <div className="h-px bg-border-light w-full my-2"></div>

                                        <div className="space-y-6">
                                            <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="fashion" />
                                        </div>

                                        <div className="pt-6">
                                            <a href="#checkout-section" className="w-full lg:max-w-md h-14 bg-primary text-white text-lg font-bold tracking-wide hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 group animate-attention">
                                                <span>{t('t_3e032e93')}</span>
                                                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1" style={{ "fontSize": "20px" }}>arrow_back</span>
                                            </a>

                                        </div>

                                        <div className="grid grid-cols-3 gap-4 pt-8 lg:max-w-md border-t border-border-light mt-4">
                                            <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-right">
                                                <span className="material-symbols-outlined text-primary/40" style={{ "fontSize": "28px" }}>local_shipping</span>
                                                <span className="text-xs font-bold text-primary">{t('t_b054f451')}</span>
                                            </div>
                                            <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-right">
                                                <span className="material-symbols-outlined text-primary/40" style={{ "fontSize": "28px" }}>payments</span>
                                                <span className="text-xs font-bold text-primary">{t('t_8c4b14b8')}</span>
                                            </div>
                                            <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-right">
                                                <span className="material-symbols-outlined text-primary/40" style={{ "fontSize": "28px" }}>verified</span>
                                                <span className="text-xs font-bold text-primary">{t('t_37125442')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="bg-white dark:bg-zinc-900 py-12 px-4 lg:px-12 border-t border-border-light">
                            <div className="max-w-4xl mx-auto">
                                <StorefrontCheckoutForm product={product} />
                            </div>
                        </section>

                     </main>

                    <footer className="bg-primary text-white py-6 px-4 lg:px-12 mt-auto">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center">
                            <p className="text-sm text-balance text-center text-white/80">{t("t_3350d583")}</p>
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

                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-border-light p-4 lg:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex gap-4 items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-primary/60">{t('t_59a3ca6e')}</span>
                                <span className="text-xl font-bold text-primary">{product?.price || '899'}  {t('t_17422d')}</span>
                            </div>
                            <a href="#checkout-section" className="flex-1 h-12 bg-primary text-white font-bold rounded-none hover:bg-primary/90 transition-colors flex items-center justify-center">
                                
                                {t('t_3e032e93')}
                            </a>
                        </div>
                    </div>
                </div>

            </div>

        </>
    );
}
