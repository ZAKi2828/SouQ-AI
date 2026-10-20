'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';

import { useI18n } from "@/context/I18nContext";

export default function PerfumeTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap');
        
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #fcf9f5;
        }
        .font-serif-ar {
            font-family: 'Playfair Display', 'Tajawal', serif;
        }
        .gold-gradient {
            background: linear-gradient(135deg, #d4af37 0%, #aa771c 100%);
        }
        .gold-text {
            background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .perfume-card {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 175, 55, 0.2);
            box-shadow: 0 10px 40px rgba(0,0,0,0.03);
        }
    `}} />
            <div className="min-h-screen text-[#2c2a26] overflow-x-hidden selection:bg-[#d4af37] selection:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

                {/* Header */}
                <header className="absolute top-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center bg-transparent">
                    {product?.hide_branding ? (
                        product?.logoUrl ? (
                            <img src={product.logoUrl} alt={product?.storeName || "Store Logo"} className="h-8 md:h-10 object-contain" />
                        ) : (
                            <div className="font-serif-ar text-2xl font-bold tracking-wider text-[#d4af37]">{product?.storeName}</div>
                        )
                    ) : (
                        <div className="font-serif-ar text-2xl font-bold tracking-wider text-[#d4af37]">SOUQ<span className="text-[#2c2a26]">AI</span></div>
                    )}
                </header>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 lg:px-12 overflow-hidden flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-[1400px] mx-auto min-h-[90vh]">

                    {/* Abstract bg blur */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#f5e6d3] rounded-full blur-[120px] -z-10 opacity-70"></div>

                    <div className="lg:w-1/2 flex flex-col gap-8 z-10">
                        <div className="flex flex-col gap-2">
                            
                            <h1 className="font-serif-ar text-5xl md:text-7xl font-bold leading-[1.15] text-[#1a1814]">
                                {product?.name || t('t_c0777f9')}
                            </h1>
                        </div>
                        <p className="text-[#5c5851] text-lg leading-relaxed max-w-lg font-light">
                            {product?.description || t('t_30db75185')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
                            <div className="flex flex-col">
                                {product?.compareAtPrice && <span className="line-through text-[#a39e93] text-sm">{product.compareAtPrice}  {t('t_17422d')}</span>}
                                <span className="font-serif-ar text-4xl font-bold gold-text">
                                    {product?.price || '22,500'} <span className="text-xl">{t('t_17422d')}</span>
                                </span>
                            </div>

                            <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="perfume" />

                            <a href="#checkout" className="gold-gradient text-white px-10 py-4 rounded-none tracking-wider font-bold shadow-xl hover:shadow-[#d4af37]/30 transition-all hover:-translate-y-1 w-full sm:w-auto text-center">{t("t_70eb1569")}</a>
                        </div>


                        
                    </div>

                    <div className="lg:w-1/2 relative z-10 flex justify-center w-full">
                        <div className="relative w-full max-w-[500px]">
                            <ImageGallery
                                images={product?.images || []}
                                mainImage={product?.imageUrl || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800'}
                                productName={product?.name || 'Perfume'}
                                variant="light"
                            />
                        </div>
                    </div>
                </section>

                

                {/* Checkout Section */}
                <section id="checkout" className="py-24 px-6 lg:px-12 bg-white dark:bg-zinc-900">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 mb-12">
                        <span className="material-symbols-outlined text-5xl text-[#d4af37]">shopping_bag</span>
                        <h2 className="font-serif-ar text-4xl font-bold">{t("t_70eb1569")}</h2>
                        <p className="text-[#5c5851]">{t("t_d8d7558c")}</p>
                    </div>

                    <div className="max-w-xl mx-auto perfume-card p-8 md:p-12 rounded-[2rem] border border-[#d4af37]/30 shadow-2xl relative">
                        {/* Decorative corners */}
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#d4af37]"></div>
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#d4af37]"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#d4af37]"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#d4af37]"></div>

                        <StorefrontCheckoutForm product={product} />
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#1a1814] text-[#8c867a] py-8 text-center text-sm border-t border-white/5">
                    <p>{t("t_bdfd47")}</p>
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
