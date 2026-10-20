'use client';
import React from 'react';
import Link from 'next/link';
import { useI18n } from "@/context/I18nContext";
import StorefrontFakeReviews from '@/components/StorefrontFakeReviews';

export default function OrderSuccessTemplate(props: any) {
    const { t } = useI18n();
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
        body {
            font-family: 'Cairo', sans-serif;
        }
        .material-symbols-outlined {
            font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
        }
    
`}} />
            <div className="bg-background-light text-slate-dark antialiased min-h-screen flex flex-col">


<header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800/30">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-20">

<div className="flex items-center gap-12">
<a className="flex items-center gap-3 group" href="#">
<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
<span className="material-symbols-outlined text-2xl">shopping_bag</span>
</div>
<h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('t_1088c145')}</h1>
</a>

<nav className="hidden md:flex items-center gap-8">
<a className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium text-sm transition-colors" href="#">{t('t_88d00d26')}</a>
<a className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium text-sm transition-colors" href="#">{t('t_252280b9')}</a>
<a className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium text-sm transition-colors" href="#">{t('t_b606e80')}</a>
<a className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium text-sm transition-colors" href="#">{t('t_1d7a967b')}</a>
</nav>
</div>

<div className="flex items-center gap-4">

<div className="hidden lg:flex items-center bg-gray-50 dark:bg-zinc-900/50 rounded-xl px-4 py-2.5 w-64 border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:bg-zinc-900 transition-all">
<span className="material-symbols-outlined text-gray-400 text-xl ml-2">search</span>
<input className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-slate-700 dark:text-slate-300 p-0 focus:ring-0" placeholder={t('t_56e39c79')} type="text"/>
</div>
<button className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-[#334155] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors relative">
<span className="material-symbols-outlined text-xl">shopping_cart</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
</button>
<button className="hidden sm:flex px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-slate-900/10">
                        
                        {t('t_b1a1b65')}
                    </button>
</div>
</div>
</div>
</header>

<main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
<div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl"></div>
<div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-blue-50 rounded-full blur-3xl"></div>
</div>
<div className="w-full max-w-3xl flex flex-col items-center gap-10">

<div className="text-center flex flex-col items-center gap-6 animate-fade-in-up">
<div className="relative">
<div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-glow mb-4">
<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
<span className="material-symbols-outlined text-white text-4xl font-bold">check</span>
</div>
</div>

<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-primary/20 rounded-full -z-10 animate-ping" style={{"animationDuration":"3s"}}></div>
</div>
<div className="space-y-3">
<h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        
                        {t('t_108a0c24e')}
                    </h2>
<p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                        
                        {t('t_570418a8')}
                    </p>
</div>
</div>

<div className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-1 shadow-soft overflow-hidden">
<div className="relative rounded-[20px] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-10 text-white">

<div className="absolute inset-0 opacity-10" style={{"backgroundImage":"radial-gradient(#ffffff 1px, transparent 1px)","backgroundSize":"24px 24px"}}></div>
<div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
<div className="flex flex-col gap-4">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 w-fit">
<span className="material-symbols-outlined text-primary text-sm">inventory_2</span>
<span className="text-xs font-medium text-gray-200">{t('t_b50a59d3')}</span>
</div>
<div>
<p className="text-slate-400 text-sm font-medium mb-1">{t('t_943038da')}</p>
<h3 className="text-3xl font-bold tracking-wider font-mono text-white">#ORD-98432</h3>
</div>
<p className="text-slate-300 text-base max-w-md leading-relaxed mt-2">
                                
                                {t('t_16bfe95cf')}
                            </p>
</div>

<div className="hidden sm:block w-32 h-32 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden shrink-0">
<img alt={t('t_1de261575')} className="w-full h-full object-cover opacity-80 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2X4b-uj7Gr9RadVwo6A-uNBHtL0pJ_FPuDsryvlB1RIE6idrZUdFWGiiIbxq9tYLwnQdnuuEz04cx0FLybvzfRe2td0VOryk8lWW0GZ7PTw5yAszinOb6bNu5fLBSxvmGGBk6L0QB5J4P-yzxDaOFVBEqxhpArzrArFKXlNugtLQKygSomzx6503VjBVYZJubcOlS1DbouWyqWULz20hBsgBuIZ-mUQ7ociLOR_p4V7aYS6aFN8lQ2BYbAN1T4elkWkidv80Tk_Tj"/>
</div>
</div>
</div>

<div className="bg-white dark:bg-zinc-900 px-6 py-6 sm:px-10 border-t border-gray-50">
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-gray-100 dark:divide-gray-700/30">

<div className="flex items-center justify-center sm:justify-start gap-4 pt-4 sm:pt-0">
<div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
<span className="material-symbols-outlined">verified_user</span>
</div>
<div className="flex flex-col text-right">
<span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('t_2cb0ef5e')}</span>
<span className="text-xs text-slate-500 dark:text-slate-400">{t('t_e81a2d15')}</span>
</div>
</div>

<div className="flex items-center justify-center sm:justify-center gap-4 pt-4 sm:pt-0 px-4">
<div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
<span className="material-symbols-outlined">local_shipping</span>
</div>
<div className="flex flex-col text-right">
<span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('t_b70da944')}</span>
<span className="text-xs text-slate-500 dark:text-slate-400">{t('t_d301a50')}</span>
</div>
</div>

<div className="flex items-center justify-center sm:justify-end gap-4 pt-4 sm:pt-0">
<div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
<span className="material-symbols-outlined">payments</span>
</div>
<div className="flex flex-col text-right">
<span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('t_8c4b14b8')}</span>
<span className="text-xs text-slate-500 dark:text-slate-400">{t('t_591e3f82')}</span>
</div>
</div>
</div>
</div>
</div>

<div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
<button className="w-full sm:w-auto min-w-[200px] h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg shadow-slate-900/20 group">
<span>{t('t_f4014ae4')}</span>
<span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
</button>
<button className="w-full sm:w-auto min-w-[200px] h-14 bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 hover:border-primary/50 text-slate-700 dark:text-slate-300 hover:text-primary rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all">
<span>{t('t_65697d1')}</span>
<span className="material-symbols-outlined">location_on</span>
</button>
</div>
</div>
</main>

<footer className="py-8 text-center border-t border-gray-100 dark:border-zinc-800/30 bg-white dark:bg-zinc-900">
<p className="text-slate-400 text-sm">
            
            {t('t_1b5fd14a4')}
        </p>
</footer>

</div>

        </>
    );
}
