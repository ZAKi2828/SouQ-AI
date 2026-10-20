"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

// Define the apps and their default limits if not set in DB
const getAppsList = (t: any) => [
    { key: 'facebook', name: 'Facebook Pixel', type: 'number', description: t('t_21ba061c2') },
    { key: 'tiktok', name: 'TikTok Pixel', type: 'number', description: t('t_21ba061c2') },
    { key: 'snapchat', name: 'Snapchat Pixel', type: 'number', description: t('t_21ba061c2') },
    { key: 'google', name: 'Google Analytics 4', type: 'boolean', description: t('t_8cf822cd') },
    { key: 'gtm', name: 'Google Tag Manager', type: 'boolean', description: t('t_40ef10e8') },
    { key: 'fb_capi', name: 'Facebook Conversions API', type: 'boolean', description: t('t_584a4c35') },
    { key: 'tiktok_capi', name: 'TikTok Events API', type: 'boolean', description: t('t_584a4c35') },
    { key: 'webhook', name: 'Webhooks (Zapier/Make)', type: 'boolean', description: t('t_10a62201d') },
    { key: 'anti_fraud', name: 'SOUQ Security Shield', type: 'boolean', description: t('t_f8aae343') },
    { key: 'products_limit', name: t('t_64fadafd'), type: 'number', description: t('t_20836b8f4') },
    { key: 'orders_limit', name: t('t_8018e821'), type: 'number', description: t('t_1a8d7a24b') },
    { key: 'team_limit', name: t('t_1b1d71ab5'), type: 'number', description: t('t_68b5b4e2') },
];

export default function SuperAdminApps() {
    const { t } = useI18n();
    const APPS_LIST = getAppsList(t);
    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized } = useAdminGuard();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Default structure for plans
    const [appPlans, setAppPlans] = useState<Record<string, { free: number, pro: number, vip: number }>>({});

    const router = useRouter();

    useEffect(() => {
        if (!isAuthorized) return;
        const fetchData = async () => {
            try {
                // Fetch platform settings for app_plans
                const { data: settings } = await insforge.database
                    .from('platform_settings')
                    .select('app_plans')
                    .eq('id', 1)
                    .single();

                if (settings) {
                    // Initialize empty state based on APPS_LIST if db is empty
                    const initialAppPlans = settings.app_plans || {};
                    const formattedPlans: Record<string, { free: number, pro: number, vip: number }> = {};
                    
                    APPS_LIST.forEach(app => {
                        let defaultFree = app.type === 'boolean' ? 0 : 1;
                        let defaultPro = app.type === 'boolean' ? 1 : 5;
                        let defaultVip = app.type === 'boolean' ? 1 : 10;
                        
                        // Custom defaults for new limits
                        if (app.key === 'products_limit') { defaultFree = 10; defaultPro = 100; defaultVip = 10000; }
                        if (app.key === 'orders_limit') { defaultFree = 50; defaultPro = 500; defaultVip = 50000; }
                        if (app.key === 'team_limit') { defaultFree = 1; defaultPro = 3; defaultVip = 10; }

                        formattedPlans[app.key] = {
                            free: initialAppPlans[app.key]?.free !== undefined ? initialAppPlans[app.key].free : defaultFree,
                            pro: initialAppPlans[app.key]?.pro !== undefined ? initialAppPlans[app.key].pro : defaultPro,
                            vip: initialAppPlans[app.key]?.vip !== undefined ? initialAppPlans[app.key].vip : defaultVip,
                        };
                    });
                    
                    setAppPlans(formattedPlans);
                }

            } catch (err) {
                console.error("Error loading admin apps dashboard:", err);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchData();
    }, [isAuthorized]);

    const handleLimitChange = (appKey: string, plan: 'free' | 'pro' | 'vip', value: number) => {
        setAppPlans(prev => ({
            ...prev,
            [appKey]: {
                ...prev[appKey],
                [plan]: value
            }
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await insforge.database
                .from('platform_settings')
                .update({
                    app_plans: appPlans
                })
                .eq('id', 1);

            if (error) throw error;
            alert(t('t_561db95e'));
        } catch (error) {
            console.error(error);
            alert(t('t_88485002'));
        } finally {
            setIsSaving(false);
        }
    };

    // ...

    if (isAuthLoading || isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950 text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div dir="rtl" className="min-h-screen flex overflow-hidden bg-[#F8F9FC] dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-cairo">
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .active-nav-link {
          background: linear-gradient(90deg, rgba(233, 30, 99, 0.1) 0%, rgba(233, 30, 99, 0.05) 100%);
          border-right: 4px solid #E91E63;
          color: #E91E63;
        }
      `}} />

            {/* Sidebar */}
            <aside className={`w-72 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col h-screen z-50 transition-all ${isSidebarOpen ? '' : '-ml-72 hidden'}`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">SOUQ AI</span>
                    </div>
                </div>

                <div className="px-6 mb-6">
                    <div className="bg-pink-50 text-primary text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        SUPER ADMIN
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="font-semibold text-sm">{t('t_62962e62')}</span>
                    </Link>
                    <Link href="/super-admin/merchants" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">
                        <span className="material-symbols-outlined">storefront</span>
                        <span className="font-semibold text-sm">{t('t_252ebfd7')}</span>
                    </Link>
                    <Link href="/super-admin/billing" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="font-semibold text-sm">{t('t_6bb36ed2')}</span>
                    </Link>
                    <Link href="/super-admin/templates" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">
                        <span className="material-symbols-outlined">auto_awesome_motion</span>
                        <span className="font-semibold text-sm">{t('t_80b5bbe8')}</span>
                    </Link>
                    <Link href="/super-admin/ai" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">
                        <span className="material-symbols-outlined">psychology</span>
                        <span className="font-semibold text-sm">{t('t_f9fbb88e')}</span>
                    </Link>
                    <Link href="/super-admin/apps" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
                        <span className="material-symbols-outlined">extension</span>
                        <span className="font-semibold text-sm">{t('t_fa7e8d50')}</span>
                    </Link>
                    <div className="pt-4 pb-2 text-[11px] font-bold text-slate-400 px-4 uppercase tracking-widest">{t('t_2521d853')}</div>
                    <Link href="/super-admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="font-semibold text-sm">{t('t_df554a56')}</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col relative w-full pt-16 md:pt-0">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 dark:text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">menu_open</span>
                        </button>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{t('t_c6048ff1')}</h2>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-[#E91E63] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#D81B60] transition-all shadow-lg shadow-[#E91E63]/20 flex items-center gap-2 disabled:opacity-75"
                    >
                        {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                        
                        {t('t_1592155c4')}
                    </button>
                </header>

                <div className="p-8 max-w-[1200px] w-full mx-auto space-y-8">
                    
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-8 shadow-sm ">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-indigo-500 text-[24px]">view_list</span>
                                
                                {t('t_19bd209b6')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('t_10664e74a')}</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl hidden md:table">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-zinc-800">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 w-1/4 rounded-tr-2xl">{t('t_1133aa76')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 w-1/4">{t('t_217db6d41')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-blue-600 w-1/4">{t('t_74dcec9f')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-amber-600 w-1/4 rounded-tl-2xl">{t('t_a0d29bc5')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {APPS_LIST.map(app => (
                                        <tr key={app.key} className="hover:bg-slate-50 dark:bg-slate-800/50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-slate-800 dark:text-slate-100 text-[14px]">{app.name}</p>
                                                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">{app.description}</p>
                                            </td>
                                            {['free', 'pro', 'vip'].map((plan) => (
                                                <td key={plan} className="px-6 py-5">
                                                    {appPlans[app.key] && (
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={appPlans[app.key][plan as keyof typeof appPlans[string]]}
                                                                onChange={(e) => handleLimitChange(app.key, plan as 'free'|'pro'|'vip', parseInt(e.target.value) || 0)}
                                                                className={`w-full bg-white dark:bg-zinc-900 border ${plan === 'free' ? 'border-slate-200 dark:border-zinc-800 focus:border-slate-400 focus:ring-slate-400/20' : plan === 'pro' ? 'border-blue-200 focus:border-blue-500 focus:ring-blue-500/20' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500/20'} rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all text-sm font-bold text-center`}
                                                            />
                                                            {app.type === 'boolean' && (
                                                                <p className="text-[10px] text-center mt-1 text-slate-400">
                                                                    {appPlans[app.key][plan as 'free'|'pro'|'vip'] > 0 ? <span className="text-emerald-500">{t('t_2f1802b')}</span> : <span className="text-red-400">{t('t_2f1bfd3')}</span>}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-4">
                                {APPS_LIST.map(app => (
                                    <div key={app.key} className="bg-white dark:bg-zinc-900 border text-center border-slate-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm ">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{app.name}</p>
                                        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 mb-4">{app.description}</p>
                                        
                                        {appPlans[app.key] && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 w-1/3 text-right">{t('t_666a355e')}</label>
                                                    <input type="number" min="0" value={appPlans[app.key].free} onChange={(e) => handleLimitChange(app.key, 'free', parseInt(e.target.value) || 0)} className="w-2/3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-slate-400/20 outline-none" />
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-xs font-bold text-blue-600 w-1/3 text-right">{t('t_17e25f')}</label>
                                                    <input type="number" min="0" value={appPlans[app.key].pro} onChange={(e) => handleLimitChange(app.key, 'pro', parseInt(e.target.value) || 0)} className="w-2/3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-xs font-bold text-amber-600 w-1/3 text-right">{t('t_15187dfac')}</label>
                                                    <input type="number" min="0" value={appPlans[app.key].vip} onChange={(e) => handleLimitChange(app.key, 'vip', parseInt(e.target.value) || 0)} className="w-2/3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-amber-500/20 outline-none" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                    </div>

                </div>
            </main>
        </div>
    );
}
