'use client';
import React from 'react';
import Link from 'next/link';
import { useI18n } from "@/context/I18nContext";
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';

export default function StoreNotFoundTemplate(props: any) {
    const { t } = useI18n();
    return (
        <>
            
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary/30 selection:text-primary">

<div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
<div className="layout-container flex h-full grow flex-col relative z-10">
<div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
<div className="layout-content-container flex flex-col max-w-[1200px] flex-1 w-full">
<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-zinc-800 px-4 md:px-10 py-4 mb-8 md:mb-16 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
<div className="flex items-center gap-4 text-primary">
<div className="size-6 md:size-8">
<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
</svg>
</div>
<h2 className="text-slate-900 dark:text-white text-xl md:text-2xl font-bold leading-tight tracking-tight">SOUQ AI</h2>
</div>
<div className="hidden md:flex flex-1 justify-end gap-8">
<nav className="flex items-center gap-8">
<a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:text-slate-300 dark:hover:text-primary text-base font-semibold transition-colors" href="#">{t('t_88d00d26')}</a>
<a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:text-slate-300 dark:hover:text-primary text-base font-semibold transition-colors" href="#">{t('t_252280b9')}</a>
<a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:text-slate-300 dark:hover:text-primary text-base font-semibold transition-colors" href="#">{t('t_2ec2a06')}</a>
<a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:text-slate-300 dark:hover:text-primary text-base font-semibold transition-colors" href="#">{t('t_18249a')}</a>
</nav>
<button className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors aspect-square rounded-full size-12 flex items-center justify-center">
<span className="material-symbols-outlined">person</span>
</button>
</div>
<button className="md:hidden text-slate-900 dark:text-white">
<span className="material-symbols-outlined">menu</span>
</button>
</header>
<main className="flex flex-col px-4 py-8 md:py-16 flex-1 items-center justify-center relative">
<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
<div className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] opacity-50 mix-blend-screen animate-pulse duration-10000"></div>
</div>
<div className="flex flex-col items-center gap-8 md:gap-12 z-10 relative w-full max-w-4xl">
<div className="relative flex items-center justify-center">
<h1 className="text-[120px] md:text-[250px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary/80 to-primary/10 dark:from-white/10 dark:to-white/5 select-none" style={{"WebkitTextStroke":"2px rgba(233, 30, 99, 0.5)"}}>
        404
    </h1>
<div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] rounded-full mix-blend-overlay"></div>
</div>
<div className="flex max-w-[600px] flex-col items-center gap-4 md:gap-6 text-center">
<p className="text-slate-900 dark:text-white text-2xl md:text-4xl font-bold leading-tight tracking-tight">{t('t_1bfb88c67')}</p>
<p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-[500px]">{t('t_2982dd549')}</p>
</div>
<a className="group relative flex min-w-[200px] md:min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-xl md:rounded-2xl h-14 md:h-16 px-8 bg-gradient-to-r from-primary to-rose-600 text-white text-lg font-bold leading-normal tracking-wide shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/50" href="#">
<span className="relative z-10 flex items-center gap-3">
<span className="material-symbols-outlined text-2xl group-hover:-translate-x-1 transition-transform">arrow_forward</span>
    
    {t('t_7ba8da28')}
</span>
</a>
</div>
</main>
<footer className="flex flex-col gap-8 px-5 py-12 text-center mt-auto border-t border-slate-200 dark:border-zinc-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm rounded-t-3xl">
<div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
<a className="text-slate-500 dark:text-slate-400 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-base font-semibold transition-colors" href="#">{t('t_2508c749')}</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-base font-semibold transition-colors" href="#">{t('t_19a8405b6')}</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-base font-semibold transition-colors" href="#">{t('t_1d7a967b')}</a>
</div>
<div className="flex flex-wrap justify-center gap-6">
<a className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10 dark:text-slate-400 dark:hover:text-primary transition-all" href="#">
<span className="material-symbols-outlined">share</span>
</a>
<a className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10 dark:text-slate-400 dark:hover:text-primary transition-all" href="#">
<span className="material-symbols-outlined">mail</span>
</a>
<a className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10 dark:text-slate-400 dark:hover:text-primary transition-all" href="#">
<span className="material-symbols-outlined">chat</span>
</a>
</div>
<p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm font-medium">{t('t_1280c15d9')}</p>
</footer>
</div>
</div>
</div>
</div>

</div>

        </>
    );
}
