"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

interface MerchantSubscription {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    store_slug: string | null;
    store_name: string | null;
    plan: string;
    is_paid: boolean;
    plan_started_at: string | null;
    plan_expires_at: string | null;
    created_at: string;
}

interface BillingOverview {
    total_merchants: number;
    paid_merchants: number;
    free_merchants: number;
    pro_count: number;
    vip_count: number;
    expired_count: number;
    expiring_soon: number;
    pro_price: string;
    vip_price: string;
}

interface Invoice {
    id: string;
    profile_id: string;
    amount: number;
    status: string;
    plan: string;
    payment_method: string | null;
    created_at: string;
    merchant_email?: string;
    merchant_name?: string;
}

type TabType = 'overview' | 'subscriptions' | 'invoices';
type SubFilterType = 'all' | 'active' | 'expiring' | 'expired' | 'free';

export default function SuperAdminBilling() {
    const { t, lang } = useI18n();
    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized } = useAdminGuard();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [subFilter, setSubFilter] = useState<SubFilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Data State
    const [overview, setOverview] = useState<BillingOverview | null>(null);
    const [merchants, setMerchants] = useState<MerchantSubscription[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedMerchant, setSelectedMerchant] = useState<MerchantSubscription | null>(null);
    const [showMerchantModal, setShowMerchantModal] = useState(false);
    const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

    // Create Invoice Form State
    const [invoiceForm, setInvoiceForm] = useState({
        profile_id: '',
        amount: '',
        plan: 'pro',
        payment_method: 'CCP',
        status: 'paid'
    });
    const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

    const router = useRouter();

    const isRtl = lang === 'ar';

    useEffect(() => {
        if (!isAuthorized) return;
        const fetchAllData = async () => {
            try {
                // Fetch all data in parallel
                await Promise.all([
                    fetchOverview(),
                    fetchMerchants(),
                    fetchInvoices()
                ]);

            } catch (err) {
                console.error("Error loading billing dashboard:", err);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchAllData();
    }, [isAuthorized]);

    const fetchOverview = async () => {
        try {
            const { data: profiles } = await insforge.database
                .from('profiles')
                .select('plan, is_paid, plan_expires_at');

            const { data: settings } = await insforge.database
                .from('platform_settings')
                .select('pro_price, vip_price')
                .eq('id', 1)
                .single();

            if (profiles) {
                const now = new Date();
                const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                const overview: BillingOverview = {
                    total_merchants: profiles.length,
                    paid_merchants: profiles.filter(p => p.is_paid).length,
                    free_merchants: profiles.filter(p => !p.is_paid && p.plan === 'free').length,
                    pro_count: profiles.filter(p => p.plan === 'pro' && p.is_paid).length,
                    vip_count: profiles.filter(p => p.plan === 'vip' && p.is_paid).length,
                    expired_count: profiles.filter(p => p.plan_expires_at && new Date(p.plan_expires_at) < now && p.plan !== 'free').length,
                    expiring_soon: profiles.filter(p => {
                        if (!p.plan_expires_at) return false;
                        const exp = new Date(p.plan_expires_at);
                        return exp > now && exp <= sevenDaysLater;
                    }).length,
                    pro_price: settings?.pro_price || '1000',
                    vip_price: settings?.vip_price || '2500',
                };
                setOverview(overview);
            }
        } catch (err) {
            console.error("Error fetchOverview:", err);
        }
    };

    const fetchMerchants = async () => {
        try {
            // Fetch profiles and stores in parallel
            const [profilesRes, storesRes] = await Promise.all([
                insforge.database.from('profiles')
                    .select('id, full_name, avatar_url, store_slug, plan, is_paid, plan_started_at, plan_expires_at, created_at')
                    .order('created_at', { ascending: false }),
                insforge.database.from('stores')
                    .select('user_id, store_name')
            ]);

            if (profilesRes.data) {
                const storesMap = new Map<string, string>();
                if (storesRes.data) {
                    storesRes.data.forEach((s: any) => storesMap.set(s.user_id, s.store_name));
                }

                // Map profiles as merchants
                const mappedMerchants: MerchantSubscription[] = profilesRes.data.map(p => ({
                    id: p.id,
                    email: '', // Will be empty since profiles don't store email
                    full_name: p.full_name,
                    avatar_url: p.avatar_url,
                    store_slug: p.store_slug,
                    store_name: storesMap.get(p.id) || null,
                    plan: p.plan || 'free',
                    is_paid: p.is_paid || false,
                    plan_started_at: p.plan_started_at,
                    plan_expires_at: p.plan_expires_at,
                    created_at: p.created_at,
                }));
                setMerchants(mappedMerchants);
            }
        } catch (err) {
            console.error("Error fetchMerchants:", err);
        }
    };

    const fetchInvoices = async () => {
        try {
            const { data } = await insforge.database
                .from('merchant_invoices')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setInvoices(data);
            }
        } catch (err) {
            console.error("Error fetchInvoices:", err);
        }
    };

    // Computed values
    const mrr = useMemo(() => {
        if (!overview) return 0;
        return (overview.pro_count * Number(overview.pro_price)) + (overview.vip_count * Number(overview.vip_price));
    }, [overview]);

    const filteredMerchants = useMemo(() => {
        let filtered = merchants;
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        switch (subFilter) {
            case 'active':
                filtered = filtered.filter(m => m.is_paid && m.plan_expires_at && new Date(m.plan_expires_at) > now);
                break;
            case 'expiring':
                filtered = filtered.filter(m => {
                    if (!m.plan_expires_at) return false;
                    const exp = new Date(m.plan_expires_at);
                    return exp > now && exp <= sevenDaysLater;
                });
                break;
            case 'expired':
                filtered = filtered.filter(m => m.plan_expires_at && new Date(m.plan_expires_at) < now && m.plan !== 'free');
                break;
            case 'free':
                filtered = filtered.filter(m => m.plan === 'free' && !m.is_paid);
                break;
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                (m.full_name?.toLowerCase() || '').includes(q) ||
                (m.store_name?.toLowerCase() || '').includes(q) ||
                (m.store_slug?.toLowerCase() || '').includes(q) ||
                (m.email?.toLowerCase() || '').includes(q) ||
                m.id.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [merchants, subFilter, searchQuery]);

    // Helper functions
    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'vip': return { label: 'VIP 👑', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' };
            case 'pro': return { label: 'PRO ⭐', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400' };
            default: return { label: 'FREE 🆓', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
        }
    };

    const getSubscriptionStatus = (merchant: MerchantSubscription) => {
        if (merchant.plan === 'free' && !merchant.is_paid) {
            return { label: isRtl ? 'مجاني' : 'Free', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' };
        }
        if (!merchant.plan_expires_at) {
            return { label: isRtl ? 'نشط' : 'Active', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' };
        }
        const exp = new Date(merchant.plan_expires_at);
        const now = new Date();
        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
            return { label: isRtl ? t('t_5b4b544c') : 'Expired', color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' };
        }
        if (daysLeft <= 7) {
            return { label: isRtl ? `ينتهي خلال ${daysLeft} يوم` : `${daysLeft}d left`, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' };
        }
        return { label: isRtl ? 'نشط' : 'Active', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' };
    };

    const getDaysRemaining = (expiresAt: string | null) => {
        if (!expiresAt) return null;
        const exp = new Date(expiresAt);
        const now = new Date();
        return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString(isRtl ? 'ar-DZ' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const handleCreateInvoice = async () => {
        if (!invoiceForm.profile_id || !invoiceForm.amount) return;
        setInvoiceSubmitting(true);
        try {
            const { error } = await insforge.database
                .from('merchant_invoices')
                .insert({
                    profile_id: invoiceForm.profile_id,
                    amount: parseFloat(invoiceForm.amount),
                    plan: invoiceForm.plan,
                    payment_method: invoiceForm.payment_method,
                    status: invoiceForm.status,
                });

            if (!error) {
                setShowCreateInvoiceModal(false);
                setInvoiceForm({ profile_id: '', amount: '', plan: 'pro', payment_method: 'CCP', status: 'paid' });
                await fetchInvoices();
            } else {
                console.error("Invoice insertion error:", error);
                alert("حدث خطأ أثناء إنشاء الفاتورة: " + error.message);
            }
        } catch (err: any) {
            console.error("Error creating invoice:", err);
            alert("حدث خطأ أثناء الاتصال: " + err.message);
        } finally {
            setInvoiceSubmitting(false);
        }
    };

    const getInvoiceStatusStyle = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'pending': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
            case 'failed': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            case 'refunded': return 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
        }
    };

    const getProgressPercentage = () => {
        if (!overview) return 0;
        if (overview.total_merchants === 0) return 0;
        return Math.round((overview.paid_merchants / overview.total_merchants) * 100);
    };

    if (isAuthLoading || isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950 text-primary">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm font-bold text-slate-400 animate-pulse">{isRtl ? t('t_3d4ec4d4') : 'Loading billing data...'}</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex overflow-hidden bg-[#F8F9FC] dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-cairo">
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
        .active-nav-link {
          background: linear-gradient(90deg, rgba(233, 30, 99, 0.1) 0%, rgba(233, 30, 99, 0.05) 100%);
          border-right: 4px solid #E91E63;
          color: #E91E63;
        }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.12); }
        .glass-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .dark .glass-card {
          background: rgba(24,24,27,0.7);
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slideInUp 0.4s ease-out; }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-count { animation: countUp 0.5s ease-out; }
        .progress-bar {
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-indicator {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="font-semibold text-sm">{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
                    </Link>
                    <Link href="/super-admin/merchants" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">storefront</span>
                        <span className="font-semibold text-sm">{isRtl ? t('t_dad14029') : 'Merchants'}</span>
                    </Link>
                    <Link href="/super-admin/billing" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="font-semibold text-sm">{isRtl ? t('t_d141d026') : 'Billing & Subscriptions'}</span>
                    </Link>
                    <Link href="/super-admin/templates" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">auto_awesome_motion</span>
                        <span className="font-semibold text-sm">{isRtl ? 'القوالب' : 'Templates'}</span>
                    </Link>
                    <Link href="/super-admin/ai" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">psychology</span>
                        <span className="font-semibold text-sm">{isRtl ? t('t_b9225a88') : 'AI Settings'}</span>
                    </Link>
                    <Link href="/super-admin/apps" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">extension</span>
                        <span className="font-semibold text-sm">{isRtl ? t('t_17b06979') : 'Apps'}</span>
                    </Link>
                    <div className="pt-4 pb-2 text-[11px] font-bold text-slate-400 px-4 uppercase tracking-widest">{isRtl ? t('t_dade27ad') : 'System'}</div>
                    <Link href="/super-admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="font-semibold text-sm">{isRtl ? t('t_12ed66a9') : 'Settings'}</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col relative w-full pt-16 md:pt-0">
                {/* Header */}
                <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">menu_open</span>
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{isRtl ? t('t_d141d026') : 'Billing & Subscriptions'}</h2>
                            <p className="text-xs text-slate-400 font-medium">{isRtl ? t('t_ac6130bf') : 'Comprehensive subscription & payment management'}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { fetchOverview(); fetchMerchants(); fetchInvoices(); }}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                            {isRtl ? t('t_59c38f6d') : 'Refresh'}
                        </button>
                        <button
                            onClick={() => setShowCreateInvoiceModal(true)}
                            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            {isRtl ? t('t_db75711d') : 'New Invoice'}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-100 dark:border-zinc-800 w-fit">
                        {([
                            { key: 'overview' as TabType, label: isRtl ? t('t_32cda828') : 'Overview', icon: 'monitoring' },
                            { key: 'subscriptions' as TabType, label: isRtl ? t('t_a041bd0') : 'Subscriptions', icon: 'card_membership' },
                            { key: 'invoices' as TabType, label: isRtl ? t('t_944c912e') : 'Invoices', icon: 'receipt_long' },
                        ]).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all tab-indicator ${activeTab === tab.key
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ===================== OVERVIEW TAB ===================== */}
                    {activeTab === 'overview' && overview && (
                        <div className="space-y-8 animate-slide-in">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {/* MRR Card */}
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover-lift relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">monitoring</span>
                                            </div>
                                            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                                MRR
                                            </span>
                                        </div>
                                        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">{isRtl ? t('t_93cd1aae') : 'Monthly Recurring Revenue'}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-800 dark:text-slate-100 animate-count">{mrr.toLocaleString()}</span>
                                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{isRtl ? t('t_c14dd31c') : 'DZD/mo'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Paid Merchants */}
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-pink-100 dark:border-pink-900/30 shadow-sm hover-lift relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 dark:bg-pink-900/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">person_check</span>
                                            </div>
                                        </div>
                                        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">{isRtl ? t('t_7efafdd7') : 'Paid Merchants'}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-800 dark:text-slate-100 animate-count">{overview.paid_merchants}</span>
                                            <span className="text-slate-400 text-sm">/ {overview.total_merchants}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                                            <div className="bg-gradient-to-l from-pink-500 to-rose-500 h-full rounded-full progress-bar" style={{ width: `${getProgressPercentage()}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expiring Soon */}
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 shadow-sm hover-lift relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">schedule</span>
                                            </div>
                                            {overview.expiring_soon > 0 && (
                                                <span className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg text-xs font-bold animate-pulse">
                                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                                    {isRtl ? 'تنبيه' : 'Alert'}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">{isRtl ? t('t_ab1e3e53') : 'Expiring Soon (7 days)'}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-800 dark:text-slate-100 animate-count">{overview.expiring_soon}</span>
                                            <span className="text-slate-400 text-sm">{isRtl ? t('t_2e52f82') : 'merchants'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expired */}
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-sm hover-lift relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">timer_off</span>
                                            </div>
                                        </div>
                                        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">{isRtl ? t('t_a00b9c4a') : 'Expired Subscriptions'}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-800 dark:text-slate-100 animate-count">{overview.expired_count}</span>
                                            <span className="text-slate-400 text-sm">{isRtl ? t('t_2e52f82') : 'merchants'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Chart + Plan Distribution */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Revenue Breakdown */}
                                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            {isRtl ? t('t_4d788fc2') : 'Revenue by Plan'}
                                        </h3>
                                    </div>

                                    {/* Revenue bars */}
                                    <div className="space-y-6">
                                        {/* Pro Revenue */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-gradient-to-l from-pink-500 to-rose-500 rounded-full"></div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">PRO ⭐</span>
                                                    <span className="text-xs text-slate-400">{t("t_f9f3c545")}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{(overview.pro_count * Number(overview.pro_price)).toLocaleString()} {isRtl ? 'د.ج' : 'DZD'}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                                <div className="bg-gradient-to-l from-pink-500 to-rose-500 h-full rounded-full progress-bar" style={{ width: mrr > 0 ? `${(overview.pro_count * Number(overview.pro_price) / mrr) * 100}%` : '0%' }}></div>
                                            </div>
                                        </div>

                                        {/* VIP Revenue */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-gradient-to-l from-amber-500 to-orange-500 rounded-full"></div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">VIP 👑</span>
                                                    <span className="text-xs text-slate-400">{t("t_8bcf71d5")}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{(overview.vip_count * Number(overview.vip_price)).toLocaleString()} {isRtl ? 'د.ج' : 'DZD'}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                                <div className="bg-gradient-to-l from-amber-500 to-orange-500 h-full rounded-full progress-bar" style={{ width: mrr > 0 ? `${(overview.vip_count * Number(overview.vip_price) / mrr) * 100}%` : '0%' }}></div>
                                            </div>
                                        </div>

                                        {/* Free */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{isRtl ? t('t_8940abb7') : 'FREE 🆓'}</span>
                                                    <span className="text-xs text-slate-400">{t("t_f2a33a86")}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-400">0 {isRtl ? 'د.ج' : 'DZD'}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                                <div className="bg-slate-300 dark:bg-slate-600 h-full rounded-full progress-bar" style={{ width: '0%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="mt-8 p-4 bg-gradient-to-l from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 rounded-2xl border border-pink-100 dark:border-pink-900/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isRtl ? t('t_ef1f46a9') : 'Total Monthly Revenue'}</p>
                                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{mrr.toLocaleString()} <span className="text-sm text-slate-400">{isRtl ? 'د.ج' : 'DZD'}</span></p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isRtl ? t('t_7464acbb') : 'Projected Annual'}</p>
                                                <p className="text-xl font-black text-emerald-600">{(mrr * 12).toLocaleString()} <span className="text-sm text-slate-400">{isRtl ? 'د.ج' : 'DZD'}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions + Subscription Health */}
                                <div className="space-y-6">
                                    {/* Plan Distribution Donut */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{isRtl ? t('t_d205cdd4') : 'Plan Distribution'}</h3>

                                        {/* Visual distribution */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex-1 h-8 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                                                {overview.vip_count > 0 && (
                                                    <div className="bg-gradient-to-l from-amber-500 to-orange-500 h-full transition-all" style={{ width: `${(overview.vip_count / overview.total_merchants) * 100}%` }}></div>
                                                )}
                                                {overview.pro_count > 0 && (
                                                    <div className="bg-gradient-to-l from-pink-500 to-rose-500 h-full transition-all" style={{ width: `${(overview.pro_count / overview.total_merchants) * 100}%` }}></div>
                                                )}
                                                {overview.free_merchants > 0 && (
                                                    <div className="bg-slate-300 dark:bg-slate-600 h-full transition-all" style={{ width: `${(overview.free_merchants / overview.total_merchants) * 100}%` }}></div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">👑</span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">VIP</span>
                                                </div>
                                                <span className="text-sm font-black text-amber-600">{overview.vip_count}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/10 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">⭐</span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">PRO</span>
                                                </div>
                                                <span className="text-sm font-black text-pink-600">{overview.pro_count}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">🆓</span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{isRtl ? 'مجاني' : 'Free'}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-500">{overview.free_merchants}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alerts */}
                                    {(overview.expiring_soon > 0 || overview.expired_count > 0) && (
                                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-6 shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                                                <span className="material-symbols-outlined text-amber-500 align-middle ml-1">notifications_active</span>
                                                {isRtl ? t('t_2165192c') : 'Alerts'}
                                            </h3>
                                            <div className="space-y-3">
                                                {overview.expiring_soon > 0 && (
                                                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                                        <span className="material-symbols-outlined text-amber-500">warning</span>
                                                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                                                            {overview.expiring_soon} {isRtl ? t('t_3e24a69a') : 'subscription(s) expiring soon'}
                                                        </p>
                                                    </div>
                                                )}
                                                {overview.expired_count > 0 && (
                                                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                                        <span className="material-symbols-outlined text-red-500">error</span>
                                                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                                                            {overview.expired_count} {isRtl ? t('t_cc2f7a') : 'expired subscription(s) need renewal'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Merchants Expiring Soon Table */}
                            {merchants.filter(m => {
                                if (!m.plan_expires_at || m.plan === 'free') return false;
                                const d = getDaysRemaining(m.plan_expires_at);
                                return d !== null && d <= 7 && d >= 0;
                            }).length > 0 && (
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-amber-100 dark:border-amber-900/30 p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="material-symbols-outlined text-amber-500 text-2xl">hourglass_top</span>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{isRtl ? t('t_4f3733eb') : 'Subscriptions Expiring Soon'}</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                                                        <th className="px-4 py-3 text-right">{isRtl ? t('t_dad12dff') : 'Merchant'}</th>
                                                        <th className="px-4 py-3 text-center">{isRtl ? 'الخطة' : 'Plan'}</th>
                                                        <th className="px-4 py-3 text-center">{isRtl ? t('t_40a1fa1b') : 'Expiry Date'}</th>
                                                        <th className="px-4 py-3 text-center">{isRtl ? t('t_d55ac919') : 'Days Left'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {merchants.filter(m => {
                                                        if (!m.plan_expires_at || m.plan === 'free') return false;
                                                        const d = getDaysRemaining(m.plan_expires_at);
                                                        return d !== null && d <= 7 && d >= 0;
                                                    }).map(m => {
                                                        const daysLeft = getDaysRemaining(m.plan_expires_at);
                                                        const badge = getPlanBadge(m.plan);
                                                        return (
                                                            <tr key={m.id} className="border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        {m.avatar_url ? (
                                                                            <img src={m.avatar_url} alt="Profile" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
                                                                        ) : (
                                                                            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold text-sm">
                                                                                {(m.full_name || m.store_name || m.store_slug || '?').charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{m.full_name || m.store_name || m.store_slug || 'Unknown'}</p>
                                                                            <p className="text-[11px] text-slate-400">{m.store_name ? m.store_slug : m.id.slice(0, 8)}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400">{formatDate(m.plan_expires_at)}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${daysLeft !== null && daysLeft <= 3 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                                                                        {daysLeft} {isRtl ? t('t_1864c7') : 'days'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* ===================== SUBSCRIPTIONS TAB ===================== */}
                    {activeTab === 'subscriptions' && (
                        <div className="space-y-6 animate-slide-in">
                            {/* Filters Bar */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 flex flex-wrap items-center gap-4">
                                {/* Search */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder={isRtl ? t('t_cf7a7d97') : 'Search by name or store...'}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-cairo"
                                    />
                                </div>

                                {/* Filter Chips */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {([
                                        { key: 'all' as SubFilterType, label: isRtl ? 'الكل' : 'All', count: merchants.length },
                                        { key: 'active' as SubFilterType, label: isRtl ? 'نشط' : 'Active', count: merchants.filter(m => m.is_paid && m.plan_expires_at && new Date(m.plan_expires_at) > new Date()).length },
                                        { key: 'expiring' as SubFilterType, label: isRtl ? t('t_ef0df880') : 'Expiring', count: overview?.expiring_soon || 0 },
                                        { key: 'expired' as SubFilterType, label: isRtl ? t('t_5b4b544c') : 'Expired', count: overview?.expired_count || 0 },
                                        { key: 'free' as SubFilterType, label: isRtl ? 'مجاني' : 'Free', count: overview?.free_merchants || 0 },
                                    ]).map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => setSubFilter(f.key)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${subFilter === f.key
                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {f.label} <span className="opacity-70">({f.count})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Merchants Table */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-zinc-800/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="px-6 py-4 text-right">{isRtl ? t('t_dad12dff') : 'Merchant'}</th>
                                                <th className="px-6 py-4 text-center">{isRtl ? 'الخطة' : 'Plan'}</th>
                                                <th className="px-6 py-4 text-center">{isRtl ? t('t_dad28dfc') : 'Status'}</th>
                                                <th className="px-6 py-4 text-center">{isRtl ? t('t_dda0f60e') : 'Start Date'}</th>
                                                <th className="px-6 py-4 text-center">{isRtl ? t('t_b1e732c8') : 'Expiry Date'}</th>
                                                <th className="px-6 py-4 text-center">{isRtl ? t('t_d55ac919') : 'Days Left'}</th>
                                                <th className="px-6 py-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                                            {filteredMerchants.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center">
                                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2 block">search_off</span>
                                                        <p className="text-slate-400 font-medium">{isRtl ? t('t_49591867') : 'No results found'}</p>
                                                    </td>
                                                </tr>
                                            ) : filteredMerchants.map(m => {
                                                const badge = getPlanBadge(m.plan);
                                                const status = getSubscriptionStatus(m);
                                                const daysLeft = getDaysRemaining(m.plan_expires_at);

                                                return (
                                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {m.avatar_url ? (
                                                                    <img src={m.avatar_url} alt="Profile" className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-zinc-800" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                                                                        {(m.full_name || m.store_name || m.store_slug || '?').charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{m.full_name || m.store_name || m.store_slug || 'Unknown'}</p>
                                                                    <p className="text-[11px] text-slate-400 font-mono">{m.store_slug ? `@${m.store_slug}` : m.id.slice(0, 12)}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${status.color}`}>{status.label}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">{formatDate(m.plan_started_at)}</td>
                                                        <td className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">{formatDate(m.plan_expires_at)}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            {daysLeft !== null ? (
                                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${daysLeft < 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                    : daysLeft <= 7 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                                        : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                                    }`}>
                                                                    {daysLeft < 0 ? (isRtl ? `منتهي منذ ${Math.abs(daysLeft)} يوم` : `${Math.abs(daysLeft)}d ago`) : `${daysLeft} ${isRtl ? t('t_1864c7') : 'days'}`}
                                                                </span>
                                                            ) : <span className="text-slate-400">—</span>}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => { setSelectedMerchant(m); setShowMerchantModal(true); }}
                                                                className="opacity-0 group-hover:opacity-100 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all inline-flex items-center gap-1"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                                {isRtl ? t('t_dfc44c7f') : 'Details'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table Footer */}
                                <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                    <p className="text-xs text-slate-400 font-medium">
                                        {isRtl ? `عرض ${filteredMerchants.length} من ${merchants.length} تاجر` : `Showing ${filteredMerchants.length} of ${merchants.length} merchants`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===================== INVOICES TAB ===================== */}
                    {activeTab === 'invoices' && (
                        <div className="space-y-6 animate-slide-in">
                            {invoices.length === 0 ? (
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-12 text-center shadow-sm">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-400">receipt_long</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">{isRtl ? t('t_431f20f1') : 'No invoices yet'}</h3>
                                    <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">{isRtl ? t('t_34c53ea2') : 'No invoices recorded yet. Create one manually or they appear automatically on payment.'}</p>
                                    <button
                                        onClick={() => setShowCreateInvoiceModal(true)}
                                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-pink-600 transition-all shadow-lg shadow-primary/20 inline-flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        {isRtl ? t('t_2f5196cf') : 'Create Invoice'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{isRtl ? t('t_5ec6a2a3') : 'Invoice History'}</h3>
                                        <span className="text-xs text-slate-400 font-medium">{invoices.length} {isRtl ? t('t_59700fc') : 'invoices'}</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-zinc-800/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    <th className="px-6 py-4 text-right">{isRtl ? t('t_d84e8a5') : 'Invoice ID'}</th>
                                                    <th className="px-6 py-4 text-right">{isRtl ? t('t_dad12dff') : 'Merchant'}</th>
                                                    <th className="px-6 py-4 text-center">{isRtl ? t('t_dadd7ab6') : 'Amount'}</th>
                                                    <th className="px-6 py-4 text-center">{isRtl ? 'الخطة' : 'Plan'}</th>
                                                    <th className="px-6 py-4 text-center">{isRtl ? t('t_dad28dfc') : 'Status'}</th>
                                                    <th className="px-6 py-4 text-center">{isRtl ? t('t_c80709e1') : 'Method'}</th>
                                                    <th className="px-6 py-4 text-center">{isRtl ? 'التاريخ' : 'Date'}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                                                {invoices.map(inv => {
                                                    const invBadge = getPlanBadge(inv.plan || 'free');
                                                    const m = merchants.find(merchant => merchant.id === inv.profile_id);
                                                    return (
                                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">INV-{inv.id.slice(0, 8).toUpperCase()}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center gap-2">
                                                                    {m?.avatar_url ? (
                                                                         <img src={m.avatar_url} alt="Profile" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-sm">
                                                                            {(m?.full_name || m?.store_name || m?.store_slug || '?').charAt(0)}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{m?.full_name || m?.store_name || m?.store_slug || 'Unknown'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{Number(inv.amount).toLocaleString()} {isRtl ? 'د.ج' : 'DZD'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${invBadge.bg} ${invBadge.text}`}>{invBadge.label}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${getInvoiceStatusStyle(inv.status)}`}>
                                                                    {inv.status === 'paid' ? (isRtl ? t('t_5b413628') : 'Paid') :
                                                                        inv.status === 'pending' ? (isRtl ? t('t_2f1bc12') : 'Pending') :
                                                                            inv.status === 'failed' ? (isRtl ? t('t_184091') : 'Failed') :
                                                                                inv.status === 'refunded' ? (isRtl ? t('t_d1326a2') : 'Refunded') : inv.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">{inv.payment_method || '—'}</td>
                                                            <td className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">{formatDate(inv.created_at)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ===================== MERCHANT DETAIL MODAL ===================== */}
            {showMerchantModal && selectedMerchant && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMerchantModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl animate-slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-l from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 border-b border-slate-100 dark:border-zinc-800 relative">
                            <button onClick={() => setShowMerchantModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="flex items-center gap-4">
                                {selectedMerchant.avatar_url ? (
                                    <img src={selectedMerchant.avatar_url} alt="Profile" className="w-14 h-14 rounded-2xl object-cover shadow-xl border-2 border-white dark:border-zinc-800" />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center text-primary font-black text-xl border-2 border-white dark:border-zinc-800">
                                        {(selectedMerchant.full_name || selectedMerchant.store_name || selectedMerchant.store_slug || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedMerchant.full_name || selectedMerchant.store_name || selectedMerchant.store_slug || 'Unknown'}</h3>
                                    <p className="text-xs text-slate-400 font-mono">{selectedMerchant.store_slug ? `@${selectedMerchant.store_slug}` : selectedMerchant.id.slice(0, 16)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {[
                                { label: isRtl ? t('t_c4187bef') : 'Current Plan', value: getPlanBadge(selectedMerchant.plan).label, isTag: true, tagClass: `${getPlanBadge(selectedMerchant.plan).bg} ${getPlanBadge(selectedMerchant.plan).text}` },
                                { label: isRtl ? t('t_5dd7dae') : 'Status', value: getSubscriptionStatus(selectedMerchant).label, isTag: true, tagClass: getSubscriptionStatus(selectedMerchant).color },
                                { label: isRtl ? t('t_75d45038') : 'Registered', value: formatDate(selectedMerchant.created_at) },
                                { label: isRtl ? t('t_dda0f60e') : 'Plan Start', value: formatDate(selectedMerchant.plan_started_at) },
                                { label: isRtl ? t('t_b1e732c8') : 'Plan Expiry', value: formatDate(selectedMerchant.plan_expires_at) },
                                { label: isRtl ? t('t_d55ac919') : 'Days Remaining', value: (() => {
                                    const d = getDaysRemaining(selectedMerchant.plan_expires_at);
                                    if (d === null) return '—';
                                    if (d < 0) return isRtl ? `منتهي منذ ${Math.abs(d)} يوم` : `Expired ${Math.abs(d)} days ago`;
                                    return `${d} ${isRtl ? t('t_1864c7') : 'days'}`;
                                })() },
                                { label: isRtl ? t('t_b55b17db') : 'Merchant ID', value: selectedMerchant.id, isMono: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                                    {item.isTag ? (
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${item.tagClass}`}>{item.value}</span>
                                    ) : (
                                        <span className={`text-sm font-bold text-slate-800 dark:text-slate-100 ${item.isMono ? 'font-mono text-xs' : ''}`}>{item.value}</span>
                                    )}
                                </div>
                            ))}

                            {/* Subscription Progress */}
                            {selectedMerchant.plan_started_at && selectedMerchant.plan_expires_at && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-zinc-800/30 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{isRtl ? t('t_8b5690bf') : 'Subscription Progress'}</p>
                                    {(() => {
                                        const start = new Date(selectedMerchant.plan_started_at!).getTime();
                                        const end = new Date(selectedMerchant.plan_expires_at!).getTime();
                                        const now = Date.now();
                                        const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                                        return (
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full progress-bar ${progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        );
                                    })()}
                                    <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                                        <span>{formatDate(selectedMerchant.plan_started_at)}</span>
                                        <span>{formatDate(selectedMerchant.plan_expires_at)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== CREATE INVOICE MODAL ===================== */}
            {showCreateInvoiceModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreateInvoiceModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl animate-slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{isRtl ? t('t_db75711d') : 'New Invoice'}</h3>
                            <button onClick={() => setShowCreateInvoiceModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Merchant Select */}
                            <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1.5">{isRtl ? t('t_dad12dff') : 'Merchant'}</label>
                                <select
                                    value={invoiceForm.profile_id}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, profile_id: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 font-cairo"
                                >
                                    <option value="">{isRtl ? t('t_57d82edd') : 'Select merchant...'}</option>
                                    {merchants.map(m => (
                                        <option key={m.id} value={m.id}>{m.full_name || m.store_name || m.store_slug || m.id.slice(0, 12)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1.5">{isRtl ? t('t_10a7ddda') : 'Amount (DZD)'}</label>
                                <input
                                    type="number"
                                    value={invoiceForm.amount}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                                    placeholder="1000"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 font-cairo"
                                />
                            </div>

                            {/* Plan */}
                            <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1.5">{isRtl ? 'الخطة' : 'Plan'}</label>
                                <select
                                    value={invoiceForm.plan}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, plan: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 font-cairo"
                                >
                                    <option value="pro">PRO ⭐</option>
                                    <option value="vip">VIP 👑</option>
                                </select>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1.5">{isRtl ? t('t_c80709e1') : 'Payment Method'}</label>
                                <select
                                    value={invoiceForm.payment_method}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, payment_method: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 font-cairo"
                                >
                                    <option value="CCP">CCP</option>
                                    <option value="BaridiMob">BaridiMob</option>
                                    <option value="Chargily">Chargily</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">{isRtl ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1.5">{isRtl ? t('t_dad28dfc') : 'Status'}</label>
                                <select
                                    value={invoiceForm.status}
                                    onChange={e => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 font-cairo"
                                >
                                    <option value="paid">{isRtl ? t('t_5b413628') : 'Paid'}</option>
                                    <option value="pending">{isRtl ? t('t_2f1bc12') : 'Pending'}</option>
                                    <option value="failed">{isRtl ? t('t_184091') : 'Failed'}</option>
                                    <option value="refunded">{isRtl ? t('t_d1326a2') : 'Refunded'}</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleCreateInvoice}
                                disabled={!invoiceForm.profile_id || !invoiceForm.amount || invoiceSubmitting}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-pink-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {invoiceSubmitting ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                        {isRtl ? t('t_37e9c14c') : 'Create Invoice'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
