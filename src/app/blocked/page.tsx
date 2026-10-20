"use client";

import React from 'react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { useRouter } from 'next/navigation';
import { useI18n } from "@/context/I18nContext";

export default function BlockedPage() {
    const { t } = useI18n();
    const router = useRouter();

    const handleLogout = async () => {
        await insforge.auth.signOut();
        router.push('/login');
    };

    return (
        <div dir="rtl" className="min-h-screen bg-[#F8F9FC] dark:bg-zinc-950 flex flex-col items-center justify-center p-4 font-cairo">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-red-100">
                <div className="bg-red-500 p-8 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white text-5xl">block</span>
                    </div>
                    <h1 className="text-2xl font-black text-white text-center tracking-tight">
                        
                        {t('t_17ab7a69')}
                    </h1>
                </div>
                
                <div className="p-8 text-center space-y-6">
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                        
                        {t('t_1d33b9741')}
                    </p>
                    
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-start gap-3 text-right">
                        <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
                        <span>{t('t_53d942c5')}</span>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button 
                            onClick={() => window.location.href = 'mailto:support@souqai.net'}
                            className="w-full bg-slate-900 text-white hover:bg-slate-800 transition-colors py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">support_agent</span>
                            
                            {t('t_1edc1ea9')}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="w-full bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            
                            {t('t_b1a8499')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
