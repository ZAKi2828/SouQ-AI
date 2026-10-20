'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function ElegantTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    const descriptionLines = (product?.description || '').split('\n').filter((l: string) => l.trim());
    const hasDiscount = product?.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100) : 0;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
                body { font-family: 'Tajawal', sans-serif; }
                .elegant-shadow { box-shadow: 0 25px 60px -12px rgba(0,0,0,0.15); }
                .warm-gradient { background: linear-gradient(135deg, #f5f0eb 0%, #ede5da 100%); }
            `}} />
            <div className="min-h-screen bg-[#f8f5f1] text-[#2d2926] overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8f5f1]/90 backdrop-blur-xl border-b border-[#d4c5b3]/30">
                    <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            {product?.logoUrl && product?.hide_branding ? (
                                <img src={product.logoUrl} alt={product?.storeName || "Store Logo"} className="size-10 profile-circle border border-[#d4c5b3]/30 object-cover" />
                            ) : null}
                            {product?.hide_branding ? (
                                <h2 className="text-xl font-bold tracking-tight text-[#2d2926]">{product?.storeName}</h2>
                            ) : (
                                <h2 className="text-2xl font-black tracking-tight text-[#2d2926]">SOUQ AI</h2>
                            )}
                        </div>
                        <a href="#checkout-section" className="bg-[#2d2926] text-[#f8f5f1] text-sm font-bold px-7 py-3 rounded-full hover:bg-[#4a4440] transition-all shadow-md animate-attention">
                            {t('t_3e032e93')}
                        </a>
                    </div>
                </nav>

                <main className="pt-20">
                    {/* Hero — Full Width Split */}
                    <section className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
                        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 items-center">
                            {/* Info */}
                            <div className="w-full lg:w-5/12 flex flex-col gap-8">
                                <div className="space-y-4">
                                    <span className="text-[#b09e88] text-sm font-bold tracking-[0.2em] uppercase">{t('t_204d81db')}</span>
                                    <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#2d2926]">
                                        {product?.name || t('t_2d8944b9')}
                                    </h1>
                                    <p className="text-[#7a716a] text-lg leading-relaxed font-light">
                                        {descriptionLines[0] || t('t_cfdcc1a7')}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="warm-gradient p-6 rounded-2xl">
                                    <span className="text-xs font-bold text-[#b09e88] tracking-widest uppercase block mb-2">{t('t_59a3ca6e')}</span>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl font-black text-[#2d2926]">{product?.price || '0'}</span>
                                        <span className="text-xl font-bold text-[#b09e88]">{t('t_17422d')}</span>
                                        {hasDiscount && (
                                            <span className="text-lg text-[#c4a882] line-through">{product.compareAtPrice}  {t('t_17422d')}</span>
                                        )}
                                    </div>
                                </div>

                                <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="elegant" />

                                {/* CTA */}
                                <a href="#checkout-section" className="w-full bg-[#2d2926] text-[#f8f5f1] text-lg font-bold py-4 rounded-2xl hover:bg-[#4a4440] transition-all flex items-center justify-center gap-3 elegant-shadow animate-attention">
                                    <span className="material-symbols-outlined">shopping_bag</span>
                                    
                                    {t('t_1087536f6')}
                                </a>

                                {/* Trust */}
                                <div className="flex items-center gap-6 text-[#9c9189]">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[18px] text-[#b09e88]">local_shipping</span>
                                        <span className="font-medium">{t('t_b70da944')}</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-[#d4c5b3]"></div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[18px] text-[#b09e88]">payments</span>
                                        <span className="font-medium">{t('t_8c4b14b8')}</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-[#d4c5b3]"></div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[18px] text-[#b09e88]">verified</span>
                                        <span className="font-medium">{t('t_2e23878')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="w-full lg:w-7/12">
                                <div className="elegant-shadow rounded-3xl overflow-hidden">
                                    <ImageGallery
                                        images={product?.images || []}
                                        mainImage={product?.imageUrl || 'https://placehold.co/800x800'}
                                        productName={product?.name || 'Product'}
                                        variant="light"
                                    />
                                </div>
                                {hasDiscount && (
                                    <div className="absolute top-6 right-6 bg-[#c24a4a] text-white font-black px-5 py-2 rounded-full text-sm shadow-lg z-20">
                                        
                                        {t('t_17f95e')} {discountPercent}%
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    {descriptionLines.length > 1 && (
                        <section className="py-20 px-4 bg-white dark:bg-zinc-900">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-3xl font-black text-center mb-12 text-[#2d2926]">{t('t_97d092cb')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {descriptionLines.map((line: string, i: number) => (
                                        <div key={i} className="warm-gradient p-6 rounded-2xl border border-[#e8dccf]/50">
                                            <div className="w-10 h-10 rounded-full bg-[#2d2926] text-[#f8f5f1] flex items-center justify-center font-black text-sm mb-4">
                                                {i + 1}
                                            </div>
                                            <p className="text-[#5c554e] font-medium leading-relaxed">{line}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Reviews */}
                    <section className="py-20 px-4 bg-[#f8f5f1]">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-black text-center mb-12 text-[#2d2926]">{t('t_76611ce3')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { name: t('t_bcb72c8'), text: t('t_19a26d44b') },
                                    { name: t('t_3e8103bb'), text: t('t_fee0753f') },
                                    { name: t('t_13d42f86'), text: t('t_3f78ff43e') },
                                ].map((r, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-[#e8dccf]/50 elegant-shadow">
                                        <div className="flex gap-0.5 text-[#d4a843] text-lg mb-4">★★★★★</div>
                                        <p className="text-[#5c554e] leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                                        <p className="font-bold text-sm text-[#2d2926]">{r.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Checkout */}
                    <section id="checkout-section" className="py-20 px-4 bg-white dark:bg-zinc-900">
                        <div className="max-w-xl mx-auto">
                            <div className="bg-[#f8f5f1] rounded-3xl elegant-shadow overflow-hidden border border-[#e8dccf]/50">
                                <div className="bg-[#2d2926] text-[#f8f5f1] text-center py-6 px-6">
                                    <h2 className="text-xl font-black">{t('t_f4eec640')}</h2>
                                    <p className="text-[#b09e88] text-sm mt-1">{t('t_9f16a126')}</p>
                                </div>
                                <div className="p-6 lg:p-8">
                                    <StorefrontCheckoutForm product={product} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-[#2d2926] text-[#b09e88] py-10 px-4 text-center text-sm">
                    <p>{t('t_5a3d6ac1')}</p>
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
                <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-5 bg-gradient-to-t from-[#f8f5f1] via-[#f8f5f1]/95 to-transparent pointer-events-none md:hidden">
                    <div className="max-w-md mx-auto w-full pointer-events-auto flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#b09e88] uppercase tracking-wider">{t('t_59a3ca6e')}</span>
                            <span className="text-lg font-black text-[#2d2926]">{product?.price || '0'}  {t('t_17422d')}</span>
                        </div>
                        <a href="#checkout-section" className="flex-1 bg-[#2d2926] text-[#f8f5f1] font-bold py-3.5 rounded-2xl elegant-shadow flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined !text-[18px]">shopping_bag</span>
                            
                            {t('t_3e032e93')}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
