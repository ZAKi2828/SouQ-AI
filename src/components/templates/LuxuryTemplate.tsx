'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function LuxuryTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    const descriptionLines = (product?.description || '').split('\n').filter((l: string) => l.trim());
    const hasDiscount = product?.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100) : 0;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
                body { font-family: 'Cairo', sans-serif; }
                .luxury-gold { color: #c9a84c; }
                .luxury-gold-bg { background: linear-gradient(135deg, #c9a84c 0%, #f0d078 50%, #c9a84c 100%); }
                .luxury-glass { background: rgba(0,0,0,0.4); backdrop-filter: blur(20px); border: 1px solid rgba(201,168,76,0.15); }
                .gold-shine { background: linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent); background-size: 200% 100%; animation: goldShine 4s ease-in-out infinite; }
                @keyframes goldShine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            `}} />
            <div className="min-h-screen bg-[#0c0b0a] text-white overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* Decorative Elements */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c9a84c]/5 rounded-full blur-[150px]"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#c9a84c]/3 rounded-full blur-[120px]"></div>
                </div>

                {/* Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c0b0a]/80 backdrop-blur-xl border-b border-[#c9a84c]/10">
                    <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                        {product?.hide_branding ? (
                            product?.logoUrl ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Store'} className="h-8 md:h-10 object-contain" />
                            ) : (
                                <h2 className="text-2xl font-black tracking-wider luxury-gold">{product?.storeName}</h2>
                            )
                        ) : (
                            <h2 className="text-2xl font-black tracking-wider luxury-gold">SOUQ AI</h2>
                        )}
                        <a href="#checkout-section" className="luxury-gold-bg text-[#0c0b0a] text-sm font-bold px-7 py-3 rounded-none tracking-wider hover:opacity-90 transition-all">
                            
                            {t('t_3e032e93')}
                        </a>
                    </div>
                </nav>

                <main className="pt-20 relative z-10">
                    {/* Hero */}
                    <section className="py-16 lg:py-24 px-4">
                        <div className="max-w-6xl mx-auto">
                            {/* Badge */}
                            <div className="text-center mb-12">
                                <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase luxury-gold border border-[#c9a84c]/30 px-6 py-2">
                                    
                                    {t('t_fb8fc148')}
                                </span>
                            </div>

                            {/* Product Name Center */}
                            <h1 className="text-4xl lg:text-7xl font-black text-center leading-tight mb-6">
                                {product?.name || t('t_2d8944b9')}
                            </h1>
                            <p className="text-center text-white/40 text-lg max-w-2xl mx-auto mb-12">
                                {descriptionLines[0] || t('t_1adf0e1dc')}
                            </p>

                            {/* Image */}
                            <div className="max-w-3xl mx-auto mb-16">
                                <div className="border border-[#c9a84c]/20 p-2 lg:p-4">
                                    <ImageGallery
                                        images={product?.images || []}
                                        mainImage={product?.imageUrl || 'https://placehold.co/800x800'}
                                        productName={product?.name || 'Product'}
                                        variant="dark"
                                    />
                                </div>
                                {hasDiscount && (
                                    <div className="text-center mt-6">
                                        <span className="luxury-gold-bg text-[#0c0b0a] font-black px-6 py-2 text-sm tracking-wider">
                                            
                                            {t('t_17f95e')} {discountPercent}{t('t_175588c5')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Price + CTA */}
                            <div className="max-w-lg mx-auto text-center space-y-6">
                                <div className="luxury-glass p-8 gold-shine">
                                    <span className="text-xs font-bold tracking-[0.2em] uppercase luxury-gold block mb-3">{t('t_11f3f99b0')}</span>
                                    <div className="flex items-baseline justify-center gap-3">
                                        <span className="text-6xl font-black text-white">{product?.price || '0'}</span>
                                        <span className="text-2xl font-bold text-white/40">{t('t_17422d')}</span>
                                        {hasDiscount && (
                                            <span className="text-lg text-white/30 line-through">{product.compareAtPrice}  {t('t_17422d')}</span>
                                        )}
                                    </div>
                                </div>

                                <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="luxury" />

                                <a href="#checkout-section" className="block w-full luxury-gold-bg text-[#0c0b0a] text-lg font-black py-5 tracking-wider hover:opacity-90 transition-all">
                                    
                                    {t('t_1f5d00c14')}
                                </a>

                                <div className="flex items-center justify-center gap-8 text-white/30 text-xs font-medium tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined !text-[16px] luxury-gold">local_shipping</span>
                                        
                                        {t('t_d6536675')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined !text-[16px] luxury-gold">payments</span>
                                        
                                        {t('t_8c4b14b8')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined !text-[16px] luxury-gold">diamond</span>
                                        
                                        {t('t_33991d2a')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    {descriptionLines.length > 1 && (
                        <section className="py-20 px-4 border-t border-[#c9a84c]/10">
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-3xl font-black text-center mb-12 luxury-gold">{t('t_4fac80cd')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {descriptionLines.map((line: string, i: number) => (
                                        <div key={i} className="luxury-glass p-6 flex items-start gap-4 hover:border-[#c9a84c]/30 transition-all gold-shine">
                                            <span className="luxury-gold text-lg font-bold flex-shrink-0">✦</span>
                                            <p className="text-white/60 font-medium leading-relaxed">{line}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Reviews */}
                    <section className="py-20 px-4 border-t border-[#c9a84c]/10">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-black text-center mb-12 luxury-gold">{t('t_ef9ff43')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { name: t('t_168fd73a'), text: t('t_1c01c0c4c') },
                                    { name: t('t_2f1878b'), text: t('t_20406f2e3') },
                                    { name: t('t_5b04f925'), text: t('t_b317abc') },
                                ].map((r, i) => (
                                    <div key={i} className="luxury-glass p-6 flex flex-col gap-4">
                                        <div className="flex gap-1 luxury-gold text-sm">✦✦✦✦✦</div>
                                        <p className="text-white/50 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                                        <div className="mt-auto pt-4 border-t border-[#c9a84c]/10">
                                            <p className="font-bold text-sm luxury-gold">{r.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Checkout */}
                    <section id="checkout-section" className="py-20 px-4 border-t border-[#c9a84c]/10">
                        <div className="max-w-xl mx-auto">
                            <div className="border border-[#c9a84c]/20 overflow-hidden">
                                <div className="luxury-gold-bg text-[#0c0b0a] text-center py-6 px-6">
                                    <h2 className="text-xl font-black tracking-wider">{t('t_27898bc88')}</h2>
                                    <p className="text-[#0c0b0a]/60 text-sm mt-1">{t('t_c2fbf882')}</p>
                                </div>
                                <div className="p-6 lg:p-8 bg-[#0c0b0a]">
                                    <StorefrontCheckoutForm product={product} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-[#c9a84c]/10 py-10 px-4 text-center relative z-10">
                    <p className="text-white/15 text-sm tracking-wider">{t('t_5a3d6ac1')}</p>
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
                <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-5 bg-gradient-to-t from-[#0c0b0a] via-[#0c0b0a]/95 to-transparent pointer-events-none md:hidden">
                    <div className="max-w-md mx-auto w-full pointer-events-auto flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] luxury-gold uppercase tracking-wider">{t('t_59a3ca6e')}</span>
                            <span className="text-lg font-black">{product?.price || '0'}  {t('t_17422d')}</span>
                        </div>
                        <a href="#checkout-section" className="flex-1 luxury-gold-bg text-[#0c0b0a] font-bold py-3.5 flex items-center justify-center text-sm tracking-wider">
                            
                            {t('t_189b39f39')}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
