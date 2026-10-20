'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import Link from 'next/link';
import { Toast, ConfirmModal } from '@/components/UIFeedback';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';
import { hasPermission } from '@/lib/rbac';

export default function ProductDetailPage() {
    const { t, lang } = useI18n();
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string;

    const WILAYA_MAP: Record<string, string> = {
        '01': t('t_5961d6ef'), '02': t('t_59a3cf94'), '03': t('t_7efafe84'), '04': t('t_d4d5e8ec'), '05': t('t_59a492ee'),
        '06': t('t_59a6ce02'), '07': t('t_59aa62b0'), '08': t('t_2e476f6'), '09': t('t_7f46082b'), '10': t('t_7f47d9e5'),
        '13': t('t_2003d599'), '16': t('t_7f75b30f'), '19': t('t_2e9869b'), '23': t('t_5aa22b1b'), '25': t('t_7d33f75'),
        '31': t('t_5b762591'), '35': t('t_4370b9d1'), '42': t('t_1fbca32a'), '48': t('t_4b4098f')
    };

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState<{ visible: boolean; message: string; subMessage?: string; type: 'success' | 'error' | 'warning' | 'info' }>({ visible: false, message: '', type: 'success' });
    const [userRole, setUserRole] = useState<string>('viewer');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', subMessage?: string) => setToast({ visible: true, message, subMessage, type });
    const hideToast = () => setToast(tl => ({ ...tl, visible: false }));

    useEffect(() => {
        async function fetchProduct() {
            try {
                const ctx = await getStoreContext();
                if (!ctx) {
                    router.push('/login');
                    return;
                }
                setUserRole(ctx.role);

                const { data, error } = await insforge.database
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single();

                if (error || !data) {
                    router.push('/inventory');
                    return;
                }

                setProduct(data);

                // Fetch orders for this product
                const { data: orderData } = await insforge.database
                    .from('orders')
                    .select('*')
                    .eq('product_id', productId) // Use product_id filter specifically for this product
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (orderData) setOrders(orderData);

            } catch (err) {
                console.error('Failed to load product:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [productId, router]);

    const handleDelete = async () => {
        if (!hasPermission(userRole, 'manage_inventory')) { alert('ليس لديك صلاحية لحذف المنتجات'); return; }
        setShowDeleteConfirm(false);
        setDeleting(true);
        try {
            await insforge.database.from('products').delete().eq('id', productId);
            showToast(t('t_f7e1763b'), 'success');
            setTimeout(() => router.push('/inventory'), 1500);
        } catch (err) {
            showToast(t('t_cb0b80b9'), 'error');
        } finally {
            setDeleting(false);
        }
    };

    const handleCopyLink = () => {
        const isLocal = window.location.hostname.includes('localhost');
        const link = isLocal
            ? `http://${product.store_domain}.localhost:3000/${product.product_slug}`
            : `https://${product.store_domain}.souqai.net/${product.product_slug}`;
        navigator.clipboard.writeText(link);
        showToast(t('t_10a4de419'), 'success', link);
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') return { label: t('t_185349'), bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
        if (status === 'draft') return { label: t('t_5b431ed4'), bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
        return { label: t('t_5962cf3d'), bg: 'bg-gray-100', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' };
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Intl.DateTimeFormat('ar-DZ', { day: 'numeric', month: 'short' }).format(new Date(dateStr));
    };

    const getOrderStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return { label: t('t_5b49f6eb'), bg: 'bg-emerald-50', text: 'text-emerald-600' };
            case 'shipping': return { label: t('t_26b76c91'), bg: 'bg-blue-50', text: 'text-blue-600' };
            case 'pending': return { label: t('t_bf09a1dc'), bg: 'bg-amber-50', text: 'text-amber-600' };
            case 'cancelled': return { label: t('t_2f1e42e'), bg: 'bg-red-50', text: 'text-red-600' };
            default: return { label: t('t_bf09a1dc'), bg: 'bg-amber-50', text: 'text-amber-600' };
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Inventory" />
                <main className="flex-1 flex items-center justify-center pt-16 md:pt-0">
                    <SOUQAILoader size="md" text={t('t_c89b29e2')} />
                </main>
            </div>
        );
    }

    if (!product) return null;

    const statusBadge = getStatusBadge(product.status);
    const discount = product.compare_at_price
        ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
        : 0;
    const profit = product.price - (product.cost_price || 0);
    const productImages = product.images && Array.isArray(product.images) ? product.images : [];
    const stockPercentage = Math.min(100, ((product.stock_quantity || 0) / 100) * 100);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_price) || 0), 0);

    // Mock visits data for chart (real analytics would come from a tracking service)
    const visitData = [85, 120, 95, 210, 180, 290, 265];
    const visitDays = [t('t_59a3c858'), t('t_59a38ce8'), t('t_7f2c87c1'), t('t_91766b0c'), t('t_a02845aa'), t('t_252c8c43'), t('t_252d771a')];
    const maxVisit = Math.max(...visitData);

    return (
        <>
            <Toast
                visible={toast.visible}
                message={toast.message}
                subMessage={toast.subMessage}
                type={toast.type}
                onClose={hideToast}
            />
            <ConfirmModal
                visible={showDeleteConfirm}
                title={t('t_d0229e7e')}
                message={t('t_2d3d73a30')}
                confirmLabel={t('t_3719b64c')}
                cancelLabel={t('t_5987b375')}
                dangerous={true}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Inventory" />

                <main className="flex-1 overflow-y-auto h-screen custom-scrollbar pt-16 md:pt-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 space-y-6">

                        {/* ═══════════════ HEADER ═══════════════ */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                            <div>
                                <div className="flex items-center gap-2 text-[13px] text-[#6B7280] dark:text-gray-400 font-medium mb-2">
                                    <Link href="/inventory" className="hover:text-[#E91E63] transition-colors">{t('t_64fadafd')}</Link>
                                    <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                                    <span className="text-[#E91E63] font-bold">{t('t_7568c6e1')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-[26px] font-black text-[#111827] dark:text-white tracking-tight">{product.name}</h1>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                                        {statusBadge.label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-all">
                                    <span className="material-symbols-outlined text-[18px] text-[#6B7280] dark:text-gray-400">link</span>
                                    
                                    {t('t_1216da01')}
                                </button>
                                <button onClick={() => router.push(`/inventory/add?edit=${productId}`)} className="flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-all">
                                    <span className="material-symbols-outlined text-[18px] text-[#6B7280] dark:text-gray-400">edit</span>
                                    
                                    {t('t_4f28bf06')}
                                </button>
                                <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting} className="flex items-center gap-2 px-4 h-10 rounded-xl border border-red-200 bg-white dark:bg-zinc-900 text-red-600 text-[13px] font-bold hover:bg-red-50 transition-all">
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    
                                    {t('t_17f4fe')}
                                </button>
                                <button onClick={() => {
                                    const isLocal = window.location.hostname.includes('localhost');
                                    const link = isLocal
                                        ? `http://${product.store_domain}.localhost:3000/${product.product_slug}`
                                        : `https://${product.store_domain}.souqai.net/${product.product_slug}`;
                                    window.open(link, '_blank');
                                }} className="flex items-center gap-2 px-5 h-10 rounded-xl bg-[#E91E63] text-white text-[13px] font-bold hover:bg-[#C2185B] transition-all shadow-lg shadow-[#E91E63]/25">
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    
                                    {t('t_23dac32b')}
                                </button>
                            </div>
                        </div>

                        {/* ═══════════════ STATS CARDS ═══════════════ */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <span className="material-symbols-outlined text-[22px]">visibility</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">+12%↗</span>
                                </div>
                                <h3 className="text-[28px] font-black text-[#111827] dark:text-white">1,247</h3>
                                <p className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400 mt-0.5">{t('t_119a3e833')}</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 rounded-xl bg-[#fcebf8] flex items-center justify-center text-[#E91E63]">
                                        <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">+8%↗</span>
                                </div>
                                <h3 className="text-[28px] font-black text-[#111827] dark:text-white">{totalOrders}</h3>
                                <p className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400 mt-0.5">{t('t_140f90950')}</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                        <span className="material-symbols-outlined text-[22px]">percent</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">-0.4%↘</span>
                                </div>
                                <h3 className="text-[28px] font-black text-[#111827] dark:text-white">2.7%</h3>
                                <p className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400 mt-0.5">{t('t_35ba8515')}</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                        <span className="material-symbols-outlined text-[22px]">payments</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">+24%↗</span>
                                </div>
                                <h3 className="text-[28px] font-black text-[#111827] dark:text-white">{totalRevenue.toLocaleString()}</h3>
                                <p className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400 mt-0.5">{t('t_944f60f7')} <span className="text-[11px]">DZD</span></p>
                            </div>
                        </div>

                        {/* ═══════════════ MAIN CONTENT (2 COLUMNS) ═══════════════ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* ──── RIGHT COLUMN (Main - 8 cols) ──── */}
                            <div className="lg:col-span-8 flex flex-col gap-6">

                                {/* Product Info Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6">
                                    <h3 className="text-[16px] font-black text-[#111827] dark:text-white mb-5">{t('t_2d8944b9')}</h3>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-full md:w-[220px] h-[220px] rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img
                                                src={product.image_url || 'https://placehold.co/400x400'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <h2 className="text-[22px] font-black text-[#111827] dark:text-white">{product.name}</h2>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-[12px] text-[#6B7280] dark:text-gray-400 font-bold block mb-1">{t('t_1ca245d34')}</span>
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900/50 rounded-lg px-3 py-2 border border-gray-100 dark:border-zinc-800/30">
                                                        <span className="text-[13px] font-bold text-[#111827] dark:text-white dir-ltr text-right truncate">{product.product_slug}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[12px] text-[#6B7280] dark:text-gray-400 font-bold block mb-1">{t('t_7f5b59f5')}</span>
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900/50 rounded-lg px-3 py-2 border border-gray-100 dark:border-zinc-800/30">
                                                        <span className="text-[13px] font-bold text-[#111827] dark:text-white">{product.category || t('t_7a580c24')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[12px] text-[#6B7280] dark:text-gray-400 font-bold block mb-1">{t('t_17d14e80')}</span>
                                                <p className="text-[13px] text-[#6B7280] dark:text-gray-400 leading-relaxed line-clamp-3">
                                                    {product.description || t('t_63bbec56')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Options Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6">
                                    <h3 className="text-[16px] font-black text-[#111827] dark:text-white mb-5">{t('t_57b68f3d')}</h3>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border-2 ${product.shipping_free ? 'border-[#E91E63]/30 bg-[#E91E63]/5' : 'border-gray-100 dark:border-zinc-800/30 bg-gray-50 dark:bg-zinc-900/50'}`}>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${product.shipping_free ? 'bg-[#E91E63]/10 text-[#E91E63]' : 'bg-gray-200 text-gray-400'}`}>
                                                <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                                            </div>
                                            <div>
                                                <h4 className="text-[14px] font-bold text-[#111827] dark:text-white">{t('t_10c3b95de')}</h4>
                                                <p className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400">
                                                    {product.shipping_free ? t('t_1bb33c57') : `${product.shipping_home_price || 0} DZD`}
                                                </p>
                                            </div>
                                            {product.shipping_free && (
                                                <span className="material-symbols-outlined text-[20px] text-[#E91E63] mr-auto">check_circle</span>
                                            )}
                                        </div>
                                        <div className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border-2 ${product.shipping_office_free ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100 dark:border-zinc-800/30 bg-gray-50 dark:bg-zinc-900/50'}`}>
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 dark:text-gray-400 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[24px]">apartment</span>
                                            </div>
                                            <div>
                                                <h4 className="text-[14px] font-bold text-[#111827] dark:text-white">{t('t_6a0ac124')}</h4>
                                                <p className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400">
                                                    {product.shipping_office_free ? t('t_217db6d41') : `DZD ${product.shipping_office_price || 400}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Gallery Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-[16px] font-black text-[#111827] dark:text-white">{t('t_8a5d4d66')}</h3>
                                        <button className="text-[13px] font-bold text-[#E91E63] hover:underline flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                            
                                            {t('t_b07574dc')}
                                        </button>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                        {productImages.length > 0 ? productImages.map((img: string, idx: number) => (
                                            <div key={idx} className="w-[100px] h-[100px] rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800/30 flex-shrink-0 group relative">
                                                <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-[20px]">zoom_in</span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="w-[100px] h-[100px] rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800/30 flex-shrink-0">
                                                <img src={product.image_url || 'https://placehold.co/200x200'} alt="main" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="w-[100px] h-[100px] rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex-shrink-0 flex items-center justify-center text-gray-400 hover:border-[#E91E63]/40 hover:text-[#E91E63] transition-colors cursor-pointer">
                                            <span className="material-symbols-outlined text-[28px]">photo_camera</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Visit Activity Chart Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-[16px] font-black text-[#111827] dark:text-white">{t('t_3b3b250c')}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#E91E63]"></span>
                                            <span className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_53dd57f5')}</span>
                                        </div>
                                    </div>
                                    {/* SVG Chart */}
                                    <div className="relative h-[200px] w-full">
                                        <svg viewBox="0 0 700 200" className="w-full h-full" preserveAspectRatio="none">
                                            {/* Y-axis grid lines */}
                                            {[0, 50, 100, 150, 200, 250, 300, 350].map((v, i) => (
                                                <line key={i} x1="0" y1={200 - (v / 350) * 180 - 10} x2="700" y2={200 - (v / 350) * 180 - 10} stroke="#f3f4f6" strokeWidth="1" />
                                            ))}
                                            {/* Area fill */}
                                            <path
                                                d={`M 50 ${200 - (visitData[0] / maxVisit) * 170 - 10} ${visitData.map((v, i) => `L ${50 + i * 100} ${200 - (v / maxVisit) * 170 - 10}`).join(' ')} L 650 200 L 50 200 Z`}
                                                fill="url(#chartGradient)"
                                                opacity="0.15"
                                            />
                                            {/* Line */}
                                            <path
                                                d={visitData.map((v, i) => `${i === 0 ? 'M' : 'L'} ${50 + i * 100} ${200 - (v / maxVisit) * 170 - 10}`).join(' ')}
                                                fill="none"
                                                stroke="#E91E63"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            {/* Dots */}
                                            {visitData.map((v, i) => (
                                                <circle key={i} cx={50 + i * 100} cy={200 - (v / maxVisit) * 170 - 10} r="5" fill="#E91E63" stroke="white" strokeWidth="2" />
                                            ))}
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#E91E63" />
                                                    <stop offset="100%" stopColor="#E91E63" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        {/* Y-axis labels */}
                                        <div className="absolute top-0 right-0 h-full flex flex-col justify-between text-[10px] font-bold text-[#6B7280] dark:text-gray-400 py-1 pointer-events-none">
                                            {[350, 300, 250, 200, 150, 100, 50, 0].map(v => (
                                                <span key={v}>{v}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {/* X-axis labels */}
                                    <div className="flex justify-between px-4 mt-2">
                                        {visitDays.map((day, i) => (
                                            <span key={i} className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400">{day}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ──── LEFT COLUMN (Sidebar - 4 cols) ──── */}
                            <div className="lg:col-span-4 flex flex-col gap-6">

                                {/* Pricing Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6">
                                    <h3 className="text-[16px] font-black text-[#111827] dark:text-white mb-5">{t('t_119dca9e9')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_a21fef65')}</span>
                                            <span className="text-[16px] font-black text-[#111827] dark:text-white">DZD {product.price?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_11f442319')}</span>
                                            <span className="text-[15px] font-bold text-[#6B7280] dark:text-gray-400 line-through">DZD {product.compare_at_price?.toLocaleString() || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_59a3b741')}</span>
                                            {discount > 0 ? (
                                                <span className="text-[13px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{t('t_185c58')} {discount}%</span>
                                            ) : (
                                                <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">—</span>
                                            )}
                                        </div>
                                        <div className="h-px bg-gray-100"></div>
                                        <div className="flex items-center justify-between bg-[#E91E63]/5 rounded-xl p-3">
                                            <span className="text-[14px] font-bold text-[#111827] dark:text-white">{t('t_84de4eb6')}</span>
                                            <span className="text-[16px] font-black text-[#E91E63]">DZD {Math.round(profit).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[16px] font-black text-[#111827] dark:text-white">{t('t_80d45aaa')}</h3>
                                        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-lg ${(product.stock_quantity || 0) > 20 ? 'bg-emerald-50 text-emerald-600' : (product.stock_quantity || 0) > 5 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                            {(product.stock_quantity || 0) > 20 ? t('t_5b3f09b3') : (product.stock_quantity || 0) > 5 ? t('t_5b4009ce') : t('t_190104a5')}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_dd720b8b')}</span>
                                            <span className="text-[15px] font-black text-[#111827] dark:text-white">{product.stock_quantity || 0} / 100</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${stockPercentage > 50 ? 'bg-emerald-500' : stockPercentage > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${stockPercentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_16cdb5ab0')}</p>
                                    </div>
                                </div>

                                {/* Template Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6">
                                    <h3 className="text-[16px] font-black text-[#111827] dark:text-white mb-4">{t('t_5a60b784')}</h3>
                                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800/30 relative">
                                        <div className="h-[140px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                            <img src={product.image_url || 'https://placehold.co/300x200'} alt="template preview" className="h-full w-full object-cover opacity-60" />
                                        </div>
                                        <div className="p-3 bg-white dark:bg-zinc-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px] text-[#E91E63]">web</span>
                                            <span className="text-[13px] font-bold text-[#111827] dark:text-white">
                                                {product.template === 'tech' ? 'Electronics & Tech' :
                                                    product.template === 'fashion' ? 'Fashion & Style' :
                                                        product.template === 'perfume' ? 'Perfume & Luxury' :
                                                            product.template === 'food' ? 'Food & Restaurant' :
                                                                product.template === 'skincare' ? 'Skincare & Beauty' :
                                                                    product.template === 'digital' ? 'Digital Products' :
                                                                        product.template === 'decor' ? 'Home & Decor' :
                                                                            product.template === 'image' ? 'Infographic / Image' :
                                                                                product.template === 'classic-pro' ? 'Classic Pro' :
                                                                                    product.template || 'Default'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6">
                                    <h3 className="text-[16px] font-black text-[#111827] dark:text-white mb-4">{t('t_385b1a66')}</h3>
                                    {orders.length === 0 ? (
                                        <p className="text-[13px] text-[#6B7280] dark:text-gray-400 text-center py-6">{t('t_6039ee7a')}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {orders.slice(0, 5).map((order, i) => {
                                                const badge = getOrderStatusBadge(order.status);
                                                const initials = (order.customer_name || t('t_645')).slice(0, 2);
                                                return (
                                                    <div key={order.id} className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:bg-zinc-900/50 rounded-xl px-2 transition-colors cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-[13px] font-bold text-[#111827] dark:text-white flex-shrink-0">
                                                            {initials}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-bold text-[#111827] dark:text-white truncate">{order.customer_name || t('t_2ec7566')}</p>
                                                            <p className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400">{order.customer_phone || ''} · {formatDate(order.created_at)}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <Link href="/orders" className="flex items-center justify-center gap-1 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/30 text-[13px] font-bold text-[#6B7280] dark:text-gray-400 hover:text-[#E91E63] transition-colors">
                                        
                                        {t('t_1f1be68b5')}
                                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
