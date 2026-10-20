'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';
import { hasPermission } from '@/lib/rbac';

export default function AbandonedFormsPage() {
    const { t, lang } = useI18n();
    const { planExpired, currentPlan } = useExpiredPlanGuard();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [storeDomain, setStoreDomain] = useState('');
    const [userRole, setUserRole] = useState<string>('viewer');
    const [forms, setForms] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        total: 0,
        pending: 0,
        contacted: 0,
        converted: 0,
        abandoned: 0,
        totalValue: 0,
        convertedValue: 0,
        conversionRate: 0,
    });
    
    // Filters and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const formsPerPage = 10;
    const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

    const showToast = (msg: string, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        async function load() {
            try {
                const ctx = await getStoreContext();
                if (!ctx) { router.push('/login'); return; }

                setUserRole(ctx.role);
                // Require view_abandoned_carts permission
                if (!hasPermission(ctx.role, 'view_abandoned_carts')) {
                    router.push('/merchant');
                    return;
                }

                const uid = ctx.targetUserId;
                setUserId(uid);
                setStoreDomain(ctx.storeDomain || '');

                // Fetch abandoned forms
                const response = await fetch(`/api/abandoned-forms?userId=${uid}`);
                const data = await response.json();

                if (data.success) {
                    setForms(data.forms || []);
                    setStats(data.stats || {});
                }
            } catch (err) {
                console.error('Error loading abandoned forms:', err);
                showToast(t('t_d9cb36b6'), 'error');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [router]);

    // ── Realtime: live abandoned form notifications ──
    const playAbandonedSound = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const playNote = (freq: number, start: number, dur: number) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, start);
                gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
                osc.start(start);
                osc.stop(start + dur);
            };
            const now = audioCtx.currentTime;
            playNote(440, now, 0.3);       // A4
            playNote(349.23, now + 0.15, 0.4); // F4
        } catch (err) {
            console.log('Audio playback failed:', err);
        }
    };

    const recomputeStats = (allForms: any[]) => {
        setStats({
            total: allForms.length,
            pending: allForms.filter((f: any) => f.status === 'pending').length,
            contacted: allForms.filter((f: any) => f.status === 'contacted').length,
            converted: allForms.filter((f: any) => f.status === 'converted').length,
            abandoned: allForms.filter((f: any) => f.status === 'abandoned').length,
            totalValue: allForms.reduce((sum: number, f: any) => sum + (f.total_price || 0), 0),
            convertedValue: allForms.filter((f: any) => f.status === 'converted').reduce((sum: number, f: any) => sum + (f.total_price || 0), 0),
            conversionRate: allForms.length ? ((allForms.filter((f: any) => f.status === 'converted').length / allForms.length) * 100).toFixed(1) : 0,
        });
    };

    useEffect(() => {
        if (!storeDomain) return;
        let isMounted = true;

        const handleNewAbandonedForm = (newForm: any) => {
            if (!isMounted) return;
            console.log('Received real-time abandoned form:', newForm);
            
            setForms(prev => {
                const existingIdx = prev.findIndex(f => f.id === newForm.id);
                
                // If the form is converted, we want to remove it from the list entirely 
                // so it disappears live, without refresh!
                if (newForm.status === 'converted') {
                    if (existingIdx >= 0) {
                        const updated = [...prev];
                        updated.splice(existingIdx, 1);
                        recomputeStats(updated);
                        return updated;
                    }
                    return prev;
                }

                // For newly tracked or updated abandoned carts (not converted yet):
                playAbandonedSound();
                if (existingIdx >= 0) {
                    // UPDATE: move to top and highlight
                    const updated = [...prev];
                    updated.splice(existingIdx, 1);
                    const result = [{ ...newForm, is_new: true }, ...updated];
                    recomputeStats(result);
                    return result;
                }
                // INSERT: prepend new form
                const result = [{ ...newForm, is_new: true }, ...prev];
                recomputeStats(result);
                return result;
            });

            // Remove "new" highlight after 10 seconds
            setTimeout(() => {
                if (!isMounted) return;
                setForms(prev => prev.map(f => f.id === newForm.id ? { ...f, is_new: false } : f));
            }, 10000);
        };

        insforge.realtime.on('INSERT_abandoned_form', handleNewAbandonedForm);

        const setupRealtime = async () => {
            try {
                if (insforge.realtime.connectionState === 'disconnected') {
                    await insforge.realtime.connect();
                }
                let attempts = 0;
                while (insforge.realtime.connectionState !== 'connected' && attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    attempts++;
                }
                if (insforge.realtime.connectionState === 'connected') {
                    await insforge.realtime.subscribe(`store:${storeDomain}`);
                    console.log('Subscribed to abandoned forms realtime channel');
                }
            } catch (err) {
                console.error('Abandoned forms realtime setup error:', err);
            }
        };

        setupRealtime();

        return () => {
            isMounted = false;
            insforge.realtime.off('INSERT_abandoned_form', handleNewAbandonedForm);
        };
    }, [storeDomain]);

    const filteredForms = forms.filter(form => {
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchName = (form.customer_name || '').toLowerCase().includes(q);
            const matchPhone = (form.customer_phone || '').includes(q);
            const matchProduct = (form.product_name || '').toLowerCase().includes(q);
            if (!matchName && !matchPhone && !matchProduct) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (form.status !== statusFilter) {
                return false;
            }
        } else {
            // When 'all' is selected, we hide 'converted' forms because they are no longer abandoned!
            if (form.status === 'converted') {
                return false;
            }
        }
        
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredForms.length / formsPerPage);
    const paginatedForms = filteredForms.slice((currentPage - 1) * formsPerPage, currentPage * formsPerPage);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: t('t_e7d5c8d'), bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', icon: 'pending' };
            case 'contacted':
                return { label: t('t_d910a58d'), bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', icon: 'phone_in_talk' };
            case 'converted':
                return { label: t('t_d93c94bd'), bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', icon: 'check_circle' };
            case 'abandoned':
                return { label: t('t_5b3eb447'), bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: 'cancel' };
            default:
                return { label: status, bg: 'bg-gray-50 dark:bg-zinc-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-zinc-700', icon: 'help' };
        }
    };

    const handleMarkAsContacted = async (formId: string, currentCallCount: number) => {
        try {
            const response = await fetch('/api/abandoned-forms', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId,
                    status: 'contacted',
                    phoneCallCount: currentCallCount + 1,
                }),
            });

            if (response.ok) {
                showToast(t('t_f5c678b4'));
                // Refresh data
                const refreshResponse = await fetch(`/api/abandoned-forms?userId=${userId}`);
                const refreshData = await refreshResponse.json();
                if (refreshData.success) {
                    setForms(refreshData.forms || []);
                    setStats(refreshData.stats || {});
                }
            } else {
                showToast(t('t_fa181c01'), 'error');
            }
        } catch (err) {
            console.error('Error updating form:', err);
            showToast(t('t_9dcd19ff'), 'error');
        }
    };

    const handleCallCustomer = (phone: string) => {
        window.open(`tel:${phone}`, '_self');
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: new Intl.DateTimeFormat('ar-DZ', { day: 'numeric', month: 'short', year: 'numeric' }).format(date),
            time: new Intl.DateTimeFormat('ar-DZ', { hour: '2-digit', minute: '2-digit' }).format(date)
        };
    };

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="AbandonedCarts" />
                <main className="flex-1 flex items-center justify-center pt-16 md:pt-0">
                    <SOUQAILoader size="md" text={t("t_a9da051d")} />
                </main>
            </div>
        );
    }

    return (
        <>
        {planExpired && (
            <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? 'التاجر المحترف' : 'الخطة المجانية'} />
        )}
        <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar activePage="AbandonedCarts" />

            <main className="flex-1 overflow-y-auto h-screen relative custom-scrollbar pt-16 md:pt-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-8">

                    {/* Toast */}
                    {toast && (
                        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl text-[14px] font-bold ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white animate-in fade-in slide-in-from-top-4'}`}>
                            {toast.msg}
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-[28px] font-black text-[#111827] dark:text-white mb-1 tracking-tight">{t("t_9e2244c4")}</h1>
                            <p className="text-[#6B7280] dark:text-gray-400 font-medium text-[15px]">{t("t_ab703d4")}</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <StoreLinkButton />
                            <NotificationsDropdown />
                            {hasPermission(userRole, 'manage_orders') && (
                                <button className="flex items-center gap-2 px-6 h-12 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white hover:bg-gray-50 dark:bg-zinc-900/50 transition-all shadow-sm  font-bold text-[15px]">
                                    <span className="material-symbols-outlined text-[20px] text-[#6B7280] dark:text-gray-400">file_download</span>
                                    <span>{t("t_1b313396")}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <span className="material-symbols-outlined text-[22px]">description</span>
                                </div>
                                <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t("t_bfdac8f6")}</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.total}</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                    <span className="material-symbols-outlined text-[22px]">pending</span>
                                </div>
                                <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t("t_e7d5c8d")}</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.pending}</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <span className="material-symbols-outlined text-[22px]">check_circle</span>
                                </div>
                                <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t("t_e1f2304f")}</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.converted}</h3>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                    <span className="material-symbols-outlined text-[22px]">trending_up</span>
                                </div>
                                <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t("t_ca457aeb")}</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.conversionRate}%</h3>
                        </div>
                    </div>

                    {/* Forms Table Block */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800/30 flex flex-col min-h-[400px]">
                        
                        {/* Search & Filter Bar */}
                        <div className="p-5 md:p-6 border-b border-gray-50 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-stretch gap-4">
                            <div className="relative w-full md:w-[380px]">
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#6B7280] dark:text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                </div>
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pr-12 pl-4 h-11 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-[14px] font-medium focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63] placeholder:text-gray-400 transition-all"
                                    placeholder={t("t_4a856225")}
                                    type="text"
                                />
                            </div>
                            <div className="flex gap-2 items-center flex-wrap">
                                {/* Status Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`flex items-center gap-2 px-4 h-11 rounded-xl border text-[13px] font-bold transition-colors ${statusFilter !== 'all' ? 'border-[#E91E63] bg-[#E91E63]/5 text-[#E91E63]' : 'border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:bg-zinc-900/50'}`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                        {statusFilter === 'all' ? t('t_85a8f9a5') : getStatusStyles(statusFilter).label}
                                    </button>
                                    {showStatusDropdown && (
                                        <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800/30 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            {[
                                                { value: 'all', label: t('t_2e4421e'), icon: 'list', color: 'text-gray-600 dark:text-gray-400' },
                                                { value: 'pending', label: t('t_e7d5c8d'), icon: 'pending', color: 'text-amber-500' },
                                                { value: 'contacted', label: t('t_d910a58d'), icon: 'phone_in_talk', color: 'text-blue-500' },
                                                { value: 'converted', label: t('t_d93c94bd'), icon: 'check_circle', color: 'text-emerald-500' },
                                                { value: 'abandoned', label: t('t_825620ab'), icon: 'cancel', color: 'text-red-500' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => { setStatusFilter(opt.value); setShowStatusDropdown(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${statusFilter === opt.value ? 'bg-[#E91E63]/5 text-[#E91E63]' : 'text-[#111827] dark:text-white'}`}
                                                >
                                                    <span className={`material-symbols-outlined text-[18px] ${opt.color}`}>{opt.icon}</span>
                                                    {opt.label}
                                                    {statusFilter === opt.value && <span className="material-symbols-outlined text-[16px] mr-auto text-[#E91E63]">check</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800/50">
                                        <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 whitespace-nowrap">{t("t_d581c00")}</th>
                                        <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 whitespace-nowrap">{t("t_59a39cbc")}</th>
                                        <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 whitespace-nowrap">{t("t_dadde820")}</th>
                                        <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 whitespace-nowrap">{t("t_dadc9d49")}</th>
                                        <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 whitespace-nowrap">{t("t_4137b330")}</th>
                                        <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 whitespace-nowrap">{t("t_7f54addb")}</th>
                                        <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 whitespace-nowrap">الحالة</th>
                                        <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 whitespace-nowrap">{t("t_ecf64ca7")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedForms.length === 0 ? (
                                        <tr>
                                            <td colSpan={8}>
                                                <div className="flex flex-col items-center justify-center py-20 px-4">
                                                    <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                                                        <span className="material-symbols-outlined text-[32px] text-gray-400">phone_disabled</span>
                                                    </div>
                                                    <h3 className="text-[16px] font-black text-[#111827] dark:text-white mb-2">{t("t_407f6900")}</h3>
                                                    <p className="text-[14px] text-[#6B7280] dark:text-gray-400 text-center max-w-sm">
                                                        {searchQuery || statusFilter !== 'all' ? t('t_509ba3bb') : 'ستظهر هنا السلات المستعجلة والنماذج التي تم تركها لتتمكن من استهدافها مرة أخرى.'}
                                                    </p>
                                                    {searchQuery || statusFilter !== 'all' ? (
                                                        <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-6 px-6 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-[#111827] dark:text-white rounded-xl text-[13px] font-bold transition-all">{t("t_faec516d")}</button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedForms.map((form) => {
                                            const statusObj = getStatusStyles(form.status);
                                            const dt = formatDateTime(form.created_at);
                                            const isNew = form.is_new;
                                            const tdHoverClass = isNew 
                                                ? 'group-hover:bg-amber-100/50 dark:group-hover:bg-amber-900/40' 
                                                : 'group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/20';
                                            
                                            const tdClass = () => 
                                                `px-6 py-4 ${isNew ? 'bg-amber-50 dark:bg-amber-900/20' : ''} ${tdHoverClass} transition-colors`;

                                            return (
                                                <tr key={form.id} className="group border-b border-gray-50 dark:border-zinc-800/30 transition-colors">
                                                    <td className={tdClass()}>
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-bold text-[#111827] dark:text-white" dir="ltr">{form.customer_phone}</span>
                                                        </div>
                                                    </td>
                                                    <td className={tdClass()}>
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-bold text-[#111827] dark:text-white">{form.customer_name || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className={tdClass()}>
                                                        <div className="flex flex-col max-w-[200px]">
                                                            <span className="text-[13px] font-bold text-[#4B5563] dark:text-gray-300 truncate" title={form.product_name}>{form.product_name || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className={tdClass()}>
                                                        <span className="text-[14px] font-black text-[#111827] dark:text-white">{form.total_price ? `${form.total_price.toLocaleString()} د.ج` : '—'}</span>
                                                    </td>
                                                    <td className={tdClass()}>
                                                        <span className="text-[14px] font-bold text-[#6B7280] dark:text-gray-400">{form.phone_call_count || 0} مكالمات</span>
                                                    </td>
                                                    <td className={tdClass()}>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-bold text-[#4B5563] dark:text-gray-300">{dt.date}</span>
                                                            <span className="text-[12px] font-medium text-[#9CA3AF] dark:text-gray-500">{dt.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className={tdClass()}>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-bold ${statusObj.bg} ${statusObj.text} ${statusObj.border}`}>
                                                            <span className="material-symbols-outlined text-[14px]">{statusObj.icon}</span>
                                                            {statusObj.label}
                                                        </span>
                                                    </td>
                                                    <td className={tdClass()}>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleCallCustomer(form.customer_phone)}
                                                                className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center transition-all shadow-sm "
                                                                title={t("t_73d717d3")}
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">call</span>
                                                            </button>
                                                            {(form.status === 'pending' || form.status === 'contacted') && hasPermission(userRole, 'manage_orders') && (
                                                                <button
                                                                    onClick={() => handleMarkAsContacted(form.id, form.phone_call_count || 0)}
                                                                    className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-all shadow-sm "
                                                                    title={t("t_72cd4d4b")}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-50 dark:border-zinc-800/50 flex items-center justify-between">
                                <span className="text-[13px] font-medium text-[#6B7280] dark:text-gray-400">
                                    عرض {((currentPage - 1) * formsPerPage) + 1} إلى {Math.min(currentPage * formsPerPage, filteredForms.length)} من {filteredForms.length}
                                </span>
                                <div className="flex gap-1" dir="ltr">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-800 text-[#111827] dark:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-bold transition-all ${currentPage === i + 1 ? 'bg-[#E91E63] text-white shadow-md shadow-[#E91E63]/20' : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-[#6B7280] dark:text-gray-400'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-800 text-[#111827] dark:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
        </>
    );
}
