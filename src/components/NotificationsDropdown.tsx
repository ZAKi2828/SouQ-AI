'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { useI18n } from "@/context/I18nContext";

export default function NotificationsDropdown() {
    const { t } = useI18n();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchNotifications = async () => {
            try {
                // Use store context to scope notifications to the correct merchant
                const { getStoreContext } = await import('@/lib/storeContext');
                const ctx = await getStoreContext();
                if (!ctx) return;

                const targetUserId = ctx.targetUserId;
                const storeDomain = ctx.storeDomain;

                // Get profile for subscription dates (always from store owner)
                const { data: profile } = await insforge.database
                    .from('profiles')
                    .select('plan, plan_expires_at, created_at')
                    .eq('id', targetUserId)
                    .single();

                if (!isMounted) return;

                const notifs: any[] = [];
                const now = new Date();

                // System Notifications based on store owner's profile
                if (profile) {
                    // Welcome notification (if account created in last 7 days)
                    if (profile.created_at) {
                        const createdAt = new Date(profile.created_at);
                        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
                        if (diffDays < 7) {
                            notifs.push({
                                id: `sys_welcome_${targetUserId}`,
                                type: 'system',
                                title: t('t_f638680f'),
                                message: t('t_2e6f8025'),
                                time: createdAt.getTime(),
                                link: '/settings',
                                icon: 'waving_hand',
                                color: 'text-purple-500',
                                bg: 'bg-purple-50',
                                isNew: true
                            });
                        }
                    }

                    // Subscription notifications
                    if (profile.plan === 'free') {
                        notifs.push({
                            id: `sys_upgrade_free_${targetUserId}`,
                            type: 'system',
                            title: t('t_c557cf36'),
                            message: t('t_5dda457b'),
                            time: now.getTime(),
                            link: '/upgrade',
                            icon: 'rocket_launch',
                            color: 'text-blue-500',
                            bg: 'bg-blue-50',
                            isNew: true
                        });
                    }
                    
                    if (profile.plan_expires_at) {
                        const endDate = new Date(profile.plan_expires_at);
                        const diffDays = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                        
                        // Expired
                        if (diffDays < 0) {
                            notifs.push({
                                id: `sys_sub_expired_${targetUserId}`,
                                type: 'system',
                                title: t('t_c242ea1e'),
                                message: t('t_e2c17eeb'),
                                time: now.getTime(),
                                link: '/upgrade',
                                icon: 'error',
                                color: 'text-red-500',
                                bg: 'bg-red-50',
                                isNew: true
                            });
                        } 
                        // Ending soon (7 days or less)
                        else if (diffDays <= 7) {
                            notifs.push({
                                id: `sys_sub_ending_${targetUserId}`,
                                type: 'system',
                                title: t('t_4b404be0'),
                                message: `تنتهي خطتك بعد ${diffDays} يوم/أيام. يرجى التجديد قريباً.`,
                                time: now.getTime(),
                                link: '/upgrade',
                                icon: 'history',
                                color: 'text-amber-500',
                                bg: 'bg-amber-50',
                                isNew: true
                            });
                        }
                    }
                }

                if (storeDomain) {
                    // Fetch recent pending orders for this specific store
                    const { data: latestOrders } = await insforge.database
                        .from('orders')
                        .select('id, product_name, total_price, created_at, customer_name, status')
                        .eq('store_domain', storeDomain)
                        .eq('status', 'pending')
                        .order('created_at', { ascending: false })
                        .limit(5);

                    if (latestOrders && latestOrders.length > 0) {
                        latestOrders.forEach((order: any) => {
                            notifs.push({
                                id: `order_${order.id}`,
                                type: 'order',
                                title: t('t_90f7de0d'),
                                message: `طلب جديد من ${order.customer_name || t('t_2ec7566')} بقيمة ${order.total_price} د.ج`,
                                time: new Date(order.created_at).getTime(),
                                link: `/orders/${order.id}`,
                                icon: 'shopping_bag',
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-50',
                                isNew: true
                            });
                        });
                    }

                    // Fetch recent abandoned forms for this specific store
                    const { data: latestAbandoned } = await insforge.database
                        .from('abandoned_forms')
                        .select('id, product_name, customer_name, customer_phone, created_at')
                        .eq('store_domain', storeDomain)
                        .eq('status', 'pending')
                        .order('created_at', { ascending: false })
                        .limit(5);

                    if (latestAbandoned && latestAbandoned.length > 0) {
                        latestAbandoned.forEach((form: any) => {
                            notifs.push({
                                id: `abandoned_${form.id}`,
                                type: 'abandoned',
                                title: t('t_4d921b9d'),
                                message: `قام ${form.customer_name || form.customer_phone || 'عميل'} بترك سلة التسوق الخاصة به`,
                                time: new Date(form.created_at).getTime(),
                                link: `/abandoned-carts`,
                                icon: 'remove_shopping_cart',
                                color: 'text-amber-500',
                                bg: 'bg-amber-50',
                                isNew: true
                            });
                        });
                    }

                    // Fetch low stock products for this specific store
                    const { data: lowStock } = await insforge.database
                        .from('products')
                        .select('id, name, stock_quantity')
                        .eq('store_domain', storeDomain)
                        .lte('stock_quantity', 5)
                        .limit(5);

                    if (lowStock && lowStock.length > 0) {
                        lowStock.forEach((product: any) => {
                            notifs.push({
                                id: `stock_${product.id}`,
                                type: 'stock',
                                title: t('t_98457ea9'),
                                message: `المنتج "${product.name}" على وشك النفاد (${product.stock_quantity} متبقي)`,
                                time: new Date().getTime(),
                                link: `/inventory/${product.id}`,
                                icon: 'warning',
                                color: 'text-amber-500',
                                bg: 'bg-amber-50',
                                isNew: true
                            });
                        });
                    }
                }

                if (!isMounted) return;

                // Sort by time descending
                notifs.sort((a, b) => b.time - a.time);

                setNotifications(notifs);
                setUnreadCount(notifs.length);
            } catch (err) {
                console.error('Error fetching notifications:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchNotifications();

        return () => {
            isMounted = false;
        };
    }, []);

    const markAllAsRead = () => {
        setUnreadCount(0);
    };

    const handleNotificationClick = (link: string) => {
        setIsOpen(false);
        router.push(link);
    };

    const formatTimeAgo = (timeMs: number) => {
        const diff = Date.now() - timeMs;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return t('t_2e43e21');
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        const days = Math.floor(hours / 24);
        return `منذ ${days} يوم`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center w-12 h-12 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-[#111827] dark:hover:text-white shadow-sm  transition-all hover:shadow-md"
            >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-red-500/30 animate-in fade-in zoom-in duration-300">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 md:left-auto md:right-0 w-[320px] md:w-[380px] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200" dir="rtl">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
                        <h3 className="text-[16px] font-black text-[#111827] dark:text-white">{t('t_10af21e1a')}</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[12px] font-bold text-primary hover:underline">
                                
                                {t('t_d1f9cabd')}
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 flex justify-center items-center">
                                <span className="material-symbols-outlined animate-spin text-gray-300 dark:text-gray-600 dark:text-gray-400 text-3xl">refresh</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined text-[24px]">notifications_paused</span>
                                </div>
                                <p className="text-[14px] font-bold text-[#111827] dark:text-white">{t('t_8d69ed71')}</p>
                                <p className="text-[12px] text-gray-500 dark:text-gray-400">{t('t_e348d724')}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((notif, index) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif.link)}
                                        className={`flex items-start gap-3 p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors border-b border-gray-50 dark:border-zinc-800/30 last:border-0 ${notif.isNew && unreadCount > 0 ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.bg} dark:bg-opacity-10 dark:bg-gray-800`}>
                                            <span className={`material-symbols-outlined text-[20px] ${notif.color}`}>{notif.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className={`text-[13px] font-bold ${notif.isNew && unreadCount > 0 ? 'text-[#111827] dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {notif.title}
                                                </span>
                                                <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                                                    {formatTimeAgo(notif.time)}
                                                </span>
                                            </div>
                                            <p className={`text-[12px] leading-relaxed truncate ${notif.isNew && unreadCount > 0 ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
