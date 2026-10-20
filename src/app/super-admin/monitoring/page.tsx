"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from "@/context/I18nContext";
import { useAdminGuard } from '@/hooks/useAdminGuard';

// ─── Types ───────────────────────────────────────────────────
interface MerchantData {
    id: string;
    full_name: string | null;
    email: string;
    plan: string;
    store_slug: string | null;
    created_at: string;
}

interface ProductData {
    id: string;
    user_id: string;
    name: string;
    price: number;
    stock_quantity: number;
    category: string | null;
    status: string | null;
    created_at: string;
    store_domain: string | null;
    description: string | null;
    images: string[] | null;
}

interface OrderData {
    id: string;
    user_id: string;
    status: string;
    total_price: number;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
    product_name: string;
    quantity: number;
    customer_state: string | null;
    customer_address: string | null;
    created_at: string;
    store_domain: string | null;
    notes: string | null;
}

type ViewTab = 'overview' | 'products' | 'orders';

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
function Sparkline({ data, color, height = 36 }: { data: number[]; color: string; height?: number }) {
    if (!data.length || data.every(v => v === 0)) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const w = 100;
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
                <linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#sp-${color.replace('#', '')})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={points[points.length - 1].split(',')[0]} cy={points[points.length - 1].split(',')[1]} r="2.5" fill={color} />
        </svg>
    );
}

// ─── Helper: Horizontal Bar Chart ────────────────────────────
function HBarChart({ data, height = 200 }: { data: { label: string; value: number; color: string }[]; height?: number }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="space-y-2.5" style={{ maxHeight: height, overflowY: 'auto' }}>
            {data.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-20 truncate text-right">{d.label}</span>
                    <div className="flex-1 h-5 bg-slate-100 dark:bg-zinc-800 rounded-md overflow-hidden">
                        <div
                            className="h-full rounded-md transition-all duration-700 ease-out flex items-center justify-end px-2"
                            style={{ width: `${Math.max(6, (d.value / max) * 100)}%`, background: d.color }}
                        >
                            <span className="text-[9px] font-bold text-white drop-shadow-sm">{d.value}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}


export default function SuperAdminMonitoring() {
    const { lang, t } = useI18n();
    const isRTL = lang === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';
    const router = useRouter();

    // ─── SECURITY: Admin Guard ────────────────────────────────
    const { isLoading: isAuthLoading, isAuthorized } = useAdminGuard();

    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [merchants, setMerchants] = useState<MerchantData[]>([]);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [orders, setOrders] = useState<OrderData[]>([]);

    const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<ViewTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [productSortBy, setProductSortBy] = useState<'date' | 'price' | 'stock' | 'name'>('date');
    const [productCategoryFilter, setProductCategoryFilter] = useState('all');

    // Pagination
    const [productPage, setProductPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Order Detail Modal
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // Refresh
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // ─── Data Fetching ──────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            const [profilesRes, productsRes, ordersRes] = await Promise.all([
                insforge.database.from('profiles').select('id, full_name, email, plan, store_slug, created_at'),
                insforge.database.from('products').select('id, user_id, name, price, stock_quantity, category, status, created_at, store_domain, description, images'),
                insforge.database.from('orders').select('id, user_id, status, total_price, customer_name, customer_phone, customer_email, product_name, quantity, customer_state, customer_address, created_at, store_domain, notes'),
            ]);
            setMerchants(profilesRes.data || []);
            setProducts(productsRes.data || []);
            setOrders(ordersRes.data || []);
            setLastRefresh(new Date());
        } catch (err) {
            console.error("Error fetching monitoring data:", err);
        }
    }, []);

    useEffect(() => {
        if (!isAuthorized) return;
        const init = async () => {
            try {
                await fetchData();
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setIsDataLoading(false);
            }
        };
        init();
    }, [isAuthorized, fetchData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    // ─── Filtered Data ─────────────────────────────────────
    const filteredProducts = useMemo(() => {
        let list = products;
        if (selectedMerchant !== 'all') list = list.filter(p => p.user_id === selectedMerchant);
        if (searchQuery) list = list.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
        if (productCategoryFilter !== 'all') list = list.filter(p => (p.category || 'بدون تصنيف') === productCategoryFilter);

        if (productSortBy === 'price') list = [...list].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        else if (productSortBy === 'stock') list = [...list].sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0));
        else if (productSortBy === 'name') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        else list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return list;
    }, [products, selectedMerchant, searchQuery, productSortBy, productCategoryFilter]);

    const filteredOrders = useMemo(() => {
        let list = orders;
        if (selectedMerchant !== 'all') list = list.filter(o => o.user_id === selectedMerchant);
        if (orderStatusFilter !== 'all') list = list.filter(o => o.status === orderStatusFilter);
        if (searchQuery) list = list.filter(o =>
            o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [orders, selectedMerchant, orderStatusFilter, searchQuery]);

    // Paginated results
    const paginatedProducts = useMemo(() => {
        const start = (productPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, productPage]);

    const paginatedOrders = useMemo(() => {
        const start = (orderPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrders, orderPage]);

    const totalProductPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    // Reset page on filter change
    useEffect(() => { setProductPage(1); }, [selectedMerchant, searchQuery, productSortBy, productCategoryFilter]);
    useEffect(() => { setOrderPage(1); }, [selectedMerchant, searchQuery, orderStatusFilter]);

    // ─── Analytics ─────────────────────────────────────────
    const merchantStats = useMemo(() => {
        const map: Record<string, { products: number; orders: number; revenue: number; name: string; plan: string }> = {};
        merchants.forEach(m => {
            map[m.id] = { products: 0, orders: 0, revenue: 0, name: m.full_name || m.store_slug || m.email || 'بدون اسم', plan: m.plan };
        });
        products.forEach(p => { if (map[p.user_id]) map[p.user_id].products++; });
        orders.forEach(o => {
            if (map[o.user_id]) {
                map[o.user_id].orders++;
                map[o.user_id].revenue += Number(o.total_price) || 0;
            }
        });
        return map;
    }, [merchants, products, orders]);

    const selectedMerchantInfo = selectedMerchant !== 'all' ? merchantStats[selectedMerchant] : null;

    // Product categories list
    const productCategories = useMemo(() => {
        const cats = new Set<string>();
        const filteredByMerchant = selectedMerchant !== 'all' ? products.filter(p => p.user_id === selectedMerchant) : products;
        filteredByMerchant.forEach(p => cats.add(p.category || 'بدون تصنيف'));
        return Array.from(cats).sort();
    }, [products, selectedMerchant]);

    // Overview analytics
    const overviewStats = useMemo(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const thisMonth = now.toISOString().slice(0, 7);

        const relevantProducts = selectedMerchant !== 'all' ? products.filter(p => p.user_id === selectedMerchant) : products;
        const relevantOrders = selectedMerchant !== 'all' ? orders.filter(o => o.user_id === selectedMerchant) : orders;

        const totalRevenue = relevantOrders.reduce((s, o) => s + (Number(o.total_price) || 0), 0);
        const todayOrders = relevantOrders.filter(o => o.created_at?.startsWith(today));
        const todayRevenue = todayOrders.reduce((s, o) => s + (Number(o.total_price) || 0), 0);
        const monthOrders = relevantOrders.filter(o => o.created_at?.startsWith(thisMonth));
        const monthRevenue = monthOrders.reduce((s, o) => s + (Number(o.total_price) || 0), 0);

        // Order status counts
        const statusCounts: Record<string, number> = {};
        relevantOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

        // Low stock products with very limited stock (warning & critical)
        const lowStockWarning = relevantProducts.filter(p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 10);
        const outOfStock = relevantProducts.filter(p => (p.stock_quantity || 0) <= 0);

        // Revenue by last 7 days
        const last7 = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });
        const revenueByDay = last7.map(day =>
            relevantOrders.filter(o => o.created_at?.startsWith(day)).reduce((s, o) => s + (Number(o.total_price) || 0), 0)
        );
        const ordersByDay = last7.map(day =>
            relevantOrders.filter(o => o.created_at?.startsWith(day)).length
        );

        // Category distribution
        const catDist: Record<string, number> = {};
        relevantProducts.forEach(p => {
            const cat = p.category || 'بدون تصنيف';
            catDist[cat] = (catDist[cat] || 0) + 1;
        });

        // Top products by orders
        const productOrderCount: Record<string, { name: string; count: number; revenue: number }> = {};
        relevantOrders.forEach(o => {
            const key = o.product_name || 'غير محدد';
            if (!productOrderCount[key]) productOrderCount[key] = { name: key, count: 0, revenue: 0 };
            productOrderCount[key].count += o.quantity || 1;
            productOrderCount[key].revenue += Number(o.total_price) || 0;
        });
        const topProducts = Object.values(productOrderCount).sort((a, b) => b.count - a.count).slice(0, 5);

        // Geographic distribution (by state)
        const geoDist: Record<string, { count: number; revenue: number }> = {};
        relevantOrders.forEach(o => {
            const state = o.customer_state || 'غير محدد';
            if (!geoDist[state]) geoDist[state] = { count: 0, revenue: 0 };
            geoDist[state].count++;
            geoDist[state].revenue += Number(o.total_price) || 0;
        });
        const topStates = Object.entries(geoDist)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 8)
            .map(([state, data]) => ({ state, ...data }));

        // Average order value
        const avgOrderValue = relevantOrders.length > 0 ? totalRevenue / relevantOrders.length : 0;

        // Top merchants by revenue
        const topMerchants = Object.values(merchantStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            totalProducts: relevantProducts.length,
            totalOrders: relevantOrders.length,
            totalRevenue,
            todayOrders: todayOrders.length,
            todayRevenue,
            monthOrders: monthOrders.length,
            monthRevenue,
            statusCounts,
            lowStockWarning,
            outOfStock,
            last7, revenueByDay, ordersByDay,
            catDist,
            topProducts,
            topStates,
            avgOrderValue,
            topMerchants,
        };
    }, [products, orders, selectedMerchant, merchantStats]);

    // ─── Configs ───────────────────────────────────────────
    const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
        pending: { label: 'معلّق', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'schedule' },
        confirmed: { label: 'مؤكد', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'check_circle' },
        shipping: { label: 'قيد الشحن', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'local_shipping' },
        delivered: { label: 'تم التسليم', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'done_all' },
        completed: { label: 'مكتمل', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: 'verified' },
        cancelled: { label: 'ملغي', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: 'cancel' },
    };

    const statusColors: Record<string, string> = {
        pending: '#f59e0b', confirmed: '#3b82f6', shipping: '#a855f7',
        delivered: '#10b981', completed: '#22c55e', cancelled: '#ef4444',
    };

    const planConfig: Record<string, { label: string; icon: string; color: string }> = {
        free: { label: 'مجاني', icon: '🆓', color: 'text-slate-500' },
        pro: { label: 'PRO', icon: '⭐', color: 'text-blue-600' },
        vip: { label: 'VIP', icon: '👑', color: 'text-amber-600' },
        blocked: { label: 'محظور', icon: '🚫', color: 'text-red-600' },
    };

    const categoryColors = ['#E91E63', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6'];

    // ─── Export CSV ─────────────────────────────────────────
    const exportProductsCSV = () => {
        const headers = ['المنتج', 'التاجر', 'السعر', 'المخزون', 'الفئة', 'التاريخ'];
        const rows = filteredProducts.map(p => [
            p.name || '', merchantStats[p.user_id]?.name || '', p.price || 0, p.stock_quantity ?? '', p.category || '', p.created_at?.split('T')[0] || ''
        ]);
        const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `products_${new Date().toISOString().split('T')[0]}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const exportOrdersCSV = () => {
        const headers = ['رقم الطلب', 'العميل', 'المنتج', 'التاجر', 'المبلغ', 'الكمية', 'الحالة', 'الولاية', 'التاريخ'];
        const rows = filteredOrders.map(o => [
            o.id?.slice(0, 8) || '', o.customer_name || '', o.product_name || '', merchantStats[o.user_id]?.name || '',
            o.total_price || 0, o.quantity || 1, statusConfig[o.status]?.label || o.status, o.customer_state || '', o.created_at?.split('T')[0] || ''
        ]);
        const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    // ─── Format Helpers ────────────────────────────────────
    const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatTime = (d: string) => new Date(d).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
    const timeAgo = (d: string) => {
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'الآن';
        if (mins < 60) return `منذ ${mins} دقيقة`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `منذ ${hrs} ساعة`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `منذ ${days} يوم`;
        return `منذ ${Math.floor(days / 30)} شهر`;
    };

    // ─── Pagination Component ──────────────────────────────
    const PaginationControls = ({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) => {
        if (totalPages <= 1) return null;
        const pages: number[] = [];
        for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);
        return (
            <div className="flex items-center justify-center gap-1 py-3">
                <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
                {pages[0] > 1 && <span className="text-xs text-slate-400 px-1">...</span>}
                {pages.map(p => (
                    <button key={p} onClick={() => onPageChange(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700'
                            }`}>
                        {p}
                    </button>
                ))}
                {pages[pages.length - 1] < totalPages && <span className="text-xs text-slate-400 px-1">...</span>}
                <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
            </div>
        );
    };


    // ─── Loading ────────────────────────────────────────────
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
                    <p className="text-sm font-bold text-slate-400 animate-pulse">جاري تحميل بيانات المراقبة...</p>
                    <div className="flex gap-1">
                        {[0, 150, 300].map(d => <div key={d} className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                </div>
            </div>
        );
    }
    if (!isAuthorized) return null;

    return (
        <div dir={dir} className="min-h-screen flex overflow-hidden bg-[#F8F9FC] dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-cairo">
            <style dangerouslySetInnerHTML={{ __html: `
                .hover-lift { transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s cubic-bezier(.4,0,.2,1); }
                .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 28px -8px rgba(0,0,0,0.12); }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .active-nav-link { background: linear-gradient(90deg, rgba(233,30,99,0.12) 0%, rgba(233,30,99,0.04) 100%); border-right: 4px solid #E91E63; color: #E91E63; }
                .glass-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(16px); }
                .dark .glass-card { background: rgba(24,24,27,0.75); }
                @keyframes fadeInUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
                .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                .stagger-1 { animation-delay: 0.05s; opacity: 0; }
                .stagger-2 { animation-delay: 0.10s; opacity: 0; }
                .stagger-3 { animation-delay: 0.15s; opacity: 0; }
                .stagger-4 { animation-delay: 0.20s; opacity: 0; }
                .stagger-5 { animation-delay: 0.25s; opacity: 0; }
                @keyframes slideIn { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
                .animate-slide-in { animation: slideIn 0.35s ease-out; }
                @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(233,30,99,0.3); } 100% { box-shadow: 0 0 0 10px rgba(233,30,99,0); } }
                .pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
            `}} />

            {/* ══════════ SIDEBAR ══════════ */}
            <aside className={`w-72 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col h-screen z-50 transition-all duration-300 ${isSidebarOpen ? '' : '-mr-72 hidden'}`}>
                <div className="p-6 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-500/20">S</div>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">SOUQ AI</span>
                </div>
                <div className="px-6 mb-6">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 text-primary dark:text-pink-400 text-[10px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-primary dark:bg-pink-400 rounded-full animate-pulse" />
                        SUPER ADMIN
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60">
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span className="font-semibold text-sm">لوحة التحكم</span>
                    </Link>
                    <Link href="/super-admin/merchants" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60">
                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                        <span className="font-semibold text-sm">إدارة التجار</span>
                    </Link>
                    <Link href="/super-admin/monitoring" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
                        <span className="material-symbols-outlined text-[20px]">monitoring</span>
                        <span className="font-semibold text-sm">المنتجات والطلبات</span>
                    </Link>
                    {[
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
                {/* System Health */}
                <div className="px-6 py-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">النظام يعمل</span>
                        </div>
                        <div className="flex gap-3 text-[10px] text-emerald-600/70 dark:text-emerald-400/60">
                            <span>API ✓</span><span>DB ✓</span><span>CDN ✓</span>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">المدير العام</p>
                            <p className="text-xs text-slate-500">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ══════════ MAIN ══════════ */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
                {/* Header */}
                <header className="h-20 glass-card border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-primary lg:hidden bg-slate-100 dark:bg-zinc-800 w-10 h-10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">monitoring</span>
                                مراقبة المنتجات والطلبات
                            </h1>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                تابع جميع منتجات وطلبات التجار من مكان واحد
                                <span className="text-[10px] text-slate-400">• آخر تحديث: {lastRefresh.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleRefresh} disabled={isRefreshing}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50">
                            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>تحديث</button>
                        <ThemeToggle className="bg-slate-100 dark:bg-zinc-800 border-none" />
                    </div>
                </header>

                <div className="p-6 lg:p-8 space-y-6">
                    {/* ══════ Merchant Selector + Search ══════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Merchant Filter */}
                        <div className="lg:col-span-3">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">فلتر التاجر</label>
                            <select
                                value={selectedMerchant}
                                onChange={e => setSelectedMerchant(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                            >
                                <option value="all">👥 جميع التجار ({merchants.length})</option>
                                {merchants.map(m => {
                                    const pc = planConfig[m.plan] || planConfig.free;
                                    return (
                                        <option key={m.id} value={m.id}>
                                            {pc.icon} {m.full_name || m.store_slug || m.email || 'بدون اسم'}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="lg:col-span-5">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">بحث</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-lg">search</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={t("t_e2e4e1a1")}
                                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute left-3 top-3 text-slate-400 hover:text-slate-600">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="lg:col-span-4">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">ملخص سريع</label>
                            <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 text-white px-4 py-3 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
                                {selectedMerchantInfo ? (
                                    <div className="space-y-0.5 relative">
                                        <p className="text-[10px] opacity-80 truncate flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">person</span>
                                            {selectedMerchantInfo.name}
                                        </p>
                                        <p className="text-sm font-bold">{selectedMerchantInfo.products} {t("t_2f1e9a3")} · {selectedMerchantInfo.orders} {t("t_181cdb")}</p>
                                        <p className="text-xs">{selectedMerchantInfo.revenue.toLocaleString()} {t("dzd")} {t("t_7f1e1d17")}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-0.5 relative">
                                        <p className="text-[10px] opacity-80">{t("t_da1c72c1")}</p>
                                        <p className="text-sm font-bold">{products.length} {t("t_2f1e9a3")} · {orders.length} {t("t_181cdb")}</p>
                                        <p className="text-xs">{orders.reduce((s, o) => s + (Number(o.total_price) || 0), 0).toLocaleString()} {t("dzd")} {t("t_d62191af")}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ══════ Tabs ══════ */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                            {([
                                { key: 'overview' as ViewTab, label: 'نظرة عامة', icon: 'dashboard', count: null },
                                { key: 'products' as ViewTab, label: 'المنتجات', icon: 'inventory_2', count: filteredProducts.length },
                                { key: 'orders' as ViewTab, label: 'الطلبات', icon: 'shopping_bag', count: filteredOrders.length },
                            ]).map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                    {tab.label}
                                    {tab.count !== null && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Export buttons per tab */}
                        {activeTab === 'products' && (
                            <button onClick={exportProductsCSV} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                تصدير CSV
                            </button>
                        )}
                        {activeTab === 'orders' && (
                            <button onClick={exportOrdersCSV} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                تصدير CSV
                            </button>
                        )}
                    </div>


                    {/* ══════ OVERVIEW TAB ══════ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                                {[
                                    { icon: 'inventory_2', label: 'المنتجات', value: overviewStats.totalProducts, color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/20' },
                                    { icon: 'shopping_bag', label: 'إجمالي الطلبات', value: overviewStats.totalOrders, color: 'from-violet-400 to-purple-500', shadow: 'shadow-violet-500/20' },
                                    { icon: 'trending_up', label: 'إجمالي الإيرادات', value: overviewStats.totalRevenue, suffix: ' د.ج', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
                                    { icon: 'today', label: 'طلبات اليوم', value: overviewStats.todayOrders, color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/20' },
                                    { icon: 'calendar_month', label: 'طلبات الشهر', value: overviewStats.monthOrders, color: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-500/20' },
                                    { icon: 'point_of_sale', label: 'متوسط قيمة الطلب', value: Math.round(overviewStats.avgOrderValue), suffix: ' د.ج', color: 'from-cyan-400 to-sky-500', shadow: 'shadow-cyan-500/20' },
                                ].map((item, i) => (
                                    <div key={i} className={`fade-in-up stagger-${Math.min(i + 1, 5)} bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 hover-lift group`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md ${item.shadow} group-hover:scale-110 transition-transform`}>
                                                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">{item.label}</p>
                                        </div>
                                        <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                                            <AnimatedCounter value={item.value} suffix={item.suffix || ''} />
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Row 2: Revenue Chart + Order Status + Alerts */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                                {/* Revenue Trend */}
                                <div className="fade-in-up stagger-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">show_chart</span>
                                        إيرادات آخر 7 أيام
                                    </h4>
                                    <p className="text-xs text-slate-400 mb-4">الإيراد:<strong className="text-emerald-500">{overviewStats.revenueByDay.reduce((a, b) =>a + b, 0).toLocaleString()} د.ج</strong></p>
                                    <div className="flex justify-center mb-4">
                                        <Sparkline data={overviewStats.revenueByDay} color="#10b981" height={60} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 px-2">
                                        {overviewStats.last7.map((day, i) => (
                                            <div key={i} className="text-center">
                                                <p>{new Date(day).toLocaleDateString('ar-DZ', { weekday: 'short' })}</p>
                                                <p className="font-bold text-slate-500 dark:text-slate-300 mt-0.5">{overviewStats.ordersByDay[i]}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Status Distribution */}
                                <div className="fade-in-up stagger-3 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">donut_large</span>
                                        توزيع حالات الطلبات
                                    </h4>
                                    <div className="space-y-2.5">
                                        {Object.entries(statusConfig).map(([key, config]) => {
                                            const count = overviewStats.statusCounts[key] || 0;
                                            const pct = overviewStats.totalOrders > 0 ? (count / overviewStats.totalOrders * 100) : 0;
                                            return (
                                                <div key={key} className="flex items-center gap-3">
                                                    <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center`}>
                                                        <span className={`material-symbols-outlined text-[14px] ${config.color}`}>{config.icon}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-16">{config.label}</span>
                                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(1, pct)}%`, backgroundColor: statusColors[key] }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500 w-8 text-left">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Stock Alerts */}
                                <div className="fade-in-up stagger-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
                                        تنبيهات المخزون
                                        {(overviewStats.outOfStock.length + overviewStats.lowStockWarning.length) > 0 && (
                                            <span className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                                {overviewStats.outOfStock.length + overviewStats.lowStockWarning.length}
                                            </span>
                                        )}
                                    </h4>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {overviewStats.outOfStock.length === 0 && overviewStats.lowStockWarning.length === 0 ? (
                                            <div className="text-center py-6">
                                                <span className="material-symbols-outlined text-3xl text-emerald-300 block mb-2">verified</span>
                                                <p className="text-xs text-slate-400">جميع المنتجات متوفرة بالمخزون</p>
                                            </div>
                                        ) : (
                                            <>
                                                {overviewStats.outOfStock.slice(0, 4).map(p => (
                                                    <div key={p.id} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
                                                        <span className="material-symbols-outlined text-red-500 text-[16px]">error</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-red-700 dark:text-red-400 truncate">{p.name}</p>
                                                            <p className="text-[10px] text-red-500">نفد المخزون</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {overviewStats.lowStockWarning.slice(0, 4).map(p => (
                                                    <div key={p.id} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                                        <span className="material-symbols-outlined text-amber-500 text-[16px]">warning</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 truncate">{p.name}</p>
                                                            <p className="text-[10px] text-amber-500">المتبقي: {p.stock_quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Top Products + Category Dist + Geographic */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                                {/* Top Products */}
                                <div className="fade-in-up stagger-3 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">leaderboard</span>
                                        أكثر المنتجات مبيعاً
                                    </h4>
                                    {overviewStats.topProducts.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-8">لا توجد بيانات مبيعات بعد</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {overviewStats.topProducts.map((p, i) => {
                                                const medals = ['🥇', '🥈', '🥉'];
                                                return (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <span className="text-lg w-7 text-center">{i < 3 ? medals[i] : <span className="text-xs font-bold text-slate-400">#{i + 1}</span>}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{p.name}</p>
                                                            <p className="text-[10px] text-slate-400">{p.count} مبيع · {p.revenue.toLocaleString()} د.ج</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Category Distribution */}
                                <div className="fade-in-up stagger-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">category</span>
                                        توزيع الفئات
                                    </h4>
                                    <HBarChart
                                        data={Object.entries(overviewStats.catDist)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 6)
                                            .map(([cat, count], i) => ({
                                                label: cat,
                                                value: count,
                                                color: categoryColors[i % categoryColors.length],
                                            }))}
                                    />
                                </div>

                                {/* Geographic Distribution */}
                                <div className="fade-in-up stagger-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                                        التوزيع الجغرافي
                                    </h4>
                                    {overviewStats.topStates.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-8">لا توجد بيانات جغرافية</p>
                                    ) : (
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                            {overviewStats.topStates.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold text-slate-400 w-5">#{i + 1}</span>
                                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{s.state}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="text-slate-500">{s.count} طلب</span>
                                                        <span className="font-bold text-emerald-600">{s.revenue.toLocaleString()} د.ج</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 4: Merchant Performance Table */}
                            {selectedMerchant === 'all' && (
                                <div className="fade-in-up stagger-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                                    <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-lg">groups</span>
                                            أداء التجار
                                        </h4>
                                        <span className="text-xs text-slate-400">{merchants.length} تاجر</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead>
                                                <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                                    <th className="px-5 py-3">التاجر</th>
                                                    <th className="px-5 py-3 text-center">الخطة</th>
                                                    <th className="px-5 py-3 text-center">المنتجات</th>
                                                    <th className="px-5 py-3 text-center">الطلبات</th>
                                                    <th className="px-5 py-3 text-center">الإيراد</th>
                                                    <th className="px-5 py-3 text-center">عرض</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                                {Object.entries(merchantStats)
                                                    .sort((a, b) => b[1].revenue - a[1].revenue)
                                                    .slice(0, 10)
                                                    .map(([id, ms]) => {
                                                        const pc = planConfig[ms.plan] || planConfig.free;
                                                        return (
                                                            <tr key={id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                                                                <td className="px-5 py-3">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                                            {(ms.name || '?').charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{ms.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-3 text-center">
                                                                    <span className={`text-xs font-bold ${pc.color}`}>{pc.icon} {pc.label}</span>
                                                                </td>
                                                                <td className="px-5 py-3 text-center text-sm font-bold text-blue-600">{ms.products}</td>
                                                                <td className="px-5 py-3 text-center text-sm font-bold text-violet-600">{ms.orders}</td>
                                                                <td className="px-5 py-3 text-center">
                                                                    <span className="text-sm font-bold text-emerald-600">{ms.revenue.toLocaleString()}</span>
                                                                    <span className="text-[10px] text-slate-400 mr-1">د.ج</span>
                                                                </td>
                                                                <td className="px-5 py-3 text-center">
                                                                    <button onClick={() => { setSelectedMerchant(id); setActiveTab('products'); }}
                                                                        className="text-primary hover:underline text-xs font-bold">
                                                                        تفاصيل ←
                                                                    </button>
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


                    {/* ══════ PRODUCTS TAB ══════ */}
                    {activeTab === 'products' && (
                        <div className="space-y-4 fade-in-up">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
                                    المنتجات ({filteredProducts.length})
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Category Filter */}
                                    <select value={productCategoryFilter} onChange={e => setProductCategoryFilter(e.target.value)}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-pink-500">
                                        <option value="all">كل الفئات</option>
                                        {productCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {/* Sort */}
                                    {(['date', 'price', 'stock', 'name'] as const).map(s => (
                                        <button key={s} onClick={() => setProductSortBy(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${productSortBy === s ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
                                            {s === 'date' ? 'الأحدث' : s === 'price' ? 'السعر' : s === 'stock' ? 'المخزون' : 'الاسم'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Products Table */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right">
                                        <thead>
                                            <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                                <th className="px-5 py-3">#</th>
                                                <th className="px-5 py-3">المنتج</th>
                                                <th className="px-5 py-3">التاجر</th>
                                                <th className="px-5 py-3">السعر</th>
                                                <th className="px-5 py-3">المخزون</th>
                                                <th className="px-5 py-3">الفئة</th>
                                                <th className="px-5 py-3">المتجر</th>
                                                <th className="px-5 py-3">التاريخ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                            {paginatedProducts.length === 0 ? (
                                                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                                                    <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">inventory_2</span>
                                                    لا توجد منتجات مطابقة
                                                </td></tr>
                                            ) : paginatedProducts.map((p, idx) => {
                                                const owner = merchantStats[p.user_id];
                                                const rowNum = (productPage - 1) * ITEMS_PER_PAGE + idx + 1;
                                                return (
                                                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                                                        <td className="px-5 py-3 text-xs text-slate-400">{rowNum}</td>
                                                        <td className="px-5 py-3">
                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{p.name || '—'}</p>
                                                            {p.description && <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{p.description}</p>}
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-[9px] font-black text-slate-500">
                                                                    {(owner?.name || '?').charAt(0)}
                                                                </div>
                                                                <span className="text-xs text-slate-500 truncate max-w-[100px]">{owner?.name || '—'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {Number(p.price || 0).toLocaleString()} <span className="text-[10px] text-slate-400">د.ج</span>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${(p.stock_quantity || 0) <= 0
                                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
                                                                : (p.stock_quantity || 0) < 10
                                                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                                                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                                                }`}>
                                                                {(p.stock_quantity || 0) <= 0 && <span className="material-symbols-outlined text-[12px]">error</span>}
                                                                {p.stock_quantity ?? '∞'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className="text-xs text-slate-500 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded">{p.category || '—'}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-xs text-slate-400 truncate max-w-[100px]">{p.store_domain || '—'}</td>
                                                        <td className="px-5 py-3">
                                                            <div>
                                                                <p className="text-[11px] text-slate-400">{formatDate(p.created_at)}</p>
                                                                <p className="text-[10px] text-slate-300">{timeAgo(p.created_at)}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Footer */}
                                <div className="px-5 py-3 bg-slate-50/80 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                    <p className="text-xs text-slate-400">
                                        عرض {((productPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(productPage * ITEMS_PER_PAGE, filteredProducts.length)} من {filteredProducts.length} منتج
                                    </p>
                                    <PaginationControls page={productPage} totalPages={totalProductPages} onPageChange={setProductPage} />
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ══════ ORDERS TAB ══════ */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4 fade-in-up">
                            {/* Status Filter Bar */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">shopping_bag</span>
                                    الطلبات ({filteredOrders.length})
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { key: 'all', label: 'الكل', count: filteredOrders.length },
                                        { key: 'pending', label: 'معلّق' },
                                        { key: 'confirmed', label: 'مؤكد' },
                                        { key: 'shipping', label: 'شحن' },
                                        { key: 'delivered', label: 'تسليم' },
                                        { key: 'completed', label: 'مكتمل' },
                                        { key: 'cancelled', label: 'ملغي' },
                                    ].map(f => (
                                        <button key={f.key} onClick={() => setOrderStatusFilter(f.key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orderStatusFilter === f.key
                                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                            }`}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orders Table */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right">
                                        <thead>
                                            <tr className="bg-slate-50/80 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                                <th className="px-5 py-3">رقم الطلب</th>
                                                <th className="px-5 py-3">العميل</th>
                                                <th className="px-5 py-3">المنتج</th>
                                                <th className="px-5 py-3">التاجر</th>
                                                <th className="px-5 py-3">المبلغ</th>
                                                <th className="px-5 py-3">الكمية</th>
                                                <th className="px-5 py-3">الحالة</th>
                                                <th className="px-5 py-3">الولاية</th>
                                                <th className="px-5 py-3">التاريخ</th>
                                                <th className="px-5 py-3">عرض</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                            {paginatedOrders.length === 0 ? (
                                                <tr><td colSpan={10} className="px-5 py-10 text-center text-slate-400">
                                                    <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">inbox</span>
                                                    لا توجد طلبات مطابقة
                                                </td></tr>
                                            ) : paginatedOrders.map(o => {
                                                const sc = statusConfig[o.status] || statusConfig.pending;
                                                const owner = merchantStats[o.user_id];
                                                return (
                                                    <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                                                        <td className="px-5 py-3">
                                                            <span className="text-xs font-mono text-slate-400 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                                                #{o.id?.slice(0, 8)}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                                    {(o.customer_name || '?').charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px] block">{o.customer_name || 'زائر'}</span>
                                                                    {o.customer_phone && <span className="text-[10px] text-slate-400">{o.customer_phone}</span>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-xs text-slate-500 truncate max-w-[150px]">{o.product_name || '—'}</td>
                                                        <td className="px-5 py-3">
                                                            <span className="text-xs text-slate-400 truncate max-w-[100px] block">{owner?.name || '—'}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {Number(o.total_price || 0).toLocaleString()} <span className="text-[10px] text-slate-400">د.ج</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-sm text-slate-500 text-center">{o.quantity || 1}</td>
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                                                                <span className="material-symbols-outlined text-[12px]">{sc.icon}</span>
                                                                {sc.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-xs text-slate-400">{o.customer_state || '—'}</td>
                                                        <td className="px-5 py-3">
                                                            <div>
                                                                <p className="text-[11px] text-slate-400">{formatDate(o.created_at)}</p>
                                                                <p className="text-[10px] text-slate-300">{timeAgo(o.created_at)}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <button onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}
                                                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-primary hover:bg-pink-50 dark:hover:bg-pink-900/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Footer */}
                                <div className="px-5 py-3 bg-slate-50/80 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                    <p className="text-xs text-slate-400">
                                        عرض {filteredOrders.length > 0 ? ((orderPage - 1) * ITEMS_PER_PAGE) + 1 : 0} - {Math.min(orderPage * ITEMS_PER_PAGE, filteredOrders.length)} من {filteredOrders.length} طلب
                                    </p>
                                    <PaginationControls page={orderPage} totalPages={totalOrderPages} onPageChange={setOrderPage} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ══════════ ORDER DETAIL MODAL ══════════ */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowOrderModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl animate-slide-in overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-l from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 border-b border-slate-100 dark:border-zinc-800 relative">
                            <button onClick={() => setShowOrderModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                                    <span className="material-symbols-outlined text-2xl">receipt_long</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">تفاصيل الطلب</h3>
                                    <p className="text-xs text-slate-400 font-mono">#{selectedOrder.id?.slice(0, 12)}</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                {(() => {
                                    const sc = statusConfig[selectedOrder.status] || statusConfig.pending;
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${sc.bg} ${sc.color}`}>
                                            <span className="material-symbols-outlined text-[14px]">{sc.icon}</span>
                                            {sc.label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Customer Info */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">person</span>
                                    معلومات العميل
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        { icon: 'badge', label: 'الاسم', value: selectedOrder.customer_name || '—' },
                                        { icon: 'call', label: 'الهاتف', value: selectedOrder.customer_phone || '—' },
                                        { icon: 'mail', label: 'البريد', value: selectedOrder.customer_email || '—' },
                                        { icon: 'location_on', label: 'الولاية', value: selectedOrder.customer_state || '—' },
                                        { icon: 'home', label: 'العنوان', value: selectedOrder.customer_address || '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">{item.icon}</span>
                                                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[200px] truncate">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Details */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">shopping_bag</span>تفاصيل الطلب</h4>
                                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedOrder.product_name || '—'}</span>
                                        <span className="text-xs text-slate-400">x{selectedOrder.quantity || 1}</span>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-zinc-700 pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-xs text-slate-500">المبلغ الإجمالي</span>
                                            <span className="text-lg font-black text-slate-800 dark:text-slate-100">{Number(selectedOrder.total_price || 0).toLocaleString()} <span className="text-xs text-slate-400">د.ج</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Merchant Info */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">storefront</span>
                                    معلومات التاجر
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        { icon: 'person', label: 'التاجر', value: merchantStats[selectedOrder.user_id]?.name || '—' },
                                        { icon: 'language', label: 'المتجر', value: selectedOrder.store_domain || '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">{item.icon}</span>
                                                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">notes</span>
                                        ملاحظات
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl leading-relaxed">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                    التوقيت
                                </h4>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
                                    <div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(selectedOrder.created_at)}</p>
                                        <p className="text-xs text-slate-400">{formatTime(selectedOrder.created_at)} · {timeAgo(selectedOrder.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
