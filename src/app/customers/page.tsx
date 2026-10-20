'use client';
import { useEffect, useState } from 'react';
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

export default function CustomersPage() {
    const { t, lang } = useI18n();
    const { planExpired, currentPlan } = useExpiredPlanGuard();
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        newThisMonth: 0,
        returnRate: '24%',
        avgLifetimeValue: 0
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchCustomers() {
            try {
                const ctx = await getStoreContext();
                if (!ctx) {
                    router.push('/login');
                    return;
                }

                if (!ctx.storeDomain) {
                    setLoading(false);
                    return;
                }

                const { data: orders, error } = await insforge.database
                    .from('orders')
                    .select('*')
                    .eq('store_domain', ctx.storeDomain)
                    .order('created_at', { ascending: false });

                if (!error && orders) {
                    const customerMap = new Map();
                    let newThisMonthCount = 0;
                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth();
                    const currentYear = currentDate.getFullYear();

                    orders.forEach((order: any) => {
                        const phone = order.customer_phone || 'unknown';
                        const existing = customerMap.get(phone);
                        const orderDate = new Date(order.created_at);

                        if (existing) {
                            existing.total_orders += 1;
                            existing.total_spent += Number(order.total_price) || 0;
                            if (new Date(order.created_at) > new Date(existing.last_order)) {
                                existing.last_order = order.created_at;
                            }
                        } else {
                            const isNewThisMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                            if (isNewThisMonth) {
                                newThisMonthCount++;
                            }
                            customerMap.set(phone, {
                                phone: phone,
                                name: order.customer_name || t('t_5b3fef9c'),
                                email: `${phone.replace(/\D/g, '').substring(0, 6)}@example.com`,
                                total_orders: 1,
                                total_spent: Number(order.total_price) || 0,
                                last_order: order.created_at,
                                status: orderDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? t('t_185349') : t('t_744daf8a'),
                                isNew: isNewThisMonth
                            });
                        }
                    });

                    const customersList = Array.from(customerMap.values()).sort((a, b) => new Date(b.last_order).getTime() - new Date(a.last_order).getTime());

                    const totalRevenue = customersList.reduce((sum, c) => sum + c.total_spent, 0);
                    const avgLtv = customersList.length > 0 ? totalRevenue / customersList.length : 0;

                    setCustomers(customersList);
                    setStats({
                        total: customersList.length,
                        newThisMonth: newThisMonthCount,
                        returnRate: '2%',
                        avgLifetimeValue: Math.round(avgLtv)
                    });
                }
            } catch (err) {
                console.error("Failed to fetch customers", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCustomers();
    }, [router]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const StatusBadge = ({ status, isNew }: { status: string, isNew?: boolean }) => {
        if (isNew) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>  {t('t_2e639e8')}
                </span>
            );
        }
        if (status === t('t_185349')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>  {t('t_185349')}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>  {t('t_744daf8a')}
            </span>
        );
    };

    const avatarColors = [
        'bg-indigo-50 text-indigo-600',
        'bg-pink-50 text-pink-600',
        'bg-amber-50 text-amber-600',
        'bg-emerald-50 text-emerald-600',
        'bg-teal-50 text-teal-600',
        'bg-purple-50 text-purple-600',
    ];

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Customers" />
                <main className="flex-1 flex flex-col items-center justify-center pt-16 md:pt-0">
                    <SOUQAILoader size="lg" text={t('t_1b687461b')} />
                </main>
            </div>
        );
    }

    return (
        <>
        {planExpired && (
            <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
        )}
        <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar activePage="Customers" />

            <main className="flex-1 overflow-y-auto h-screen relative custom-scrollbar pt-16 md:pt-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-[28px] font-black text-[#111827] dark:text-white mb-1 tracking-tight">{t('t_7a3d0d0a')}</h1>
                            <p className="text-[#6B7280] dark:text-gray-400 font-medium text-[15px]">{t('t_2cc74bed')}</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <StoreLinkButton />
                            <NotificationsDropdown />
                            <button className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-[#E91E63] hover:bg-[#C2185B] text-white transition-all shadow-lg shadow-[#E91E63]/30 font-bold text-[15px]">
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                                <span>{t('t_a1c509d8')}</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-between h-40 transition-transform hover:-translate-y-1 duration-300">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                    <span className="material-symbols-outlined text-[24px]">group</span>
                                </div>
                                <div className="bg-[#dcfce7] dark:bg-[#dcfce7]/10 text-[#166534] dark:text-[#4ade80] text-xs font-bold px-3 py-1.5 rounded-xl">+12%</div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black text-[#111827] dark:text-white">{stats.total.toLocaleString('ar-DZ')}</h3>
                                <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mt-1">{t('t_140dbfcdc')}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-between h-40 transition-transform hover:-translate-y-1 duration-300">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-[#fcebf8] dark:bg-[#E91E63]/10 flex items-center justify-center text-[#E91E63]">
                                    <span className="material-symbols-outlined text-[24px]">person_add</span>
                                </div>
                                <div className={stats.newThisMonth > 0 ? "bg-[#dcfce7] dark:bg-[#dcfce7]/10 text-[#166534] dark:text-[#4ade80] text-xs font-bold px-3 py-1.5 rounded-xl" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl"}>
                                    {stats.newThisMonth > 0 ? '+' : ''}{stats.newThisMonth}
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black text-[#111827] dark:text-white">{stats.newThisMonth > 0 ? '+' : ''}{stats.newThisMonth}</h3>
                                <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mt-1">{t('t_cd0079')}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-between h-40 transition-transform hover:-translate-y-1 duration-300">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                                    <span className="material-symbols-outlined text-[24px]">restart_alt</span>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl">-</div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black text-[#111827] dark:text-white">{stats.returnRate}</h3>
                                <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mt-1">{t('t_35ff9682')}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-between h-40 transition-transform hover:-translate-y-1 duration-300">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                                    <span className="material-symbols-outlined text-[24px]">payments</span>
                                </div>
                                <div className="bg-[#dcfce7] dark:bg-[#dcfce7]/10 text-[#166534] dark:text-[#4ade80] text-xs font-bold px-3 py-1.5 rounded-xl">+8%</div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black text-[#111827] dark:text-white">{stats.avgLifetimeValue.toLocaleString('ar-DZ')} <span className="text-sm">{t('t_17422d')}</span></h3>
                                <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mt-1">{t('t_ce6e2ad7')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col min-h-[400px]">
                        <div className="p-6 md:p-8 pb-6 border-b border-gray-50 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-[400px]">
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#6B7280] dark:text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                </div>
                                <input
                                    className="w-full pr-12 pl-4 h-12 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-[15px] font-medium focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63] dark:text-white placeholder:text-gray-400 transition-all"
                                    placeholder={t('t_9a8ee4d8')}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 h-12 rounded-2xl border border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 text-[14px] font-bold transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    {t('t_59c775f5')}
                                </button>
                                <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 h-12 rounded-2xl border border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 text-[14px] font-bold transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    {t('t_59c7326b')}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1 p-2">
                            <table className="w-full text-right border-separate border-spacing-y-2 px-6">
                                <thead>
                                    <tr className="text-[#6B7280] dark:text-gray-400 text-[14px] font-bold">
                                        <th className="py-4 px-4 rounded-r-2xl font-bold w-[25%]" scope="col">{t('t_25278c1d')}</th>
                                        <th className="py-4 px-4 font-bold" scope="col">{t('t_11f05e453')}</th>
                                        <th className="py-4 px-4 font-bold text-center" scope="col">{t('t_8018e821')}</th>
                                        <th className="py-4 px-4 font-bold text-center" scope="col">{t('t_9cf81b14')}</th>
                                        <th className="py-4 px-4 font-bold text-center" scope="col">{t('t_4ef039a0')}</th>
                                        <th className="py-4 px-4 font-bold text-center" scope="col">{t('t_252d7204')}</th>
                                        <th className="py-4 px-4 rounded-l-2xl font-bold text-center" scope="col">{t('t_597ca8c4')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-[#6B7280] dark:text-gray-400 font-bold text-[14px]">
                                                {t('t_e454a3b3')}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map((customer, index) => {
                                            const initial = customer.name.charAt(0) || t('t_645');
                                            const colorClass = avatarColors[index % avatarColors.length];

                                            return (
                                                <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer">
                                                    <td className="py-4 px-4 rounded-r-2xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <div className={`h-10 w-10 rounded-xl ${colorClass} flex items-center justify-center font-bold text-[16px]`}>
                                                                    <span>{initial}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="text-[14px] font-bold text-[#111827] dark:text-white line-clamp-1">{customer.name}</div>
                                                                <div className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400 dir-ltr text-right mt-0.5">{customer.phone}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-[14px] text-[#6B7280] dark:text-gray-400 font-bold">{customer.email}</td>
                                                    <td className="py-4 px-4 text-center text-[15px] text-[#111827] dark:text-white font-black">{customer.total_orders}</td>
                                                    <td className="py-4 px-4 text-center text-[15px] font-black text-[#111827] dark:text-white">
                                                        {customer.total_spent.toLocaleString('ar-DZ')} <span className="text-xs text-[#6B7280] dark:text-gray-400">{t('t_17422d')}</span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center text-[14px] text-[#6B7280] dark:text-gray-400 font-bold">{formatDate(customer.last_order)}</td>
                                                    <td className="py-4 px-4 text-center"><StatusBadge status={customer.status} isNew={customer.isNew} /></td>
                                                    <td className="py-4 px-4 rounded-l-2xl text-center">
                                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors" title={t('t_8091154a')}>
                                                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                                            </a>
                                                            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#E91E63]/10 hover:text-[#E91E63] text-gray-400 transition-colors" title={t('t_18e990d7')}>
                                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
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

                        <div className="p-6 border-t border-gray-50 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                            <span className="text-[14px] text-[#6B7280] dark:text-gray-400 font-bold">
                                {t('t_18221e')} {filteredCustomers.length > 0 ? 1 : 0}  {t('t_17d96a')} {filteredCustomers.length}  {t('t_c8a1')} {stats.total}  {t('t_2ec7566')}
                            </span>
                            <div className="flex gap-1" dir="ltr">
                                <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 text-[#6B7280] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors" disabled>
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#E91E63] text-white text-[14px] font-bold shadow-md shadow-[#E91E63]/30">1</button>
                                <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 text-[#6B7280] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors" disabled>
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
}
