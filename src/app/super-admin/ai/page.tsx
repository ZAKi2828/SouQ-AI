"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

export default function SuperAdminAIControl() {
    const { t } = useI18n();
    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized } = useAdminGuard();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // AI Settings State
    const [isAiEnabled, setIsAiEnabled] = useState(true);
    const [activeModel, setActiveModel] = useState('deepseek/deepseek-v3.2');
    const [systemPrompt, setSystemPrompt] = useState(t('t_8680c65f'));
    const [creativity, setCreativity] = useState('0.7');

    // Image AI
    const [imageModel, setImageModel] = useState('google/gemini-3-pro-image-preview');
    const [geminiKeyStatus, setGeminiKeyStatus] = useState<'loaded' | 'missing' | 'checking'>('checking');

    // Text Quotas State
    const [freeTextQuota, setFreeTextQuota] = useState('10');
    const [proTextQuota, setProTextQuota] = useState('500');
    const [vipTextQuota, setVipTextQuota] = useState('unlimited');

    // Image Quotas State
    const [freeImageQuota, setFreeImageQuota] = useState('5');
    const [proImageQuota, setProImageQuota] = useState('50');
    const [vipImageQuota, setVipImageQuota] = useState('unlimited');

    const router = useRouter();

    useEffect(() => {
        if (!isAuthorized) return;
        const fetchData = async () => {
            try {
                // Fetch AI settings from database
                const { data: aiSettings } = await insforge.database
                    .from('ai_settings')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (aiSettings) {
                    setActiveModel(aiSettings.description_model || 'deepseek/deepseek-v3.2');
                    setSystemPrompt(aiSettings.description_prompt || '');
                    setCreativity(aiSettings.description_temperature?.toString() || '0.7');
                    setImageModel(aiSettings.image_model || 'google/gemini-3-pro-image-preview');
                    setIsAiEnabled(aiSettings.ai_enabled ?? true);
                    setFreeTextQuota(aiSettings.free_text_quota?.toString() || '10');
                    setProTextQuota(aiSettings.pro_text_quota?.toString() || '500');
                    setVipTextQuota(aiSettings.vip_text_quota || 'unlimited');
                    setFreeImageQuota(aiSettings.free_image_quota?.toString() || '5');
                    setProImageQuota(aiSettings.pro_image_quota?.toString() || '50');
                    setVipImageQuota(aiSettings.vip_image_quota || 'unlimited');
                }

                // Check Gemini key status
                const { data: platformSettings } = await insforge.database
                    .from('platform_settings')
                    .select('gemini_key')
                    .eq('id', 1)
                    .single();
                
                setGeminiKeyStatus(platformSettings?.gemini_key ? 'loaded' : 'missing');

            } catch (err) {
                console.error("Error loading admin dashboard:", err);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchData();
    }, [isAuthorized]);

    if (isAuthLoading || isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950 text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    const handleSaveAISettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Save core settings
            const { error: coreError } = await insforge.database
                .from('ai_settings')
                .update({
                    description_model: activeModel,
                    description_prompt: systemPrompt,
                    description_temperature: Number(creativity),
                    image_model: imageModel,
                    ai_enabled: isAiEnabled,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', 1);
            if (coreError) throw coreError;

            // Save quota settings
            const quotaPayload: Record<string, any> = {
                free_text_quota: freeTextQuota === 'unlimited' ? null : Number(freeTextQuota),
                pro_text_quota: proTextQuota === 'unlimited' ? null : Number(proTextQuota),
                vip_text_quota: vipTextQuota,
                free_image_quota: freeImageQuota === 'unlimited' ? null : Number(freeImageQuota),
                pro_image_quota: proImageQuota === 'unlimited' ? null : Number(proImageQuota),
                vip_image_quota: vipImageQuota,
            };
            
            const { error: quotaError } = await insforge.database
                .from('ai_settings')
                .update(quotaPayload)
                .eq('id', 1);
            
            if (quotaError) {
                console.warn('Quota update via SDK failed, trying alternative...', quotaError);
                for (const [key, value] of Object.entries(quotaPayload)) {
                    await insforge.database
                        .from('ai_settings')
                        .update({ [key]: value })
                        .eq('id', 1);
                }
            }

            // Sync all merchants' credits based on their plan
            const ftq = freeTextQuota === 'unlimited' ? 999999999 : Number(freeTextQuota);
            const ptq = proTextQuota === 'unlimited' ? 999999999 : Number(proTextQuota);
            const vtq = vipTextQuota === 'unlimited' ? 999999999 : Number(vipTextQuota);
            const fiq = freeImageQuota === 'unlimited' ? 999999999 : Number(freeImageQuota);
            const piq = proImageQuota === 'unlimited' ? 999999999 : Number(proImageQuota);
            const viq = vipImageQuota === 'unlimited' ? 999999999 : Number(vipImageQuota);

            const syncResponse = await fetch('/api/sync-ai-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    t_free: ftq, t_pro: ptq, t_vip: vtq,
                    i_free: fiq, i_pro: piq, i_vip: viq
                })
            });

            if (!syncResponse.ok) {
                const err = await syncResponse.json();
                throw new Error(err.error || 'Server Sync Error');
            }

            alert(t('t_3961cf54e'));
        } catch (error: any) {
            console.error('Save error details:', error);
            alert(t('t_72b3476e') + (error?.message || error?.details || JSON.stringify(error)));
        } finally {
            setIsSaving(false);
        }
    };

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
                    <div className="bg-pink-50 dark:bg-pink-900/20 text-primary dark:text-pink-400 text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-primary dark:bg-pink-400 rounded-full animate-pulse"></span>
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
                    <Link href="/super-admin/ai" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
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
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            
                            {t('t_18def9e9')}
                            <span className="material-symbols-outlined text-primary text-2xl animate-spin-slow">psychology</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Kill Switch Toggle at the header */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${isAiEnabled ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                            <span className="material-symbols-outlined text-[18px]">
                                {isAiEnabled ? 'power' : 'power_off'}
                            </span>
                            
                            {t('t_146dda578')} {isAiEnabled ? t('t_185349') : t('t_2f1bfd3')}
                            <label className="relative inline-flex items-center cursor-pointer mr-3">
                                <input type="checkbox" className="sr-only peer" checked={isAiEnabled} onChange={async () => {
                                    const newVal = !isAiEnabled;
                                    setIsAiEnabled(newVal);
                                    try {
                                        await insforge.database
                                            .from('ai_settings')
                                            .update({ ai_enabled: newVal, updated_at: new Date().toISOString() })
                                            .eq('id', 1);
                                    } catch (e) { console.error('Failed to toggle AI:', e); }
                                }} />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white dark:bg-zinc-900 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <ThemeToggle className="bg-slate-100 dark:bg-slate-800 border-none" />
                    </div>
                </header>

                <div className="p-8 max-w-[1200px] w-full mx-auto space-y-8">
                    
                    {/* Insforge Free Credit Notice */}
                    <div className="bg-gradient-to-l from-indigo-600 to-purple-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden flex items-center justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-zinc-900 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                <span className="material-symbols-outlined text-3xl">card_giftcard</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black mb-1">{t('t_2c47d97a')}</h3>
                                <p className="text-indigo-100 text-sm font-medium">{t('t_4d164db2')}</p>
                            </div>
                        </div>
                        <div className="relative z-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[150px]">
                            <div className="text-xs text-indigo-100 font-bold mb-1">{t('t_17f19926c')}</div>
                            <div className="text-3xl font-black font-mono tracking-tight">$0.98</div>
                            <div className="w-full bg-black/30 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-emerald-400 h-full rounded-full w-[98%] shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSaveAISettings} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Engine & Prompts */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Section: InsForge AI */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                                        <span className="material-symbols-outlined text-xl">edit_note</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{t('t_88d9b5db')}</h2>
                                        <p className="text-xs text-slate-400">{t('t_4a91abe9')}</p>
                                    </div>
                                </div>

                                {/* Engine Selector */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-8 shadow-sm ">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">memory</span>
                                        
                                        {t('t_1bda842ee')}
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', badge: t('t_7ce8abf0'), badgeColor: 'text-emerald-600', icon: 'bolt', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', desc: t('t_441d6caf') },
                                            { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', badge: t('t_de3f7796'), badgeColor: 'text-orange-500', icon: 'psychology', iconBg: 'bg-orange-50 text-orange-500 border-orange-100', desc: t('t_f62fbee') },
                                            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', badge: t('t_ca1d178'), badgeColor: 'text-indigo-500', icon: 'smart_toy', iconBg: 'bg-indigo-50 text-indigo-500 border-indigo-100', desc: t('t_31c12fe0') },
                                            { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', badge: t('t_2531d2eb'), badgeColor: 'text-slate-600 dark:text-slate-400', icon: 'flash_on', iconBg: 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-800', desc: t('t_436d8e9d') },
                                            { id: 'minimax/minimax-m2.1', name: 'MiniMax M2.1', badge: t('t_2e0cb0a4'), badgeColor: 'text-purple-500', icon: 'auto_awesome', iconBg: 'bg-purple-50 text-purple-500 border-purple-100', desc: t('t_97c44c73') },
                                            { id: 'google/gemini-3-pro-image-preview', name: 'Gemini 3 Pro', badge: t('t_e9a5777'), badgeColor: 'text-blue-500', icon: 'image', iconBg: 'bg-blue-50 text-blue-500 border-blue-100', desc: t('t_39b4f250') },
                                        ].map((model) => (
                                            <label key={model.id} className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${activeModel === model.id ? 'border-primary bg-primary/5 shadow-sm ' : 'border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:border-zinc-800'}`}>
                                                <input type="radio" name="model" value={model.id} className="sr-only" checked={activeModel === model.id} onChange={(e) => setActiveModel(e.target.value)} />
                                                <div className={`w-11 h-11 rounded-full shadow-sm  flex items-center justify-center border ${model.iconBg}`}>
                                                    <span className="material-symbols-outlined text-xl">{model.icon}</span>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-tight">{model.name}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{model.desc}</div>
                                                    <div className={`text-[10px] font-bold mt-1 ${model.badgeColor}`}>{model.badge}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-8">
                                        <label className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            <span>{t('t_1f019b21b')}</span>
                                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">{creativity}</span>
                                        </label>
                                        <input 
                                            type="range" 
                                            min="0" max="1" step="0.1" 
                                            value={creativity}
                                            onChange={(e) => setCreativity(e.target.value)}
                                            className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold">
                                            <span>{t('t_64b4eb9b')}</span>
                                            <span>{t('t_ca1d178')}</span>
                                            <span>{t('t_164b15a0e')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* System Prompt Editor */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-8 shadow-sm ">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-500">rule</span>
                                        
                                        {t('t_a8c900a3')}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{t('t_ff184272')}</p>
                                    
                                    <div className="relative">
                                        <textarea 
                                            value={systemPrompt}
                                            onChange={(e) => setSystemPrompt(e.target.value)}
                                            rows={5}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none shadow-inner"
                                            placeholder={t('t_1176c1421')}
                                        />
                                        <div className="absolute bottom-4 left-4 text-[10px] font-bold text-slate-400 bg-white dark:bg-zinc-900 px-2 py-1 rounded-md border border-slate-100 dark:border-zinc-800 shadow-sm ">
                                            
                                            {t('t_47f4c9be')}
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Gemini AI */}
                                <div className="flex items-center gap-3 mb-2 mt-10">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                                        <span className="material-symbols-outlined text-xl">image</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{t('t_5b2e54e0')}</h2>
                                        <p className="text-xs text-slate-400">{t('t_f51d243a')}</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-8 shadow-sm ">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500">auto_awesome</span>
                                        
                                        {t('t_8e472e07')}
                                    </h3>

                                    {/* Gemini Key Status */}
                                    <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${
                                        geminiKeyStatus === 'loaded' ? 'bg-emerald-50 border-emerald-200' :
                                        geminiKeyStatus === 'missing' ? 'bg-red-50 border-red-200' :
                                        'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-zinc-800'
                                    }`}>
                                        <span className={`material-symbols-outlined text-xl ${
                                            geminiKeyStatus === 'loaded' ? 'text-emerald-600' :
                                            geminiKeyStatus === 'missing' ? 'text-red-500' :
                                            'text-slate-400'
                                        }`}>
                                            {geminiKeyStatus === 'loaded' ? 'check_circle' : geminiKeyStatus === 'missing' ? 'error' : 'pending'}
                                        </span>
                                        <div>
                                            <p className={`text-sm font-bold ${
                                                geminiKeyStatus === 'loaded' ? 'text-emerald-700' :
                                                geminiKeyStatus === 'missing' ? 'text-red-600' :
                                                'text-slate-600 dark:text-slate-400'
                                            }`}>
                                                {geminiKeyStatus === 'loaded' ? t('t_1ed46b4c2') :
                                                 geminiKeyStatus === 'missing' ? t('t_b5f3bc15') :
                                                 t('t_f8bc40fe')}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                {geminiKeyStatus === 'missing' 
                                                    ? t('t_12bcf1076')
                                                    : t('t_5b8ecfce')}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('t_102f711f9')}</p>

                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 font-bold flex items-start gap-2">
                                        <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                                        <p>{t('t_1055a4a39')} <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">gemini-2.5-flash</code>  {t('t_5edfd6e0')} <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">nano-banana-pro-preview</code>  {t('t_205c1e624')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quotas & Limits */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-8 shadow-sm ">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-500">account_balance_wallet</span>
                                        
                                        {t('t_8aad3d1')}
                                    </h3>
                                    
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-xs font-bold text-emerald-700 mb-6 space-y-2">
                                        <p>{t('t_26f6907a')} <strong>{t('t_a1892242')}</strong>  {t('t_648')} <strong>{t('t_46e6a932')}</strong>  {t('t_3a4379613')}</p>
                                        <ul className="list-disc leading-relaxed pr-4 text-[11px] font-medium text-emerald-600">
                                            <li>{t('t_59d0244b')} <strong>{t('t_5b0e87a3')}</strong>  {t('t_3d235a34')}</li>
                                            <li>{t('t_59d0244b')} <strong>{t('t_de9b0ee8')}</strong>  {t('t_6d97ab4b')}</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {/* Free Quota */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-zinc-800 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('t_217db6d41')}</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t('t_faeeca16')}</label>
                                                    <input 
                                                        type="number" 
                                                        value={freeTextQuota}
                                                        onChange={(e) => setFreeTextQuota(e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-slate-500 transition-all text-sm font-bold shadow-sm "
                                                        placeholder={t('t_8c3fdd18')}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t('t_ae7fe4f0')}</label>
                                                    <input 
                                                        type="number" 
                                                        value={freeImageQuota}
                                                        onChange={(e) => setFreeImageQuota(e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-slate-500 transition-all text-sm font-bold shadow-sm "
                                                        placeholder={t('t_788dc914')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pro Quota */}
                                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                                                <h4 className="font-bold text-primary text-sm">{t('t_b26f90a3')}</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-primary/70 mb-1.5">{t('t_faeeca16')}</label>
                                                    <input 
                                                        type="number" 
                                                        value={proTextQuota}
                                                        onChange={(e) => setProTextQuota(e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-primary transition-all text-sm font-bold shadow-sm "
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-primary/70 mb-1.5">{t('t_ae7fe4f0')}</label>
                                                    <input 
                                                        type="number" 
                                                        value={proImageQuota}
                                                        onChange={(e) => setProImageQuota(e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-primary transition-all text-sm font-bold shadow-sm "
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* التاجر المحترف Quota */}
                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
                                                <h4 className="font-bold text-amber-700 text-sm">{t('t_14fedfe2b')}</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-amber-700/70 mb-1.5">{t('t_faeeca16')}</label>
                                                    <input 
                                                        type="text" 
                                                        value={vipTextQuota}
                                                        onChange={(e) => setVipTextQuota(e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-all text-sm font-bold shadow-sm"
                                                        placeholder={t("t_38719d72")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-amber-700/70 mb-1.5">{t('t_ae7fe4f0')}</label>
                                                    <input 
                                                        type="text" 
                                                        value={vipImageQuota}
                                                        onChange={(e) => setVipImageQuota(e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-all text-sm font-bold shadow-sm"
                                                        placeholder={t("t_38719d72")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                                
                                <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 mt-4">
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            
                                            {t('t_92bc19d3')}
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                                            
                                            {t('t_1039e2dfb')}
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </main>
        </div>
    );
}
