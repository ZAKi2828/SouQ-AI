'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> | any }) {
    const { t } = useI18n();
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
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const ctx = await getStoreContext();
                if (!ctx) { router.push('/login'); return; }
                const userId = ctx.targetUserId;

                // Fetch order
                const { data: orderData } = await insforge.database
                    .from('orders').select('*').eq('id', orderId).single();
                if (orderData) {
                    setOrder(orderData);
                    // Fetch product
                    if (orderData.product_id) {
                        const { data: prod } = await insforge.database
                            .from('products').select('*').eq('id', orderData.product_id).single();
                        if (prod) setProduct(prod);
                    }
                }
                // Fetch store info (from owner's profile)
                const { data: profile } = await insforge.database
                    .from('profiles').select('*').eq('id', userId).single();
                if (profile) setStore(profile);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchData();
    }, [orderId, router]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Intl.DateTimeFormat('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
    };

    const getWilayaName = (code: string) => {
        if (!code) return '';
        const paddedCode = String(code).padStart(2, '0');
        return WILAYA_MAP[paddedCode] || WILAYA_MAP[code] || code;
    };

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f1f3]" dir="rtl">
                <SOUQAILoader size="md" text={t('t_6c976c9b')} />
            </div>
        );
    }
    if (!order) return null;

    const unitPrice = order.quantity ? (parseFloat(order.total_price || 0) / (order.quantity || 1)) : parseFloat(order.total_price || 0);
    const shippingCost = product?.shipping_free ? 0 : (product?.shipping_home_price || 0);
    const subtotal = parseFloat(order.total_price || 0);
    const grandTotal = subtotal + shippingCost;
    const invoiceNumber = `INV-${order.id.slice(0, 6).toUpperCase()}`;
    const storeName = store?.store_name || store?.store_slug || t('t_5b3e9ec0');

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

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .invoice-paper { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; max-width: 100% !important; }
                }
                body { background-color: #f0f1f3; }
            `}} />

            <div className="min-h-screen py-6 px-4" dir="rtl">

                {/* ═══════════════ ACTION BUTTONS ═══════════════ */}
                <div className="no-print flex items-center justify-center gap-3 mb-6">
                    <button onClick={handlePrint}
                        className="flex items-center gap-2 px-8 h-12 rounded-full bg-[#E91E63] text-white text-[15px] font-bold hover:bg-[#C2185B] transition-all shadow-lg shadow-[#E91E63]/25">
                        <span className="material-symbols-outlined text-[20px]">print</span>
                        
                        {t('t_1237e1fed')}
                    </button>
                    <button onClick={() => router.back()}
                        className="flex items-center gap-2 px-8 h-12 rounded-full border-2 border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#111827] dark:text-white text-[15px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50 transition-all">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        
                        {t('t_2e8744c')}
                    </button>
                </div>

                {/* ═══════════════ INVOICE PAPER ═══════════════ */}
                <div ref={invoiceRef} className="invoice-paper max-w-[800px] mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden">

                    {/* ── Top colored border ── */}
                    <div className="h-1.5 bg-gradient-to-l from-[#E91E63] to-[#1a1a2e]"></div>

                    <div className="p-8 md:p-12">

                        {/* ── HEADER ── */}
                        <div className="flex justify-between items-start mb-10">
                            {/* Right: Logo + Store */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#E91E63] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[24px]">shopping_bag</span>
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-[#1a1a2e] tracking-tight">SOUQ AI</h2>
                                    <p className="text-[13px] font-bold text-[#E91E63]">{t('t_2f180ca')} {storeName}</p>
                                </div>
                            </div>
                            {/* Left: Invoice info */}
                            <div className="text-left">
                                <h1 className="text-[28px] font-black text-[#1a1a2e] mb-1">{t('t_5b9ab864')}</h1>
                                <p className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_5ce7d3cb')} <span className="text-[#1a1a2e]">#{invoiceNumber}</span></p>
                                <p className="text-[13px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_94bef241')} <span className="text-[#1a1a2e]">{formatDate(order.created_at)}</span></p>
                            </div>
                        </div>

                        {/* ── STORE & CUSTOMER INFO ── */}
                        <div className="grid grid-cols-2 gap-8 mb-10">
                            {/* Store info */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-5 bg-[#E91E63] rounded-full"></div>
                                    <h3 className="text-[15px] font-black text-[#E91E63]">{t('t_3d842297')}</h3>
                                </div>
                                <div className="space-y-1.5 text-[13px]">
                                    <p className="font-bold text-[#1a1a2e]">{t('t_2f180ca')} {storeName}  {t('t_985834a4')}</p>
                                    <p className="text-[#6B7280] dark:text-gray-400">{t('t_5b596503')} <span dir="ltr">{store?.phone || '+213 XXX XXX XX XX'}</span></p>
                                    <p className="text-[#6B7280] dark:text-gray-400">{t('t_ce711e69')}</p>
                                </div>
                            </div>
                            {/* Customer info */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-5 bg-[#E91E63] rounded-full"></div>
                                    <h3 className="text-[15px] font-black text-[#E91E63]">{t('t_3d7f1733')}</h3>
                                </div>
                                <div className="space-y-1.5 text-[13px]">
                                    <p className="font-bold text-[#1a1a2e]">{order.customer_name || '—'}</p>
                                    <p className="text-[#6B7280] dark:text-gray-400">{order.customer_address || '—'}{t('t_60c')} {getWilayaName(order.customer_state)}</p>
                                    <p className="text-[#6B7280] dark:text-gray-400">{t('t_5b596503')} <span dir="ltr">{order.customer_phone || '—'}</span></p>
                                    <p className="text-[#6B7280] dark:text-gray-400">{t('t_1630794af')} <span className="font-bold text-[#1a1a2e]">{parsedDelivery}</span></p>
                                    {userNotes && <p className="text-[#6B7280] dark:text-gray-400">{t('t_92dcfdc4')} <span className="font-bold text-[#1a1a2e]">{userNotes}</span></p>}
                                </div>
                            </div>
                        </div>

                        {/* ── PRODUCTS TABLE ── */}
                        <div className="mb-8">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="border-b-2 border-[#1a1a2e]">
                                        <th className="py-3 text-[13px] font-black text-[#1a1a2e]">{t('t_252217e0')}</th>
                                        <th className="py-3 text-[13px] font-black text-[#1a1a2e] text-center">{t('t_25230082')}</th>
                                        <th className="py-3 text-[13px] font-black text-[#1a1a2e] text-center">{t('t_5e13decf')}</th>
                                        <th className="py-3 text-[13px] font-black text-[#1a1a2e] text-left">{t('t_9cf81b14')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 dark:border-zinc-800/30">
                                        <td className="py-4">
                                            <p className="text-[14px] font-bold text-[#1a1a2e]">{order.product_name || t('t_2f1e9a3')}</p>
                                            <p className="text-[11px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 mt-0.5">SKU: {product?.product_slug?.toUpperCase()?.replace(/-/g, '-') || order.product_id?.slice(0, 10).toUpperCase() || '—'}</p>
                                            {parsedOptions && (
                                                <p className="text-[11px] font-black text-[#E91E63] mt-1">{parsedOptions}</p>
                                            )}
                                        </td>
                                        <td className="py-4 text-center text-[14px] font-bold text-[#1a1a2e]">{order.quantity || 1}</td>
                                        <td className="py-4 text-center text-[14px] font-bold text-[#1a1a2e]">{unitPrice.toLocaleString()}  {t('t_17422d')}</td>
                                        <td className="py-4 text-left text-[14px] font-black text-[#1a1a2e]">{subtotal.toLocaleString()}  {t('t_17422d')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* ── SUMMARY + QR ── */}
                        <div className="flex justify-between items-end mb-8">
                            {/* QR Code area */}
                            <div className="flex items-center gap-3">
                                <div className="w-[80px] h-[80px] bg-gray-100 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
                                    {/* QR Code placeholder */}
                                    <svg viewBox="0 0 100 100" className="w-[60px] h-[60px] opacity-60">
                                        <rect x="10" y="10" width="25" height="25" rx="2" fill="#1a1a2e" />
                                        <rect x="65" y="10" width="25" height="25" rx="2" fill="#1a1a2e" />
                                        <rect x="10" y="65" width="25" height="25" rx="2" fill="#1a1a2e" />
                                        <rect x="15" y="15" width="15" height="15" rx="1" fill="white" />
                                        <rect x="70" y="15" width="15" height="15" rx="1" fill="white" />
                                        <rect x="15" y="70" width="15" height="15" rx="1" fill="white" />
                                        <rect x="19" y="19" width="7" height="7" fill="#1a1a2e" />
                                        <rect x="74" y="19" width="7" height="7" fill="#1a1a2e" />
                                        <rect x="19" y="74" width="7" height="7" fill="#1a1a2e" />
                                        <rect x="40" y="10" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="50" y="10" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="40" y="20" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="40" y="40" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="50" y="40" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="60" y="40" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="65" y="50" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="75" y="45" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="85" y="50" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="40" y="55" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="50" y="65" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="65" y="65" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="75" y="75" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="85" y="65" width="5" height="5" fill="#1a1a2e" />
                                        <rect x="85" y="85" width="5" height="5" fill="#1a1a2e" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#6B7280] dark:text-gray-400">{t('t_65697d1')}</p>
                                    <p className="text-[13px] font-black text-[#1a1a2e]">{t('t_d2646cba')}</p>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="w-[280px] space-y-2.5">
                                <div className="flex justify-between text-[13px]">
                                    <span className="font-bold text-[#6B7280] dark:text-gray-400">{t('t_927e394')}</span>
                                    <span className="font-bold text-[#1a1a2e]">{subtotal.toLocaleString()}  {t('t_17422d')}</span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="font-bold text-[#6B7280] dark:text-gray-400">{t('t_20c7c984')}</span>
                                    <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600' : 'text-[#1a1a2e]'}`}>
                                        {shippingCost === 0 ? t('t_217db6d41') : `${shippingCost.toLocaleString()} د.ج`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="font-bold text-[#6B7280] dark:text-gray-400">{t('t_2a6ab7a92')}</span>
                                    <span className="font-bold text-[#1a1a2e]">{t('t_2ca363d')}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-1"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[15px] font-black text-[#1a1a2e]">{t('t_dcf56048')}</span>
                                    <span className="text-[22px] font-black text-[#E91E63]">{grandTotal.toLocaleString()}  {t('t_17422d')}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── PAYMENT METHOD ── */}
                        <div className="flex items-center gap-2 mb-10 text-[13px]">
                            <span className="material-symbols-outlined text-[18px] text-[#6B7280] dark:text-gray-400">payments</span>
                            <span className="font-bold text-[#6B7280] dark:text-gray-400">{t('t_138da3279')}</span>
                            <span className="font-bold text-[#1a1a2e]">{t('t_addbc04b')}</span>
                        </div>

                        {/* ── THANK YOU ── */}
                        <div className="text-center py-6 border-t border-gray-100 dark:border-zinc-800/30">
                            <h2 className="text-[20px] font-black text-[#1a1a2e] mb-2">{t('t_5b9971fb')}</h2>
                            <p className="text-[13px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_254eaf644')}</p>
                        </div>

                        {/* ── FOOTER ── */}
                        <div className="text-center pt-4 border-t border-gray-100 dark:border-zinc-800/30">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-[12px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_51df6071')}</span>
                                <span className="material-symbols-outlined text-[14px] text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">shopping_bag</span>
                                <span className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">SOUQ AI</span>
                            </div>
                            <p className="text-[11px] text-[#C4C4C4]">{t('t_36a795f03')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
