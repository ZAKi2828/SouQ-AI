'use client';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';

interface Stats {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface TopProduct {
  name: string;
  image_url: string;
  sales: number;
  maxSales: number;
}

interface WilayaStat {
  name: string;
  count: number;
  color: string;
}

interface DailyRevenue {
  day: number;
  revenue: number;
}

export default function AnalyticsDashboard() {
    const { t, lang } = useI18n();
    const router = useRouter();
    const { planExpired, currentPlan } = useExpiredPlanGuard();

    // Wilaya code → name map
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
    };

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, totalProfit: 0, totalOrders: 0, avgOrderValue: 0,
    totalProducts: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [wilayaStats, setWilayaStats] = useState<WilayaStat[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [period, setPeriod] = useState<'today' | '7' | '30'>('7');
  const [storeName, setStoreName] = useState('');

  const WILAYA_COLORS = ['#e637b8', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const ctx = await getStoreContext();
        if (!ctx) {
            router.push('/login');
            return;
        }

        // RBAC Guard: Only owners can access analytics
        if (ctx.role !== 'owner') {
            router.push('/merchant');
            return;
        }
        
        setStoreName(ctx.storeName || '');
        const storeDomain = ctx.storeDomain;
        if (!storeDomain) { setLoading(false); return; }

        // Date filter
        const now = new Date();
        let fromDate: Date | null = null;
        if (period === 'today') {
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === '7') {
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === '30') {
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Fetch orders
        let ordersQuery = insforge.database
          .from('orders').select('*').eq('store_domain', storeDomain);
        if (fromDate) ordersQuery = ordersQuery.gte('created_at', fromDate.toISOString());
        const { data: orders } = await ordersQuery;

        // Fetch products
        const { data: products } = await insforge.database
          .from('products').select('id, name, image_url, compare_at_price, cost_price, price, product_slug').eq('store_domain', storeDomain);

        // Fetch shipping rates
        const { data: shippingRates } = await insforge.database
          .from('shipping_rates').select('*');

        const allOrders = orders || [];
        const allProducts = products || [];
        const allShippingRates = shippingRates || [];

        const validOrders = allOrders.filter((o: any) => !['cancelled', 'returned', t('t_2f1e42e')].includes(o.status));
        const totalRev = validOrders.reduce((s: number, o: any) => s + (Number(o.total_price) || 0), 0);
        
        let totalProfit = 0;
        validOrders.forEach((o: any) => {
           const prod = allProducts.find((p: any) => p.id === (o.product_id || o.product_slug) || p.product_slug === (o.product_id || o.product_slug));
           const quantity = Number(o.quantity) || 1;
           const orderTotal = Number(o.total_price) || 0;

           if (prod) {
             const costPrice = Number(prod.cost_price) || 0;
             const productCost = costPrice * quantity;
             
             // تحديد نوع التوصيل (مكتب أو منزل)
             const addressLower = (o.customer_address || '').toLowerCase();
             const notesLower = (o.notes || '').toLowerCase();
             const isDesk = addressLower.includes('مكتب') || addressLower.includes('desk') || addressLower.includes('office') || 
                            notesLower.includes('للمكتب') || notesLower.includes('desk') || notesLower.includes('office');
             
             // مطابقة الولاية
             const rawState = o.customer_state || '';
             const normalizedState = String(rawState).padStart(2, '0');
             const rate = allShippingRates.find((r: any) => String(r.wilaya_code).padStart(2, '0') === normalizedState);
             
             let shippingCost = 0;
             if (rate) {
               shippingCost = isDesk ? (Number(rate.desk_price) || 0) : (Number(rate.home_price) || 0);
             } else {
               // تسعيرة افتراضية في حال عدم ضبط تسعيرة الولاية
               shippingCost = isDesk ? 500 : 700;
             }
             
             // صافي الربح للطلب = المبلغ الإجمالي المدفوع - (تكلفة المنتج + تكلفة التوصيل الفعلية)
             totalProfit += orderTotal - (productCost + shippingCost);
           } else {
             // قيمة تقريبية في حالة عدم توفر المنتج
             totalProfit += orderTotal * 0.4;
           }
        });

        const completedOrds = allOrders.filter((o: any) => ['completed', t('t_5b49f6eb')].includes(o.status)).length;
        const pendingOrds = allOrders.filter((o: any) => ['pending', t('t_bf09a1dc'), 'new'].includes(o.status)).length;
        const cancelledOrds = allOrders.filter((o: any) => ['cancelled', t('t_2f1e42e')].includes(o.status)).length;

        setStats({
          totalRevenue: totalRev,
          totalProfit: Math.round(totalProfit),
          totalOrders: allOrders.length,
          avgOrderValue: validOrders.length > 0 ? Math.round(totalRev / validOrders.length) : 0,
          totalProducts: allProducts.length,
          pendingOrders: pendingOrds,
          completedOrders: completedOrds,
          cancelledOrders: cancelledOrds,
        });

        // Top products by order count
        const productOrderCount: Record<string, { count: number; name: string; image_url: string }> = {};
        for (const order of allOrders) {
          const pid = order.product_id || order.product_slug;
          if (!pid) continue;
          if (!productOrderCount[pid]) {
            const prod = allProducts.find((p: any) => p.id === pid || p.product_slug === pid);
            productOrderCount[pid] = { count: 0, name: order.product_name || prod?.name || t('t_2f1e9a3'), image_url: prod?.image_url || '' };
          }
          productOrderCount[pid].count++;
        }
        const sortedProducts = Object.values(productOrderCount)
          .sort((a, b) => b.count - a.count).slice(0, 3);
        const maxSales = sortedProducts[0]?.count || 1;
        setTopProducts(sortedProducts.map(p => ({ ...p, sales: p.count, maxSales })));

        // Daily revenue for chart (last 30 days)
        const dailyMap: Record<number, number> = {};
        for (let i = 1; i <= 30; i++) dailyMap[i] = 0;
        for (const order of allOrders) {
          if (!order.created_at) continue;
          const d = new Date(order.created_at).getDate();
          if (dailyMap[d] !== undefined) {
            dailyMap[d] += Number(order.total_price) || 0;
          }
        }
        setDailyRevenue(Object.entries(dailyMap).map(([k, v]) => ({ day: Number(k), revenue: v })));

        // Wilaya breakdown
        const wilayaCount: Record<string, number> = {};
        for (const order of allOrders) {
          let raw = order.customer_state || order.wilaya || order.customer_wilaya || '';
          let name = t('t_2e21be3');

          if (raw) {
            const paddedCode = String(raw).padStart(2, '0');
            name = WILAYA_MAP[paddedCode] || WILAYA_MAP[raw] || raw;
          } else if (order.customer_phone) {
            // Try to extract 2-digit code from phone if state is completely missing
            const phone = order.customer_phone.replace(/\D/g, '');
            const local = phone.startsWith('213') ? phone.slice(3) : phone.startsWith('0') ? phone.slice(1) : phone;
            const prefix = local.slice(0, 2).padStart(2, '0');
            name = WILAYA_MAP[prefix] || prefix || t('t_2e21be3');
          }

          wilayaCount[name] = (wilayaCount[name] || 0) + 1;
        }
        const sortedWilaya = Object.entries(wilayaCount)
          .sort(([, a], [, b]) => b - a).slice(0, 4);
        const totalW = sortedWilaya.reduce((s, [, c]) => s + c, 0) || 1;
        setWilayaStats(sortedWilaya.map(([name, count], i) => ({
          name, count, color: WILAYA_COLORS[i] || '#94a3b8',
        })));

      } catch (err) {
        console.error('Error fetching analytics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [period]);

  // Chart path builder
  const buildChartPath = () => {
    if (!dailyRevenue.length) return { area: '', line: '' };
    const W = 1000, H = 300, pad = 20;
    const maxRev = Math.max(...dailyRevenue.map(d => d.revenue), 1);
    const pts = dailyRevenue.map((d, i) => ({
      x: (i / (dailyRevenue.length - 1)) * (W - 40) + 20,
      y: H - pad - ((d.revenue / maxRev) * (H - pad * 2)),
    }));
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
    return { area, line };
  };

  const { area, line } = buildChartPath();
  const totalWilaya = wilayaStats.reduce((s, w) => s + w.count, 0) || 1;

  // Donut chart calculations
  const buildDonut = () => {
    const R = 40, C = 2 * Math.PI * R;
    let offset = 0;
    return wilayaStats.map(w => {
      const pct = w.count / totalWilaya;
      const dash = pct * C;
      const seg = { ...w, dash, gap: C - dash, offset };
      offset += dash;
      return seg;
    });
  };
  const donutSegs = buildDonut();

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Sidebar activePage="Analytics" />
        <main className="flex-1 flex items-center justify-center bg-[#F9FAFB] dark:bg-zinc-950 pt-16 md:pt-0">
          <SOUQAILoader size="lg" text={t('t_7a5e9c1d')} />
        </main>
      </div>
    );
  }

  return (
    <>
      {planExpired && (
          <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
        body { font-family: 'Cairo', sans-serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
      <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Sidebar activePage="Analytics" />
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950 relative pt-16 md:pt-0">

          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8 py-4 bg-[#F9FAFB] dark:bg-zinc-950 shrink-0">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('t_44c3ac2d')}</h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">
                {storeName ? `نظرة شاملة على أداء متجر "${storeName}"` : t('t_299ace1a')}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4 relative">
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input className="h-10 w-64 rounded-xl border-none bg-white dark:bg-zinc-900 pr-10 pl-4 text-sm font-medium text-slate-700 dark:text-gray-200 shadow-sm  focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" placeholder={t('t_16046b0ab')} type="text" />
              </div>
              <StoreLinkButton />
              <NotificationsDropdown />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">

              {/* Filter + Export */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl p-1 shadow-sm  border border-slate-100 dark:border-zinc-800">
                  {([['today', t('t_59a422aa')], ['7', t('t_6e4410d7')], ['30', t('t_76f18e61')]] as [string, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPeriod(val as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${period === val
                        ? 'bg-primary/10 text-primary shadow-sm '
                        : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const csv = `إجمالي الإيرادات,${stats.totalRevenue}\nإجمالي الطلبات,${stats.totalOrders}\nمتوسط قيمة الطلب,${stats.avgOrderValue}\n`;
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'analytics.csv'; a.click();
                  }}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  <span className="text-sm font-bold">{t('t_17496272e')}</span>
                </button>
              </div>

              {/* AI Insights Banner */}
              <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-primary/20 dark:to-zinc-900 p-6 shadow-lg text-white group">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <span className="material-symbols-outlined text-9xl">auto_awesome</span>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                      <span className="material-symbols-outlined text-primary-300 text-2xl">insights</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        
                        {t('t_ad7b292e')}
                        <span className="px-2 py-0.5 rounded-full bg-primary text-[10px] font-black uppercase tracking-wider">{t('t_2e639e8')}</span>
                      </h3>
                      <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                        {stats.totalOrders === 0
                          ? t('t_15dc9fa8f')
                          : stats.pendingOrders > 0
                            ? `لديك ${stats.pendingOrders} طلب${stats.pendingOrders > 1 ? t('t_c4e3') : ''} قيد المعالجة. يُنصح بمعالجتها في أقرب وقت لرفع رضا العملاء.`
                            : `أداء رائع! جميع الطلبات تمت معالجتها. إجمالي إيراداتك: ${stats.totalRevenue.toLocaleString('ar-DZ')} د.ج`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                  { icon: 'account_balance_wallet', color: 'emerald', label: t('t_7ef66f03'), value: `${stats.totalProfit.toLocaleString('ar-DZ')} د.ج`, trend: null },
                  { icon: 'payments', color: 'green', label: t('t_944f60f7'), value: `${stats.totalRevenue.toLocaleString('ar-DZ')} د.ج`, trend: null },
                  { icon: 'shopping_cart', color: 'blue', label: t('t_140f90950'), value: stats.totalOrders.toString(), trend: null },
                  { icon: 'receipt_long', color: 'purple', label: t('t_b6361a23'), value: `${stats.avgOrderValue.toLocaleString('ar-DZ')} د.ج`, trend: null },
                  { icon: 'inventory_2', color: 'orange', label: t('t_4850e76a'), value: stats.totalProducts.toString(), trend: null },
                ].map((card, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-card hover:shadow-md transition-shadow duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 bg-${card.color}-50 dark:bg-${card.color}-900/20 rounded-xl`}>
                        <span className={`material-symbols-outlined text-${card.color}-600 dark:text-${card.color}-400`}>{card.icon}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-700 dark:text-${card.color}-400 text-xs font-bold`}>
                        <span className="material-symbols-outlined text-[14px]">bar_chart</span>
                        <span>{t('t_59f7c63d')}</span>
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">{card.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</h3>
                  </div>
                ))}
              </div>

              {/* Sales Chart */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('t_769cb2ec')}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{t('t_219239d7d')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-xs font-bold text-slate-600 dark:text-gray-300">{t('t_15561a363')}</span>
                    </div>
                  </div>
                </div>

                <div className="relative w-full h-[300px] flex items-end gap-1 sm:gap-2 justify-between px-2">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full h-px border-t border-dashed border-slate-200 dark:border-zinc-800"></div>
                    ))}
                  </div>
                  <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none" viewBox="0 0 1000 300">
                    <defs>
                      <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#e637b8" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#e637b8" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    {area && <path d={area} fill="url(#gradient)" />}
                    {line && <path d={line} fill="none" stroke="#e637b8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />}
                  </svg>
                </div>

                <div className="flex justify-between w-full mt-4 text-xs font-medium text-slate-400 dark:text-slate-500 dark:text-gray-400 px-2">
                  {['01', '05', '10', '15', '20', '25', '30'].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top Products */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('t_586d6f07')}</h3>
                  </div>
                  <div className="flex flex-col gap-5">
                    {topProducts.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                        <p className="text-sm font-bold">{t('t_631ea1ab')}</p>
                      </div>
                    ) : topProducts.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                          {p.image_url
                            ? <img className="w-full h-full object-cover" src={p.image_url} alt={p.name} />
                            : <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">image</span>
                              </div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{p.sales}  {t('t_181cdb')}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-700"
                              style={{ width: `${Math.round((p.sales / p.maxSales) * 100)}%`, opacity: 1 - i * 0.2 }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wilaya Breakdown */}
                <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-zinc-800 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('t_bd3b11d0')}</h3>
                  <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" strokeWidth="12" />
                        {donutSegs.length === 0 ? (
                          <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e2e8f0" strokeWidth="12" />
                        ) : donutSegs.map((seg, i) => (
                          <circle
                            key={i}
                            cx="50" cy="50" fill="transparent" r="40"
                            stroke={seg.color}
                            strokeDasharray={`${seg.dash} ${seg.gap}`}
                            strokeDashoffset={-seg.offset}
                            strokeLinecap="round"
                            strokeWidth="12"
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalOrders}</span>
                        <span className="text-xs text-slate-500 dark:text-gray-400">{t('t_181cdb')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    {wilayaStats.length === 0 ? (
                      <p className="text-center text-sm text-slate-400">{t('t_4fa4005a')}</p>
                    ) : wilayaStats.map((w, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: w.color }}></span>
                          <span className="text-slate-600 dark:text-gray-300 font-medium">{w.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {Math.round((w.count / totalWilaya) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}