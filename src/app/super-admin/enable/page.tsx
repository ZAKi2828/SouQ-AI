"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

export default function EnableSuperAdmin() {
    const { t } = useI18n();
    const router = useRouter();
    const [status, setStatus] = useState(t('t_f70a1b1b'));

    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized } = useAdminGuard();

    useEffect(() => {
        if (!isAuthorized) return;
        setStatus(t('t_a58ec737'));
    }, [isAuthorized, t]);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950 text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div dir="rtl" className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-cairo">
            <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-xl shadow-primary/5 text-center max-w-md w-full border border-slate-100 dark:border-zinc-800">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
                </div>
                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">{t('t_5ef005c6')}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                    {status}
                </p>
                {status === t('t_f70a1b1b') && (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
