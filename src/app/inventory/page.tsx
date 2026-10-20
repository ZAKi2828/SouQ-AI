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

export default function InventoryManagement() {
    const { t, lang } = useI18n();
    const router = useRouter();
    const { planExpired, currentPlan } = useExpiredPlanGuard();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('viewer');

    useEffect(() => {
        async function loadProducts() {
            try {
                const ctx = await getStoreContext();
                if (!ctx || !ctx.targetUserId) {
                    setLoading(false);
                    return;
                }
                setUserRole(ctx.role);

                const { data, error } = await insforge.database
                    .from('products')
                    .select('*')
                    .eq('user_id', ctx.targetUserId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setProducts(data);
                }
            } catch (err) {
                console.error('Failed to load products:', err);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    return (
        <>
            {planExpired && (
                <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
            )}
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Inventory" />

                <main className="flex-1 overflow-y-auto h-screen relative custom-scrollbar pt-16 md:pt-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-8">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-[28px] font-black text-[#111827] dark:text-white mb-1 tracking-tight">{t('t_fc94e1df')}</h1>
                                <p className="text-[#6B7280] dark:text-gray-400 font-medium text-[15px]">{t('t_1347d9999')}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <StoreLinkButton />
                                <NotificationsDropdown />
                                <div className="relative hidden md:block">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-gray-400 material-symbols-outlined text-[20px]">search</span>
                                    <input className="pr-11 pl-4 h-12 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl text-[15px] focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63] w-80 shadow-sm dark:text-white placeholder:text-gray-400 transition-all font-medium" placeholder={t('t_49109e4')} type="text" />
                                </div>
                                {hasPermission(userRole, 'manage_inventory') && (
                                    <Link href="/inventory/add" className="flex items-center gap-2 px-6 h-12 bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-2xl shadow-lg shadow-[#E91E63]/30 transition-all font-bold text-[15px]">
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                        
                                        {t('t_a1bf959b')}
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="md:hidden relative">
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-gray-400 material-symbols-outlined text-[20px]">search</span>
                            <input className="pr-11 pl-4 h-12 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full shadow-sm  text-[15px] dark:text-white font-medium focus:ring-2 focus:ring-[#E91E63]/20" placeholder={t('t_24d4cd18')} type="text" />
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center h-44 transition-transform hover:-translate-y-1 duration-300">
                                <div className="flex justify-between items-start w-full mb-4">
                                    <div className="bg-[#e0f2fe] dark:bg-[#e0f2fe]/10 w-12 h-12 flex items-center justify-center rounded-2xl text-[#0284c7]">
                                        <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                                    </div>
                                    <div className="bg-[#dcfce7] dark:bg-[#dcfce7]/10 text-[#166534] dark:text-[#4ade80] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#bbf7d0]/50 dark:border-transparent">
                                        +12%
                                    </div>
                                </div>
                                <div className="w-full text-center mt-2">
                                    <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mb-1">{t('t_139d8e854')}</p>
                                    <h3 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">{loading ? '...' : products.length}</h3>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center h-44 transition-transform hover:-translate-y-1 duration-300">
                                <div className="flex justify-between items-start w-full mb-4">
                                    <div className="bg-[#ffedd5] dark:bg-[#ffedd5]/10 w-12 h-12 flex items-center justify-center rounded-2xl text-[#ea580c]">
                                        <span className="material-symbols-outlined text-[24px]">warning</span>
                                    </div>
                                    <div className="bg-[#ffedd5] dark:bg-[#ffedd5]/10 text-[#c2410c] dark:text-[#fb923c] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#fed7aa]/50 dark:border-transparent">
                                        
                                        {t('t_59ced289')}
                                    </div>
                                </div>
                                <div className="w-full text-center mt-2">
                                    <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mb-1">{t('t_8f745981')}</p>
                                    <h3 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">
                                        {loading ? '...' : products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length}
                                    </h3>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center h-44 transition-transform hover:-translate-y-1 duration-300">
                                <div className="flex justify-between items-start w-full mb-4">
                                    <div className="bg-[#fee2e2] dark:bg-[#fee2e2]/10 w-12 h-12 flex items-center justify-center rounded-2xl text-[#dc2626]">
                                        <span className="material-symbols-outlined text-[24px]">remove_shopping_cart</span>
                                    </div>
                                    <div className="bg-[#fee2e2] dark:bg-[#fee2e2]/10 text-[#b91c1c] dark:text-[#f87171] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#fecaca]/50 dark:border-transparent">
                                        
                                        {t('t_17f508')}
                                    </div>
                                </div>
                                <div className="w-full text-center mt-2">
                                    <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mb-1">{t('t_514f5193')}</p>
                                    <h3 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">
                                        {loading ? '...' : products.filter(p => !p.stock_quantity || p.stock_quantity <= 0).length}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col">
                            <div className="p-8 pb-6 flex items-center justify-between border-b border-gray-50 dark:border-zinc-800">
                                <h2 className="text-xl font-black text-[#111827] dark:text-white">{t('t_19e150fde')}</h2>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[14px] font-bold">
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                        
                                        {t('t_59c775f5')}
                                    </button>
                                    <button className="flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[14px] font-bold">
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        
                                        {t('t_59c7326b')}
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto flex-1 p-2">
                                <table className="w-full text-right border-separate border-spacing-y-2 px-6">
                                    <thead>
                                        <tr className="text-[#6B7280] dark:text-gray-400 text-[14px] font-bold">
                                            <th className="font-bold py-4 px-4 w-[30%] rounded-r-2xl">{t('t_252217e0')}</th>
                                            <th className="font-bold py-4 px-4 text-center">{t('t_59a3fca7')}</th>
                                            <th className="font-bold py-4 px-4 text-center">{t('t_59a3ca6e')}</th>
                                            <th className="font-bold py-4 px-4 text-center w-[15%]">{t('t_80d45aaa')}</th>
                                            <th className="font-bold py-4 px-4 text-center">{t('t_a124356f')}</th>
                                            <th className="font-bold py-4 px-4 rounded-l-2xl text-left">{t('t_252d7204')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center">
                                                    <SOUQAILoader size="sm" text={t('t_b79569a5')} />
                                                </td>
                                            </tr>
                                        ) : products.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-[#6B7280] dark:text-gray-400 font-bold">
                                                    
                                                    {t('t_b86f9e61')} <Link href="/inventory/add" className="text-[#E91E63] hover:underline">{t('t_bca8dc30')}</Link>
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product) => {
                                                const stockQty = product.stock_quantity || 0;
                                                const stockPrc = Math.min(100, Math.max(0, (stockQty / 100) * 100));
                                                let stockColor = 'bg-[#16a34a]'; // green
                                                if (stockQty <= 0) stockColor = 'bg-[#dc2626]'; // red
                                                else if (stockQty <= 10) stockColor = 'bg-[#f59e0b]'; // orange

                                                return (
                                                    <tr key={product.id} onClick={(e) => {
                                                        const target = e.target as HTMLElement;
                                                        if (target.closest('button') || target.closest('a')) return;
                                                        try { router.push(`/inventory/${product.id}`) } catch (err) { }
                                                    }} className="group transition-colors cursor-pointer">
                                                        <td className="py-4 px-4 rounded-r-2xl group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-[52px] h-[52px] rounded-xl bg-gray-100 border border-gray-200 dark:border-zinc-800/60 dark:border-zinc-800 flex-shrink-0 overflow-hidden">
                                                                    {product.image_url ? (
                                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <Link href={`/inventory/${product.id}`} className="font-bold text-[#111827] dark:text-white text-[15px] max-w-[150px] leading-tight hover:text-[#E91E63] truncate transition-colors">
                                                                        {product.name}
                                                                    </Link>
                                                                    <p className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400 mt-0.5" dir="ltr">SKU: {product.product_slug}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors text-center">
                                                            <span className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px]">
                                                                {{
                                                                    tech: t('t_7a580c24'),
                                                                    fashion: t('t_596391d5'),
                                                                    perfume: t('t_2ec4087'),
                                                                    food: t('t_8490be1c'),
                                                                    skincare: t('t_536d3f1e'),
                                                                    digital: t('t_5a301253'),
                                                                    decor: t('t_5a177e91')
                                                                }[product.template as string] || t('t_ea9847b9')}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors text-center">
                                                            <p className="font-black text-[#111827] dark:text-white text-[15px]">{product.price?.toLocaleString()} <span className="text-xs text-[#6B7280] dark:text-gray-400">{t('t_17422d')}</span></p>
                                                        </td>
                                                        <td className="py-4 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors">
                                                            <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                                                                <div className="w-full max-w-[100px] h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                                                    <div className={`h-full rounded-full ${stockColor}`} style={{ width: `${stockPrc}%` }}></div>
                                                                </div>
                                                                <span className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400">{stockQty}  {t('t_2f2e97f')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => router.push(`/inventory/${product.id}`)}
                                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700 transition-colors border border-gray-200 dark:border-zinc-700"
                                                                    title={t("t_6caa9fbc")}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const isLocal = window.location.hostname.includes('localhost');
                                                                        const link = isLocal
                                                                            ? `http://${product.store_domain}.localhost:3000/${product.product_slug}`
                                                                            : `https://${product.store_domain}.souqai.net/${product.product_slug}`;
                                                                        window.open(link, '_blank');
                                                                    }}
                                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                                                                    title={t('t_23e21b86')}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const isLocal = window.location.hostname.includes('localhost');
                                                                        const link = isLocal
                                                                            ? `http://${product.store_domain}.localhost:3000/${product.product_slug}`
                                                                            : `https://${product.store_domain}.souqai.net/${product.product_slug}`;
                                                                        navigator.clipboard.writeText(link);
                                                                        alert(t('t_101a7b4f6'));
                                                                    }}
                                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#E91E63]/10 text-[#E91E63] hover:bg-[#E91E63]/20 transition-colors border border-[#E91E63]/20"
                                                                    title={t('t_92876b84')}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 rounded-l-2xl group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors text-left">
                                                            <div className="inline-flex items-center gap-2 justify-end text-[14px]">
                                                                <span className={`font-bold ${product.status === 'active' ? 'text-[#166534] dark:text-[#4ade80]' : 'text-[#9ca3af]'}`}>
                                                                    {product.status === 'active' ? t('t_185349') : (product.status === 'draft' ? t('t_5b431ed4') : t('t_5962cf3d'))}
                                                                </span>
                                                                <div className={`w-2.5 h-2.5 rounded-full ${product.status === 'active' ? 'bg-[#22c55e]' : 'bg-[#d1d5db] dark:bg-[#6b7280]'}`}></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 border-t border-gray-50 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                                <span className="text-[14px] text-[#6B7280] dark:text-gray-400 font-bold">{t('t_18221e')} {products.length > 0 ? 1 : 0}-{products.length}  {t('t_c8a1')} {products.length}  {t('t_2f1e9a3')}</span>
                                <div className="flex gap-1" dir="ltr">
                                    <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 text-[#6B7280] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#E91E63] text-white text-[14px] font-bold shadow-md shadow-[#E91E63]/30">1</button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 text-[#111827] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 text-[14px] font-bold transition-colors">2</button>
                                    <span className="w-9 h-9 flex items-center justify-center text-[#6B7280] dark:text-gray-400 text-[14px] font-bold">...</span>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-800 text-[#6B7280] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
