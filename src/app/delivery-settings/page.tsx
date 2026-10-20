'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useI18n } from '@/context/I18nContext';
import { insforge } from '@/lib/insforge';
import { ALGERIA_WILAYAS } from '@/lib/algeriaWilayas';

import { getStoreContext } from '@/lib/storeContext';
import { CLONE_CARRIERS, getCarriersByFamily, FAMILY_LABELS, TOTAL_CARRIERS, type CarrierInfo, type CarrierFamily } from '@/lib/vargoClones';

type WilayaRate = { wilaya_code: string; wilaya_name_ar: string; wilaya_name_fr: string; home_price: number; desk_price: number; is_active: boolean; };

export default function DeliverySettingsPage() {
    const { lang, t } = useI18n();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'rates' | 'companies'>('rates');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState('');
    const [storeData, setStoreData] = useState<any>(null);
    const [rates, setRates] = useState<WilayaRate[]>([]);
    const [search, setSearch] = useState('');
    const [companySearch, setCompanySearch] = useState('');
    const [bulkHome, setBulkHome] = useState('');
    const [bulkDesk, setBulkDesk] = useState('');
    const [saveMsg, setSaveMsg] = useState('');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setSaveMsg(msg);
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Modal state
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<CarrierInfo | null>(null);
    const [apiKey, setApiKey] = useState('');  // maps to shipping_api_id (field1)
    const [apiToken, setApiToken] = useState('');  // maps to shipping_api_token (field2)
    const [linking, setLinking] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [fromWilaya, setFromWilaya] = useState('');

    // Grouped carriers for the companies tab
    const carriersByFamily = useMemo(() => getCarriersByFamily(), []);
    const allCarriers = useMemo(() => Object.values(CLONE_CARRIERS), []);

    useEffect(() => {
        (async () => {
            const ctx = await getStoreContext();
            if (!ctx) { router.push('/login'); return; }
            setUserId(ctx.targetUserId);
            const { data: store } = await insforge.database.from('stores').select('*').eq('user_id', ctx.targetUserId).single();
            setStoreData(store);
            const res = await fetch(`/api/shipping-rates?user_id=${ctx.targetUserId}`);
            const json = await res.json();
            const saved: WilayaRate[] = json.rates || [];
            const merged = ALGERIA_WILAYAS.map(w => {
                const existing = saved.find(s => s.wilaya_code === w.code);
                return existing ? { wilaya_code: w.code, wilaya_name_ar: w.name_ar, wilaya_name_fr: w.name_fr, home_price: existing.home_price, desk_price: existing.desk_price, is_active: existing.is_active } : { wilaya_code: w.code, wilaya_name_ar: w.name_ar, wilaya_name_fr: w.name_fr, home_price: 0, desk_price: 0, is_active: true };
            });
            setRates(merged);
            setLoading(false);
        })();
    }, [router]);

    const updateRate = useCallback((code: string, field: keyof WilayaRate, value: any) => {
        setRates(prev => prev.map(r => r.wilaya_code === code ? { ...r, [field]: value } : r));
    }, []);

    const applyBulk = () => {
        setRates(prev => prev.map(r => ({ ...r, home_price: bulkHome ? Number(bulkHome) : r.home_price, desk_price: bulkDesk ? Number(bulkDesk) : r.desk_price })));
        setBulkHome(''); setBulkDesk('');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const upsertData = rates.map((r: any) => ({
                user_id: userId,
                wilaya_code: r.wilaya_code,
                wilaya_name_ar: r.wilaya_name_ar,
                wilaya_name_fr: r.wilaya_name_fr,
                home_price: Number(r.home_price) || 0,
                desk_price: Number(r.desk_price) || 0,
                is_active: r.is_active !== false,
                updated_at: new Date().toISOString(),
            }));

            // Delete existing rates to replace them (since upsert isn't directly supported in the insforge sdk wrapper)
            const { error: deleteError } = await insforge.database
                .from('shipping_rates')
                .delete()
                .eq('user_id', userId);

            if (deleteError) throw deleteError;

            // Insert new updated rates
            const { error: insertError } = await insforge.database
                .from('shipping_rates')
                .insert(upsertData);

            if (insertError) throw insertError;
            
            showToast(t('t_5d15460c'), 'success');
        } catch (err: any) {
            console.error('Save failed:', err);
            showToast(t('t_562cef1e'), 'error');
        }
        setSaving(false);
    };

    const filtered = rates.filter(r => r.wilaya_name_ar.includes(search) || r.wilaya_name_fr.toLowerCase().includes(search.toLowerCase()) || r.wilaya_code.includes(search));

    const openLinkModal = (company: CarrierInfo) => {
        setSelectedCompany(company);
        if (storeData?.shipping_provider === company.id) {
            setApiKey(storeData?.shipping_api_id || '');
            setApiToken(storeData?.shipping_api_token || '');
            setFromWilaya(storeData?.shipping_from_wilaya || '');
        } else {
            setApiKey('');
            setApiToken('');
            setFromWilaya('');
        }
        setLinkError('');
        setLinkModalOpen(true);
    };

    const saveLinking = async () => {
        if (!selectedCompany) return;
        setLinking(true); setLinkError('');
        try {
            const { error } = await insforge.database
                .from('stores')
                .update({ 
                    shipping_provider: selectedCompany.id, 
                    shipping_api_id: selectedCompany.field1 ? apiKey : null, 
                    shipping_api_token: apiToken,
                    shipping_from_wilaya: selectedCompany.needsFromWilaya ? fromWilaya : null
                })
                .eq('user_id', userId);
            if (error) throw error;
            setStoreData((prev: any) => ({ 
                ...prev, 
                shipping_provider: selectedCompany.id, 
                shipping_api_id: selectedCompany.field1 ? apiKey : null, 
                shipping_api_token: apiToken,
                shipping_from_wilaya: selectedCompany.needsFromWilaya ? fromWilaya : null
            }));
            setLinkModalOpen(false);
            showToast(t('t_a4d999eb'), 'success');
        } catch (err: any) {
            setLinkError(t('t_3283c79e'));
        }
        setLinking(false);
    };

    const disableProvider = async () => {
        if (!confirm(t('t_4d1c295f'))) return;
        setLinking(true); setLinkError('');
        try {
            await insforge.database.from('stores').update({ shipping_provider: null, shipping_api_id: null, shipping_api_token: null, shipping_from_wilaya: null }).eq('user_id', userId);
            setStoreData((prev: any) => ({ ...prev, shipping_provider: null, shipping_api_id: null, shipping_api_token: null, shipping_from_wilaya: null }));
            setLinkModalOpen(false);
            showToast(t('t_e693ffd8'), 'success');
        } catch (err) { setLinkError(t('t_f33fbe')); }
        setLinking(false);
    };

    if (loading) return (
        <div className="flex min-h-screen bg-[#f8f5f7] dark:bg-[#0e0a0c]">
            <Sidebar activePage="delivery-settings" /><main className="flex-1 p-6 md:p-10 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></main>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f8f5f7] dark:bg-[#0e0a0c]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar activePage="delivery-settings" />
            
            {/* ═══════════ TOAST ═══════════ */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl text-[14px] font-bold animate-bounce ${
                    toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                    {toast.msg}
                </div>
            )}

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
                    {/* Header */}
                    <div className="bg-gradient-to-l from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[60px]" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-3xl">local_shipping</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black">{t("t_dbd7055a")}</h1>
                                    <p className="text-white/70 text-sm mt-1">{t("t_1a2afeb5")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-3">
                        {[
                            { key: 'rates' as const, label: t('t_4a84fc87'), icon: 'payments', desc: t('t_a60afb4d') },
                            { key: 'companies' as const, label: t('t_d4e512dd'), icon: 'business', desc: t('t_86a48d6d') },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${activeTab === tab.key ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-zinc-900 text-[#88637e] dark:text-gray-400 hover:border-primary/30'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === tab.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5'}`}>
                                    <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                </div>
                                <div className="text-right"><p>{tab.label}</p><p className="text-[10px] font-medium opacity-60">{tab.desc}</p></div>
                            </button>
                        ))}
                    </div>

                    {/* ===== RATES TAB ===== */}
                    {activeTab === 'rates' && (
                        <div className="space-y-6">
                            {/* Bulk Actions */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] p-6">
                                <h3 className="font-bold text-[#181116] dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">tune</span>{t("t_ad15cb7a")}</h3>
                                <div className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-[#88637e] dark:text-gray-400 mb-1 block">{t("t_f3fec649")}</label>
                                        <input type="number" value={bulkHome} onChange={e => setBulkHome(e.target.value)} placeholder={t("t_73c035ad")} className="w-full px-4 py-3 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-zinc-800 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-[#88637e] dark:text-gray-400 mb-1 block">{t("t_2ef99732")}</label>
                                        <input type="number" value={bulkDesk} onChange={e => setBulkDesk(e.target.value)} placeholder={t("t_73c02e2b")} className="w-full px-4 py-3 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-zinc-800 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                                    </div>
                                    <button onClick={applyBulk} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 whitespace-nowrap">
                                        <span className="material-symbols-outlined text-lg">published_with_changes</span>{t("t_2a846d0d")}</button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#88637e]">search</span>
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("t_8a3b275d")} className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-zinc-900 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </div>

                            {/* Rates Table */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                <div className="grid grid-cols-[60px_1fr_140px_140px_60px] gap-0 p-4 bg-slate-50 dark:bg-zinc-800/50 border-b border-[#e5dce3] dark:border-[#4a3b45] text-xs font-black text-[#88637e] dark:text-gray-400">
                                    <span>{t("t_59a3c417")}</span><span>{t("t_8108782d")}</span><span className="text-center">{t("t_33d608d4")}</span><span className="text-center">{t("t_6ed0d9bd")}</span><span className="text-center">{t("t_2e68f7f")}</span>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto divide-y divide-[#e5dce3]/50 dark:divide-[#4a3b45]/50">
                                    {filtered.map(r => (
                                        <div key={r.wilaya_code} className={`grid grid-cols-[60px_1fr_140px_140px_60px] gap-0 items-center p-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${!r.is_active ? 'opacity-40' : ''}`}>
                                            <span className="text-sm font-black text-primary">{r.wilaya_code}</span>
                                            <div>
                                                <p className="text-sm font-bold text-[#181116] dark:text-white">{r.wilaya_name_ar}</p>
                                                <p className="text-[10px] text-[#88637e] dark:text-gray-500">{r.wilaya_name_fr}</p>
                                            </div>
                                            <input type="number" value={r.home_price} onChange={e => updateRate(r.wilaya_code, 'home_price', Number(e.target.value))} className="mx-2 px-3 py-2 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-zinc-800 text-center text-sm font-bold text-[#181116] dark:text-white focus:ring-2 focus:ring-primary outline-none w-full" />
                                            <input type="number" value={r.desk_price} onChange={e => updateRate(r.wilaya_code, 'desk_price', Number(e.target.value))} className="mx-2 px-3 py-2 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-zinc-800 text-center text-sm font-bold text-[#181116] dark:text-white focus:ring-2 focus:ring-primary outline-none w-full" />
                                            <div className="flex justify-center">
                                                <button onClick={() => updateRate(r.wilaya_code, 'is_active', !r.is_active)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${r.is_active ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-100 dark:bg-red-900/20 text-red-500'}`}>
                                                    <span className="material-symbols-outlined text-lg">{r.is_active ? 'check_circle' : 'cancel'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex items-center justify-between">
                                <button onClick={handleSave} disabled={saving} className="mr-auto px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-primary/20">
                                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined">save</span>}
                                    {saving ? t('t_92bc19d3') : t('t_2d07906b')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== COMPANIES TAB ===== */}
                    {activeTab === 'companies' && (
                        <div className="space-y-6">
                            {/* Info + Stats */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">info</span>
                                        <p className="text-sm text-[#88637e] dark:text-gray-400">{t("t_f201d0dc")}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-primary/10 rounded-xl">
                                        <span className="text-sm font-black text-primary">{TOTAL_CARRIERS} شركة مدعومة</span>
                                    </div>
                                </div>
                            </div>

                            {/* Search Companies */}
                            <div className="relative">
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#88637e]">search</span>
                                <input type="text" value={companySearch} onChange={e => setCompanySearch(e.target.value)} placeholder="ابحث عن شركة شحن..." className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-zinc-900 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </div>

                            {/* Carriers grouped by family */}
                            {(Object.entries(carriersByFamily) as [CarrierFamily, CarrierInfo[]][]).map(([familyKey, carriers]) => {
                                const familyInfo = FAMILY_LABELS[familyKey];
                                const filteredCarriers = companySearch
                                    ? carriers.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()) || c.nameAr.includes(companySearch) || c.id.includes(companySearch.toLowerCase()))
                                    : carriers;
                                if (filteredCarriers.length === 0) return null;
                                return (
                                    <div key={familyKey}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xl">{familyInfo.icon}</span>
                                            <h3 className="font-black text-[#181116] dark:text-white">{lang === 'ar' ? familyInfo.nameAr : familyInfo.name}</h3>
                                            <span className="text-xs font-bold text-[#88637e] dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">{filteredCarriers.length}</span>
                                            {!carriers[0].field1 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">رمز API فقط</span>}
                                            {carriers[0].needsFromWilaya && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-lg">+ ولاية الإرسال</span>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                            {filteredCarriers.map(company => {
                                                const isActive = storeData?.shipping_provider === company.id;
                                                return (
                                                    <div key={company.id} className={`relative bg-white dark:bg-zinc-900 rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${isActive ? 'border-primary shadow-lg shadow-primary/10' : 'border-[#e5dce3] dark:border-[#4a3b45]'}`}>
                                                        {isActive && (
                                                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-[10px] font-black rounded-lg flex items-center gap-1 z-10">
                                                                <span className="material-symbols-outlined text-xs">check_circle</span>{t("t_5b4947f0")}</div>
                                                        )}
                                                        <div className="p-5 pb-3">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md" style={{ background: `linear-gradient(135deg, ${company.color}, ${company.color}dd)` }}>
                                                                    {company.logo ? <img src={company.logo} alt={company.name} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.textContent = company.name[0]; }} /> : company.name[0]}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-black text-[#181116] dark:text-white text-sm">{company.name}</h3>
                                                                    <p className="text-[11px] text-[#88637e] dark:text-gray-400">{company.nameAr}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-800/30 border-t border-[#e5dce3] dark:border-[#4a3b45]">
                                                            <button onClick={() => openLinkModal(company)} className={`w-full py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-slate-200 dark:bg-white/5 text-[#88637e] dark:text-gray-400 hover:bg-primary/10 hover:text-primary'}`}>
                                                                <span className="material-symbols-outlined text-lg">{isActive ? 'settings' : 'link'}</span>
                                                                {isActive ? t('t_9e76da89') : t('t_500be720')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Manual Mode Card */}
                            <div className="bg-gradient-to-l from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/5 rounded-2xl border border-amber-200 dark:border-amber-900/30 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-amber-600 text-2xl">touch_app</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#181116] dark:text-white mb-1">{t("t_4c256886")}</h4>
                                        <p className="text-xs text-[#88637e] dark:text-gray-400 leading-relaxed">{t("t_54e29ad5")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Link Modal */}
                    {linkModalOpen && selectedCompany && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181116]/80 backdrop-blur-sm">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e5dce3] dark:border-[#4a3b45]">
                                <div className="p-6 border-b border-[#e5dce3] dark:border-[#4a3b45] flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: `linear-gradient(135deg, ${selectedCompany.color}, ${selectedCompany.color}dd)` }}>
                                            {selectedCompany.name[0]}
                                        </div>
                                        <h3 className="font-black text-lg text-[#181116] dark:text-white">ربط {selectedCompany.nameAr}</h3>
                                    </div>
                                    <button onClick={() => setLinkModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[#88637e] hover:bg-red-100 hover:text-red-500 transition-all">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    {linkError && <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/20 rounded-xl text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined">error</span>{linkError}</div>}
                                    
                                    {/* Dynamic Field 1 (maps to shipping_api_id) - only shown if carrier needs it */}
                                    {selectedCompany.field1 && (
                                        <div>
                                            <label className="text-sm font-bold text-[#88637e] dark:text-gray-400 mb-2 block">{lang === 'ar' ? selectedCompany.field1.labelAr : selectedCompany.field1.label}</label>
                                            <input type={selectedCompany.field1.type} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={`أدخل ${selectedCompany.field1.labelAr}...`} className="w-full px-4 py-3 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-slate-50 dark:bg-zinc-800 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                                        </div>
                                    )}
                                    
                                    {/* Dynamic Field 2 (maps to shipping_api_token) - always shown */}
                                    <div>
                                        <label className="text-sm font-bold text-[#88637e] dark:text-gray-400 mb-2 block">{lang === 'ar' ? selectedCompany.field2.labelAr : selectedCompany.field2.label}</label>
                                        <input type={selectedCompany.field2.type} value={apiToken} onChange={e => setApiToken(e.target.value)} placeholder={`أدخل ${selectedCompany.field2.labelAr}...`} className="w-full px-4 py-3 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-slate-50 dark:bg-zinc-800 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                                    </div>

                                    {/* From Wilaya - only for Yalidine family */}
                                    {selectedCompany.needsFromWilaya && (
                                        <div>
                                            <label className="text-sm font-bold text-[#88637e] dark:text-gray-400 mb-2 block">ولاية الإرسال (مطلوبة)</label>
                                            <select value={fromWilaya} onChange={e => setFromWilaya(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-slate-50 dark:bg-zinc-800 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
                                                <option value="">اختر ولاية الإرسال...</option>
                                                {ALGERIA_WILAYAS.map(w => (
                                                    <option key={w.code} value={w.name_fr}>{w.code} - {w.name_ar} ({w.name_fr})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Family info hint */}
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-sm mt-0.5">lightbulb</span>
                                        <span>هذه الشركة تنتمي لعائلة <strong>{FAMILY_LABELS[selectedCompany.family]?.nameAr}</strong>. {!selectedCompany.field1 ? 'تحتاج فقط رمز API واحد.' : `تحتاج ${selectedCompany.field1.labelAr} + ${selectedCompany.field2.labelAr}.`}</span>
                                    </div>
                                    
                                    <div className="pt-4 flex flex-col gap-3">
                                        <button onClick={saveLinking} disabled={linking || !apiToken || (!!selectedCompany.field1 && !apiKey) || (!!selectedCompany.needsFromWilaya && !fromWilaya)} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                            {linking ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined">link</span>}
                                            {linking ? t('t_982ebc57') : t('t_578915d5')}
                                        </button>
                                        {storeData?.shipping_provider === selectedCompany.id && (
                                            <button onClick={disableProvider} disabled={linking} className="w-full py-3.5 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                                <span className="material-symbols-outlined text-lg">link_off</span>{t("t_607e9813")}</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <footer className="mt-8 text-center text-[#88637e] dark:text-gray-500 text-sm">{t("t_29656d17")}</footer>
                </div>
            </main>
        </div>
    );
}
