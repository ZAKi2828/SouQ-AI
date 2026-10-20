'use client';
import Sidebar from '@/components/Sidebar';
import TechTemplate from '@/components/templates/TechTemplate';
import FashionTemplate from '@/components/templates/FashionTemplate';
import PerfumeTemplate from '@/components/templates/PerfumeTemplate';
import FoodTemplate from '@/components/templates/FoodTemplate';
import SkincareTemplate from '@/components/templates/SkincareTemplate';
import DigitalTemplate from '@/components/templates/DigitalTemplate';
import DecorTemplate from '@/components/templates/DecorTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import BoldTemplate from '@/components/templates/BoldTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import FreshTemplate from '@/components/templates/FreshTemplate';
import LuxuryTemplate from '@/components/templates/LuxuryTemplate';
import SimpleTemplate from '@/components/templates/SimpleTemplate';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import { useI18n } from "@/context/I18nContext";
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';

export default function TemplatesDashboard() {
    const { t, lang } = useI18n();
    const { planExpired, currentPlan } = useExpiredPlanGuard();

    const dummyTechProduct = {
        name: t('t_a7384b88'),
        description: t('t_cd94f89a'),
        price: '15,900',
        imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000'
    };

    const dummyFashionProduct = {
        name: t('t_4fa9ad0b'),
        description: t('t_1c76ee197'),
        price: '8,500',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
    };

    const dummyPerfumeProduct = {
        name: t('t_c0777f9'),
        description: t('t_312984b35'),
        price: '22,500',
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800'
    };

    const dummyFoodProduct = {
        name: t('t_be9bb73e'),
        description: t('t_730b744a'),
        price: '850',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800'
    };

    const dummySkincareProduct = {
        name: t('t_8afb0044'),
        description: t('t_f42887c0'),
        price: '3,500',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800'
    };

    const dummyDigitalProduct = {
        name: t('t_ab6eff39'),
        description: t('t_2798106ee'),
        price: '9,900',
        imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000'
    };

    const dummyDecorProduct = {
        name: t('t_4e9b87db'),
        description: t('t_12b88fce8'),
        price: '125,000',
        imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000'
    };
    const dummyMinimalProduct = {
        name: t('t_2594fd977'),
        description: t('t_89c1318d'),
        price: '4,500',
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800'
    };

    const dummyBoldProduct = {
        name: t('t_d14fcd63'),
        description: t('t_174ad1a67'),
        price: '12,000',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000'
    };

    const dummyClassicProduct = {
        name: t('t_14ca4b0d4'),
        description: t('t_cfa08316'),
        price: '18,500',
        imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800'
    };

    const dummyElegantProduct = {
        name: t('t_6cca649c'),
        description: t('t_25e42a950'),
        price: '35,000',
        imageUrl: 'https://images.unsplash.com/photo-1599643478524-fb66f456c669?q=80&w=800'
    };

    const dummyFreshProduct = {
        name: t('t_12be05e63'),
        description: t('t_15df93c8e'),
        price: '5,500',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800'
    };

    const dummyLuxuryProduct = {
        name: t('t_14fe20071'),
        description: t('t_1fbe2ce1b'),
        price: '195,000',
        imageUrl: 'https://images.unsplash.com/photo-1587836374828-cb438786100f?q=80&w=800'
    };

    const dummySimpleProduct = {
        name: t('t_86cacf46'),
        description: t('t_b3ff71d2'),
        price: '299',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'
    };

    return (
        <>
            {planExpired && (
                <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
        /* Custom scrollbar for better UX */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
        }
    `}} />


            <div className="flex h-screen overflow-hidden text-[#181116] dark:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Templates" />

                <main className="relative flex flex-1 flex-col overflow-y-auto bg-[#F8F9FC] dark:bg-zinc-950 pt-16 md:pt-0">

                    <header className="sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-zinc-950/80 dark:bg-zinc-950/80 px-6 py-4 backdrop-blur-md">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t('t_80b5bbe8')}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('t_ec0f9403')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <StoreLinkButton />
                            <NotificationsDropdown />
                            <button className="flex items-center justify-center gap-2 bg-primary hover:bg-[#c22a99] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/30 transition-all hover:-translate-y-0.5">
                                <span className="material-symbols-outlined text-lg">add_circle</span>
                                
                                {t('t_17c4ea87')}
                            </button>
                        </div>
                    </header>

                    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Tech Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-10 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>

                                <div className="h-64 md:h-80 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 z-0"></div>
                                    {/* Abstract representation of tech template */}
                                    <div className="relative z-10 w-3/4 h-3/4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl flex flex-col p-4 gap-4 transform group-hover:scale-105 transition-transform duration-700">
                                        <div className="w-full flex justify-between items-center">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full bg-primary"></div>
                                            </div>
                                            <div className="w-24 h-2 bg-white/20 rounded-full"></div>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="w-32 h-32 rounded-full border-[8px] border-indigo-500/50 flex flex-col items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-white/80 rounded-full"></div>
                                                <div className="w-8 h-2 bg-white/40 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="w-full h-8 flex justify-center mt-auto">
                                            <div className="w-32 h-full bg-primary rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_120d1e0d5')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_26f4a8f36')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">devices</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-md">{t('t_202a41211')}</span>
                                        <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                                            
                                            {t('t_888e603')} <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Fashion Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-10 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>

                                <div className="h-64 md:h-80 w-full bg-[#f8f6f0] relative overflow-hidden flex items-center justify-center">
                                    {/* Live Fashion Template Preview */}
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl">
                                            <FashionTemplate product={dummyFashionProduct} />
                                        </div>
                                    </div>

                                    {/* Overlay blocker */}
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_881a057a')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_936528aa')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">styler</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-md">{t('t_e6fedf39')}</span>
                                        <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                                            
                                            {t('t_a7553363')} <span className="material-symbols-outlined text-[16px]">stars</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Perfume Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>

                                <div className="h-64 md:h-80 w-full bg-[#fcf9f5] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-amber-200 rounded-3xl shadow-2xl">
                                            <PerfumeTemplate product={dummyPerfumeProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_2650bbf4b')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_1608d3184')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">spa</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-md">{t('t_e6fedf39')}</span>
                                        <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                                            
                                            {t('t_4ffccd49')} <span className="material-symbols-outlined text-[16px]">diamond</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Food Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>

                                <div className="h-64 md:h-80 w-full bg-[#fff9f0] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-red-200 rounded-3xl shadow-2xl">
                                            <FoodTemplate product={dummyFoodProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_78cd2b6')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_1ee411b59')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">restaurant</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-md">{t('t_e6fedf39')}</span>
                                        <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                                            
                                            {t('t_71cb908c')} <span className="material-symbols-outlined text-[16px]">local_pizza</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Skincare Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>

                                <div className="h-64 md:h-80 w-full bg-[#fdfbf7] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-rose-200 rounded-3xl shadow-2xl">
                                            <SkincareTemplate product={dummySkincareProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_f48fa03b')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_2d3a4a61a')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">eco</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-md">{t('t_e6fedf39')}</span>
                                        <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                                            
                                            {t('t_8d83881e')} <span className="material-symbols-outlined text-[16px]">water_drop</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Digital Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>

                                <div className="h-64 md:h-80 w-full bg-[#0f172a] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-sky-400 rounded-3xl shadow-2xl">
                                            <DigitalTemplate product={dummyDigitalProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_1107d3d77')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_2269df9eb')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">menu_book</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-md">{t('t_e6fedf39')}</span>
                                        <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                                            
                                            {t('t_5ac8549e')} <span className="material-symbols-outlined text-[16px]">school</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Decor Template Card */}
                            <div className="col-span-1 lg:col-span-2 bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col md:flex-row h-full md:h-80">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>

                                <div className="h-64 md:h-full w-full md:w-1/2 lg:w-[60%] bg-[#faf9f6] relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-l border-[#e5dce3] dark:border-[#4a3b45]">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] lg:scale-[0.45] xl:scale-[0.5] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43] lg:group-hover:scale-[0.48] xl:group-hover:scale-[0.53]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-[#8c7d70] rounded-3xl shadow-2xl">
                                            <DecorTemplate product={dummyDecorProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>

                                <div className="p-6 md:p-10 flex flex-col flex-1 justify-center relative bg-white dark:bg-zinc-900">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8c7d70]/10 text-[#8c7d70] text-xs font-bold mb-3 md:mb-4 w-fit">
                                                
                                                {t('t_1051d8831')}
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">{t('t_2fd9f5a6')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 mt-2 md:mt-4 text-sm md:text-base leading-relaxed">
                                                
                                                {t('t_6c6101c9')}
                                            </p>
                                        </div>
                                        <div className="hidden md:flex w-14 h-14 rounded-full bg-[#f0ede6] dark:bg-[#8c7d70]/20 text-[#8c7d70] items-center justify-center shrink-0 shadow-inner">
                                            <span className="material-symbols-outlined text-[28px]">chair</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-md">{t('t_e6fedf39')}</span>
                                        <button className="text-[#8c7d70] font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                                            
                                            {t('t_5829aef5')} <span className="material-symbols-outlined text-[18px]">weekend</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            
                            {/* Minimal Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>
                                <div className="h-64 md:h-80 w-full bg-[#f9fafb] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl">
                                            <MinimalTemplate product={dummyMinimalProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_199c6601')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_327bf408')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">check_box_outline_blank</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bold Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>
                                <div className="h-64 md:h-80 w-full bg-[#111] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-amber-400 rounded-3xl shadow-2xl">
                                            <BoldTemplate product={dummyBoldProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_a544b817')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_35c3b05d')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">flash_on</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Classic Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>
                                <div className="h-64 md:h-80 w-full bg-[#f3f4f6] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-blue-200 rounded-3xl shadow-2xl">
                                            <ClassicTemplate product={dummyClassicProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_4431b7ec')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_10a600d07')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">inventory_2</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Elegant Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>
                                <div className="h-64 md:h-80 w-full bg-[#f8f5f1] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-[#d4c5b3] rounded-3xl shadow-2xl">
                                            <ElegantTemplate product={dummyElegantProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_1937f0bb')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_10daebbf7')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#f8f5f1] text-[#2d2926] border border-[#d4c5b3] flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">flare</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fresh Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>
                                <div className="h-64 md:h-80 w-full bg-[#ecfdf5] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-emerald-200 rounded-3xl shadow-2xl">
                                            <FreshTemplate product={dummyFreshProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_3d08062a')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_b6c93ddd')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">skateboarding</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Luxury Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                </div>
                                <div className="h-64 md:h-80 w-full bg-[#0c0b0a] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-[#c9a84c] rounded-3xl shadow-2xl">
                                            <LuxuryTemplate product={dummyLuxuryProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('t_f458e2d4')}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('t_15e85913')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#0c0b0a] text-[#c9a84c] border border-[#c9a84c]/20 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">diamond</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simple Template Card */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-3xl overflow-hidden shadow-sm  hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm  flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{t('t_2f1802b')}
                                    </span>
                                    <span className="bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm">جديد</span>
                                </div>
                                <div className="h-64 md:h-80 w-full bg-[#fafafa] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-0 left-0 w-[1200px] h-[900px] origin-top-left scale-[0.35] md:scale-[0.4] pointer-events-none transition-transform duration-700 group-hover:scale-[0.38] md:group-hover:scale-[0.43]">
                                        <div className="w-full h-full overflow-hidden bg-background-light border-[4px] border-blue-200 rounded-3xl shadow-2xl">
                                            <SimpleTemplate product={dummySimpleProduct} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-10 hover:bg-black/5 transition-colors"></div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t("t_2a7c523")}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t("t_f137593f")}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined">web</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coming Soon Card */}
                            <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 dark:border-primary/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm relative overflow-hidden">
                                <span className="absolute -right-10 -top-10 text-[150px] material-symbols-outlined text-primary/5 rotate-12 pointer-events-none">auto_awesome</span>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('t_e5d254b6')}</h2>
                                    <p className="text-slate-600 dark:text-slate-400 max-w-xl">
                                        
                                        {t('t_3aa4cec61')}
                                    </p>
                                </div>
                                <button className="shrink-0 bg-white dark:bg-zinc-950 border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors duration-300">
                                    
                                    {t('t_8a83c181')}
                                </button>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
