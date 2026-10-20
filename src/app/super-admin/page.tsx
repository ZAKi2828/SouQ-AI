"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

// ─── Types ───────────────────────────────────────────────────
interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    store_name: string | null;
    plan: string;
    is_paid: boolean;
    created_at: string;
    store_slug: string | null;
    plan_expires_at: string | null;
}

interface Store {
    id: string;
    user_id: string;
    store_name: string;
    store_domain: string;
    industry: string | null;
    created_at: string;
}

interface Order {
    id: string;
    status: string;
    total_price: number;
    created_at: string;
    store_domain: string;
    customer_name: string;
    product_name: string;
    user_id: string;
}

interface SystemAlert {
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    icon: string;
    title: string;
    description: string;
    time: string;
    actionLabel?: string;
    actionLink?: string;
}

// ─── Helper: Animated Counter ────────────────────────────────
function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1200 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        let start = 0;
        const step = Math.max(1, Math.ceil(value / (duration / 16)));
        const timer = setInterval(() => {
            start += step;
            if (start >= value) { setDisplay(value); clearInterval(timer); }
            else setDisplay(start);
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

// ─── Helper: Mini Sparkline SVG ──────────────────────────────
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
    if (!data.length) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const w = 120;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    });
    const pathD = 'M' + points.join(' L');
    const areaD = pathD + ` L${w},${height} L0,${height} Z`;
    return (
        <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="overflow-visible">
            <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#sg-${color.replace('#', '')})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={points[points.length - 1].split(',')[0]} cy={points[points.length - 1].split(',')[1]} r="3" fill={color} />
        </svg>
    );
}

// ─── Helper: Donut Chart ─────────────────────────────────────
function DonutChart({ segments, size = 160 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const r = (size - 20) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((seg, i) => {
                const pct = seg.value / total;
                const dashArray = `${pct * circumference} ${circumference}`;
                const rotation = (offset / total) * 360 - 90;
                offset += seg.value;
                return (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeDasharray={dashArray}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform={`rotate(${rotation} ${cx} ${cy})`}
                        className="transition-all duration-1000"
                    />
                );
            })}
            <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 text-2xl font-bold" style={{ fontSize: '22px', fontWeight: 800 }}>{total}</text>
            <text x={cx} y={cy + 16} textAnchor="middle" className="fill-slate-400 text-xs" style={{ fontSize: '11px' }}>إجمالي</text>
        </svg>
    );
}

// ─── Helper: Bar Chart ───────────────────────────────────────
function BarChart({ data, height = 160 }: { data: { label: string; value: number; color: string }[]; height?: number }) {
    const max = Math.max(...data.map(d => d.value), 1);
    const barW = Math.min(36, Math.floor(400 / data.length) - 8);
    return (
        <div className="flex items-end justify-between gap-1 w-full" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{d.value}</span>
                    <div
                        className="rounded-t-lg transition-all duration-700 ease-out"
                        style={{
                            width: barW,
                            height: `${Math.max(4, (d.value / max) * (height - 30))}px`,
                            background: d.color,
                            opacity: 0.85,
                        }}
                    />
                    <span className="text-[9px] text-slate-400 truncate max-w-[40px]">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────
export default function SuperAdminDashboard() {
    const { t, lang } = useI18n();
    const isRTL = lang === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';

    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized, adminId } = useAdminGuard();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // ─── Data State ──────────────────────────────────────────
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalAbandonedCarts, setTotalAbandonedCarts] = useState(0);
    const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [domainReqs, setDomainReqs] = useState<any[]>([]);

    const router = useRouter();

    // ─── Live Clock ──────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // ─── Fetch All Data (only after admin is verified) ─────────
    useEffect(() => {
        if (!isAuthorized) return;
        const init = async () => {
            try {

                const [
                    profilesRes, storesRes, ordersRes, productsRes, abandonedRes
                ] = await Promise.all([
                    insforge.database.from('profiles').select('id, full_name, avatar_url, plan, is_paid, created_at, store_slug, plan_expires_at'),
                    insforge.database.from('stores').select('id, user_id, store_name, store_domain, industry, created_at'),
                    insforge.database.from('orders').select('id, status, total_price, created_at, store_domain, customer_name, product_name, user_id'),
                    insforge.database.from('products').select('id', { count: 'exact', head: true }),
                    insforge.database.from('abandoned_carts').select('id', { count: 'exact', head: true }),
                ]);

                const storesData = storesRes.data || [];
                const storesMap = new Map<string, string>();
                storesData.forEach((s: any) => storesMap.set(s.user_id, s.store_name));

                const mappedProfiles = (profilesRes.data || []).map(p => ({
                    ...p,
                    store_name: storesMap.get(p.id) || null
                }));

                setProfiles(mappedProfiles);
                setStores(storesData);
                setOrders(ordersRes.data || []);
                setTotalProducts(productsRes.count || 0);
                setTotalAbandonedCarts(abandonedRes.count || 0);

                // Fetch domain purchase requests
                const { data: domainData } = await insforge.database
                    .from('domain_requests')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (domainData) setDomainReqs(domainData);

                // ─── Generate Real System Alerts ─────────────
                const alerts: SystemAlert[] = [];

                // Check for expiring subscriptions
                const now = new Date();
                const expiringProfiles = (profilesRes.data || []).filter(p => {
                    if (!p.plan_expires_at) return false;
                    const exp = new Date(p.plan_expires_at);
                    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    return diff > 0 && diff <= 3;
                });
                if (expiringProfiles.length > 0) {
                    alerts.push({
                        id: 'expiring-subs',
                        type: 'warning',
                        icon: 'schedule',
                        title: `${expiringProfiles.length} اشتراكات ستنتهي خلال 3 أيام`,
                        description: `التجار: ${expiringProfiles.map(p => p.full_name || p.store_slug || 'بدون اسم').join('، ')}`,
                        time: 'الآن',
                        actionLabel: 'عرض التجار',
                        actionLink: '/super-admin/merchants',
                    });
                }

                // Check for blocked merchants
                const blockedCount = (profilesRes.data || []).filter(p => p.plan === 'blocked').length;
                if (blockedCount > 0) {
                    alerts.push({
                        id: 'blocked',
                        type: 'critical',
                        icon: 'block',
                        title: `${blockedCount} تاجر محظور حالياً`,
                        description: 'تأكد من مراجعة حالة الحسابات المحظورة بشكل دوري.',
                        time: 'مستمر',
                        actionLabel: 'إدارة الحظر',
                        actionLink: '/super-admin/merchants',
                    });
                }

                // Check for pending orders
                const pendingOrders = (ordersRes.data || []).filter(o => o.status === 'pending').length;
                if (pendingOrders > 5) {
                    alerts.push({
                        id: 'pending-orders',
                        type: 'warning',
                        icon: 'pending_actions',
                        title: `${pendingOrders} طلب معلّق بحاجة لمتابعة`,
                        description: 'يوجد عدد كبير من الطلبات المعلقة عبر المنصة.',
                        time: 'اليوم',
                    });
                }

                // Check abandoned carts
                if ((abandonedRes.count || 0) > 0) {
                    alerts.push({
                        id: 'abandoned',
                        type: 'info',
                        icon: 'shopping_cart',
                        title: `${abandonedRes.count} سلة متروكة`,
                        description: 'عملاء محتملون لم يكملوا عمليات الشراء.',
                        time: 'آخر 30 يوم',
                    });
                }

                // New merchants today
                const today = new Date().toISOString().split('T')[0];
                const newToday = (profilesRes.data || []).filter(p => p.created_at?.startsWith(today)).length;
                if (newToday > 0) {
                    alerts.push({
                        id: 'new-merchants',
                        type: 'success',
                        icon: 'person_add',
                        title: `${newToday} تاجر جديد اليوم 🎉`,
                        description: 'تم تسجيل تجار جدد في المنصة اليوم.',
                        time: 'اليوم',
                    });
                }

                // System healthy fallback
                if (alerts.length === 0) {
                    alerts.push({
                        id: 'system-ok',
                        type: 'success',
                        icon: 'verified',
                        title: 'النظام يعمل بشكل ممتاز',
                        description: 'لا توجد تنبيهات حالياً. كل الأنظمة تعمل بكفاءة.',
                        time: 'الآن',
                    });
                }

                setSystemAlerts(alerts);

            } catch (err) {
                console.error("Error loading admin dashboard:", err);
            } finally {
                setIsDataLoading(false);
            }
        };
        init();
    }, [isAuthorized]);

    // ─── Computed Stats ──────────────────────────────────────
    const stats = useMemo(() => {
        const totalMerchants = profiles.length;
        const vipCount = profiles.filter(p => p.plan === 'vip').length;
        const proCount = profiles.filter(p => p.plan === 'pro').length;
        const freeCount = profiles.filter(p => p.plan === 'free').length;
        const blockedCount = profiles.filter(p => p.plan === 'blocked').length;
        const paidCount = profiles.filter(p => p.is_paid).length;
        const totalGMV = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
        const totalOrders = orders.length;

        // Order status breakdown
        const pending = orders.filter(o => o.status === 'pending').length;
        const confirmed = orders.filter(o => o.status === 'confirmed').length;
        const shipping = orders.filter(o => o.status === 'shipping').length;
        const delivered = orders.filter(o => o.status === 'delivered').length;
        const completed = orders.filter(o => o.status === 'completed').length;
        const cancelled = orders.filter(o => o.status === 'cancelled').length;

        // Revenue by last 7 days
        const last7 = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });
        const revenueByDay = last7.map(day => {
            return orders
                .filter(o => o.created_at?.startsWith(day))
                .reduce((s, o) => s + (Number(o.total_price) || 0), 0);
        });
        const ordersByDay = last7.map(day => {
            return orders.filter(o => o.created_at?.startsWith(day)).length;
        });

        // Top stores by revenue
        const storeRevMap: Record<string, { name: string; revenue: number; orders: number }> = {};
        orders.forEach(o => {
            const key = o.store_domain || 'unknown';
            if (!storeRevMap[key]) storeRevMap[key] = { name: key, revenue: 0, orders: 0 };
            storeRevMap[key].revenue += Number(o.total_price) || 0;
            storeRevMap[key].orders += 1;
        });
        const topStores = Object.values(storeRevMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        // Conversion rate
        const conversionRate = totalOrders > 0 && totalMerchants > 0
            ? ((completed + delivered) / totalOrders * 100).toFixed(1)
            : '0.0';

        // MRR (Monthly Recurring Revenue) estimate
        const mrr = (proCount * 2900) + (vipCount * 5900);

        return {
            totalMerchants, vipCount, proCount, freeCount, blockedCount, paidCount,
            totalGMV, totalOrders,
            pending, confirmed, shipping, delivered, completed, cancelled,
            revenueByDay, ordersByDay, last7,
            topStores, conversionRate, mrr,
        };
    }, [profiles, orders]);

    // Recent orders (last 8)
    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8);
    }, [orders]);

    // Recent merchants (last 5)
    const recentMerchants = useMemo(() => {
        return [...profiles]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
    }, [profiles]);

    // ─── Status Colors / Labels ──────────────────────────────
    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        pending: { label: 'معلّق', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        confirmed: { label: 'مؤكد', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        shipping: { label: 'قيد الشحن', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        delivered: { label: 'تم التسليم', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        completed: { label: 'مكتمل', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        cancelled: { label: 'ملغي', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    };

    const planConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
        free: { label: 'مجاني', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', icon: '🆓' },
        pro: { label: 'PRO', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: '⭐' },
        vip: { label: 'VIP', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: '👑' },
        blocked: { label: 'محظور', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: '🚫' },
    };

    const alertTypeConfig: Record<string, { ring: string; dot: string; border: string }> = {
        critical: { ring: 'ring-red-100 dark:ring-red-900/30', dot: 'bg-red-500', border: 'border-red-200 dark:border-red-800/40' },
        warning: { ring: 'ring-amber-100 dark:ring-amber-900/30', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800/40' },
        info: { ring: 'ring-blue-100 dark:ring-blue-900/30', dot: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-800/40' },
        success: { ring: 'ring-emerald-100 dark:ring-emerald-900/30', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800/40' },
    };

    // ─── Loading ─────────────────────────────────────────────
    if (isAuthLoading || isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center animate-pulse">
                            <span className="text-white text-2xl font-black">S</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white dark:border-zinc-950 animate-bounce" />
                    </div>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    const greeting = currentTime.getHours() < 12 ? 'صباح الخير' : currentTime.getHours() < 18 ? 'مساء الخير' : 'مساء النور';

    return (
        <div dir={dir} className="min-h-screen flex overflow-hidden bg-[#F8F9FC] dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-cairo">
            <style dangerouslySetInnerHTML={{ __html: `
                .hover-lift { transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s cubic-bezier(.4,0,.2,1); }
                .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 28px -8px rgba(0,0,0,0.12); }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .active-nav-link { background: linear-gradient(90deg, rgba(233,30,99,0.12) 0%, rgba(233,30,99,0.04) 100%); border-right: 4px solid #E91E63; color: #E91E63; }
                .glass-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
                .dark .glass-card { background: rgba(24,24,27,0.75); }
                @keyframes fadeInUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                .stagger-1 { animation-delay: 0.05s; opacity: 0; }
                .stagger-2 { animation-delay: 0.10s; opacity: 0; }
                .stagger-3 { animation-delay: 0.15s; opacity: 0; }
                .stagger-4 { animation-delay: 0.20s; opacity: 0; }
                .stagger-5 { animation-delay: 0.25s; opacity: 0; }
                .stagger-6 { animation-delay: 0.30s; opacity: 0; }
                .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
                @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(233,30,99,0.3); } 50% { box-shadow: 0 0 0 8px rgba(233,30,99,0); } }
            `}} />

            {/* ══════════ SIDEBAR ══════════ */}
            <aside className={`w-72 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col h-screen z-50 transition-all duration-300 ${isSidebarOpen ? '' : '-mr-72 hidden'}`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-500/20">S</div>
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">SOUQ AI</span>
                    </div>
                </div>

                <div className="px-6 mb-6">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 text-primary dark:text-pink-400 text-[10px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-primary dark:bg-pink-400 rounded-full animate-pulse" />
                        SUPER ADMIN
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span className="font-semibold text-sm">لوحة التحكم</span>
                    </Link>
                    {[
                        { href: '/super-admin/merchants', icon: 'storefront', label: 'إدارة التجار' },
                        { href: '/super-admin/monitoring', icon: 'monitoring', label: 'المنتجات والطلبات' },
                        { href: '/super-admin/billing', icon: 'payments', label: 'الفوترة والاشتراكات' },
                        { href: '/super-admin/templates', icon: 'auto_awesome_motion', label: 'القوالب' },
                        { href: '/super-admin/ai', icon: 'psychology', label: 'إعدادات الذكاء الاصطناعي' },
                        { href: '/super-admin/apps', icon: 'extension', label: 'التطبيقات' },
                    ].map(item => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60">
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <span className="font-semibold text-sm">{item.label}</span>
                        </Link>
                    ))}
                    <div className="pt-4 pb-2 text-[11px] font-bold text-slate-400 px-4 uppercase tracking-widest">النظام</div>
                    <Link href="/super-admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span className="font-semibold text-sm">الإعدادات</span>
                    </Link>
                </nav>

                {/* System Health Indicator */}
                <div className="px-6 py-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">النظام يعمل</span>
                        </div>
                        <div className="flex gap-3 text-[10px] text-emerald-600/70 dark:text-emerald-400/60">
                            <span>API ✓</span>
                            <span>DB ✓</span>
                            <span>CDN ✓</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-zinc-800 mt-auto">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex-shrink-0 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div className="overflow-hidden text-right pl-2 flex-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">المدير العام</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ══════════ MAIN CONTENT ══════════ */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
                {/* Header */}
                <header className="h-20 glass-card border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-primary lg:hidden flex items-center justify-center bg-slate-100 dark:bg-zinc-800 w-10 h-10 rounded-xl transition-colors">
                            <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{greeting} 👋</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {currentTime.toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/super-admin/merchants" className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-pink-500/20 transition-all">
                            <span className="material-symbols-outlined text-lg">storefront</span>
                            <span>إدارة التجار</span>
                        </Link>
                        <div className="relative">
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            {systemAlerts.filter(a => a.type === 'critical' || a.type === 'warning').length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse" />
                            )}
                        </div>
                        <ThemeToggle className="bg-slate-100 dark:bg-zinc-800 border-none" />
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">

                    {/* ══════ ROW 1: KPI Cards ══════ */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
                        {/* KPI 1: Total Revenue (GMV) */}
                        <div className="fade-in-up stagger-1 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 hover-lift group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">إجمالي المبيعات</p>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                        <AnimatedCounter value={stats.totalGMV} suffix=" د.ج" />
                                    </h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[20px]">trending_up</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                                    <span>GMV عبر المنصة</span>
                                </div>
                                <Sparkline data={stats.revenueByDay} color="#10b981" />
                            </div>
                        </div>

                        {/* KPI 2: Total Merchants */}
                        <div className="fade-in-up stagger-2 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 hover-lift group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">إجمالي التجار</p>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                        <AnimatedCounter value={stats.totalMerchants} />
                                    </h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[20px]">group</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold">{stats.vipCount} VIP</span>
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold">{stats.proCount} PRO</span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">{stats.freeCount} مجاني</span>
                            </div>
                        </div>

                        {/* KPI 3: Total Orders */}
                        <div className="fade-in-up stagger-3 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 hover-lift group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">إجمالي الطلبات</p>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                                        <AnimatedCounter value={stats.totalOrders} />
                                    </h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="text-xs text-slate-400">
                                    <span className="text-emerald-500 font-bold">{stats.completed + stats.delivered}</span>مكتمل ·<span className="text-amber-500 font-bold">{stats.pending}</span>معلّق</div>
                                <Sparkline data={stats.ordersByDay} color="#8b5cf6" />
                            </div>
                        </div>

                        {/* KPI 4: MRR */}
                        <div className="fade-in-up stagger-4 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-5 rounded-2xl hover-lift group text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />
                            <div className="relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">الإيراد الشهري (MRR)</p>
                                        <h3 className="text-2xl font-black mt-1">
                                            <AnimatedCounter value={stats.mrr} suffix=" د.ج" />
                                        </h3>
                                    </div>
                                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-[20px]">payments</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                    <span className="material-symbols-outlined text-sm">auto_graph</span>
                                    <span>{stats.paidCount} تاجر مشترك من {stats.totalMerchants}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════ ROW 2: Quick Stats Strip ══════ */}
                    <section className="fade-in-up stagger-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { icon: 'inventory_2', label: 'المنتجات', value: totalProducts, color: 'from-sky-400 to-blue-500', shadow: 'shadow-sky-500/20' },
                            { icon: 'store', label: 'المتاجر', value: stores.length, color: 'from-teal-400 to-emerald-500', shadow: 'shadow-teal-500/20' },
                            { icon: 'remove_shopping_cart', label: 'سلات متروكة', value: totalAbandonedCarts, color: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-500/20' },
                            { icon: 'percent', label: 'معدل التحويل', value: stats.conversionRate, color: 'from-fuchsia-400 to-pink-500', shadow: 'shadow-fuchsia-500/20', suffix: '%' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 px-4 py-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-3 hover-lift">
                                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md ${item.shadow}`}>
                                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">{item.value}{item.suffix}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold">{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* ══════ ROW 3: Charts + Distribution ══════ */}
                    <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        {/* Order Status Distribution */}
                        <div className="fade-in-up stagger-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">donut_large</span>
                                توزيع حالات الطلبات
                            </h4>
                            <div className="flex justify-center mb-5">
                                <DonutChart segments={[
                                    { value: stats.pending, color: '#f59e0b', label: 'معلّق' },
                                    { value: stats.confirmed, color: '#3b82f6', label: 'مؤكد' },
                                    { value: stats.shipping, color: '#a855f7', label: 'شحن' },
                                    { value: stats.delivered, color: '#10b981', label: 'تسليم' },
                                    { value: stats.completed, color: '#22c55e', label: 'مكتمل' },
                                    { value: stats.cancelled, color: '#ef4444', label: 'ملغي' },
                                ]} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'معلّق', value: stats.pending, color: '#f59e0b' },
                                    { label: 'مؤكد', value: stats.confirmed, color: '#3b82f6' },
                                    { label: 'قيد الشحن', value: stats.shipping, color: '#a855f7' },
                                    { label: 'تم التسليم', value: stats.delivered, color: '#10b981' },
                                    { label: 'مكتمل', value: stats.completed, color: '#22c55e' },
                                    { label: 'ملغي', value: stats.cancelled, color: '#ef4444' },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                                        <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
                                        <span className="mr-auto font-bold text-slate-700 dark:text-slate-300">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subscription Tiers */}
                        <div className="fade-in-up stagger-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">loyalty</span>
                                توزيع الاشتراكات
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { label: 'VIP 👑', value: stats.vipCount, pct: stats.totalMerchants ? (stats.vipCount / stats.totalMerchants * 100) : 0, color: 'from-amber-400 to-orange-500' },
                                    { label: 'PRO ⭐', value: stats.proCount, pct: stats.totalMerchants ? (stats.proCount / stats.totalMerchants * 100) : 0, color: 'from-blue-400 to-indigo-500' },
                                    { label: 'مجاني 🆓', value: stats.freeCount, pct: stats.totalMerchants ? (stats.freeCount / stats.totalMerchants * 100) : 0, color: 'from-slate-300 to-slate-400' },
                                    { label: 'محظور 🚫', value: stats.blockedCount, pct: stats.totalMerchants ? (stats.blockedCount / stats.totalMerchants * 100) : 0, color: 'from-red-400 to-rose-500' },
                                ].map((tier, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{tier.label}</span>
                                            <span className="text-slate-400 text-xs font-bold">{tier.value} تاجر ({tier.pct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                                            <div className={`bg-gradient-to-r ${tier.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${Math.max(2, tier.pct)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 rounded-xl border border-pink-100 dark:border-pink-800/30">
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    معدل التحول للاشتراك المدفوع: <strong className="text-primary">{stats.totalMerchants ? ((stats.paidCount / stats.totalMerchants) * 100).toFixed(1) : 0}%</strong>
                                </p>
                            </div>
                        </div>

                        {/* Orders by Day (Bar Chart) */}
                        <div className="fade-in-up stagger-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
                                الطلبات (آخر 7 أيام)
                            </h4>
                            <BarChart data={stats.last7.map((day, i) => ({
                                label: new Date(day).toLocaleDateString('ar-DZ', { weekday: 'short' }),
                                value: stats.ordersByDay[i],
                                color: stats.ordersByDay[i] > 0 ? '#E91E63' : '#e2e8f0',
                            }))} />
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between text-xs text-slate-400">
                                <span>{t("t_fec7e13f")}<strong className="text-slate-700 dark:text-slate-300">{stats.ordersByDay.reduce((a, b) => a + b, 0)} {t("orders")}</strong></span>
                                <span>{t("t_45be49a")}<strong className="text-emerald-500">{stats.revenueByDay.reduce((a, b) => a + b, 0).toLocaleString()} {t("dzd")}</strong></span>
                            </div>
                        </div>
                    </section>

                    {/* ══════ ROW 4: Recent Orders + System Alerts ══════ */}
                    <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        {/* Recent Orders Table */}
                        <div className="xl:col-span-2 fade-in-up stagger-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
                                    آخر الطلبات عبر المنصة
                                </h4>
                                <span className="text-xs text-slate-400">{stats.totalOrders} طلب إجمالاً</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                            <th className="px-5 py-3">العميل</th>
                                            <th className="px-5 py-3">المنتج</th>
                                            <th className="px-5 py-3">المبلغ</th>
                                            <th className="px-5 py-3">الحالة</th>
                                            <th className="px-5 py-3">التاريخ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {recentOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                                                    <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">inbox</span>
                                                    لا توجد طلبات بعد
                                                </td>
                                            </tr>
                                        ) : (
                                            recentOrders.map(order => {
                                                const sc = statusConfig[order.status] || statusConfig.pending;
                                                return (
                                                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400">
                                                                    {(order.customer_name || '?').charAt(0)}
                                                                </div>
                                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                                                    {order.customer_name || 'زائر'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{order.product_name || '—'}</td>
                                                        <td className="px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {Number(order.total_price || 0).toLocaleString()} <span className="text-[10px] text-slate-400">د.ج</span>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                                                                {sc.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-[11px] text-slate-400">
                                                            {new Date(order.created_at).toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* System Alerts */}
                        <div className="fade-in-up stagger-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 flex flex-col">
                            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">notifications_active</span>
                                    تنبيهات النظام
                                </h4>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800">
                                    <div className={`w-1.5 h-1.5 rounded-full ${systemAlerts.some(a => a.type === 'critical') ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{systemAlerts.length}</span>
                                </div>
                            </div>
                            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar max-h-[400px]">
                                {systemAlerts.map(alert => {
                                    const ac = alertTypeConfig[alert.type];
                                    return (
                                        <div key={alert.id} className={`p-3.5 rounded-xl border ${ac.border} transition-all hover:shadow-sm`}>
                                            <div className="flex gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${ac.dot} bg-opacity-10 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                    <span className="material-symbols-outlined text-[16px]" style={{ color: ac.dot.includes('red') ? '#ef4444' : ac.dot.includes('amber') ? '#f59e0b' : ac.dot.includes('blue') ? '#3b82f6' : '#10b981' }}>
                                                        {alert.icon}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{alert.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{alert.description}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[10px] font-semibold text-slate-400">{alert.time}</span>
                                                        {alert.actionLabel && alert.actionLink && (
                                                            <Link href={alert.actionLink} className="text-[10px] font-bold text-primary hover:underline">
                                                                {alert.actionLabel} ←
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ══════ ROW 5: Domain Purchase Requests ══════ */}
                    {domainReqs.length > 0 && (
                        <section className="fade-in-up stagger-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500 text-lg">public</span>
                                    طلبات شراء الدومينات
                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 text-[10px] font-bold">{domainReqs.filter(r => r.status === 'pending').length} جديد</span>
                                </h4>
                                <span className="text-xs text-slate-400">{domainReqs.length} طلب إجمالاً</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                            <th className="px-5 py-3">التاجر (المتجر)</th>
                                            <th className="px-5 py-3">الدومين المطلوب</th>
                                            <th className="px-5 py-3">الامتداد</th>
                                            <th className="px-5 py-3">السعر</th>
                                            <th className="px-5 py-3">الحالة</th>
                                            <th className="px-5 py-3">التاريخ</th>
                                            <th className="px-5 py-3">إجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {domainReqs.map(req => {
                                            const merchantProfile = profiles.find(p => p.id === req.user_id);
                                            const statusStyles: Record<string, {label: string; bg: string; color: string}> = {
                                                pending: { label: 'قيد الانتظار', bg: 'bg-amber-50 dark:bg-amber-900/20', color: 'text-amber-600' },
                                                processing: { label: 'قيد المعالجة', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600' },
                                                completed: { label: 'مكتمل', bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600' },
                                                cancelled: { label: 'ملغي', bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-600' },
                                            };
                                            const st = statusStyles[req.status] || statusStyles.pending;
                                            return (
                                                <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center text-[10px] font-black text-purple-600 dark:text-purple-400">
                                                                {(merchantProfile?.full_name || req.store_domain || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{merchantProfile?.full_name || 'غير معروف'}</p>
                                                                <p className="text-[10px] text-slate-400 dir-ltr">{req.store_domain}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 dir-ltr">{req.requested_domain}</td>
                                                    <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-500 dir-ltr">{req.tld}</span></td>
                                                    <td className="px-5 py-3 text-sm font-bold text-emerald-600">{req.price_dzd?.toLocaleString()} <span className="text-[10px] text-slate-400">د.ج</span></td>
                                                    <td className="px-5 py-3"><span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${st.bg} ${st.color}`}>{st.label}</span></td>
                                                    <td className="px-5 py-3 text-[11px] text-slate-400">{new Date(req.created_at).toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                    <td className="px-5 py-3">
                                                        {req.status === 'pending' && (
                                                            <div className="flex gap-1.5">
                                                                <button onClick={async () => {
                                                                    await insforge.database.from('domain_requests').update({ status: 'completed' }).eq('id', req.id);
                                                                    setDomainReqs(prev => prev.map(r => r.id === req.id ? {...r, status: 'completed'} : r));
                                                                }} className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">check</span>مكتمل
                                                                </button>
                                                                <button onClick={async () => {
                                                                    await insforge.database.from('domain_requests').update({ status: 'cancelled' }).eq('id', req.id);
                                                                    setDomainReqs(prev => prev.map(r => r.id === req.id ? {...r, status: 'cancelled'} : r));
                                                                }} className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-colors flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">close</span>إلغاء
                                                                </button>
                                                            </div>
                                                        )}
                                                        {req.status !== 'pending' && <span className="text-[10px] text-slate-400">—</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* ══════ ROW 6: Recent Merchants + Top Stores + Quick Actions ══════ */}
                    <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 pb-8">
                        {/* Recent Merchants */}
                        <div className="fade-in-up stagger-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">person_add</span>
                                أحدث التجار
                            </h4>
                            <div className="space-y-3">
                                {recentMerchants.map((m, i) => {
                                    const pc = planConfig[m.plan] || planConfig.free;
                                    return (
                                        <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                                            {m.avatar_url ? (
                                                <img src={m.avatar_url} alt="Profile" className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-zinc-800 flex-shrink-0" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-xs font-black text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                    {(m.full_name || m.store_name || m.store_slug || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{m.full_name || m.store_name || m.store_slug || 'بدون اسم'}</p>
                                                <p className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${pc.bg} ${pc.color}`}>
                                                {pc.icon} {pc.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <Link href="/super-admin/merchants" className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-primary hover:underline pt-3 border-t border-slate-100 dark:border-zinc-800">
                                عرض جميع التجار
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </Link>
                        </div>

                        {/* Top Stores by Revenue */}
                        <div className="fade-in-up stagger-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">leaderboard</span>
                                أعلى المتاجر أداءً
                            </h4>
                            <div className="space-y-3">
                                {stats.topStores.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-8">لا توجد بيانات كافية</p>
                                ) : (
                                    stats.topStores.map((store, i) => {
                                        const medals = ['🥇', '🥈', '🥉', '4', '5'];
                                        const maxRev = stats.topStores[0].revenue || 1;
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-lg w-7 text-center">{i < 3 ? medals[i] : <span className="text-xs font-bold text-slate-400">#{i + 1}</span>}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{store.name}</p>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold mr-2">{store.revenue.toLocaleString()} د.ج</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-gradient-to-r from-pink-400 to-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(store.revenue / maxRev) * 100}%` }} />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{store.orders} طلب</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="fade-in-up stagger-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                                إجراءات سريعة
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: 'group', label: 'إدارة التجار', href: '/super-admin/merchants', color: 'from-blue-400 to-indigo-500' },
                                    { icon: 'payments', label: 'الفوترة', href: '/super-admin/billing', color: 'from-emerald-400 to-teal-500' },
                                    { icon: 'palette', label: 'القوالب', href: '/super-admin/templates', color: 'from-violet-400 to-purple-500' },
                                    { icon: 'psychology', label: 'الذكاء الاصطناعي', href: '/super-admin/ai', color: 'from-pink-400 to-rose-500' },
                                    { icon: 'extension', label: 'التطبيقات', href: '/super-admin/apps', color: 'from-amber-400 to-orange-500' },
                                    { icon: 'settings', label: 'الإعدادات', href: '/super-admin/settings', color: 'from-slate-400 to-slate-500' },
                                ].map((action, i) => (
                                    <Link
                                        key={i}
                                        href={action.href}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 hover:border-pink-200 dark:hover:border-pink-800/40 hover:shadow-md transition-all group"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{action.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
