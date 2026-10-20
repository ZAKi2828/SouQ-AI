"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

export default function SuperAdminSettings() {
    const { t } = useI18n();
    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized } = useAdminGuard();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);
    
    // Tabs state: 'general', 'roles', 'integrations'
    const [activeTab, setActiveTab] = useState('general');

    // General Settings State
    const [platformName, setPlatformName] = useState('SOUQ AI');
    const [allowRegistration, setAllowRegistration] = useState(true);
    const [proPrice, setProPrice] = useState('15');
    const [vipPrice, setVipPrice] = useState('45');
    const [commissionRate, setCommissionRate] = useState('0');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [customDomainPlans, setCustomDomainPlans] = useState({ vip: true, pro: false, free: false });

    // Branding State
    const [brandingStores, setBrandingStores] = useState<any[]>([]);
    const [brandingLoading, setBrandingLoading] = useState(false);

    // Roles & Staff State (Mock Data)
    const [staff, setStaff] = useState([
        { id: 1, name: t('t_51304def'), email: 'ahmed@souqai.net', role: t('t_c447b2d9'), status: t('t_185349') },
        { id: 2, name: t('t_b43504ba'), email: 'sara@souqai.net', role: t('t_caba1ff4'), status: t('t_185349') },
        { id: 3, name: t('t_6e6da3e'), email: 'karim@souqai.net', role: t('t_128086c0'), status: t('t_5b4c9738') },
    ]);

    // Integrations State
    const [openAiKey, setOpenAiKey] = useState('sk-proj-************************************');
    const [geminiKey, setGeminiKey] = useState('AIzaSyC**************************');
    const [stripeKey, setStripeKey] = useState('sk_live_***********************************');
    const [resendKey, setResendKey] = useState('');

    const router = useRouter();

    useEffect(() => {
        if (!isAuthorized) return;
        const fetchSettings = async () => {
            try {
                // Fetch platform settings
                const { data: settings } = await insforge.database
                    .from('platform_settings')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (settings) {
                    setPlatformName(settings.platform_name || 'SOUQ AI');
                    setAllowRegistration(settings.allow_registration ?? true);
                    setProPrice(settings.pro_price?.toString() || '15');
                    setVipPrice(settings.vip_price?.toString() || '45');
                    setCommissionRate(settings.commission_rate?.toString() || '0');
                    if (settings.openai_key) setOpenAiKey(settings.openai_key);
                    if (settings.gemini_key) setGeminiKey(settings.gemini_key);
                    if (settings.stripe_key) setStripeKey(settings.stripe_key);
                    if (settings.resend_key) setResendKey(settings.resend_key);
                    if (settings.whatsapp_number) setWhatsappNumber(settings.whatsapp_number);
                    if (settings.custom_domain_plans) setCustomDomainPlans(settings.custom_domain_plans);
                }

            } catch (err) {
                console.error("Error loading settings:", err);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchSettings();
    }, [isAuthorized]);

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await insforge.database
                .from('platform_settings')
                .update({
                    platform_name: platformName,
                    allow_registration: allowRegistration,
                    pro_price: Number(proPrice),
                    vip_price: Number(vipPrice),
                    commission_rate: Number(commissionRate),
                    whatsapp_number: whatsappNumber,
                    custom_domain_plans: customDomainPlans,
                })
                .eq('id', 1);
            if (error) throw error;
            alert('تم حفظ الإعدادات بنجاح');
        } catch (err: any) {
            console.error('Save error:', err);
            alert('Error:' + (err?.message || ''));
        }
    };

    const handleSaveIntegrations = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await insforge.database
                .from('platform_settings')
                .update({
                    openai_key: openAiKey,
                    gemini_key: geminiKey,
                    stripe_key: stripeKey,
                    resend_key: resendKey,
                })
                .eq('id', 1);
            if (error) throw error;
            alert('تم حفظ المفاتيح بنجاح');
        } catch (err: any) {
            console.error('Save error:', err);
            alert('Error:' + (err?.message || ''));
        }
    };

    const loadBrandingStores = async () => {
        setBrandingLoading(true);
        try {
            // Fetch stores with their branding info
            const { data: storesData, error: storesError } = await insforge.database
                .from('stores')
                .select('id, user_id, store_name, store_domain, hide_branding')
                .order('created_at', { ascending: false });
            if (storesError) throw storesError;

            // Fetch profiles for plan info
            const { data: profilesData } = await insforge.database
                .from('profiles')
                .select('id, plan, is_paid');

            const profileMap: Record<string, any> = {};
            (profilesData || []).forEach((p: any) => { profileMap[p.id] = p; });

            const merged = (storesData || []).map((s: any) => ({
                id: s.id,
                user_id: s.user_id,
                store_name: s.store_name,
                store_domain: s.store_domain,
                hide_branding: s.hide_branding,
                plan: profileMap[s.user_id]?.plan || 'free',
                is_paid: profileMap[s.user_id]?.is_paid || false,
            }));

            setBrandingStores(merged);
        } catch (err) {
            console.error('Error loading stores:', err);
        } finally {
            setBrandingLoading(false);
        }
    };

    const toggleBranding = async (storeId: string, currentHide: boolean) => {
        try {
            const { error } = await insforge.database
                .from('stores')
                .update({ hide_branding: !currentHide })
                .eq('id', storeId);
            if (error) throw error;
            setBrandingStores(prev => prev.map(s => s.id === storeId ? { ...s, hide_branding: !currentHide } : s));
        } catch (err) {
            console.error('Error toggling branding:', err);
        }
    };

    if (isAuthLoading || isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950 text-indigo-600">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
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
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
          border-right: 4px solid #4f46e5;
          color: #4f46e5;
        }
      `}} />

            {/* Sidebar */}
            <aside className={`w-72 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col h-screen z-50 transition-all ${isSidebarOpen ? '' : '-ml-72 hidden'}`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">SOUQ AI</span>
                    </div>
                </div>

                <div className="px-6 mb-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></span>
                        SUPER ADMIN
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="font-semibold text-sm">{t('t_62962e62')}</span>
                    </Link>
                    <Link href="/super-admin/merchants" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">storefront</span>
                        <span className="font-semibold text-sm">{t('t_252ebfd7')}</span>
                    </Link>
                    <Link href="/super-admin/billing" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="font-semibold text-sm">{t('t_6bb36ed2')}</span>
                    </Link>
                    <Link href="/super-admin/templates" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">auto_awesome_motion</span>
                        <span className="font-semibold text-sm">{t('t_80b5bbe8')}</span>
                    </Link>
                    <Link href="/super-admin/ai" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">psychology</span>
                        <span className="font-semibold text-sm">{t('t_f9fbb88e')}</span>
                    </Link>
                    <Link href="/super-admin/apps" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">extension</span>
                        <span className="font-semibold text-sm">{t('t_fa7e8d50')}</span>
                    </Link>
                    <div className="pt-4 pb-2 text-[11px] font-bold text-slate-400 px-4 uppercase tracking-widest">{t('t_2521d853')}</div>
                    <Link href="/super-admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="font-semibold text-sm">{t('t_df554a56')}</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col relative w-full pt-16 md:pt-0">
                {/* Header */}
                <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">menu_open</span>
                        </button>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{t('t_1b4491775')}</h2>
                    </div>
                    <ThemeToggle className="bg-slate-100 dark:bg-slate-800 border-none" />
                </header>

                <div className="p-8 max-w-[1200px] w-full mx-auto space-y-8">
                    
                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 p-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm  w-fit inline-flex flex-wrap">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700 shadow-sm ' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                            
                            {t('t_1be3e254')}
                        </button>
                        <button
                            onClick={() => setActiveTab('branding')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'branding' ? 'bg-pink-50 text-pink-700 shadow-sm ' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">branding_watermark</span>
                            
                            {t('t_55819f85')}
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'roles' ? 'bg-emerald-50 text-emerald-700 shadow-sm ' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">shield_person</span>
                            
                            {t('t_4b1acde8')}
                        </button>
                        <button
                            onClick={() => setActiveTab('integrations')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'integrations' ? 'bg-amber-50 text-amber-700 shadow-sm ' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">key</span>
                            
                            {t('t_177d0d96')}
                        </button>
                    </div>

                    {/* Tab 1: General Settings */}
                    {activeTab === 'general' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-8 shadow-sm  animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500">store</span>
                                
                                {t('t_c163b75a')}
                            </h3>
                            <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl">
                                
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Platform Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('t_1af95250c')}</label>
                                        <input 
                                            type="text" 
                                            value={platformName}
                                            onChange={(e) => setPlatformName(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                                        />
                                    </div>
                                    {/* Registration Toggle */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('t_5a7a44fb')}</label>
                                        <div className="flex items-center h-[50px]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={allowRegistration} onChange={() => setAllowRegistration(!allowRegistration)} />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white dark:bg-zinc-900 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                                <span className="mr-3 text-sm font-bold text-slate-600 dark:text-slate-400">{allowRegistration ? t('t_4bb728ab') : t('t_3f640268')}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-zinc-800 my-8" />

                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg inline-block">{t('t_83df9bb2')}</h4>
                                
                                <div className="grid grid-cols-3 gap-6">
                                    {/* Pro Price */}
                                    <div>
                                        <label className="block text-sm font-bold text-primary mb-2">{t('t_8c628b98')}</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={proPrice}
                                                onChange={(e) => setProPrice(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold text-left"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{t('t_17422d')}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 mr-1">{t('t_7c9dc093')}</p>
                                    </div>
                                    {/* التاجر المحترف Price */}
                                    <div>
                                        <label className="block text-sm font-bold text-amber-600 mb-2">{t('t_1b5c68b39')}</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={vipPrice}
                                                onChange={(e) => setVipPrice(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-bold text-left"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{t('t_17422d')}</span>
                                        </div>
                                    </div>
                                    {/* Commission */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('t_a68912d7')}</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={commissionRate}
                                                onChange={(e) => setCommissionRate(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-left"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 mr-1">{t('t_3e35ea48')}</p>
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-zinc-800 my-8" />

                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500 text-[18px]">public</span>
                                    صلاحية النطاق المخصص (Custom Domain)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={customDomainPlans.vip} onChange={(e) => setCustomDomainPlans(prev => ({ ...prev, vip: e.target.checked }))} className="peer sr-only" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white dark:after:bg-zinc-900 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("t_129ce7a2")}</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={customDomainPlans.pro} onChange={(e) => setCustomDomainPlans(prev => ({ ...prev, pro: e.target.checked }))} className="peer sr-only" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white dark:after:bg-zinc-900 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("t_1e76266")}</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={customDomainPlans.free} onChange={(e) => setCustomDomainPlans(prev => ({ ...prev, free: e.target.checked }))} className="peer sr-only" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white dark:after:bg-zinc-900 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("t_c40840f6")}</span>
                                    </label>
                                </div>

                                <hr className="border-slate-100 dark:border-zinc-800 my-8" />

                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#25D366"><path d="M12.031 2.052c-5.592 0-10.131 4.539-10.131 10.131 0 1.776.459 3.513 1.343 5.048l-1.444 5.275 5.397-1.415c1.474.808 3.149 1.233 4.835 1.233v.001c5.589-.001 10.132-4.54 10.132-10.132 0-2.71-1.055-5.257-2.971-7.173a10.082 10.082 0 0 0-7.161-2.968z"/></svg>
                                    دعم الواتساب
                                </h4>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t("t_f2ff006d")}</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                placeholder="213XXXXXXXXX"
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-bold text-left"
                                                dir="ltr"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 mr-1">{t("t_c8e4303a")}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {whatsappNumber && (
                                            <a 
                                                href={`https://wa.me/${whatsappNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#128C7E] transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.031 2.052c-5.592 0-10.131 4.539-10.131 10.131 0 1.776.459 3.513 1.343 5.048l-1.444 5.275 5.397-1.415c1.474.808 3.149 1.233 4.835 1.233v.001c5.589-.001 10.132-4.54 10.132-10.132 0-2.71-1.055-5.257-2.971-7.173a10.082 10.082 0 0 0-7.161-2.968z"/></svg>
                                                اختبار الرقم
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        
                                        {t('t_b00ceca4')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab: Branding */}
                    {activeTab === 'branding' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Info Card */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-8 shadow-sm ">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-pink-500">branding_watermark</span>
                                    
                                    {t('t_1ce325de7')}
                                </h3>

                                <div className="bg-gradient-to-r from-pink-50 to-indigo-50 rounded-2xl p-6 border border-pink-100 mb-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 shadow-sm  flex items-center justify-center shrink-0">
                                            <img src="/logo.png" alt="SOUQ AI" className="h-7 object-contain" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{t('t_8e2b21e7')}</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                
                                                {t('t_1d48d364f')} <strong className="text-pink-600">{t('t_17e25f')}</strong>  {t('t_c485')} <strong className="text-amber-600">{t('t_15187dfac')}</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Plan Rules */}
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg inline-block">{t('t_16417991d')}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 dark:text-slate-400 text-sm font-bold"></span>
                                            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('t_217db6d41')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                                            
                                            {t('t_1153a1a72')}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">{t('t_4c5e34349')}</p>
                                    </div>
                                    <div className="border border-pink-200 bg-pink-50/30 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-bold">⭐</span>
                                            <span className="font-bold text-pink-700 text-sm">{t('t_74dcec9f')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-pink-600 text-xs font-bold">
                                            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                                            
                                            {t('t_bbc8d655')}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">{t('t_15e97ff6d')}</p>
                                    </div>
                                    <div className="border border-amber-200 bg-amber-50/30 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-sm font-bold"></span>
                                            <span className="font-bold text-amber-700 text-sm">{t('t_bae4664e')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
                                            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                                            
                                            {t('t_bbc8d655')}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">{t('t_206cfaaa6')}</p>
                                    </div>
                                </div>

                                {/* Where it appears */}
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg inline-block">{t('t_b54bd84')}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-slate-800/50/50">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">storefront</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('t_44a850bb')}</p>
                                            <p className="text-[10px] text-slate-400">{t('t_4be098c6')}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-emerald-500 mr-auto">check_circle</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-slate-800/50/50">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">web</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('t_15f9f3805')}</p>
                                            <p className="text-[10px] text-slate-400">{t('t_18b7279bb')}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-emerald-500 mr-auto">check_circle</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stores Management */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm ">
                                <div className="p-8 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">manage_accounts</span>
                                        
                                        {t('t_89f3130d')}
                                    </h3>
                                    <button 
                                        onClick={loadBrandingStores}
                                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                                        
                                        {t('t_10535fe66')}
                                    </button>
                                </div>

                                {brandingStores.length === 0 ? (
                                    <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">storefront</span>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('t_270b1b0c6')}</p>
                                        <p className="text-xs text-slate-400">{t('t_2dafed3fb')}</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-slate-800/50/50">
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400">{t('t_252280b9')}</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400">{t('t_252ba3de')}</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400">{t('t_59a3b763')}</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400">{t('t_76872f7d')}</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 text-center">{t('t_2e548e5')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {brandingStores.map(store => (
                                                    <tr key={store.id} className="hover:bg-slate-50 dark:bg-slate-800/50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ">
                                                                    {(store.store_name || 'M')[0]}
                                                                </div>
                                                                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{store.store_name || t('t_519cd782')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">{store.store_domain || '—'}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                store.plan === t('t_15187dfac') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                                store.plan === t('t_74dcec9f') || store.is_paid ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                                                                'bg-slate-100 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-800'
                                                            }`}>
                                                                {store.plan === t('t_15187dfac') ? t('t_1d07d01c0') : store.plan === t('t_74dcec9f') || store.is_paid ? t('t_b0421891') : t('t_2e015ad8')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`flex items-center gap-1.5 text-xs font-bold ${store.hide_branding ? 'text-red-500' : 'text-emerald-600'}`}>
                                                                <span className="material-symbols-outlined text-[14px]">{store.hide_branding ? 'visibility_off' : 'visibility'}</span>
                                                                {store.hide_branding ? t('t_2f19272') : t('t_2f3fe78')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center">
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="sr-only peer" 
                                                                        checked={!store.hide_branding}
                                                                        onChange={() => toggleBranding(store.id, store.hide_branding)}
                                                                    />
                                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white dark:bg-zinc-900 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                                </label>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Roles & Staff */}
                    {activeTab === 'roles' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm  animate-in fade-in duration-300 flex flex-col">
                            <div className="p-8 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">admin_panel_settings</span>
                                    
                                    {t('t_f180471f')}
                                </h3>
                                <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    
                                    {t('t_6c8911f5')}
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto p-2">
                                <table className="w-full text-right bg-white dark:bg-zinc-900">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-zinc-800">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400">{t('t_465ca4b1')}</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400">{t('t_7b3e0c35')}</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400">{t('t_252d7204')}</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 text-center">{t('t_1309b359')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {staff.map(member => (
                                            <tr key={member.id} className="hover:bg-slate-50 dark:bg-slate-800/50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{member.name}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold ${member.role === t('t_c447b2d9') ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${member.status === t('t_185349') ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {member.status === t('t_185349') ? <span className="material-symbols-outlined text-[14px]">check_circle</span> : <span className="material-symbols-outlined text-[14px]">cancel</span>}
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {member.role !== t('t_c447b2d9') && (
                                                            <>
                                                                <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 dark:text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-colors" title={t('t_59c903fa')}>
                                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                                </button>
                                                                <button className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors" title={t('t_17f4fe')}>
                                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Integrations & Keys */}
                    {activeTab === 'integrations' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-8 shadow-sm  animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">api</span>
                                
                                {t('t_9e6c7af6')}
                            </h3>
                            
                            <div className="bg-amber-50 border border-amber-100 text-amber-700 px-4 py-3 rounded-xl text-xs font-bold flex items-start gap-2 mb-8">
                                <span className="material-symbols-outlined text-[18px]">warning</span>
                                <p>{t('t_1e7149c19')}</p>
                            </div>

                            <form onSubmit={handleSaveIntegrations} className="space-y-6 max-w-2xl">
                                
                                {/* OpenAI Key */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <span>{t('t_19a153a5')}</span>
                                        <a href="#" className="text-[10px] text-blue-500 hover:underline">{t('t_de5ce4db')}</a>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={openAiKey}
                                            onChange={(e) => setOpenAiKey(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-mono text-left"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Gemini Key */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <span>{t('t_b646dd84')}</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={geminiKey}
                                            onChange={(e) => setGeminiKey(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-mono text-left"
                                        />
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-zinc-800 my-8" />

                                {/* Chargily Key (Maps to stripe_key in DB for now) */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <span>{t('t_95c5803e')}</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={stripeKey}
                                            onChange={(e) => setStripeKey(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-mono text-left"
                                            placeholder="test_sk_..."
                                        />
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-zinc-800 my-8" />

                                {/* Resend API Key */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <span>{t("t_3ec4579f")}</span>
                                        <a href="https://resend.com/api-keys" target="_blank" className="text-[10px] text-blue-500 hover:underline">resend.com</a>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={resendKey}
                                            onChange={(e) => setResendKey(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-mono text-left"
                                            placeholder="re_..."
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">mail</span>
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 mr-1">{t("t_5fb91c22")}</p>
                                </div>

                                <div className="pt-6">
                                    <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">enhanced_encryption</span>
                                        
                                        {t('t_86ba5515')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
