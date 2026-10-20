"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

interface Merchant {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    store_slug: string | null;
    store_name: string | null;
    store_domain: string | null;
    store_id: string | null;
    plan: string;
    is_paid: boolean;
    plan_started_at: string | null;
    plan_expires_at: string | null;
    created_at: string;
    whatsapp_number: string | null;
    custom_domain: string | null;
    products_count: number;
    orders_count: number;
}

type FilterType = 'all' | 'pro' | 'vip' | 'free' | 'blocked' | 'expired';

export default function SuperAdminMerchants() {
    const { t, lang } = useI18n();
    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized } = useAdminGuard();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterType>('all');
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const router = useRouter();
    const isRtl = lang === 'ar';

    // Show notification helper
    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    useEffect(() => {
        if (!isAuthorized) return;
        const loadData = async () => {
            try {
                await fetchMerchants();
            } catch (err) {
                console.error("Error loading merchants:", err);
            } finally {
                setIsDataLoading(false);
            }
        };
        loadData();
    }, [isAuthorized]);

    const fetchMerchants = async () => {
        try {
            // Fetch profiles and stores in parallel
            const [profilesRes, storesRes, productsRes, ordersRes] = await Promise.all([
                insforge.database.from('profiles')
                    .select('id, full_name, avatar_url, store_slug, plan, is_paid, plan_started_at, plan_expires_at, created_at, whatsapp_number, custom_domain')
                    .order('created_at', { ascending: false }),
                insforge.database.from('stores')
                    .select('id, user_id, store_name, store_domain'),
                // Get product counts per merchant
                insforge.database.from('products')
                    .select('user_id'),
                // Get order counts per merchant
                insforge.database.from('orders')
                    .select('store_id'),
            ]);

            if (profilesRes.data) {
                // Build stores map by user_id
                const storesMap = new Map<string, any>();
                if (storesRes.data) {
                    storesRes.data.forEach((s: any) => storesMap.set(s.user_id, s));
                }

                // Build product count map
                const productCounts = new Map<string, number>();
                if (productsRes.data) {
                    productsRes.data.forEach((p: any) => {
                        productCounts.set(p.user_id, (productCounts.get(p.user_id) || 0) + 1);
                    });
                }

                // Build order count map (by store_id -> user_id)
                const storeUserMap = new Map<string, string>();
                if (storesRes.data) {
                    storesRes.data.forEach((s: any) => storeUserMap.set(s.id, s.user_id));
                }
                const orderCounts = new Map<string, number>();
                if (ordersRes.data) {
                    ordersRes.data.forEach((o: any) => {
                        const userId = storeUserMap.get(o.store_id);
                        if (userId) {
                            orderCounts.set(userId, (orderCounts.get(userId) || 0) + 1);
                        }
                    });
                }

                const mapped: Merchant[] = profilesRes.data.map((p: any) => {
                    const store = storesMap.get(p.id);
                    return {
                        id: p.id,
                        email: '', // Not available from profiles
                        full_name: p.full_name,
                        avatar_url: p.avatar_url,
                        store_slug: p.store_slug,
                        store_name: store?.store_name || null,
                        store_domain: store?.store_domain || null,
                        store_id: store?.id || null,
                        plan: p.plan || 'free',
                        is_paid: p.is_paid || false,
                        plan_started_at: p.plan_started_at,
                        plan_expires_at: p.plan_expires_at,
                        created_at: p.created_at,
                        whatsapp_number: p.whatsapp_number,
                        custom_domain: p.custom_domain,
                        products_count: productCounts.get(p.id) || 0,
                        orders_count: orderCounts.get(p.id) || 0,
                    };
                });

                setMerchants(mapped);
            }
        } catch (err) {
            console.error("Error fetchMerchants:", err);
        }
    };

    // ============= ACTIONS =============

    const handleUpdatePlan = async (merchantId: string, newPlan: string, isPaid: boolean) => {
        setActionLoading(merchantId);
        try {
            const now = new Date();
            const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            const res = await fetch('/api/admin/update-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId,
                    newPlan,
                    isPaid,
                    planStartedAt: isPaid ? now.toISOString() : null,
                    planExpiresAt: isPaid ? oneMonthLater.toISOString() : null,
                })
            });

            const data = await res.json();
            if (data.success) {
                // Update local state
                setMerchants(prev => prev.map(m =>
                    m.id === merchantId ? { ...m, plan: newPlan, is_paid: isPaid, plan_started_at: isPaid ? now.toISOString() : m.plan_started_at, plan_expires_at: isPaid ? oneMonthLater.toISOString() : m.plan_expires_at } : m
                ));
                showNotification('success', isRtl ? t('t_39ff2b7f') : 'Plan updated successfully');
                setShowPlanModal(false);
            } else {
                showNotification('error', data.error || (isRtl ? 'حدث خطأ' : 'An error occurred'));
            }
        } catch (err) {
            console.error("Failed to update plan:", err);
            showNotification('error', isRtl ? t('t_369386e8') : 'Failed to update plan');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleBlock = async (merchant: Merchant) => {
        const isBlocked = merchant.plan === 'blocked';
        const newPlan = isBlocked ? 'free' : 'blocked';
        const isPaid = false;

        setActionLoading(merchant.id);
        try {
            const res = await fetch('/api/admin/update-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchantId: merchant.id, newPlan, isPaid })
            });

            const data = await res.json();
            if (data.success) {
                setMerchants(prev => prev.map(m =>
                    m.id === merchant.id ? { ...m, plan: newPlan, is_paid: isPaid } : m
                ));
                showNotification('success',
                    isBlocked
                        ? (isRtl ? t('t_910fa67d') : 'Merchant unblocked successfully')
                        : (isRtl ? t('t_c91950f2') : 'Merchant blocked successfully')
                );
            } else {
                showNotification('error', data.error || (isRtl ? 'حدث خطأ' : 'An error occurred'));
            }
        } catch (err) {
            showNotification('error', isRtl ? t('t_bb9271ea') : 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLoginAsMerchant = (merchant: Merchant) => {
        // Open the merchant's store in a new tab
        const domain = merchant.store_domain || merchant.store_slug;
        if (domain) {
            window.open(`/${domain}`, '_blank');
        } else {
            showNotification('error', isRtl ? t('t_960b0428') : 'No store link available');
        }
    };

    const handleDeleteOrphanStore = async (storeId: string) => {
        if (!confirm(isRtl ? t('t_bbd57a19') : 'Are you sure you want to permanently delete this store?')) return;
        setActionLoading(storeId);
        try {
            const { error } = await insforge.database.from('stores').delete().eq('id', storeId);
            if (!error) {
                setMerchants(prev => prev.filter(m => m.store_id !== storeId));
                showNotification('success', isRtl ? t('t_98a6d422') : 'Store deleted successfully');
            }
        } catch (err) {
            showNotification('error', isRtl ? t('t_c2c1a7b1') : 'Failed to delete store');
        } finally {
            setActionLoading(null);
        }
    };

    // ============= HELPERS =============

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'vip': return { label: 'VIP 👑', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' };
            case 'pro': return { label: 'PRO ⭐', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400', dot: 'bg-pink-500' };
            case 'blocked': return { label: isRtl ? t('t_8be5a3e4') : 'Blocked 🚫', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' };
            case 'expired': return { label: isRtl ? t('t_b5c7991c') : 'Expired ⏰', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' };
            default: return { label: isRtl ? t('t_8940abb7') : 'FREE 🆓', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' };
        }
    };

    const getSubscriptionStatus = (m: Merchant) => {
        if (m.plan === 'blocked') return { label: isRtl ? 'محظور' : 'Blocked', color: 'bg-red-50 dark:bg-red-900/30 text-red-600', icon: 'block' };
        if (m.plan === 'free' && !m.is_paid) return { label: isRtl ? 'مجاني' : 'Free', color: 'bg-slate-50 dark:bg-slate-800 text-slate-500', icon: 'person' };
        if (m.plan_expires_at) {
            const daysLeft = Math.ceil((new Date(m.plan_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysLeft < 0) return { label: isRtl ? t('t_5b4b544c') : 'Expired', color: 'bg-red-50 dark:bg-red-900/30 text-red-600', icon: 'timer_off' };
            if (daysLeft <= 7) return { label: isRtl ? `${daysLeft} يوم` : `${daysLeft}d left`, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600', icon: 'schedule' };
        }
        return { label: isRtl ? 'نشط' : 'Active', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600', icon: 'check_circle' };
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString(isRtl ? 'ar-DZ' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return isRtl ? 'اليوم' : 'Today';
        if (days === 1) return isRtl ? t('t_17d1f1') : 'Yesterday';
        if (days < 30) return isRtl ? `منذ ${days} يوم` : `${days}d ago`;
        const months = Math.floor(days / 30);
        return isRtl ? `منذ ${months} شهر` : `${months}mo ago`;
    };

    // ============= FILTERED DATA =============

    const filteredMerchants = useMemo(() => {
        let filtered = merchants;
        const now = new Date();

        switch (statusFilter) {
            case 'pro': filtered = filtered.filter(m => m.plan === 'pro'); break;
            case 'vip': filtered = filtered.filter(m => m.plan === 'vip'); break;
            case 'free': filtered = filtered.filter(m => m.plan === 'free' && !m.is_paid); break;
            case 'blocked': filtered = filtered.filter(m => m.plan === 'blocked'); break;
            case 'expired': filtered = filtered.filter(m => m.plan_expires_at && new Date(m.plan_expires_at) < now && m.plan !== 'free' && m.plan !== 'blocked'); break;
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                (m.full_name?.toLowerCase() || '').includes(q) ||
                (m.store_slug?.toLowerCase() || '').includes(q) ||
                (m.store_name?.toLowerCase() || '').includes(q) ||
                (m.store_domain?.toLowerCase() || '').includes(q) ||
                m.id.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [merchants, statusFilter, searchQuery]);

    // Stats
    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: merchants.length,
            pro: merchants.filter(m => m.plan === 'pro').length,
            vip: merchants.filter(m => m.plan === 'vip').length,
            free: merchants.filter(m => m.plan === 'free' && !m.is_paid).length,
            blocked: merchants.filter(m => m.plan === 'blocked').length,
            expired: merchants.filter(m => m.plan_expires_at && new Date(m.plan_expires_at) < now && m.plan !== 'free' && m.plan !== 'blocked').length,
        };
    }, [merchants]);

    if (isAuthLoading || isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950 text-primary">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm font-bold text-slate-400 animate-pulse">{isRtl ? t('t_75cff4f9') : 'Loading merchants...'}</p>
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
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slideInUp 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes notifSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-notif { animation: notifSlide 0.3s ease-out; }
      `}} />

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-notif flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border ${notification.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/80 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/80 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
                    }`}>
                    <span className="material-symbols-outlined text-[20px]">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
                    <span className="text-sm font-bold">{notification.message}</span>
                </div>
            )}

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
                    <Link href="/super-admin/merchants" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
                        <span className="material-symbols-outlined">storefront</span>
                        <span className="font-semibold text-sm">{isRtl ? t('t_dad14029') : 'Merchants'}</span>
                    </Link>
                    <Link href="/super-admin/billing" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="font-semibold text-sm">{isRtl ? t('t_d141d026') : 'Billing'}</span>
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
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{isRtl ? t('t_45fac514') : 'Merchant Management'}</h2>
                            <p className="text-xs text-slate-400 font-medium">{isRtl ? t('t_cb71a53a') : 'Complete merchant, store & subscription management'}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setIsDataLoading(true); fetchMerchants().finally(() => setIsDataLoading(false)); }}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                            {isRtl ? t('t_59c38f6d') : 'Refresh'}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-[1400px] w-full mx-auto space-y-6">

                    {/* KPI Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        {[
                            { key: 'all' as FilterType, label: isRtl ? 'الكل' : 'All', count: stats.total, icon: 'group', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', border: 'border-slate-200' },
                            { key: 'vip' as FilterType, label: 'VIP 👑', count: stats.vip, icon: 'diamond', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', border: 'border-amber-200' },
                            { key: 'pro' as FilterType, label: 'PRO ⭐', count: stats.pro, icon: 'star', color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400', border: 'border-pink-200' },
                            { key: 'free' as FilterType, label: isRtl ? 'مجاني' : 'Free', count: stats.free, icon: 'person', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', border: 'border-blue-200' },
                            { key: 'expired' as FilterType, label: isRtl ? t('t_5b4b544c') : 'Expired', count: stats.expired, icon: 'timer_off', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400', border: 'border-orange-200' },
                            { key: 'blocked' as FilterType, label: isRtl ? 'محظور' : 'Blocked', count: stats.blocked, icon: 'block', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400', border: 'border-red-200' },
                        ].map(stat => (
                            <button
                                key={stat.key}
                                onClick={() => setStatusFilter(stat.key)}
                                className={`p-4 rounded-2xl border transition-all hover-lift cursor-pointer ${statusFilter === stat.key
                                    ? `${stat.color} ${stat.border} shadow-md ring-2 ring-primary/20`
                                    : `bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:border-slate-200`
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`material-symbols-outlined text-[18px] ${statusFilter === stat.key ? '' : 'text-slate-400'}`}>{stat.icon}</span>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stat.count}</p>
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={isRtl ? t('t_d6787d0e') : 'Search by name, store, or domain...'}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pr-12 pl-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-cairo"
                            />
                        </div>
                    </div>

                    {/* Merchants Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden animate-slide-in">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-zinc-800/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                                        <th className="px-6 py-4 text-right">{isRtl ? t('t_dad12dff') : 'Merchant'}</th>
                                        <th className="px-4 py-4 text-center">{isRtl ? t('t_dadd7f47') : 'Store'}</th>
                                        <th className="px-4 py-4 text-center">{isRtl ? 'الخطة' : 'Plan'}</th>
                                        <th className="px-4 py-4 text-center">{isRtl ? t('t_dad28dfc') : 'Status'}</th>
                                        <th className="px-4 py-4 text-center">{isRtl ? t('t_9b052503') : 'Products'}</th>
                                        <th className="px-4 py-4 text-center">{isRtl ? 'الطلبات' : 'Orders'}</th>
                                        <th className="px-4 py-4 text-center">{isRtl ? t('t_7f5a0fa0') : 'Joined'}</th>
                                        <th className="px-4 py-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                                    {filteredMerchants.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center">
                                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 block mb-3">search_off</span>
                                                <p className="text-slate-400 font-bold text-sm">{isRtl ? t('t_c2666633') : 'No matching results'}</p>
                                                <p className="text-slate-300 text-xs mt-1">{isRtl ? t('t_8a5b5fcf') : 'Try changing search or filter'}</p>
                                            </td>
                                        </tr>
                                    ) : filteredMerchants.map(merchant => {
                                        const badge = getPlanBadge(merchant.plan);
                                        const status = getSubscriptionStatus(merchant);
                                        const isBlocked = merchant.plan === 'blocked';

                                        return (
                                            <tr key={merchant.id} className={`transition-colors group ${isBlocked ? 'bg-red-50/30 dark:bg-red-900/5' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/30'}`}>
                                                {/* Merchant */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {merchant.avatar_url && !isBlocked ? (
                                                            <img src={merchant.avatar_url} alt="Profile" className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-zinc-800" />
                                                        ) : (
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${isBlocked
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                                                : 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400'
                                                                }`}>
                                                                {isBlocked
                                                                    ? <span className="material-symbols-outlined text-[18px]">block</span>
                                                                    : (merchant.full_name || merchant.store_name || merchant.store_slug || '?').charAt(0).toUpperCase()
                                                                }
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className={`text-sm font-bold ${isBlocked ? 'text-red-600 dark:text-red-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                                                                {merchant.full_name || merchant.store_name || merchant.store_slug || 'Unknown'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 font-mono">ID: {merchant.id.slice(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Store */}
                                                <td className="px-4 py-4 text-center">
                                                    {merchant.store_domain ? (
                                                        <a href={`/${merchant.store_domain}`} target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg hover:text-primary hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all">
                                                            {merchant.store_domain}
                                                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </td>

                                                {/* Plan */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${badge.bg} ${badge.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                                        {badge.label}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${status.color}`}>
                                                        <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
                                                        {status.label}
                                                    </span>
                                                </td>

                                                {/* Products */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{merchant.products_count}</span>
                                                </td>

                                                {/* Orders */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{merchant.orders_count}</span>
                                                </td>

                                                {/* Joined */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className="text-xs text-slate-400 font-medium">{getTimeAgo(merchant.created_at)}</span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {/* View Details */}
                                                        <button
                                                            onClick={() => { setSelectedMerchant(merchant); setShowDetailModal(true); }}
                                                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 flex items-center justify-center transition-colors"
                                                            title={isRtl ? t('t_dfc44c7f') : 'Details'}
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                        </button>

                                                        {/* Change Plan */}
                                                        {!isBlocked && (
                                                            <button
                                                                onClick={() => { setSelectedMerchant(merchant); setShowPlanModal(true); }}
                                                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 flex items-center justify-center transition-colors"
                                                                title={isRtl ? t('t_b53a2c24') : 'Change Plan'}
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">swap_vert</span>
                                                            </button>
                                                        )}

                                                        {/* Visit Store */}
                                                        {merchant.store_domain && (
                                                            <button
                                                                onClick={() => handleLoginAsMerchant(merchant)}
                                                                className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center transition-colors"
                                                                title={isRtl ? t('t_5e2b4460') : 'Visit Store'}
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">storefront</span>
                                                            </button>
                                                        )}

                                                        {/* Block/Unblock */}
                                                        <button
                                                            onClick={() => handleToggleBlock(merchant)}
                                                            disabled={actionLoading === merchant.id}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isBlocked
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                                                                }`}
                                                            title={isBlocked ? (isRtl ? t('t_912d4f5e') : 'Unblock') : (isRtl ? t('t_17f5e6') : 'Block')}
                                                        >
                                                            {actionLoading === merchant.id ? (
                                                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-[16px]">{isBlocked ? 'lock_open' : 'block'}</span>
                                                            )}
                                                        </button>
                                                    </div>
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
            </main>

            {/* ===== MERCHANT DETAIL MODAL ===== */}
            {showDetailModal && selectedMerchant && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl animate-slide-in overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className={`p-6 relative ${selectedMerchant.plan === 'blocked'
                            ? 'bg-gradient-to-l from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10'
                            : selectedMerchant.plan === 'vip' ? 'bg-gradient-to-l from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10'
                                : selectedMerchant.plan === 'pro' ? 'bg-gradient-to-l from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-pink-900/10'
                                    : 'bg-gradient-to-l from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30'
                            } border-b border-slate-100 dark:border-zinc-800`}>
                            <button onClick={() => setShowDetailModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="flex items-center gap-4">
                                {selectedMerchant.avatar_url ? (
                                    <img src={selectedMerchant.avatar_url} alt="Profile" className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-zinc-800" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center text-primary font-black text-2xl">
                                        {(selectedMerchant.full_name || selectedMerchant.store_name || selectedMerchant.store_slug || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedMerchant.full_name || selectedMerchant.store_name || 'Unknown'}</h3>
                                    <p className="text-xs text-slate-400">{selectedMerchant.store_slug ? `@${selectedMerchant.store_slug}` : ''}</p>
                                    <div className="mt-1">
                                        {(() => { const b = getPlanBadge(selectedMerchant.plan); return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.bg} ${b.text}`}>{b.label}</span>; })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-3">
                            {[
                                { icon: 'badge', label: isRtl ? t('t_daddb841') : 'ID', value: selectedMerchant.id, mono: true },
                                { icon: 'storefront', label: isRtl ? t('t_d276526e') : 'Store Name', value: selectedMerchant.store_name || '—' },
                                { icon: 'language', label: isRtl ? t('t_feee107b') : 'Store Domain', value: selectedMerchant.store_domain || '—' },
                                { icon: 'public', label: isRtl ? t('t_e49cdf1d') : 'Custom Domain', value: selectedMerchant.custom_domain || '—' },
                                { icon: 'call', label: isRtl ? t('t_11889d49') : 'WhatsApp', value: selectedMerchant.whatsapp_number || '—' },
                                { icon: 'inventory_2', label: isRtl ? t('t_9b052503') : 'Products', value: String(selectedMerchant.products_count) },
                                { icon: 'shopping_cart', label: isRtl ? 'الطلبات' : 'Orders', value: String(selectedMerchant.orders_count) },
                                { icon: 'calendar_today', label: isRtl ? t('t_75d45038') : 'Registered', value: formatDate(selectedMerchant.created_at) },
                                { icon: 'play_arrow', label: isRtl ? t('t_dda0f60e') : 'Plan Start', value: formatDate(selectedMerchant.plan_started_at) },
                                { icon: 'event', label: isRtl ? t('t_b1e732c8') : 'Plan Expiry', value: formatDate(selectedMerchant.plan_expires_at) },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-zinc-800/50 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-slate-400">{item.icon}</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                                    </div>
                                    <span className={`text-sm font-bold text-slate-800 dark:text-slate-100 ${item.mono ? 'font-mono text-[11px]' : ''}`}>{item.value}</span>
                                </div>
                            ))}

                            {/* Subscription Progress */}
                            {selectedMerchant.plan_started_at && selectedMerchant.plan_expires_at && selectedMerchant.plan !== 'blocked' && selectedMerchant.plan !== 'free' && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-zinc-800/30 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{isRtl ? t('t_8b5690bf') : 'Subscription Progress'}</p>
                                    {(() => {
                                        const start = new Date(selectedMerchant.plan_started_at!).getTime();
                                        const end = new Date(selectedMerchant.plan_expires_at!).getTime();
                                        const now = Date.now();
                                        const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                                        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                                        return (
                                            <>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${progress}%` }}></div>
                                                </div>
                                                <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                                                    <span>{formatDate(selectedMerchant.plan_started_at)}</span>
                                                    <span className="font-bold">{daysLeft > 0 ? `${daysLeft} ${isRtl ? 'يوم متبقي' : 'days left'}` : (isRtl ? t('t_5b4b544c') : 'Expired')}</span>
                                                    <span>{formatDate(selectedMerchant.plan_expires_at)}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                {selectedMerchant.store_domain && (
                                    <a href={`/${selectedMerchant.store_domain}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all">
                                        <span className="material-symbols-outlined text-[16px]">storefront</span>
                                        {isRtl ? t('t_5e2b4460') : 'Visit Store'}
                                    </a>
                                )}
                                <button
                                    onClick={() => { setShowDetailModal(false); setShowPlanModal(true); }}
                                    className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
                                    <span className="material-symbols-outlined text-[16px]">swap_vert</span>
                                    {isRtl ? t('t_b53a2c24') : 'Change Plan'}
                                </button>
                                <button
                                    onClick={() => { setShowDetailModal(false); handleToggleBlock(selectedMerchant); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedMerchant.plan === 'blocked'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                                        }`}>
                                    <span className="material-symbols-outlined text-[16px]">{selectedMerchant.plan === 'blocked' ? 'lock_open' : 'block'}</span>
                                    {selectedMerchant.plan === 'blocked' ? (isRtl ? t('t_912d4f5e') : 'Unblock') : (isRtl ? t('t_53e15179') : 'Block')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CHANGE PLAN MODAL ===== */}
            {showPlanModal && selectedMerchant && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPlanModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl animate-slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{isRtl ? t('t_2286487e') : 'Change Merchant Plan'}</h3>
                                <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                {selectedMerchant.full_name || selectedMerchant.store_slug || selectedMerchant.id.slice(0, 12)}
                            </p>
                        </div>

                        <div className="p-6 space-y-3">
                            {[
                                { plan: 'free', label: isRtl ? t('t_8940abb7') : 'Free 🆓', desc: isRtl ? t('t_914a8896') : 'Limited free plan', isPaid: false, bg: 'border-slate-200 hover:border-slate-300', activeBg: 'border-slate-500 bg-slate-50 dark:bg-slate-800/50' },
                                { plan: 'pro', label: 'PRO ⭐', desc: isRtl ? t('t_82ab3ef4') : 'Professional merchant plan', isPaid: true, bg: 'border-pink-200 hover:border-pink-300', activeBg: 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' },
                                { plan: 'vip', label: 'VIP 👑', desc: isRtl ? t('t_a67d3f64') : 'Advanced business plan', isPaid: true, bg: 'border-amber-200 hover:border-amber-300', activeBg: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                            ].map(opt => (
                                <button
                                    key={opt.plan}
                                    onClick={() => handleUpdatePlan(selectedMerchant.id, opt.plan, opt.isPaid)}
                                    disabled={selectedMerchant.plan === opt.plan || actionLoading !== null}
                                    className={`w-full p-4 rounded-2xl border-2 text-right transition-all ${selectedMerchant.plan === opt.plan ? opt.activeBg + ' cursor-default' : opt.bg + ' cursor-pointer'
                                        } ${actionLoading !== null ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{opt.label}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                                        </div>
                                        {selectedMerchant.plan === opt.plan ? (
                                            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                        ) : actionLoading === selectedMerchant.id ? (
                                            <span className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></span>
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">radio_button_unchecked</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
