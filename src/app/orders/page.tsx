'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { getStoreContext } from '@/lib/storeContext';
import { hasPermission } from '@/lib/rbac';
import SOUQAILoader from '@/components/SOUQAILoader';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';
import { useI18n } from "@/context/I18nContext";
export default function OrdersManagement() {
    const { t, lang } = useI18n();
    const { planExpired, currentPlan } = useExpiredPlanGuard();
    
    const WILAYA_MAP: Record<string, string> = {
        '01': t('t_5961d6ef'), '02': t('t_59a3cf94'), '03': t('t_7efafe84'), '04': t('t_d4d5e8ec'), '05': t('t_59a492ee'),
        '06': t('t_59a6ce02'), '07': t('t_59aa62b0'), '08': t('t_2e476f6'), '09': t('t_7f46082b'), '10': t('t_7f47d9e5'),
        '11': t('t_214b2db8'), '12': t('t_2e53414'), '13': t('t_2003d599'), '14': t('t_59d09d20'), '15': t('t_12e401ca'),
        '16': t('t_7f75b30f'), '17': t('t_252d79e3'), '18': t('t_2e69bb6'), '19': t('t_2e9869b'), '20': t('t_5a48397e'),
        '21': t('t_10b3ccbd'), '22': t('t_f6446c85'), '23': t('t_5aa22b1b'), '24': t('t_5b135783'), '25': t('t_7d33f75'),
        '26': t('t_25226a5a'), '27': t('t_6aaa45f8'), '28': t('t_80d6fa04'), '29': t('t_5b458cad'), '30': t('t_5b6c689e'),
        '31': t('t_5b762591'), '32': t('t_59a3a337'), '33': t('t_5987f103'), '34': t('t_3858a5fe'), '35': t('t_4370b9d1'),
        '36': t('t_2528e883'), '37': t('t_59ceec8c'), '38': t('t_eb2b811'), '39': t('t_25212e69'), '40': t('t_5a075cc1'),
        '41': t('t_3b649c66'), '42': t('t_1fbca32a'), '43': t('t_2f1fbca'), '44': t('t_46623a41'), '45': t('t_80e7487b'),
        '46': t('t_412a6c4a'), '47': t('t_5cc3352'), '48': t('t_4b4098f'),
        '49': t('t_29d121de'), '50': t('t_c84fe665'), '51': t('t_51cf158e'), '52': t('t_1e9d42ef'),
        '53': t('t_2eab097a'), '54': t('t_2ea4fac7'), '55': t('t_2e59571'), '56': t('t_2e61b5f'), '57': t('t_25224107'), '58': t('t_80df9bbc')
    };
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('viewer');
    const [stats, setStats] = useState({
        total: 0, pending: 0, shipping: 0, completed: 0, cancelled: 0, returned: 0, totalRevenue: 0
    });

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const [activeChannelName, setActiveChannelName] = useState<string | null>(null);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        if (!hasPermission(userRole, 'manage_orders')) { alert('ليس لديك صلاحية لتحديث حالة الطلب'); return; }
        try {
            const { error } = await insforge.database
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (!error) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                // Recalculate stats
                setOrders(prev => {
                    const updated = prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
                    computeStats(updated);
                    return updated;
                });
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const computeStats = (data: any[]) => {
        let pending = 0, shipping = 0, completed = 0, cancelled = 0, returned = 0, totalRevenue = 0;
        data.forEach((o: any) => {
            const s = o.status || 'pending';
            if (s === 'pending') pending++;
            else if (s === 'shipping') shipping++;
            else if (s === 'completed') { completed++; totalRevenue += parseFloat(o.total_price || 0); }
            else if (s === 'cancelled') cancelled++;
            else if (s === 'returned') returned++;
        });
        setStats({ total: data.length, pending, shipping, completed, cancelled, returned, totalRevenue });
    };

    useEffect(() => {
        async function fetchOrders() {
            try {
                const ctx = await getStoreContext();
                if (!ctx) {
                    router.push('/login');
                    return;
                }
                setUserRole(ctx.role);

                if (!ctx.storeDomain) {
                    setOrders([]);
                    setLoading(false);
                    return;
                }

                const { data, error } = await insforge.database
                    .from('orders')
                    .select('*')
                    .eq('store_domain', ctx.storeDomain)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    // Fetch product images
                    const productIds = [...new Set(data.map((o: any) => o.product_id).filter(Boolean))];
                    let productImages: Record<string, string> = {};
                    if (productIds.length > 0) {
                        const { data: products } = await insforge.database
                            .from('products')
                            .select('id, image_url')
                            .in('id', productIds);
                        if (products) {
                            products.forEach((p: any) => { productImages[p.id] = p.image_url; });
                        }
                    }
                    const ordersWithImages = data.map((o: any) => ({
                        ...o,
                        product_image: productImages[o.product_id] || ''
                    }));
                    setOrders(ordersWithImages);
                    computeStats(ordersWithImages);
                }
            } catch (err) {
                console.error("Failed to load orders", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [router]);

    // Play synthesized sound notification
    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const playNote = (frequency: number, startTime: number, duration: number) => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.value = frequency;
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };
            
            const now = audioCtx.currentTime;
            playNote(523.25, now, 0.35); // C5
            playNote(659.25, now + 0.12, 0.45); // E5
        } catch (err) {
            console.log('Audio playback failed/blocked:', err);
        }
    };

    // Reusable realtime init function
    const initRealtimeConnection = async () => {
        try {
            const ctx = await getStoreContext();
            if (!ctx || !ctx.storeDomain) {
                setRealtimeStatus('disconnected');
                return null;
            }

            const channelName = `store:${ctx.storeDomain}`;
            setRealtimeStatus('connecting');

            let attempts = 0;
            while (insforge.realtime.connectionState !== 'connected' && attempts < 10) {
                if (insforge.realtime.connectionState === 'disconnected') {
                    await insforge.realtime.connect();
                }
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }

            if (insforge.realtime.connectionState !== 'connected') {
                console.error('Realtime connection could not be established');
                setRealtimeStatus('disconnected');
                return null;
            }

            const response = await insforge.realtime.subscribe(channelName);
            if (!response.ok) {
                console.error('Failed to subscribe to realtime channel:', response.error?.message);
                setRealtimeStatus('disconnected');
                return null;
            }
            
            setRealtimeStatus('connected');
            setActiveChannelName(channelName);
            console.log('Subscribed to store realtime channel:', channelName);
            return channelName;
        } catch (err) {
            console.error('Realtime setup error:', err);
            setRealtimeStatus('disconnected');
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;
        let subscribedChannel: string | null = null;
        
        const handleNewOrder = async (newOrder: any) => {
            if (!isMounted) return;
            console.log('Received real-time order:', newOrder);

            playNotificationSound();

            // 1. Prepend order to state immediately to ensure instant UI rendering
            const initialOrder = {
                ...newOrder,
                product_image: '',
                is_new: true
            };

            setOrders(prev => {
                if (prev.some(o => o.id === newOrder.id)) return prev;
                const updated = [initialOrder, ...prev];
                computeStats(updated);
                return updated;
            });

            // 2. Fetch product image in background without blocking UI render
            if (newOrder.product_id) {
                try {
                    const { data: product } = await insforge.database
                        .from('products')
                        .select('image_url')
                        .eq('id', newOrder.product_id)
                        .maybeSingle();
                    if (product?.image_url && isMounted) {
                        setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, product_image: product.image_url } : o));
                    }
                } catch (err) {
                    console.error('Failed to fetch product image for real-time order:', err);
                }
            }

            setTimeout(() => {
                if (!isMounted) return;
                setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, is_new: false } : o));
            }, 10000);
        };

        // Register the listener immediately on mount (so it is active even if reconnecting)
        insforge.realtime.on('INSERT_order', handleNewOrder);

        const setup = async () => {
            const ch = await initRealtimeConnection();
            if (ch && isMounted) {
                subscribedChannel = ch;
            }
        };

        setup();

        // Monitor connection drops every 8 seconds
        const interval = setInterval(() => {
            if (!isMounted) return;
            const state = insforge.realtime.connectionState;
            if (state === 'connected' && realtimeStatus !== 'connected') {
                setRealtimeStatus('connected');
            } else if (state === 'disconnected') {
                setRealtimeStatus('disconnected');
                setup();
            }
        }, 8000);

        return () => {
            isMounted = false;
            clearInterval(interval);
            insforge.realtime.off('INSERT_order', handleNewOrder);
            if (subscribedChannel) {
                insforge.realtime.unsubscribe(subscribedChannel);
            }
        };
    }, []);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return { label: t('t_5b49f6eb'), bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', icon: 'check_circle' };
            case 'pending':
                return { label: t('t_bf09a1dc'), bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', icon: 'pending' };
            case 'shipping':
                return { label: t('t_b05c8d5c'), bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', icon: 'local_shipping' };
            case 'cancelled':
                return { label: t('t_2f1e42e'), bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', icon: 'cancel' };
            case 'returned':
                return { label: lang === 'ar' ? 'مرتجع' : 'Returned', bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500', icon: 'keyboard_return' };
            case 'high_risk':
                return { label: t('t_43cd089d'), bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', icon: 'warning' };
            default:
                return { label: t('t_bf09a1dc'), bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', icon: 'pending' };
        }
    };

    const getWilayaName = (code: string) => {
        if (!code) return '—';
        // Handle cases where code is "1" instead of "01"
        const paddedCode = String(code).padStart(2, '0');
        return WILAYA_MAP[paddedCode] || WILAYA_MAP[code] || code;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('ar-DZ', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('ar-DZ', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    // Filtering logic
    const filteredOrders = orders.filter(order => {
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchName = (order.customer_name || '').toLowerCase().includes(q);
            const matchPhone = (order.customer_phone || '').includes(q);
            const matchId = (order.id || '').toLowerCase().includes(q);
            const matchProduct = (order.product_name || '').toLowerCase().includes(q);
            const matchWilaya = getWilayaName(order.customer_state).includes(q);
            if (!matchName && !matchPhone && !matchId && !matchProduct && !matchWilaya) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'high_risk') {
                if (order.risk_score !== 'high') return false;
            } else if (order.status !== statusFilter) {
                return false;
            }
        }

        // Date filter
        if (dateFrom) {
            const orderDate = new Date(order.created_at);
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            if (orderDate < fromDate) return false;
        }
        if (dateTo) {
            const orderDate = new Date(order.created_at);
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            if (orderDate > toDate) return false;
        }

        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, dateFrom, dateTo]);

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
    };
    const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFrom || dateTo;

    return (
        <>
            {planExpired && (
                <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
            )}
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Orders" />

                <main className="flex-1 overflow-y-auto h-screen relative custom-scrollbar pt-16 md:pt-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-8">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-[28px] font-black text-[#111827] dark:text-white mb-1 tracking-tight">{t('t_7a200096')}</h1>
                                <p className="text-[#6B7280] dark:text-gray-400 font-medium text-[15px]">{t('t_2d889ccb2')}</p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <StoreLinkButton />
                                <NotificationsDropdown />
                                {hasPermission(userRole, 'manage_orders') && (
                                    <button className="flex items-center gap-2 px-6 h-12 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white hover:bg-gray-50 dark:bg-zinc-900/50 transition-all shadow-sm  font-bold text-[15px]">
                                        <span className="material-symbols-outlined text-[20px] text-[#6B7280] dark:text-gray-400">file_download</span>
                                        <span>{t('t_59c7326b')}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm  border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#fcebf8] flex items-center justify-center text-[#E91E63]">
                                        <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_9cf81b14')}</span>
                                </div>
                                <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.total}</h3>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm  border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                        <span className="material-symbols-outlined text-[22px]">pending</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_bf09a1dc')}</span>
                                </div>
                                <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.pending}</h3>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm  border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_b05c8d5c')}</span>
                                </div>
                                <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.shipping}</h3>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm  border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                        <span className="material-symbols-outlined text-[22px]">check_circle</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_5b49f6eb')}</span>
                                </div>
                                <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.completed}</h3>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm  border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                        <span className="material-symbols-outlined text-[22px]">keyboard_return</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{lang === 'ar' ? 'المرتجع' : 'Returned'}</span>
                                </div>
                                <h3 className="text-2xl font-black text-[#111827] dark:text-white">{stats.returned}</h3>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm  border border-gray-100 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                        <span className="material-symbols-outlined text-[22px]">payments</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_300bf83a')}</span>
                                </div>
                                <h3 className="text-xl font-black text-[#111827] dark:text-white">{stats.totalRevenue.toLocaleString()} <span className="text-xs text-[#6B7280] dark:text-gray-400">{t('t_17422d')}</span></h3>
                            </div>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800/30 flex flex-col min-h-[400px]">
                            {/* Search + Filters Bar */}
                            <div className="p-5 md:p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-stretch gap-4">
                                <div className="relative w-full md:w-[380px]">
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#6B7280] dark:text-gray-400">
                                        <span className="material-symbols-outlined text-[20px]">search</span>
                                    </div>
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pr-12 pl-4 h-11 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-[14px] font-medium focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63] placeholder:text-gray-400 transition-all"
                                        placeholder={t('t_1f77ed904')}
                                        type="text"
                                    />
                                </div>
                                <div className="flex gap-2 items-center flex-wrap">
                                    {/* Status Filter */}
                                    <div className="relative">
                                        <button
                                            onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowDatePicker(false); }}
                                            className={`flex items-center gap-2 px-4 h-11 rounded-xl border text-[13px] font-bold transition-colors ${statusFilter !== 'all' ? 'border-[#E91E63] bg-[#E91E63]/5 text-[#E91E63]' : 'border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:bg-zinc-900/50'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                            {statusFilter === 'all' ? t('t_cc0b2d79') : getStatusStyles(statusFilter).label}
                                        </button>
                                        {showStatusDropdown && (
                                            <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800/30 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                {[
                                                    { value: 'all', label: t('t_cc0b2d79'), icon: 'list', color: 'text-gray-600 dark:text-gray-400' },
                                                    { value: 'high_risk', label: t('t_43cd089d'), icon: 'warning', color: 'text-red-600' },
                                                    { value: 'pending', label: t('t_bf09a1dc'), icon: 'pending', color: 'text-amber-500' },
                                                    { value: 'shipping', label: t('t_b05c8d5c'), icon: 'local_shipping', color: 'text-blue-500' },
                                                    { value: 'completed', label: t('t_5b49f6eb'), icon: 'check_circle', color: 'text-emerald-500' },
                                                    { value: 'cancelled', label: t('t_2f1e42e'), icon: 'cancel', color: 'text-red-500' },
                                                    { value: 'returned', label: lang === 'ar' ? 'مرتجع' : 'Returned', icon: 'keyboard_return', color: 'text-purple-500' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => { setStatusFilter(opt.value); setShowStatusDropdown(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-colors ${statusFilter === opt.value ? 'bg-[#E91E63]/5 text-[#E91E63]' : 'text-[#111827] dark:text-white'}`}
                                                    >
                                                        <span className={`material-symbols-outlined text-[18px] ${opt.color}`}>{opt.icon}</span>
                                                        {opt.label}
                                                        {statusFilter === opt.value && <span className="material-symbols-outlined text-[16px] mr-auto text-[#E91E63]">check</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date Range Picker */}
                                    <div className="relative">
                                        <button
                                            onClick={() => { setShowDatePicker(!showDatePicker); setShowStatusDropdown(false); }}
                                            className={`flex items-center gap-2 px-4 h-11 rounded-xl border text-[13px] font-bold transition-colors ${(dateFrom || dateTo) ? 'border-[#E91E63] bg-[#E91E63]/5 text-[#E91E63]' : 'border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:bg-zinc-900/50'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                            {(dateFrom || dateTo) ? `${dateFrom || '...'} → ${dateTo || '...'}` : t('t_7f54addb')}
                                        </button>
                                        {showDatePicker && (
                                            <div className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800/30 z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <p className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_a43765fb')}</p>
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400 mb-1 block">{t('t_4c8e0387')}</label>
                                                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full h-10 rounded-xl border border-gray-200 dark:border-zinc-800 px-3 text-[13px] focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400 mb-1 block">{t('t_f2c19282')}</label>
                                                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full h-10 rounded-xl border border-gray-200 dark:border-zinc-800 px-3 text-[13px] focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-zinc-800 text-[12px] font-bold text-[#6B7280] dark:text-gray-400 hover:bg-gray-50 dark:bg-zinc-900/50">{t('t_184f5f')}</button>
                                                    <button onClick={() => setShowDatePicker(false)} className="flex-1 h-9 rounded-lg bg-[#E91E63] text-white text-[12px] font-bold hover:bg-[#C2185B]">{t('t_59c800f3')}</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Clear all filters */}
                                    {hasActiveFilters && (
                                        <button onClick={clearFilters} className="flex items-center gap-1 px-3 h-11 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                            
                                            {t('t_f77613f3')}
                                        </button>
                                    )}

                                    {/* Results count */}
                                    <span className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400 mr-2 hidden md:block">{filteredOrders.length}  {t('t_5b4d2623')}</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto flex-1 p-2">
                                <table className="w-full text-right border-separate border-spacing-y-1 px-4">
                                    <thead>
                                        <tr className="text-[#6B7280] dark:text-gray-400 text-[13px] font-bold">
                                            <th className="py-3 px-3 rounded-r-xl font-bold">{t('t_59a3dabe')}</th>
                                            <th className="py-3 px-3 font-bold">{t('t_25278c1d')}</th>
                                            <th className="py-3 px-3 font-bold">{t('t_252217e0')}</th>
                                            <th className="py-3 px-3 font-bold text-center">{t('t_8108782d')}</th>
                                            <th className="py-3 px-3 font-bold text-center">{t('t_25230082')}</th>
                                            <th className="py-3 px-3 font-bold text-center">{t('t_9cf81b14')}</th>
                                            <th className="py-3 px-3 font-bold text-center">{t('t_7f54addb')}</th>
                                            <th className="py-3 px-3 font-bold text-center">{t('t_252d7204')}</th>
                                            <th className="py-3 px-3 rounded-l-xl font-bold text-center">{t('t_597ca8c4')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={9} className="py-12 text-center">
                                                    <SOUQAILoader size="sm" text={t('t_9c2144dd')} />
                                                </td>
                                            </tr>
                                        ) : paginatedOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <span className="material-symbols-outlined text-[48px] text-gray-300">inbox</span>
                                                        <p className="text-[15px] font-bold text-[#6B7280] dark:text-gray-400">
                                                            {hasActiveFilters ? t('t_10cb44873') : t('t_640cdda6')}
                                                        </p>
                                                        {hasActiveFilters && (
                                                            <button onClick={clearFilters} className="text-[13px] font-bold text-[#E91E63] hover:underline">{t('t_32734a2b')}</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedOrders.map((order, i) => {
                                                const badge = getStatusStyles(order.status);
                                                const name = order.customer_name || t('t_5b3fef9c');
                                                const initial = name.charAt(0);

                                                const avatarColors = [
                                                    'bg-indigo-50 text-indigo-600',
                                                    'bg-pink-50 text-pink-600',
                                                    'bg-purple-50 text-purple-600',
                                                    'bg-orange-50 text-orange-600',
                                                    'bg-teal-50 text-teal-600'
                                                ];
                                                const avatarColor = avatarColors[i % avatarColors.length];
                                                const isNew = (order as any).is_new;

                                                const tdHoverClass = isNew 
                                                    ? 'group-hover:bg-pink-100/50 dark:group-hover:bg-pink-900/30' 
                                                    : 'group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/20';
                                                
                                                const tdClass = (isFirst = false, isLast = false) => 
                                                    `py-3 px-3 ${isFirst ? 'rounded-r-xl' : ''} ${isLast ? 'rounded-l-xl' : ''} ${isNew ? 'bg-pink-50/70 dark:bg-pink-950/20' : ''} ${tdHoverClass} transition-colors`;

                                                return (
                                                    <tr key={order.id} onClick={(e) => {
                                                        const target = e.target as HTMLElement;
                                                        if (target.closest('button') || target.closest('a')) return;
                                                        try { router.push(`/orders/${order.id}`) } catch (err) { }
                                                    }} className={`group transition-all duration-1000 cursor-pointer ${isNew ? 'border-r-4 border-r-[#E91E63] animate-pulse shadow-md' : ''}`}>
                                                        <td className={tdClass(true, false)}>
                                                            <div className="flex flex-col items-start gap-1">
                                                                <span className="text-[13px] font-black text-[#111827] dark:text-white group-hover:text-[#E91E63] transition-colors">#{order.id.slice(0, 6).toUpperCase()}</span>
                                                                {order.risk_score === 'high' && (
                                                                    <div title={Array.isArray(order.fraud_flags) ? order.fraud_flags.join(' | ') : t('t_57c8b2c6')} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 text-[10px] font-bold">
                                                                        <span className="material-symbols-outlined text-[12px]">warning</span>
                                                                        احتيال
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className={tdClass(false, false)}>
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`w-9 h-9 rounded-lg ${avatarColor} flex items-center justify-center text-[14px] font-bold shrink-0`}>
                                                                    {initial}
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-[13px] font-bold text-[#111827] dark:text-white truncate">{name}</span>
                                                                    <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400 dir-ltr text-right">{order.customer_phone || ''}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={tdClass(false, false)}>
                                                            <div className="flex items-center gap-2">
                                                                 <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-100 dark:border-zinc-800/30 flex-shrink-0 overflow-hidden">
                                                                    {order.product_image ? (
                                                                        <img src={order.product_image} alt={order.product_name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-[13px] font-bold text-[#111827] dark:text-white line-clamp-1 max-w-[120px]">{order.product_name || '—'}</span>
                                                            </div>
                                                        </td>
                                                        <td className={tdClass(false, false)} text-center="true">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/30 text-[12px] font-bold text-[#111827] dark:text-white">
                                                                <span className="material-symbols-outlined text-[14px] text-[#6B7280] dark:text-gray-400">location_on</span>
                                                                {getWilayaName(order.customer_state)}
                                                            </span>
                                                        </td>
                                                        <td className={tdClass(false, false)} text-center="true">
                                                            <span className="text-[13px] font-black text-[#111827] dark:text-white">{order.quantity || 1}</span>
                                                        </td>
                                                        <td className={tdClass(false, false)} text-center="true">
                                                            <span className="font-black text-[#111827] dark:text-white text-[14px]">{order.total_price?.toLocaleString() || 0} <span className="text-[10px] text-[#6B7280] dark:text-gray-400">{t('t_17422d')}</span></span>
                                                        </td>
                                                        <td className={tdClass(false, false)} text-center="true">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[12px] font-bold text-[#111827] dark:text-white">{formatDate(order.created_at)}</span>
                                                                <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400">{formatTime(order.created_at)}</span>
                                                            </div>
                                                        </td>
                                                        <td className={tdClass(false, false)} text-center="true">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                        <td className={tdClass(false, true)} text-center="true" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <select
                                                                    value={order.status || 'pending'}
                                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                                    className="text-[11px] font-bold border border-gray-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 bg-white dark:bg-zinc-900 focus:ring-1 focus:ring-[#E91E63]/30 focus:border-[#E91E63] cursor-pointer"
                                                                >
                                                                    <option value="pending">{t('t_bf09a1dc')}</option>
                                                                    <option value="shipping">{t('t_b05c8d5c')}</option>
                                                                    <option value="completed">{t('t_5b49f6eb')}</option>
                                                                    <option value="cancelled">{t('t_2f1e42e')}</option>
                                                                    <option value="returned">{lang === 'ar' ? 'مرتجع' : 'Returned'}</option>
                                                                </select>
                                                                <button
                                                                    onClick={() => router.push(`/orders/${order.id}`)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700 transition-colors shrink-0"
                                                                    title={t("t_6caa9fbc")}
                                                                 >
                                                                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                                                                </button>
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
                            {totalPages > 0 && (
                                <div className="p-5 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-bold">
                                        
                                        {t('t_18221e')} {((currentPage - 1) * ordersPerPage) + 1}  {t('t_17d96a')} {Math.min(currentPage * ordersPerPage, filteredOrders.length)}  {t('t_c8a1')} {filteredOrders.length}  {t('t_181cdb')}
                                    </span>
                                    <div className="flex gap-1" dir="ltr">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 text-[#6B7280] dark:text-gray-400 hover:bg-gray-50 dark:bg-zinc-900/50 disabled:opacity-40 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                                        </button>
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                                            let page: number;
                                            if (totalPages <= 5) {
                                                page = idx + 1;
                                            } else if (currentPage <= 3) {
                                                page = idx + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                page = totalPages - 4 + idx;
                                            } else {
                                                page = currentPage - 2 + idx;
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-bold transition-colors ${currentPage === page
                                                        ? 'bg-[#E91E63] text-white shadow-md shadow-[#E91E63]/30'
                                                        : 'border border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:bg-zinc-900/50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                        <button
                                            disabled={currentPage >= totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 text-[#6B7280] dark:text-gray-400 hover:bg-gray-50 dark:bg-zinc-900/50 disabled:opacity-40 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
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
