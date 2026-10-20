'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StorefrontCheckoutForm from '@/components/StorefrontCheckoutForm';
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';
import ImageGallery from '@/components/ImageGallery';
import ProductOptionsSelector from '@/components/ProductOptionsSelector';
import { useI18n } from "@/context/I18nContext";

export default function TechTemplate({ product }: { product?: any }) {
    const { t } = useI18n();
    // This is a template component that will accept dynamic product data later

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        body {
            font-family: 'Cairo', sans-serif;
        }
        .glass-nav {
            background: rgba(2, 6, 23, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .glass-card {
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .text-gradient {
            background: linear-gradient(to right, #ffffff, #93c5fd);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    \n`}} />
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-x-hidden min-h-screen flex flex-col">


                <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex navbar-container items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            {product?.logoUrl && product?.hide_branding ? (
                                <img src={product.logoUrl} alt={product?.storeName || 'Store Logo'} className="h-8 md:h-10 object-contain" />
                            ) : product?.hide_branding ? (
                                <h1 className="text-black dark:text-white text-xl font-black tracking-wide font-display">{product?.storeName}</h1>
                            ) : (
                                <>
                                    <div className="size-8 text-primary">
                                        <span className="material-symbols-outlined !text-[32px]">watch</span>
                                    </div>
                                    <h1 className="text-white text-xl font-black tracking-wide font-display">SOUQ AI</h1>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                <main className="flex-grow pt-20">

                    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 px-6">

                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>
                        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

                            <div className="flex flex-col gap-6 lg:gap-8 order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark border border-slate-700 w-fit">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-xs font-bold text-primary tracking-wide">{t('t_113c657dd')}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-black dark:text-white font-display">
                                    <span className="text-black dark:text-white drop-shadow-md">{product?.name || t('t_a7384b88')}</span>
                                </h1>
                                <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl">
                                    {product?.description || t('t_3b2f1c8e8')}
                                </p>
                                    <StorefrontFakeReviews product={product} />
                                    <ProductOptionsSelector options={product?.options} variant="tech" />
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-4">
                                    <div className="flex flex-col">
                                        {product?.compareAtPrice && <span className="text-sm text-slate-400 line-through">{product.compareAtPrice}  {t('t_17422d')}</span>}
                                        <span className="text-3xl font-bold text-white">{product?.price || '15,900'}  {t('t_17422d')}</span>
                                    </div>
                                    <a href="#checkout-section" className="bg-primary hover:bg-blue-600 text-white text-base md:text-lg font-bold h-14 px-10 rounded-xl transition-all shadow-neon-strong hover:shadow-neon hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center animate-attention">
                                        <span>{t('t_a4b13862')}</span>
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </a>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                                    <div className="flex -space-x-2 space-x-reverse">
                                        <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-slate-700 bg-cover bg-center" data-alt="User avatar 1" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxKKQwCewKSjdIr044WJilW70qMfu44JZ52leM6vqSaLNF1B6z4SERiH6xue_16eRs8tPa8SxVrCqTQADyYyzBbjUEHb9xvJxs-UGIJefFPk7LaJmT-K_T721YHxS2r0AzZuG2jc39JUZN2PGYQqBsuVbIbGKfb0e-64s4BDgj6Wb3y000Za73p6sjn1L-sW0hxHFPlB981Aj8BKxN2x8AmcTiIiMBINrqqPM-D_OKE9eb9pSf5-9TFqA98UaoGiV61OjX_oel_eQI')" }}></div>
                                        <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-slate-700 bg-cover bg-center" data-alt="User avatar 2" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMRA0FRMlZjRW9sPue_VsfUNAb_5XpBr8GKl7J1So7PjZkBLCd7HhiYEkGzwU2O2fPMhbH3Z3NvMOgST4W5KDA43n1P0-HKGggvOVq4N_THn2wqKPtjUeI7B-JiEsbweOr0bbDFOqS4u7IXQT99RTSLyiHlfVoUDBjiOCrrGjz5f2ssqG7_8zooVOsAEPlCHgY5tNlj-1Yie3oMlNzEir7xqFZpoz1Xw6P_F4KznqnRMAamZYUunrJe161ZqK3lODfkBrWrSvWzM7y')" }}></div>
                                        <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-slate-700 bg-cover bg-center" data-alt="User avatar 3" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCAgbq0EcKLrSZT6CodoNZvIWQJ_EKO7I9iT-kiMpoGH-BeJkDPYkjK0NVDokcWSCT6J7R3UN-V1SKa1oVuRKU8IDlJ4mVb28tqwcBIDbgjKYvhzSfM6T94dR1e-roLJISWzSxm1zQI6mKpHpshU7cf4-QmWA5nJ9TWz8w1h8anhnIu7JGVZZvcvuk61oOiU3B61VB3diPCl6G106sQLvPrci8I1-oGHQ_ZVYGABNHaLwYHqsFBaSe0tVUf-4HsEXeP79r85Npq5OC0')" }}></div>
                                    </div>
                                    <p>{t('t_20521eadf')}</p>
                                </div>
                            </div>

                            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
                                <div className="relative z-10 w-full max-w-[500px]">
                                    <ImageGallery
                                        images={product?.images || []}
                                        mainImage={product?.imageUrl || '/images/tech_product.png'}
                                        productName={product?.name || 'Product'}
                                        variant="dark"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="bg-surface-dark border-y border-slate-800 py-6">
                        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center justify-center gap-4 text-slate-300">
                                <div className="p-3 bg-slate-800/50 rounded-full text-primary">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{t('t_21690263')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('t_107623342')}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-slate-300">
                                <div className="p-3 bg-slate-800/50 rounded-full text-primary">
                                    <span className="material-symbols-outlined">local_shipping</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{t('t_151b71768')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('t_a5ed1777')}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-slate-300">
                                <div className="p-3 bg-slate-800/50 rounded-full text-primary">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{t('t_addbc04b')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('t_1dfcb6ce6')}</p>
                                </div>
                            </div>
                        </div>
                    </div>





                    <section className="py-24 px-6 relative bg-background-dark border-t border-slate-800">
                        <div className="max-w-4xl mx-auto">
                            <StorefrontCheckoutForm product={product} />
                        </div>
                    </section>

                </main>

                <footer className="bg-background-dark border-t border-slate-800 pt-16 pb-32 md:pb-16">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                            {product?.hide_branding ? (
                                <h2 className="text-white text-2xl font-black tracking-wide font-display">{product?.storeName}</h2>
                            ) : (
                                <div className="flex items-center gap-3 text-white">
                                    <div className="size-8 text-primary">
                                        <span className="material-symbols-outlined !text-[32px]">watch</span>
                                    </div>
                                    <h2 className="text-white text-2xl font-black tracking-wide font-display">SOUQ AI</h2>
                                </div>
                            )}
                            <div className="flex gap-6 text-slate-400">
                                <a className="hover:text-primary" href="#"><span className="material-symbols-outlined">social_leaderboard</span></a>
                                <a className="hover:text-primary" href="#"><span className="material-symbols-outlined">camera_alt</span></a>
                                <a className="hover:text-primary" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 pt-8 text-center text-slate-500 dark:text-slate-400 text-sm">{t("t_bdfd47")}</div>
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

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/90 backdrop-blur-lg border-t border-slate-800 z-50 md:hidden">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            {product?.compareAtPrice && <span className="text-slate-400 text-xs line-through">{product.compareAtPrice}  {t('t_17422d')}</span>}
                            <span className="text-white font-bold text-lg">{product?.price || '15,900'}  {t('t_17422d')}</span>
                        </div>
                        <a href="#checkout-section" className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-neon flex items-center justify-center gap-2">
                            <span>{t('t_3e032e93')}</span>
                            <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        </a>
                    </div>
                </div>

            </div>

        </>
    );
}
