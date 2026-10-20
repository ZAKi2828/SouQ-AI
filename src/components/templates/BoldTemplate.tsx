'use client';

import React from 'react';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function BoldTemplate({ product }: { product?: any }) {
    const { t, lang } = useI18n();
    const descriptionLines = (product?.description || '').split('\n').filter((l: string) => l.trim());
    const hasDiscount = product?.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100) : 0;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                body { font-family: 'Cairo', sans-serif; }
                .neon-glow { box-shadow: 0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1); }
                .gradient-text { background: linear-gradient(135deg, #a78bfa, #f472b6, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .glass-bg { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
                .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            `}} />
            <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* Animated Background */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]"></div>
                </div>

                {/* Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 glass-bg">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        {product?.hide_branding ? (
                            product?.logoUrl ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Store'} className="h-8 md:h-10 object-contain" />
                            ) : (
                                <h2 className="text-xl font-black tracking-wide">{product?.storeName}</h2>
                            )
                        ) : (
                            <h2 className="text-xl font-black tracking-wide">SOUQ AI</h2>
                        )}
                        <a href="#checkout-section" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 neon-glow">
                            <span>{t('t_3e032e93')}</span>
                            <span className="material-symbols-outlined !text-[18px]">rocket_launch</span>
                        </a>
                    </div>
                </nav>

                <main className="pt-16 relative z-10">
                    {/* Hero */}
                    <section className="py-12 lg:py-24 px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col lg:flex-row gap-12 items-center">
                                {/* Image */}
                                <div className="w-full lg:w-1/2 relative">
                                    <ImageGallery
                                        images={product?.images || []}
                                        mainImage={product?.imageUrl || 'https://placehold.co/800x800'}
                                        productName={product?.name || 'Product'}
                                        variant="dark"
                                    />
                                    {hasDiscount && (
                                        <div className="absolute top-6 right-6 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black px-5 py-2.5 rounded-2xl text-sm shadow-lg z-20">
                                            
                                            {t('t_eafdb4de')} {discountPercent}%
                                        </div>
                                    )}
                                    {/* Floating badge */}
                                    <div className="absolute -bottom-4 left-6 glass-bg px-5 py-3 rounded-2xl z-20 flex items-center gap-3">
                                        <div className="flex -space-x-2 space-x-reverse">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400"></div>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400"></div>
                                        </div>
                                        <span className="text-sm font-bold text-white/80">{t('t_c95f4cde')}</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="w-full lg:w-1/2 flex flex-col gap-7">
                                    <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-4 py-2 rounded-full w-fit text-sm font-bold">
                                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                                        
                                        {t('t_22c7c3b2')}
                                    </div>
                                    
                                    <h1 className="text-4xl lg:text-6xl font-black leading-tight">
                                        <span className="gradient-text">{product?.name || t('t_2d8944b9')}</span>
                                    </h1>

                                    <p className="text-white/50 text-lg leading-relaxed">
                                        {descriptionLines[0] || t('t_19c24e8d8')}
                                    </p>

                                    {/* Price */}
                                    <div className="glass-bg p-6 rounded-2xl">
                                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2 block">{t('t_11f3f99b0')}</span>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-5xl font-black text-white">{product?.price || '0'}</span>
                                            <span className="text-2xl font-bold text-white/40">{t('t_17422d')}</span>
                                            {hasDiscount && (
                                                <span className="text-lg text-red-400 line-through font-bold">{product.compareAtPrice}  {t('t_17422d')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="bold" />

                                    {/* CTA */}
                                    <a href="#checkout-section" className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-lg font-black py-4 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 neon-glow hover:-translate-y-0.5 active:translate-y-0">
                                        <span>��</span>
                                        <span>{t('t_e6fc0de5')}</span>
                                    </a>

                                    {/* Trust */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { icon: 'local_shipping', label: t('t_a52d0d84'), color: 'from-blue-500 to-cyan-500' },
                                            { icon: 'payments', label: t('t_8c4b14b8'), color: 'from-green-500 to-emerald-500' },
                                            { icon: 'verified', label: t('t_37d8f07f'), color: 'from-purple-500 to-pink-500' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2 text-center">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                                                    <span className="material-symbols-outlined text-white">{item.icon}</span>
                                                </div>
                                                <span className="text-xs font-bold text-white/60">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    {descriptionLines.length > 1 && (
                        <section className="py-20 px-4 border-t border-white/5">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-3xl font-black text-center mb-12">
                                    <span className="gradient-text">{t('t_a8cb7337')}</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {descriptionLines.map((line: string, i: number) => (
                                        <div key={i} className="glass-bg p-6 rounded-2xl flex items-start gap-4 hover:border-purple-500/30 transition-all group shimmer">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                                {i + 1}
                                            </div>
                                            <p className="text-white/70 font-medium leading-relaxed pt-1.5">{line}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Reviews */}
                    <section className="py-20 px-4 border-t border-white/5">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-black text-center mb-12">{t('t_1d610b18e')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { name: t('t_2e21a74'), city: t('t_7f75b30f'), text: t('t_18f554547') },
                                    { name: t('t_5b050f35'), city: t('t_5b762591'), text: t('t_6cf696be') },
                                    { name: t('t_2f0b609'), city: t('t_7d33f75'), text: t('t_2a3c1617a') },
                                ].map((r, i) => (
                                    <div key={i} className="glass-bg p-6 rounded-2xl flex flex-col gap-4">
                                        <div className="flex gap-0.5 text-amber-400 text-lg">★★★★★</div>
                                        <p className="text-white/60 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                                        <div className="mt-auto pt-4 border-t border-white/5">
                                            <p className="font-bold text-sm">{r.name}</p>
                                            <p className="text-xs text-white/30">{r.city}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Checkout */}
                    <section id="checkout-section" className="py-16 px-4 border-t border-white/5">
                        <div className="max-w-xl mx-auto">
                            <div className="glass-bg rounded-3xl overflow-hidden neon-glow">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-center py-5 px-6">
                                    <h2 className="text-xl font-black flex items-center justify-center gap-2">
                                        <span>��</span>  {t('t_d7ae9ea3')}
                                    </h2>
                                    <p className="text-white/70 text-sm mt-1">{t('t_98cf09e9')}</p>
                                </div>
                                <div className="p-6">
                                    <StorefrontCheckoutForm product={product} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/5 py-10 px-4 relative z-10">
                    <div className="max-w-6xl mx-auto text-center">
                        <p className="text-white/20 text-sm">{t('t_5a3d6ac1')}</p>
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

                {/* Mobile CTA */}
                <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-5 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent pointer-events-none md:hidden">
                    <div className="max-w-md mx-auto w-full pointer-events-auto flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-white/30">{t('t_59a3ca6e')}</span>
                            <span className="text-lg font-black">{product?.price || '0'}  {t('t_17422d')}</span>
                        </div>
                        <a href="#checkout-section" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl neon-glow flex items-center justify-center gap-2">
                            <span>��</span>  {t('t_3e032e93')}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
