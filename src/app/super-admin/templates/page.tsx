"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

export default function SuperAdminTemplates() {
    const { t } = useI18n();
    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized } = useAdminGuard();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [templates, setTemplates] = useState<any[]>([]);

    const router = useRouter();

    useEffect(() => {
        if (!isAuthorized) return;
        const fetchData = async () => {
            try {
                // Fetch real templates from DB
                const { data: dbTemplates, error } = await insforge.database
                    .from('templates')
                    .select('*')
                    .order('created_at', { ascending: true });
                
                if (error) {
                    console.error("[Templates] Database query error:", error);
                }
                
                if (dbTemplates && dbTemplates.length > 0) {
                    // map them to UI state
                    setTemplates(dbTemplates.map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        category: t.category,
                        plan: t.plan,
                        isActive: t.is_active,
                        usersCount: t.users_count || 0,
                        image: t.image_url || 'https://placehold.co/800x400'
                    })));
                } else {
                    console.warn("[Templates] No templates returned from database. Data:", dbTemplates);
                }

            } catch (err) {
                console.error("Error loading templates dashboard:", err);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchData();
    }, [isAuthorized]);

    const handleToggleActive = async (id: any, currentStatus: boolean) => {
        // Optimistic UI update
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
        
        try {
            const { error } = await insforge.database
                .from('templates')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            
            if (error) {
                console.error("[Templates] Failed to update status:", error);
                // Revert optimistic update on failure
                setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: currentStatus } : t));
            }
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert optimistic update on failure
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: currentStatus } : t));
        }
    };

    const handleUpdatePlan = async (id: any, newPlan: string) => {
        const oldPlan = templates.find(t => t.id === id)?.plan;
        // Optimistic UI update
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, plan: newPlan } : t));
        
        try {
            const { error } = await insforge.database
                .from('templates')
                .update({ plan: newPlan })
                .eq('id', id);
            
            if (error) {
                console.error("[Templates] Failed to update plan:", error);
                // Revert optimistic update on failure
                if (oldPlan) setTemplates(prev => prev.map(t => t.id === id ? { ...t, plan: oldPlan } : t));
            }
        } catch (err) {
            console.error("Failed to update plan", err);
            if (oldPlan) setTemplates(prev => prev.map(t => t.id === id ? { ...t, plan: oldPlan } : t));
        }
    };

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
                    <Link href="/super-admin/templates" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
                        <span className="material-symbols-outlined">auto_awesome_motion</span>
                        <span className="font-semibold text-sm">{t('t_80b5bbe8')}</span>
                    </Link>
                    <Link href="/super-admin/ai" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">
                        <span className="material-symbols-outlined">psychology</span>
                        <span className="font-semibold text-sm">{t('t_f9fbb88e')}</span>
                    </Link>
                    <Link href="/super-admin/apps" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50">
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
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{t('t_377e5fdb')}</h2>
                    </div>
                    <div>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            
                            {t('t_44123e4d')}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-[1400px] w-full mx-auto">
                    {/* Metrics/Tabs can go here implicitly */}
                    <div className="mb-8 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-zinc-800 pb-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100 border-b-2 border-primary pb-4 -mb-[18px]">{t('t_5f4f3a8')}{templates.length})</span>
                        <span className="mx-4 text-slate-300">|</span>
                        <span className="cursor-pointer hover:text-slate-800 dark:text-slate-100 transition-colors">{t('t_a76a7c7d')}{templates.filter(t => t.isActive).length})</span>
                        <span className="mx-4 text-slate-300">|</span>
                        <span className="cursor-pointer hover:text-slate-800 dark:text-slate-100 transition-colors">{t('t_e6560005')}{templates.filter(t => !t.isActive).length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <div key={template.id} className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${template.isActive ? 'border-slate-200 dark:border-zinc-800 shadow-sm  hover:shadow-xl hover:-translate-y-1 hover:border-primary/30' : 'border-slate-200 dark:border-zinc-800 opacity-60 grayscale-[0.3]'}`}>
                                {/* Thumbnail */}
                                <div className="relative h-48 bg-slate-100 overflow-hidden group">
                                    <img src={template.image} alt={template.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    
                                    {!template.isActive && (
                                        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
                                            <span className="bg-black/80 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                                                
                                                {t('t_67e61f41')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Appears on hover */}
                                    {template.isActive && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                                            <button className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                                                
                                                {t('t_410ee66')}
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className={`px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-lg shadow-sm  border border-white/20 ${
                                            template.plan === t('t_15187dfac') ? 'text-amber-600' :
                                            template.plan === t('t_74dcec9f') ? 'text-primary' :
                                            'text-emerald-600'
                                        }`}>
                                            {template.plan}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 right-4">
                                        <span className="px-3 py-1 bg-black/60 backdrop-blur text-white text-xs font-bold rounded-lg shadow-sm  flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px]">storefront</span>
                                            {template.usersCount}  {t('t_2f180ca')}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{template.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{template.category} • Slug: <code className="bg-slate-100 px-1 rounded text-primary">{template.slug}</code></p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                                        {/* Status Toggle */}
                                        <label className="flex items-center cursor-pointer gap-2">
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only" 
                                                    checked={template.isActive}
                                                    onChange={() => handleToggleActive(template.id, template.isActive)}
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${template.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white dark:bg-zinc-900 w-4 h-4 rounded-full transition-transform ${template.isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{template.isActive ? t('t_5b4fc042') : t('t_2f1ba81')}</span>
                                        </label>

                                        {/* Plan Selector */}
                                        <div className="flex bg-slate-100 rounded-lg p-1">
                                            {[t('t_217db6d41'), t('t_74dcec9f'), t('t_15187dfac')].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => handleUpdatePlan(template.id, p)}
                                                    className={`px-3 py-1.5 text-[11px] font-bold rounded flex-1 transition-all shadow-none ${template.plan === p ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-100 shadow-sm ' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
