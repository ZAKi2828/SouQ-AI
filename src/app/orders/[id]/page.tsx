'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';
import { hasPermission } from '@/lib/rbac';

export default function OrderDetails({ params }: { params: Promise<{ id: string }> | any }) {
    const { t, lang } = useI18n();
    const router = useRouter();
    const unwrappedParams: any = React.use(params as any);
    const orderId = unwrappedParams.id;

    const WILAYA_MAP: Record<string, string> = {
        '01': t('t_5961d6ef'), '02': t('t_59a3cf94'), '03': t('t_7efafe84'), '04': t('t_d4d5e8ec'), '05': t('t_59a492ee'),
        '06': t('t_59a6ce02'), '07': t('t_59aa62b0'), '08': t('t_2e476f6'), '09': t('t_7f46082b'), '10': t('t_7f47d9e5'),
        '11': t('t_214b2db8'), '12': t('t_2e53414'), '13': t('t_2003d599'), '14': t('t_59d09d20'), '15': t('t_12e401ca'),
        '16': t('t_14062ecbd'), '17': t('t_252d79e3'), '18': t('t_2e69bb6'), '19': t('t_2e9869b'), '20': t('t_5a48397e'),
        '21': t('t_10b3ccbd'), '22': t('t_f6446c85'), '23': t('t_5aa22b1b'), '24': t('t_5b135783'), '25': t('t_7d33f75'),
        '26': t('t_25226a5a'), '27': t('t_6aaa45f8'), '28': t('t_80d6fa04'), '29': t('t_5b458cad'), '30': t('t_5b6c689e'),
        '31': t('t_5b762591'), '32': t('t_59a3a337'), '33': t('t_5987f103'), '34': t('t_3858a5fe'), '35': t('t_4370b9d1'),
        '36': t('t_2528e883'), '37': t('t_59ceec8c'), '38': t('t_eb2b811'), '39': t('t_25212e69'), '40': t('t_5a075cc1'),
        '41': t('t_3b649c66'), '42': t('t_1fbca32a'), '43': t('t_2f1fbca'), '44': t('t_46623a41'), '45': t('t_80e7487b'),
        '46': t('t_412a6c4a'), '47': t('t_5cc3352'), '48': t('t_4b4098f'),
        '49': t('t_29d121de'), '50': t('t_c84fe665'), '51': t('t_51cf158e'), '52': t('t_1e9d42ef'),
        '53': t('t_2eab097a'), '54': t('t_2ea4fac7'), '55': t('t_2e59571'), '56': t('t_2e61b5f'), '57': t('t_25224107'), '58': t('t_80df9bbc')
    };

    const [order, setOrder] = useState<any>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>('');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingCompany, setShippingCompany] = useState('');
    const [showShippingEdit, setShowShippingEdit] = useState(false);
    const [sendingShipping, setSendingShipping] = useState(false);
    const [labelUrl, setLabelUrl] = useState('');
    const [userRole, setUserRole] = useState<string>('viewer');

    useEffect(() => {
        async function fetchOrder() {
            try {
                const ctx = await getStoreContext();
                if (!ctx) { router.push('/login'); return; }
                setUserRole(ctx.role);

                const { data, error } = await insforge.database
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (!error && data) {
                    setOrder(data);
                    setCurrentStatus(data.status || 'pending');
                    setTrackingNumber(data.tracking_number || '');
                    setShippingCompany(data.shipping_company || '');
                    setLabelUrl(data.shipping_label_url || '');

                    // Fetch product image
                    if (data.product_id) {
                        const { data: prod } = await insforge.database
                            .from('products')
                            .select('*')
                            .eq('id', data.product_id)
                            .single();
                        if (prod) setProduct(prod);
                    }
                }
            } catch (err) {
                console.error("Failed to load order", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderId, router]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!hasPermission(userRole, 'manage_orders')) { alert('ليس لديك صلاحية لتحديث حالة الطلب'); return; }
        setUpdating(true);
        try {
            const { error } = await insforge.database
                .from('orders').update({ status: newStatus }).eq('id', orderId);
            if (!error) { setCurrentStatus(newStatus); setShowStatusDropdown(false); }
            else alert(t('t_12683be78'));
        } catch (err) { console.error(err); }
        finally { setUpdating(false); }
    };

    const handleSendToShipping = async () => {
        if (!hasPermission(userRole, 'manage_orders')) { alert('ليس لديك صلاحية لإرسال الطلب للشحن'); return; }
        if (!confirm(t('t_3eedac4cb'))) return;
        setSendingShipping(true);
        try {
            const res = await fetch('/api/shipping/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, storeDomain: order.store_domain })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || t('t_1b8d674d5'));
            } else {
                setTrackingNumber(data.trackingNumber);
                setShippingCompany(data.company);
                setLabelUrl(data.labelUrl || '');
                setCurrentStatus('shipping');
                alert(data.message || t('t_13536022d'));
            }
        } catch (err) {
            console.error(err);
            alert(t('t_76ab15e1'));
        } finally {
            setSendingShipping(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm(t('t_24441b3b'))) return;
        await handleStatusUpdate('cancelled');
    };

    const handleMarkSafe = async () => {
        if (!confirm(t('t_1495b3c2'))) return;
        setUpdating(true);
        try {
            const { error } = await insforge.database
                .from('orders').update({ risk_score: 'safe' }).eq('id', orderId);
            if (!error) { 
                setOrder((prev: any) => ({...prev, risk_score: 'safe'})); 
            }
            else alert(t('t_12683be78'));
        } catch (err) { console.error(err); }
        finally { setUpdating(false); }
    };

    const handleBanCustomer = async () => {
        if (!hasPermission(userRole, 'ban_customers')) { alert('ليس لديك صلاحية لحظر العملاء'); return; }
        if (!confirm(t('t_55a8496f'))) return;
        setUpdating(true);
        try {
            const ctx = await getStoreContext();
            if (!ctx) return;
            const uid = ctx.targetUserId;

            const { data: pixelSettings } = await insforge.database
                .from('store_pixels').select('banned_phones, banned_ips').eq('user_id', uid).single();

            const newPhones = Array.from(new Set([...(pixelSettings?.banned_phones || []), order.customer_phone].filter(Boolean)));
            const newIps = Array.from(new Set([...(pixelSettings?.banned_ips || []), order.customer_ip].filter(Boolean)));
            
            await insforge.database.from('store_pixels').update({
                banned_phones: newPhones,
                banned_ips: newIps
            }).eq('user_id', uid);

            alert('تم إضافة العميل للقائمة السوداء بنجاح ولن يتمكن من الطلب مجدداً.');
            await handleStatusUpdate('cancelled');
        } catch(err) { console.error(err); }
        finally { setUpdating(false); }
    };

    const formatDateFull = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    };
    const formatTimeFull = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat('ar-DZ', { hour: '2-digit', minute: '2-digit' }).format(d);
    };
    const getWilayaName = (code: string) => {
        if (!code) return '—';
        const paddedCode = String(code).padStart(2, '0');
        return WILAYA_MAP[paddedCode] || WILAYA_MAP[code] || code;
    };

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Orders" />
                <main className="flex-1 flex items-center justify-center pt-16 md:pt-0"><SOUQAILoader size="md" text={t('t_8a7372bf')} /></main>
            </div>
        );
    }
    if (!order) {
        return (
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Orders" />
                <main className="flex-1 flex flex-col items-center justify-center gap-3 pt-16 md:pt-0">
                    <span className="material-symbols-outlined text-[48px] text-gray-300">error</span>
                    <h1 className="text-xl font-bold text-[#111827] dark:text-white">{t('t_4ca1bdaf')}</h1>
                    <Link href="/orders" className="text-[#E91E63] hover:underline font-bold">{t('t_d5e705bc')}</Link>
                </main>
            </div>
        );
    }

    const unitPrice = order.quantity ? (parseFloat(order.total_price || 0) / order.quantity) : parseFloat(order.total_price || 0);
    const shippingCost = product?.shipping_free ? 0 : (product?.shipping_home_price || 0);
    const totalWithShipping = parseFloat(order.total_price || 0) + shippingCost;

    let parsedDelivery = t('t_ea9847b9');
    let parsedOptions = '';
    let userNotes = '';

    if (typeof order?.notes === 'string') {
        const parts = order.notes.split('|').map((p: string) => p.trim());
        const remainingParts: string[] = [];

        parts.forEach((p: string) => {
            if (p.startsWith(t('t_6c670e31'))) {
                parsedDelivery = p.replace(t('t_6c670e31'), '').trim();
            } else if (p.startsWith(t('t_10b9b8a94'))) {
                parsedOptions = p.replace(t('t_10b9b8a94'), '').trim();
            } else if (p) {
                remainingParts.push(p);
            }
        });

        userNotes = remainingParts.join(' | ');
    }

    // Timeline
    const statusToStep: Record<string, number> = { 'pending': 1, 'shipping': 2, 'completed': 3, 'cancelled': -1, 'returned': -1 };
    const activeStep = statusToStep[currentStatus] ?? 0;
    const steps = [
        { id: 'received', label: t('t_497e4f26'), icon: 'check_circle' },
        { id: 'confirmed', label: t('t_b50a59d3'), icon: 'verified' },
        { id: 'shipping', label: t('t_b05c8d5c'), icon: 'local_shipping' },
        { id: 'delivered', label: t('t_26b76c91'), icon: 'home' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return { label: t('t_5b49f6eb'), bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
            case 'pending': return { label: t('t_bf09a1dc'), bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500 animate-pulse' };
            case 'shipping': return { label: t('t_b05c8d5c'), bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500 animate-pulse' };
            case 'cancelled': return { label: t('t_2f1e42e'), bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
            case 'returned': return { label: lang === 'ar' ? 'مرتجع' : 'Returned', bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' };
            default: return { label: t('t_bf09a1dc'), bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
        }
    };
    const badge = getStatusBadge(currentStatus);

    return (
        <>
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Orders" />

                <main className="flex-1 overflow-y-auto h-screen custom-scrollbar pt-16 md:pt-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 space-y-6">

                        {/* ═══════════════ HEADER ═══════════════ */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                            <div>
                                <div className="flex items-center gap-2 text-[13px] text-[#6B7280] dark:text-gray-400 font-medium mb-3">
                                    <Link href="/orders" className="hover:text-[#E91E63] transition-colors">{t('t_8018e821')}</Link>
                                    <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                                    <span className="text-[#E91E63] font-bold">{t('t_db2e6023')}</span>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-[28px] font-black text-[#111827] dark:text-white tracking-tight">{t('t_5a84561e')}{order.id.slice(0, 6).toUpperCase()}</h1>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${badge.bg} ${badge.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                        {badge.label}
                                    </span>
                                    {order.risk_score === 'high' && (
                                        <div title={Array.isArray(order.fraud_flags) ? order.fraud_flags.join(' | ') : t('t_57c8b2c6')} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 text-[12px] font-bold">
                                            <span className="material-symbols-outlined text-[16px]">warning</span>
                                            احتيال محتمل
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[13px] text-[#6B7280] dark:text-gray-400 font-medium">
                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                        {formatDateFull(order.created_at)}{t('t_60c')} {formatTimeFull(order.created_at)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => router.push(`/orders/${orderId}/invoice`)} className="flex items-center gap-2 px-5 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-all">
                                    <span className="material-symbols-outlined text-[18px] text-[#6B7280] dark:text-gray-400">print</span>
                                    
                                    {t('t_5a785b06')}
                                </button>
                                <div className="relative">
                                    <button onClick={() => setShowStatusDropdown(!showStatusDropdown)} disabled={updating}
                                        className="flex items-center gap-2 px-5 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-all disabled:opacity-60">
                                        {updating ? <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[18px] text-[#6B7280] dark:text-gray-400">edit</span>}
                                        
                                        {t('t_d0985df1')}
                                    </button>
                                    {showStatusDropdown && (
                                        <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800/30 z-50 overflow-hidden">
                                            {[
                                                { value: 'pending', label: t('t_bf09a1dc'), icon: 'pending', color: 'text-amber-500' },
                                                { value: 'shipping', label: t('t_b05c8d5c'), icon: 'local_shipping', color: 'text-blue-500' },
                                                { value: 'completed', label: t('t_5b49f6eb'), icon: 'check_circle', color: 'text-emerald-500' },
                                                { value: 'returned', label: lang === 'ar' ? 'مرتجع' : 'Returned', icon: 'keyboard_return', color: 'text-purple-500' },
                                            ].map(opt => (
                                                <button key={opt.value} onClick={() => handleStatusUpdate(opt.value)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-colors ${currentStatus === opt.value ? 'bg-[#E91E63]/5 text-[#E91E63]' : 'text-[#111827] dark:text-white'}`}>
                                                    <span className={`material-symbols-outlined text-[18px] ${opt.color}`}>{opt.icon}</span>
                                                    {opt.label}
                                                    {currentStatus === opt.value && <span className="material-symbols-outlined text-[16px] mr-auto text-[#E91E63]">check</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {!trackingNumber ? (
                                    <button onClick={handleSendToShipping} disabled={sendingShipping || currentStatus === 'cancelled' || currentStatus === 'completed'} className="flex items-center gap-2 px-5 h-10 rounded-xl bg-[#E91E63] text-white text-[13px] font-bold hover:bg-[#C2185B] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#E91E63]/25">
                                        {sendingShipping ? <span className="material-symbols-outlined text-[18px] animate-spin">sync</span> : <span className="material-symbols-outlined text-[18px]">local_shipping</span>}
                                        
                                        {t('t_28c2659f')}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            const url = labelUrl || order?.shipping_label_url;
                                            if (url) {
                                                window.open(url, '_blank');
                                            } else {
                                                alert(t('t_12965995e') || 'بوليصة التوصيل غير متوفرة بعد أو لم يتم توليدها.');
                                            }
                                        }} 
                                        className="flex items-center gap-2 px-5 h-10 rounded-xl bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/25"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                        {t('t_57966d0d')}
                                    </button>
                                )}
                                <button onClick={handleCancelOrder} className="flex items-center gap-2 px-5 h-10 rounded-xl bg-red-500 text-white text-[13px] font-bold hover:bg-red-600 transition-all">
                                    
                                    {t('t_912d7653')}
                                </button>
                            </div>
                        </div>

                        {/* ═══════════════ STATUS TIMELINE ═══════════════ */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  px-8 py-8">
                            <div className="flex items-start justify-between relative max-w-2xl mx-auto">
                                {/* Connector Lines */}
                                <div className="absolute top-5 right-[calc(12.5%)] left-[calc(12.5%)] h-[3px] bg-gray-100 z-0"></div>
                                {steps.map((step, i) => {
                                    const isCompleted = i < activeStep;
                                    const isActive = i === activeStep;
                                    const isCancelled = currentStatus === 'cancelled' || currentStatus === 'returned';
                                    return (
                                        <div key={step.id} className="flex flex-col items-center z-10 flex-1 relative">
                                            {/* Colored connector */}
                                            {i > 0 && i <= activeStep && !isCancelled && (
                                                <div className="absolute top-5 h-[3px] -right-full w-full bg-gradient-to-l from-emerald-400 to-emerald-300 z-0" style={{ right: '50%', width: '100%' }}></div>
                                            )}
                                            <div className={`w-11 h-11 rounded-full flex items-center justify-center relative z-10 transition-all ${isCancelled ? (i <= 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400') :
                                                isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' :
                                                    isActive ? 'bg-[#E91E63] text-white shadow-lg shadow-[#E91E63]/30 ring-[5px] ring-[#E91E63]/15' :
                                                        'bg-gray-100 text-gray-400'
                                                }`}>
                                                {isCompleted && !isCancelled ? (
                                                    <span className="material-symbols-outlined text-[22px]">check</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
                                                )}
                                            </div>
                                            <span className={`text-[13px] font-bold mt-3 ${isActive && !isCancelled ? 'text-[#E91E63]' : isCompleted ? 'text-[#111827] dark:text-white' : 'text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400'
                                                }`}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ═══════════════ MAIN 2-COLUMN LAYOUT ═══════════════ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* ──── RIGHT COLUMN (8 cols) ──── */}
                            <div className="lg:col-span-8 flex flex-col gap-6">

                                {/* ── بيانات العميل ── */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-7">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2.5">
                                            <span className="material-symbols-outlined text-[22px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">person</span>
                                            <h3 className="text-[17px] font-black text-[#111827] dark:text-white">{t('t_bbbd22c1')}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={handleBanCustomer} disabled={updating} title={t("t_71c6d38a")}
                                                className="flex items-center justify-center w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all border border-red-100 dark:bg-red-900/20 dark:border-red-900/30">
                                                <span className="material-symbols-outlined text-[18px]">block</span>
                                            </button>
                                            {order.customer_phone && (
                                                <a href={`tel:${order.customer_phone}`}
                                                    className="flex items-center gap-2 px-5 h-9 rounded-full bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/25">
                                                    <span className="material-symbols-outlined text-[16px]">call</span>
                                                    {t('t_2f6918a2')}
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {order.risk_score === 'high' && Array.isArray(order.fraud_flags) && order.fraud_flags.length > 0 && (
                                        <div className="bg-red-50 dark:bg-red-900/10 border-r-4 border-red-500 rounded-lg p-4 mb-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                                                        <h4 className="text-red-700 dark:text-red-400 font-bold text-[14px]">{t("t_31ec29f0")}</h4>
                                                    </div>
                                                    <ul className="list-disc list-inside text-red-600 dark:text-red-300 text-[13px] space-y-1">
                                                        {order.fraud_flags.map((flag: string, idx: number) => (
                                                            <li key={idx}>{flag}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <button onClick={handleMarkSafe} disabled={updating} className="flex whitespace-nowrap items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-[12px] font-bold rounded-lg transition-colors border border-red-200 dark:border-red-800 disabled:opacity-50">
                                                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                                                    الطلب سليم
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                        <div>
                                            <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 block mb-1.5">{t('t_1155ce44')}</span>
                                            <span className="text-[15px] font-black text-[#111827] dark:text-white">{order.customer_name || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 block mb-1.5">{t('t_d581c00')}</span>
                                            <span className="text-[15px] font-bold text-[#111827] dark:text-white" dir="ltr">{order.customer_phone || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 block mb-1.5">{t('t_8108782d')}</span>
                                            <span className="text-[15px] font-black text-[#111827] dark:text-white">{getWilayaName(order.customer_state)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 block mb-1.5">{t('t_11dd67715')}</span>
                                            <span className="text-[15px] font-black text-[#111827] dark:text-white">
                                                {parsedDelivery}{parsedDelivery.includes(t('t_2f1de5c')) ? <span className="material-symbols-outlined text-[16px] mr-1 align-text-bottom text-[#E91E63]">storefront</span> : <span className="material-symbols-outlined text-[16px] mr-1 align-text-bottom text-emerald-500">home</span>}
                                            </span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 block mb-1.5">{t('t_4a5dfd85')}</span>
                                            <span className="text-[14px] font-bold text-[#111827] dark:text-white">{order.customer_address || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ── المنتجات المطلوبة ── */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-7">
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <span className="material-symbols-outlined text-[22px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">shopping_bag</span>
                                        <h3 className="text-[17px] font-black text-[#111827] dark:text-white">{t('t_1979cadd1')}</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead>
                                                <tr className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800/30">
                                                    <th className="pb-3 font-bold">{t('t_252217e0')}</th>
                                                    <th className="pb-3 font-bold text-center">{t('t_25230082')}</th>
                                                    <th className="pb-3 font-bold text-center">{t('t_5e13decf')}</th>
                                                    <th className="pb-3 font-bold text-left">{t('t_9cf81b14')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-zinc-800/30">
                                                                {product?.image_url ? (
                                                                    <img src={product.image_url} alt={order.product_name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                        <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-[14px] font-bold text-[#111827] dark:text-white">{order.product_name || t('t_213c8c66')}</p>
                                                                <p className="text-[11px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 mt-0.5">SKU: {product?.product_slug || order.product_id?.slice(0, 10) || '—'}</p>
                                                                {parsedOptions && (
                                                                    <p className="text-[12px] font-bold text-[#E91E63] mt-1.5 bg-[#E91E63]/5 border border-[#E91E63]/10 inline-block px-2.5 py-1 rounded-lg">
                                                                        {parsedOptions}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="text-[14px] font-bold text-[#111827] dark:text-white">{order.quantity || 1} x</span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="text-[14px] font-bold text-[#111827] dark:text-white">{unitPrice.toLocaleString()}  {t('t_17422d')}</span>
                                                    </td>
                                                    <td className="py-4 text-left">
                                                        <span className="text-[14px] font-black text-[#E91E63]">{parseFloat(order.total_price || 0).toLocaleString()}  {t('t_17422d')}</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* ── ملاحظات العميل ── */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-7">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <span className="material-symbols-outlined text-[22px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">chat_bubble</span>
                                        <h3 className="text-[17px] font-black text-[#111827] dark:text-white">{t('t_82270a0d')}</h3>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800/30 p-4 min-h-[80px]">
                                        <p className="text-[14px] text-[#6B7280] dark:text-gray-400 leading-relaxed">{userNotes || t('t_bab6b626')}</p>
                                    </div>
                                </div>

                                {/* ── سجل النشاطات ── */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-7">
                                    <div className="flex items-center gap-2.5 mb-6">
                                        <span className="material-symbols-outlined text-[22px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">schedule</span>
                                        <h3 className="text-[17px] font-black text-[#111827] dark:text-white">{t('t_99cacbcd')}</h3>
                                    </div>
                                    <div className="relative pr-4">
                                        <div className="absolute top-3 right-[5px] bottom-3 w-[2px] bg-gray-100"></div>

                                        {/* Activity: Confirmed */}
                                        {activeStep >= 1 && (
                                            <div className="flex gap-4 mb-6 relative">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5 ring-4 ring-emerald-50 z-10"></div>
                                                <div className="flex-1">
                                                    <h4 className="text-[14px] font-bold text-[#111827] dark:text-white">{t('t_b51d88f7')}</h4>
                                                    <p className="text-[12px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 mt-1">{t('t_13020b673')}</p>
                                                </div>
                                                <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1">{t('t_251fc75e')} {formatTimeFull(order.created_at)}</span>
                                            </div>
                                        )}

                                        {/* Activity: Email sent */}
                                        <div className="flex gap-4 mb-6 relative">
                                            <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0 mt-1.5 z-10"></div>
                                            <div className="flex-1">
                                                <h4 className="text-[14px] font-bold text-[#111827] dark:text-white">{t('t_5068861c')}</h4>
                                            </div>
                                            <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1">{t('t_251fc75e')} {formatTimeFull(order.created_at)}</span>
                                        </div>

                                        {/* Activity: Order created */}
                                        <div className="flex gap-4 relative">
                                            <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0 mt-1.5 z-10"></div>
                                            <div className="flex-1">
                                                <h4 className="text-[14px] font-bold text-[#111827] dark:text-white">{t('t_1ba030891')}</h4>
                                            </div>
                                            <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1">{t('t_251fc75e')} {formatTimeFull(order.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ──── LEFT COLUMN (4 cols) ──── */}
                            <div className="lg:col-span-4 flex flex-col gap-6">

                                {/* ── ملخص الحساب ── */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-7">
                                    <h3 className="text-[17px] font-black text-[#111827] dark:text-white mb-5 text-center">{t('t_166d6e9c2')}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_6cfa4bd7')}</span>
                                            <span className="text-[14px] font-bold text-[#111827] dark:text-white">{parseFloat(order.total_price || 0).toLocaleString()}  {t('t_17422d')}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_aafc43f1')}</span>
                                            <span className="text-[14px] font-bold text-[#111827] dark:text-white">{shippingCost > 0 ? `${shippingCost.toLocaleString()} د.ج` : t('t_217db6d41')}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_8e62160')}</span>
                                            <span className="text-[14px] font-bold text-[#111827] dark:text-white">{t('t_5049e38b')}</span>
                                        </div>
                                        <div className="h-px bg-gray-100 my-2"></div>
                                        <div className="text-center pt-1">
                                            <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 block mb-1">{t('t_9cf81b14')}</span>
                                            <span className="text-[28px] font-black text-[#E91E63]">{totalWithShipping.toLocaleString()} <span className="text-[16px]">{t('t_17422d')}</span></span>
                                            <p className="text-[11px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 mt-1">{t('t_9d76c11a')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ── معلومات التوصيل ── */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-7">
                                    <h3 className="text-[17px] font-black text-[#111827] dark:text-white mb-5 text-center">{t('t_8e6e7c1c')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-zinc-900/50 flex items-center justify-center text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                                            </div>
                                            <div>
                                                <span className="text-[12px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 font-bold block">{t('t_38c2d5f3')}</span>
                                                <span className="text-[14px] font-bold text-[#111827] dark:text-white">{shippingCompany || 'Yalidine Express'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-zinc-900/50 flex items-center justify-center text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                                            </div>
                                            <div>
                                                <span className="text-[12px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 font-bold block">{t('t_252118dd')}</span>
                                                <span className="text-[14px] font-bold text-[#111827] dark:text-white">{getWilayaName(order.customer_state)}{order.customer_address ? `، ${order.customer_address}` : ''}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-zinc-900/50 flex items-center justify-center text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                                            </div>
                                            <div>
                                                <span className="text-[12px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 font-bold block">{t('t_d4af83a')}</span>
                                                <span className={`text-[14px] font-black ${trackingNumber ? 'text-[#E91E63]' : 'text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400'}`}>
                                                    {trackingNumber || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowShippingEdit(!showShippingEdit)}
                                        className="w-full mt-5 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-all">
                                        
                                        {t('t_1ae9abe39')}
                                    </button>
                                    {showShippingEdit && (
                                        <div className="space-y-3 mt-4 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800/30">
                                            <div>
                                                <label className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 mb-1 block">{t('t_38c2d5f3')}</label>
                                                <input value={shippingCompany} onChange={e => setShippingCompany(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 dark:border-zinc-800 px-3 text-[13px] focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]" placeholder={t('t_29aa1d7ba')} />
                                            </div>
                                            <div>
                                                <label className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 mb-1 block">{t('t_d4af83a')}</label>
                                                <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 dark:border-zinc-800 px-3 text-[13px] focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]" placeholder={t('t_2090becd4')} dir="ltr" />
                                            </div>
                                            <button onClick={async () => {
                                                try {
                                                    await insforge.database.from('orders').update({
                                                        tracking_number: trackingNumber,
                                                        shipping_company: shippingCompany
                                                    }).eq('id', orderId);
                                                    setShowShippingEdit(false);
                                                    alert(t('t_7ec8a640'));
                                                } catch { alert(t('t_93a04e88')); }
                                            }} className="w-full h-9 rounded-lg bg-[#E91E63] text-white text-[13px] font-bold hover:bg-[#C2185B] transition-colors">
                                                
                                                {t('t_17f704')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* ── طريقة الدفع ── */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-7">
                                    <h3 className="text-[17px] font-black text-[#111827] dark:text-white mb-5 text-center">{t('t_137f8f61f')}</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                                            <span className="material-symbols-outlined text-[24px]">payments</span>
                                        </div>
                                        <div>
                                            <span className="text-[14px] font-bold text-[#111827] dark:text-white block">{t('t_addbc04b')}</span>
                                            <span className={`text-[12px] font-bold ${currentStatus === 'completed' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {currentStatus === 'completed' ? t('t_2674b4e8') : t('t_95bd87ee')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════ FOOTER ═══════════════ */}
                        <div className="text-center py-4 border-t border-gray-100 dark:border-zinc-800/30">
                            <p className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_27620bb76')}</p>
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}
