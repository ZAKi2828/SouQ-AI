'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SOUQAILoader from '@/components/SOUQAILoader';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import PlanExpiryBanner from '@/components/PlanExpiryBanner';
import StoreSetupGuide from '@/components/StoreSetupGuide';
import { insforge } from '@/lib/insforge';
import { useI18n } from '@/context/I18nContext';
import { getStoreContext } from '@/lib/storeContext';
import { ALGERIA_WILAYAS } from '@/lib/algeriaWilayas';
import { AlgeriaMapPaths, WILAYA_NAMES } from '@/components/AlgeriaMapPaths';

const WILAYA_COORDS: Record<string, { x: number; y: number }> = {
    '01': { x: -675.82, y: 1818.46 },
    '02': { x: -491.79, y: 1068.06 },
    '03': { x: -388.51, y: 1246.79 },
    '04': { x: -146.15, y: 1089.13 },
    '05': { x: -219.62, y: 1125.98 },
    '06': { x: -272.91, y: 1040.09 },
    '07': { x: -236.68, y: 1201.56 },
    '08': { x: -731.03, y: 1525.07 },
    '09': { x: -392.07, y: 1045.86 },
    '10': { x: -335.75, y: 1064.96 },
    '11': { x: -199.67, y: 1925.11 },
    '12': { x: -93.92, y: 1136.93 },
    '13': { x: -654.03, y: 1177.59 },
    '14': { x: -469.85, y: 1163.68 },
    '15': { x: -316.2, y: 1031.31 },
    '16': { x: -380.39, y: 1031.29 },
    '17': { x: -350.38, y: 1201.98 },
    '18': { x: -210.83, y: 1025.03 },
    '19': { x: -244.5, y: 1071.62 },
    '20': { x: -547.12, y: 1174.02 },
    '21': { x: -161.2, y: 1020.93 },
    '22': { x: -598.01, y: 1178.22 },
    '23': { x: -118.08, y: 1012.89 },
    '24': { x: -122.54, y: 1049.63 },
    '25': { x: -167.86, y: 1050.68 },
    '26': { x: -392.15, y: 1084.26 },
    '27': { x: -544.98, y: 1082.34 },
    '28': { x: -304.47, y: 1144.63 },
    '29': { x: -552.73, y: 1126.23 },
    '30': { x: -177.94, y: 1426.85 },
    '31': { x: -598.84, y: 1109.41 },
    '32': { x: -507.69, y: 1331.52 },
    '33': { x: 7.12, y: 1751.14 },
    '34': { x: -288.55, y: 1073.26 },
    '35': { x: -348.76, y: 1028.12 },
    '36': { x: -81.19, y: 1023.33 },
    '37': { x: -947.98, y: 1680.36 },
    '38': { x: -457.54, y: 1098.54 },
    '39': { x: -130.28, y: 1277.02 },
    '40': { x: -144.24, y: 1155.35 },
    '41': { x: -98.96, y: 1063.22 },
    '42': { x: -430.97, y: 1044.09 },
    '43': { x: -200.06, y: 1059.18 },
    '44': { x: -440.35, y: 1071.18 },
    '45': { x: -613.39, y: 1282.7 },
    '46': { x: -629.12, y: 1127.53 },
    '47': { x: -354.2, y: 1446.82 },
    '48': { x: -514.52, y: 1094.77 },
    '49': { x: -675.82, y: 1818.46 },
    '50': { x: -675.82, y: 1818.46 },
    '51': { x: -236.68, y: 1201.56 },
    '52': { x: -731.03, y: 1525.07 },
    '53': { x: -199.67, y: 1925.11 },
    '54': { x: -199.67, y: 1925.11 },
    '55': { x: -177.94, y: 1426.85 },
    '56': { x: 7.12, y: 1751.14 },
    '57': { x: -130.28, y: 1277.02 },
    '58': { x: -354.2, y: 1446.82 },
};


const BrandIcon = ({ name, className }: { name: string; className?: string }) => {
  const size = "w-4 h-4 fill-current";
  switch (name) {
    case 'facebook':
      return (
        <svg className={`${size} ${className}`} viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={`${size} ${className}`} viewBox="0 0 24 24">
          <path d="M12.53.02C13.84 0 15.14.31 16.29.93c-.15 1.52.32 3.03 1.3 4.2 1.25 1.48 3.07 2.37 5.04 2.47v3.52c-1.84-.04-3.62-.73-5.02-1.95v7.24c0 4.19-3.4 7.59-7.59 7.59-3.86 0-7.07-2.9-7.53-6.68C1.86 12.98 5.16 9.4 9.17 9.4c.59 0 1.17.07 1.73.2V.02h1.63zm-1.63 13c0-2.09-1.7-3.79-3.79-3.79-2.09 0-3.79 1.7-3.79 3.79s1.7 3.79 3.79 3.79 3.79-1.7 3.79-3.79z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className={`${size} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'snapchat':
      return (
        <svg className={`${size} ${className}`} viewBox="0 0 24 24">
          <path d="M12.015 2c-.628 0-1.25.04-1.854.122-.162.023-.326.061-.486.115-.71.24-1.393.618-2.003 1.11-1.365 1.1-2.39 2.656-2.94 4.398-.242.75-.332 1.558-.332 2.378 0 1.229.356 2.4 1.01 3.4.153.237.264.502.327.778.077.306-.017.625-.236.837l-.822.78c-.5.474-.754 1.144-.7 1.83.05.688.423 1.3 1.01 1.624.743.411 1.545.698 2.378.857.34.065.65.215.91.442.525.46 1.2.716 1.9.743.704-.027 1.376-.283 1.902-.743.26-.227.57-.377.91-.442.833-.16 1.635-.446 2.378-.857.588-.323.962-.936 1.012-1.624.053-.686-.2-1.356-.7-1.83l-.823-.78c-.218-.212-.313-.53-.235-.837.062-.276.174-.54.327-.778.654-1 1.01-2.171 1.01-3.4 0-.82-.09-1.628-.332-2.378-.55-1.742-1.575-3.298-2.94-4.398-.61-.492-1.293-.87-2.003-1.11a1.943 1.943 0 0 0-.486-.115A20.443 20.443 0 0 0 12.015 2z" />
        </svg>
      );
    case 'google':
      return (
        <svg className={`${size} ${className}`} viewBox="0 0 24 24">
          <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.175 15.42 1 12.24 1 5.92 1 1 5.92 1 12.24s4.92 11.24 11.24 11.24c6.6 0 11-4.604 11-11.24 0-.756-.08-1.333-.178-1.955H12.24z"/>
        </svg>
      );
    case 'direct':
      return (
        <svg className={`${size} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      );
    default:
      return (
        <svg className={`${size} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      );
  }
};


export default function MerchantDashboard() {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [userName, setUserName] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [planExpired, setPlanExpired] = useState(false);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('free');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [latestPop, setLatestPop] = useState<any | null>(null);
  const [hoveredWilaya, setHoveredWilaya] = useState<string | null>(null);
  const [stats, setStats] = useState({
    sales: 0,
    ordersCount: 0,
    productsCount: 0,
    customersCount: 0
  });
  const [trafficStats, setTrafficStats] = useState<any[]>([]);
  const [pixelsActive, setPixelsActive] = useState({
    facebook: false,
    tiktok: false,
    snapchat: false
  });
  const [activeTab, setActiveTab] = useState<'channels' | 'performance' | 'funnel'>('channels');

  useEffect(() => {
    let isMounted = true;
    let subscribedChannel: string | null = null;

    const handleNewOrderRealtime = async (newOrder: any) => {
        if (!isMounted) return;
        console.log('Dashboard received real-time order for map:', newOrder);
        
        // Play notification sound
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
        } catch (err) { }

        const coords = WILAYA_COORDS[String(newOrder.customer_state).padStart(2, '0')] || { x: 50, y: 15 };
        const wName = ALGERIA_WILAYAS.find(w => String(w.code).padStart(2, '0') === String(newOrder.customer_state).padStart(2, '0'))?.name_ar || newOrder.customer_state || '';
        
        const newPoint = {
            id: newOrder.id,
            x: coords.x,
            y: coords.y,
            product_name: newOrder.product_name || '',
            customer_name: newOrder.customer_name || '',
            wilaya: wName,
            total_price: newOrder.total_price || 0,
            isNew: true
        };

        // Add point to map
        setMapPoints((prev: any[]) => [newPoint, ...prev].slice(0, 20));
        
        // Set as latest pop notification
        setLatestPop(newPoint);

        // Reset isNew status after 8 seconds
        setTimeout(() => {
            if (isMounted) {
                setMapPoints((prev: any[]) => prev.map(p => p.id === newOrder.id ? { ...p, isNew: false } : p));
            }
        }, 8000);

        // Clear pop notification after 8 seconds
        setTimeout(() => {
            if (isMounted) {
                setLatestPop((prev: any | null) => prev?.id === newOrder.id ? null : prev);
            }
        }, 8000);
    };

    // Listen for new orders on the current store
    insforge.realtime.on('INSERT_order', handleNewOrderRealtime);

    async function loadDashboardData() {
      try {
        const ctx = await getStoreContext();
        if (!ctx || !ctx.targetUserId) {
            router.push('/merchant/onboarding');
            return;
        }

        // ✅ FIX: If user is a team member (not owner), never send to onboarding
        const isTeamMember = ctx.role && ctx.role !== 'owner';

        if (ctx.plan === t('t_5b402b99') || ctx.plan === 'blocked') {
            window.location.href = '/blocked';
            return;
        }

        // Check plan expiration
        if (ctx.plan === 'expired') {
            setPlanExpired(true);
            setCurrentPlan(ctx.plan);
        } else if (ctx.planExpiresAt) {
            const expiresAt = new Date(ctx.planExpiresAt);
            if (expiresAt < new Date()) {
                setPlanExpired(true);
            } else {
                setPlanExpiresAt(ctx.planExpiresAt);
            }
            setCurrentPlan(ctx.plan || 'free');
        } else {
            setCurrentPlan(ctx.plan || 'free');
        }

        let storeDomain = ctx.storeDomain;

        setUserName(ctx.storeName?.split(' ')[0] || t('merchant_label') || 'Merchant');

        if (!storeDomain) {
            // ✅ FIX: Team members should NOT be redirected to onboarding
            if (!isTeamMember) {
                window.location.href = '/merchant/onboarding'; // Force hard redirect ensures the onboarding ALWAYS shows
            }
            return;
        }

        // Load Recent Products
        const { data: productsData } = await insforge.database
          .from('products')
          .select('*')
          .eq('user_id', ctx.targetUserId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (productsData && isMounted) {
          setProducts(productsData);
        }

        if (storeDomain) {
          // 1. Load Total Sales, Order Count and Source
          const { data: ordersData } = await insforge.database
            .from('orders')
            .select('total_price, customer_phone, source, status')
            .eq('store_domain', storeDomain);

          if (ordersData && isMounted) {
            const validOrders = ordersData.filter((o: any) => !['cancelled', 'returned'].includes(o.status));
            const totalSales = validOrders.reduce((sum: number, order: any) => sum + (Number(order.total_price) || 0), 0);

            // Calculate unique customers by phone number
            const uniqueCustomers = new Set(ordersData.map(o => o.customer_phone).filter(Boolean));

            setStats(prev => ({
              ...prev,
              sales: totalSales,
              ordersCount: ordersData.length,
              customersCount: uniqueCustomers.size
            }));
          }

          // 2. Load Page Visits
          const { data: visitsData } = await insforge.database
            .from('page_visits')
            .select('source')
            .eq('store_domain', storeDomain);

          // 3. Load Pixel Settings for badges
          const { data: pixelData } = await insforge.database
            .from('store_pixels')
            .select('facebook_enabled, facebook_pixel_id, tiktok_enabled, tiktok_pixel_id, snapchat_enabled, snapchat_pixel_id')
            .eq('user_id', ctx.targetUserId)
            .maybeSingle();

          if (pixelData && isMounted) {
            setPixelsActive({
              facebook: !!(pixelData.facebook_enabled && pixelData.facebook_pixel_id),
              tiktok: !!(pixelData.tiktok_enabled && pixelData.tiktok_pixel_id),
              snapchat: !!(pixelData.snapchat_enabled && pixelData.snapchat_pixel_id)
            });
          }

          // 4. Compute Traffic Stats
          const visits = visitsData || [];
          const orders = ordersData || [];

          const sourceLabels: Record<string, string> = {
            facebook: 'فيسبوك (Facebook)',
            tiktok: 'تيك توك (TikTok)',
            instagram: 'إنستغرام (Instagram)',
            snapchat: 'سناب شات (Snapchat)',
            google: 'جوجل (Google)',
            direct: 'زيارات مباشرة (Direct)',
            other: 'مصادر أخرى (Others)'
          };

          const statsBySource = ['facebook', 'tiktok', 'instagram', 'snapchat', 'google', 'direct', 'other'].map(src => {
            const srcVisits = visits.filter((v: any) => v.source === src).length;
            const srcOrders = orders.filter((o: any) => o.source === src).length;
            const srcRevenue = orders.filter((o: any) => o.source === src).reduce((sum: number, o: any) => sum + (Number(o.total_price) || 0), 0);
            const conversionRate = srcVisits > 0 ? ((srcOrders / srcVisits) * 100).toFixed(1) : '0.0';

            return {
              key: src,
              label: sourceLabels[src] || src,
              visits: srcVisits,
              orders: srcOrders,
              revenue: srcRevenue,
              ctr: conversionRate
            };
          });

          // Sort by visits descending
          statsBySource.sort((a, b) => b.visits - a.visits);
          if (isMounted) {
            setTrafficStats(statsBySource);
          }

          // 2. Load Active Products Count
          const { count: productsCount } = await insforge.database
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('store_domain', storeDomain)
            .eq('status', 'active');

          if (productsCount !== null && isMounted) {
            setStats(prev => ({ ...prev, productsCount }));
          }

          // Load recent orders for map plotting
          const { data: mapOrders } = await insforge.database
            .from('orders')
            .select('id, product_name, customer_name, customer_state, total_price')
            .eq('store_domain', storeDomain)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (mapOrders && isMounted) {
             const initialPoints = mapOrders.map((o: any) => {
                 const coords = WILAYA_COORDS[String(o.customer_state).padStart(2, '0')] || { x: 50, y: 15 };
                 const wName = ALGERIA_WILAYAS.find(w => String(w.code).padStart(2, '0') === String(o.customer_state).padStart(2, '0'))?.name_ar || o.customer_state || '';
                 return {
                     id: o.id,
                     x: coords.x,
                     y: coords.y,
                     product_name: o.product_name || '',
                     customer_name: o.customer_name || '',
                     wilaya: wName,
                     total_price: o.total_price || 0,
                     isNew: false
                 };
             });
             setMapPoints(initialPoints);
          }

          // Setup Realtime Connection for Map
          try {
              if (insforge.realtime.connectionState === 'disconnected') {
                  await insforge.realtime.connect();
              }
              const channelName = `store:${storeDomain}`;
              await insforge.realtime.subscribe(channelName);
              subscribedChannel = channelName;
          } catch (e) {
              console.error('Realtime dashboard map connect error:', e);
          }
        } // end outer if (storeDomain)

        // AI Insight — with 1-hour localStorage cache to save tokens
        if (storeDomain) {
          try {
            const CACHE_KEY = `ai_insight_${storeDomain}`;
            const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

            // Check cache first
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached && isMounted) {
              const { text, timestamp } = JSON.parse(cached);
              if (Date.now() - timestamp < CACHE_TTL) {
                setAiInsight(text);
                setAiLoading(false);
                return; // Skip AI call — use cached insight
              }
            }

            const { data: recentOrders } = await insforge.database
              .from('orders')
              .select('total_price, status, product_name, customer_wilaya')
              .eq('store_domain', storeDomain)
              .order('created_at', { ascending: false })
              .limit(20);

            const { data: recentProducts } = await insforge.database
              .from('products')
              .select('name, price, stock_quantity, status')
              .eq('store_domain', storeDomain)
              .limit(10);

            const activeOrders = (recentOrders || []).filter((o: any) => !['cancelled', 'returned'].includes(o.status));
            const totalRev = activeOrders.reduce((s: number, o: any) => s + (Number(o.total_price) || 0), 0);
            const pending = (recentOrders || []).filter((o: any) => ['pending', 'new', t('t_bf09a1dc')].includes(o.status)).length;
            const lowStock = (recentProducts || []).filter((p: any) => (p.stock_quantity || 0) <= 5 && p.status === 'active');

            const prompt = `أنت محلل تجارة إلكترونية ذكي. بناءً على بيانات المتجر التالية:\n- إجمالي الإيرادات: ${totalRev.toLocaleString()} دب\n- طلبات بانتظار المعالجة: ${pending}\n- منتجات منخفضة المخزون (أقل من 5 وحدات): ${lowStock.map((p: any) => p.name).join(t('t_60c')) || t('t_91cdb22')}\n- عدد المنتجات: ${(recentProducts || []).length}\n- آخر طلب: ${(recentOrders || [])[0]?.product_name || t('t_91cdb22')}\n\nاكتب توصية ذكية واحدة مختصرة (2-3 جمل فقط) بالعربية لمساعدة التاجر على تحسين أداء متجره. لا تدرج مقدمة أو عنواناً، فقط التوصية مباشرة`;

            const completion = await insforge.ai.chat.completions.create({
              model: 'deepseek/deepseek-v3.2',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.5,
              maxTokens: 200,
            });

            const insight = completion.choices[0]?.message?.content?.trim();
            const finalInsight = insight || t('no_ai_data');
            if (isMounted) {
              setAiInsight(finalInsight);
              // Save to cache
              localStorage.setItem(CACHE_KEY, JSON.stringify({ text: finalInsight, timestamp: Date.now() }));
            }
          } catch {
            if (isMounted) setAiInsight(t('ai_analysis_error'));
          } finally {
            if (isMounted) setAiLoading(false);
          }
        } else {
          if (isMounted) setAiLoading(false);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        if (isMounted) setAiLoading(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();

    return () => {
        isMounted = false;
        insforge.realtime.off('INSERT_order', handleNewOrderRealtime);
        if (subscribedChannel) {
            insforge.realtime.unsubscribe(subscribedChannel);
        }
    };
  }, []);



  return (
    <>

      <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Sidebar activePage="Dashboard" />

        {/* Plan Expired Overlay */}
        {planExpired && (
          <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
        )}

        <main className="flex-1 h-full overflow-y-auto scroll-smooth custom-scrollbar relative pt-16 md:pt-0">
          {/* Plan Expiry Warning Banner */}
          {planExpiresAt && !planExpired && (
              <PlanExpiryBanner expiresAt={planExpiresAt} planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="text-start">
                <h1 className="text-[28px] font-black text-[#111827] dark:text-white mb-1 tracking-tight">{t('store_overview')}</h1>
                <p className="text-[#6B7280] dark:text-gray-400 font-medium text-[15px]">{t('welcome_back')} <span className="text-[#111827] dark:text-white font-bold">{userName || t('merchant_label') || 'Merchant'}</span>. {t('dashboard_subtitle') || 'Here is your store performance today.'}</p>
              </div>
              <div className="flex items-center gap-4">
                <StoreLinkButton />
                <NotificationsDropdown />
                <Link href="/inventory/add" className="flex items-center gap-2 px-6 h-12 bg-[#E91E63] hover:bg-[#C2185B] text-white rounded-2xl shadow-lg shadow-[#E91E63]/30 transition-all font-bold text-[15px]">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  {t('add_new_product')}
                </Link>
              </div>
            </div>

            {/* Store Setup Guide */}
            <StoreSetupGuide />

            {/* 🎬 Promotional Video (autoplay, muted, loop) */}
            <div className="mb-8 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-zinc-800 cursor-pointer h-[160px] md:h-[220px]" onClick={() => window.location.href = '/upgrade'}>
              <video 
                src="/images/%D8%B9%D8%B1%D8%B6.mp4" 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* AI Banner */}
            <div className="mb-8 rounded-3xl bg-gradient-to-l from-purple-500 to-[#E91E63] shadow-xl shadow-[#E91E63]/20 p-[2px]">
              <div className="bg-gradient-to-l from-purple-600/90 to-[#E91E63]/90 rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 z-10 w-full">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                    {aiLoading
                      ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <span className="material-symbols-outlined text-white text-[32px]">auto_awesome</span>
                    }
                  </div>
                  <div className="flex-1 text-center md:text-start">
                    <h3 className="text-white font-bold text-xl md:text-2xl mb-2">
                      {t('ai_assistant')}
                      {aiLoading && <span className="text-white/60 text-sm font-medium mx-2">{t('analyzing')}</span>}
                    </h3>
                    <p className={`text-white/90 font-medium text-[15px] leading-relaxed max-w-3xl transition-all duration-500 ${aiLoading ? 'animate-pulse' : ''}`}>
                      {aiLoading
                        ? t('analyzing_data')
                        : aiInsight || t('no_ai_data')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center h-44">
                <div className="flex justify-between items-start w-full mb-4">
                  <div className="bg-[#E91E63]/10 w-12 h-12 flex items-center justify-center rounded-2xl text-[#E91E63]">
                    <span className="material-symbols-outlined text-[24px]">payments</span>
                  </div>
                  <div className="bg-[#dcfce7] dark:bg-[#dcfce7]/10 text-[#166534] dark:text-[#4ade80] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#bbf7d0]/50 dark:border-transparent">
                    +12.5%
                  </div>
                </div>
                <div className="w-full text-center mt-2">
                  <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mb-1">{t('total_sales')}</p>
                  <h3 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">{stats.sales.toLocaleString()} <span className="text-lg font-bold text-[#6B7280] dark:text-gray-400">{t('currency')}</span></h3>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center h-44">
                <div className="flex justify-between items-start w-full mb-4">
                  <div className="bg-[#e0f2fe] dark:bg-[#e0f2fe]/10 w-12 h-12 flex items-center justify-center rounded-2xl text-[#0284c7]">
                    <span className="material-symbols-outlined text-[24px]">trending_up</span>
                  </div>
                  <div className="bg-[#dcfce7] dark:bg-[#dcfce7]/10 text-[#166534] dark:text-[#4ade80] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#bbf7d0]/50 dark:border-transparent">
                    +2.1%
                  </div>
                </div>
                <div className="w-full text-center mt-2">
                  <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mb-1">{t('total_orders')}</p>
                  <h3 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">{stats.ordersCount.toLocaleString()}</h3>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center h-44">
                <div className="flex justify-between items-start w-full mb-4">
                  <div className="bg-[#f3e8ff] dark:bg-[#f3e8ff]/10 w-12 h-12 flex items-center justify-center rounded-2xl text-[#9333ea]">
                    <span className="material-symbols-outlined text-[24px]">image_search</span>
                  </div>
                  <div className="bg-[#f3e8ff] dark:bg-[#f3e8ff]/10 text-[#7e22ce] dark:text-[#a855f7] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#e9d5ff]/50 dark:border-transparent">
                    
                    {t('t_185349')}
                  </div>
                </div>
                <div className="w-full text-center mt-2">
                  <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mb-1">{t('active_products')}</p>
                  <h3 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">{stats.productsCount.toLocaleString()}</h3>
                </div>
              </div>
              {/* Card 4 */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center h-44">
                <div className="flex justify-between items-start w-full mb-4">
                  <div className="bg-[#ffedd5] dark:bg-[#ffedd5]/10 w-12 h-12 flex items-center justify-center rounded-2xl text-[#ea580c]">
                    <span className="material-symbols-outlined text-[24px]">groups</span>
                  </div>
                  <div className="bg-[#ffedd5] dark:bg-[#ffedd5]/10 text-[#c2410c] dark:text-[#fb923c] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#fed7aa]/50 dark:border-transparent">
                    
                    {t('t_185349')}
                  </div>
                </div>
                <div className="w-full text-center mt-2">
                  <p className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px] mb-1">{t('total_customers')}</p>
                  <h3 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">{stats.customersCount.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* Wide column (Products Table) */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm  border border-gray-100 dark:border-zinc-800 overflow-hidden h-full flex flex-col">
                  <div className="p-8 pb-6 flex items-center justify-between border-b border-gray-50 dark:border-zinc-800">
                    <h2 className="text-xl font-black text-[#111827] dark:text-white">{t('latest_products')}</h2>
                    <Link href="/inventory" className="text-[#E91E63] font-bold text-[15px] hover:underline">{t('view_all')}</Link>
                  </div>
                  <div className="overflow-x-auto flex-1 p-2">
                    <table className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} border-separate border-spacing-y-2 px-6`}>
                      <thead>
                        <tr className="text-[#6B7280] dark:text-gray-400 text-[14px] font-bold">
                          <th className={`font-bold py-4 px-4 w-[35%] ${lang === 'ar' ? 'rounded-r-2xl' : 'rounded-l-2xl'}`}>{t('product')}</th>
                          <th className="font-bold py-4 px-4 text-center">{t('category')}</th>
                          <th className="font-bold py-4 px-4 text-center">{t('price')}</th>
                          <th className="font-bold py-4 px-4 text-center">{t('stock')}</th>
                          <th className="font-bold py-4 px-4 text-center">{t('ai_score')}</th>
                          <th className={`font-bold py-4 px-4 ${lang === 'ar' ? 'rounded-l-2xl text-left' : 'rounded-r-2xl text-right'}`}>{t('status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && products.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-[#6B7280] dark:text-gray-400 font-bold">
                              <SOUQAILoader size="sm" text={t('analyzing')} />
                            </td>
                          </tr>
                        ) : products.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-[#6B7280] dark:text-gray-400 font-bold">{t('no_products')}</td>
                          </tr>
                        ) : (
                          products.map(product => {
                            const templateNames: Record<string, string> = {
                              tech: t('t_7a580c24'),
                              fashion: t('t_596391d5'),
                              perfume: t('t_2ec4087'),
                              food: t('t_8490be1c'),
                              skincare: t('t_536d3f1e'),
                              digital: t('t_10f24f487'),
                              decor: t('t_5a177e91')
                            };
                            const categoryName = product.template ? templateNames[product.template] || t('t_ea9847b9') : t('t_ea9847b9');
                            const stockPrc = Math.min(100, Math.max(0, ((product.stock_quantity || 0) / 100) * 100));
                            const isActive = product.status === 'active';

                            return (
                              <tr key={product.id} className="group cursor-pointer">
                                <td className={`py-4 px-4 ${lang === 'ar' ? 'rounded-r-2xl' : 'rounded-l-2xl'} group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors`}>
                                  <div className="flex items-center gap-4">
                                    <div className="w-[52px] h-[52px] rounded-xl bg-gray-100 border border-gray-200 dark:border-zinc-800/60 dark:border-zinc-800 flex-shrink-0 overflow-hidden">
                                      {product.image_url ? (
                                        <img
                                          src={product.image_url}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                          <span className="material-symbols-outlined text-[22px]">image</span>
                                        </div>
                                      )}
                                    </div>
                                    <Link href={`/inventory/edit/${product.id}`} className={`font-bold text-[#111827] dark:text-white text-[15px] max-w-[150px] leading-tight hover:text-[#E91E63] truncate ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                      {product.name}
                                    </Link>
                                  </div>
                                </td>
                                <td className="py-4 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors text-center">
                                  <span className="text-[#6B7280] dark:text-gray-400 font-bold text-[14px]">{categoryName}</span>
                                </td>
                                <td className="py-4 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors text-center">
                                  <p className="font-black text-[#111827] dark:text-white text-[15px]">{product.price?.toLocaleString()} <span className="text-xs text-[#6B7280] dark:text-gray-400">{t('currency')}</span></p>
                                </td>
                                <td className="py-4 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors">
                                  <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                                    <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                      <div className={`h-full rounded-full ${stockPrc > 20 ? 'bg-[#E91E63]' : 'bg-[#f59e0b]'}`} style={{ width: `${stockPrc}%` }}></div>
                                    </div>
                                    <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400">{product.stock_quantity || 0} {t('unit')}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors text-center">
                                  <span className="inline-flex items-center justify-center bg-[#dcfce7] text-[#166534] dark:bg-[#dcfce7]/10 dark:text-[#4ade80] px-2.5 py-1 rounded-lg text-xs font-black">94%</span>
                                </td>
                                <td className={`py-4 px-4 ${lang === 'ar' ? 'rounded-l-2xl text-left' : 'rounded-r-2xl text-right'} group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30 transition-colors`}>
                                  <div className={`inline-flex items-center gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-start'} text-[14px]`}>
                                    <span className={`font-bold ${isActive ? 'text-[#166534] dark:text-[#4ade80]' : 'text-[#9ca3af]'}`}>{isActive ? t('active') : t('draft')}</span>
                                    <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#22c55e]' : 'bg-[#d1d5db] dark:bg-[#6b7280]'}`}></div>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Narrow column (Widgets) */}
              <div className="flex flex-col gap-6">
                {/* Ad Channel Statistics - Newly Designed Glassmorphic Layout */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-sm p-6 flex flex-col text-[#111827] dark:text-white">
                  <div className="mb-4 text-start">
                    <h2 className="text-[18px] font-black text-[#111827] dark:text-white mb-1">
                      {lang === 'ar' ? 'مركز مصادر الزوار والإعلانات' : 'Traffic Sources & Ads Center'}
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                      {lang === 'ar' ? 'تتبع فوري لأداء قنوات الترويج الإعلانية والزيارات' : 'Real-time performance of promotion channels'}
                    </p>
                  </div>

                  {/* Tabs selector */}
                  <div className="flex bg-gray-50 dark:bg-zinc-950/60 backdrop-blur p-1 rounded-xl border border-gray-100 dark:border-zinc-800/80 mb-5 text-[12px] font-bold">
                    <button 
                      onClick={() => setActiveTab('channels')}
                      className={`flex-1 py-2 text-center rounded-lg transition-colors ${activeTab === 'channels' ? 'bg-[#E91E63] text-white shadow' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {lang === 'ar' ? 'القنوات' : 'Channels'}
                    </button>
                    <button 
                      onClick={() => setActiveTab('performance')}
                      className={`flex-1 py-2 text-center rounded-lg transition-colors ${activeTab === 'performance' ? 'bg-[#E91E63] text-white shadow' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {lang === 'ar' ? 'الأداء' : 'Performance'}
                    </button>
                    <button 
                      onClick={() => setActiveTab('funnel')}
                      className={`flex-1 py-2 text-center rounded-lg transition-colors ${activeTab === 'funnel' ? 'bg-[#E91E63] text-white shadow' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {lang === 'ar' ? 'القمع والجمهور' : 'Funnel & Geo'}
                    </button>
                  </div>

                  {/* Tab contents */}
                  {activeTab === 'channels' && (
                    <div className="flex flex-col gap-4">
                      {/* Pixel status capsule bar */}
                      <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-full px-4 py-2 flex items-center justify-between shadow-md">
                        {[
                          { label: 'Snap', key: 'snapchat_enabled', color: 'text-yellow-500 dark:text-yellow-400' },
                          { label: 'TikTok', key: 'tiktok_enabled', color: 'text-gray-900 dark:text-white' },
                          { label: 'FB', key: 'facebook_enabled', color: 'text-blue-600 dark:text-blue-500' },
                        ].map(p => (
                          <div key={p.label} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span className="font-bold">{p.label}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${pixelsActive[p.key.replace('_enabled', '') as 'facebook' | 'tiktok' | 'snapchat'] ? 'bg-[#E91E63] shadow-[0_0_8px_#E91E63]' : 'bg-gray-300 dark:bg-zinc-700'}`}></span>
                          </div>
                        ))}
                      </div>

                      {/* Stacked glassmorphic channels */}
                      {(() => {
                        const directStats = trafficStats.find(s => s.key === 'direct') || { visits: 0, orders: 0, revenue: 0, ctr: '0.0' };
                        const facebookStats = trafficStats.find(s => s.key === 'facebook') || { visits: 0, orders: 0, revenue: 0, ctr: '0.0' };
                        const instagramStats = trafficStats.find(s => s.key === 'instagram') || { visits: 0, orders: 0, revenue: 0, ctr: '0.0' };
                        const tiktokStats = trafficStats.find(s => s.key === 'tiktok') || { visits: 0, orders: 0, revenue: 0, ctr: '0.0' };
                        const snapchatStats = trafficStats.find(s => s.key === 'snapchat') || { visits: 0, orders: 0, revenue: 0, ctr: '0.0' };

                        const channelsData = [
                          { key: 'direct', name: lang === 'ar' ? 'زيارة مباشرة' : 'Direct', platform: 'direct', color: '#10B981', iconBg: 'bg-emerald-500', visits: directStats.visits, orders: directStats.orders, revenue: directStats.revenue, ctr: directStats.ctr },
                          { key: 'facebook', name: lang === 'ar' ? 'فيسبوك' : 'Facebook', platform: 'facebook', color: '#1877F2', iconBg: 'bg-blue-600', visits: facebookStats.visits, orders: facebookStats.orders, revenue: facebookStats.revenue, ctr: facebookStats.ctr },
                          { key: 'instagram', name: lang === 'ar' ? 'إنستغرام' : 'Instagram', platform: 'instagram', color: '#E1306C', iconBg: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600', visits: instagramStats.visits, orders: instagramStats.orders, revenue: instagramStats.revenue, ctr: instagramStats.ctr },
                          { key: 'tiktok', name: lang === 'ar' ? 'تيك توك' : 'TikTok', platform: 'tiktok', color: '#00F2EA', iconBg: 'bg-black border border-zinc-800', visits: tiktokStats.visits, orders: tiktokStats.orders, revenue: tiktokStats.revenue, ctr: tiktokStats.ctr },
                          { key: 'snapchat', name: lang === 'ar' ? 'سناب شات' : 'Snapchat', platform: 'snapchat', color: '#FFFC00', iconBg: 'bg-[#FFFC00] text-black', visits: snapchatStats.visits, orders: snapchatStats.orders, revenue: snapchatStats.revenue, ctr: snapchatStats.ctr },
                        ];

                        const totalVisits = channelsData.reduce((sum, c) => sum + c.visits, 0) || 1;

                        return channelsData.map(src => {
                          const trafficPct = Math.round((src.visits / totalVisits) * 100);
                          const isHighCr = Number(src.ctr) >= 2.0;

                          return (
                            <div key={src.key} className="bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-4 relative overflow-hidden transition-all hover:border-gray-200 dark:hover:border-zinc-700 flex flex-col gap-3">
                              {/* Icon, name, CR badge */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg ${src.iconBg} flex items-center justify-center text-white shadow-sm shrink-0`}>
                                    <SocialIcon platform={src.platform} />
                                  </div>
                                  <div className="text-start">
                                    <span className="font-bold text-[13px] text-gray-900 dark:text-white block leading-tight">{src.name}</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{trafficPct}% {lang === 'ar' ? 'من الحركة' : 'of traffic'}</span>
                                  </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${
                                  isHighCr ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                }`}>
                                  CR {src.ctr}% {isHighCr ? '↑' : '↓'}
                                </div>
                              </div>
                              
                              {/* Circular speedometer & sparkline */}
                              <div className="flex items-center justify-between px-1">
                                <div className="flex flex-col items-center">
                                  <CustomGauge value={Number(src.ctr)} color={src.color} />
                                  <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold mt-1">{(src.platform === 'direct' ? 'Direct' : src.name) + ' source'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <Sparkline color={src.color} />
                                  <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold mt-1">{src.visits} {lang === 'ar' ? 'زيارة' : 'visits'}</span>
                                </div>
                              </div>
                              
                              {/* Bottom metrics grid */}
                              <div className="grid grid-cols-3 gap-2 text-center bg-gray-100/50 dark:bg-zinc-950/60 rounded-xl py-2 px-1 border border-gray-200/50 dark:border-zinc-800/40">
                                <div>
                                  <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 block mb-0.5">{lang === 'ar' ? 'الزيارات' : 'Visits'}</span>
                                  <span className="text-[12px] font-black text-gray-900 dark:text-white">{src.visits.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 block mb-0.5">{lang === 'ar' ? 'الطلبيات' : 'Orders'}</span>
                                  <span className="text-[12px] font-black text-gray-900 dark:text-white">{src.orders.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 block mb-0.5">{lang === 'ar' ? 'القيمة' : 'Revenue'}</span>
                                  <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">${src.revenue.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  {activeTab === 'performance' && (
                    <div className="flex flex-col gap-6 items-center py-4">
                      {(() => {
                        const directStats = trafficStats.find(s => s.key === 'direct') || { visits: 0 };
                        const facebookStats = trafficStats.find(s => s.key === 'facebook') || { visits: 0 };
                        const instagramStats = trafficStats.find(s => s.key === 'instagram') || { visits: 0 };
                        const tiktokStats = trafficStats.find(s => s.key === 'tiktok') || { visits: 0 };
                        const snapchatStats = trafficStats.find(s => s.key === 'snapchat') || { visits: 0 };

                        const channelsData = [
                          { key: 'direct', name: lang === 'ar' ? 'زيارة مباشرة' : 'Direct', color: '#10B981', visits: directStats.visits },
                          { key: 'facebook', name: lang === 'ar' ? 'فيسبوك' : 'Facebook', color: '#1877F2', visits: facebookStats.visits },
                          { key: 'instagram', name: lang === 'ar' ? 'إنستغرام' : 'Instagram', color: '#E1306C', visits: instagramStats.visits },
                          { key: 'tiktok', name: lang === 'ar' ? 'تيك توك' : 'TikTok', color: '#00F2EA', visits: tiktokStats.visits },
                          { key: 'snapchat', name: lang === 'ar' ? 'سناب شات' : 'Snapchat', color: '#FFFC00', visits: snapchatStats.visits },
                        ];
                        const totalAllVisits = channelsData.reduce((sum, c) => sum + c.visits, 0);

                        return (
                          <>
                            {/* Concentric progress rings */}
                            <div className="flex flex-col items-center relative">
                              <ConcentricRings data={channelsData.map((c) => ({
                                name: c.name,
                                value: totalAllVisits > 0 ? Math.min(((c.visits / totalAllVisits) * 100) + 15, 100) : 0,
                                color: c.color
                              }))} />
                              <div className="absolute inset-0 flex flex-col items-center justify-center mt-3">
                                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold">{lang === 'ar' ? 'الزيارات الإجمالية' : 'Total Visits'}</span>
                                <span className="text-[18px] font-black text-gray-900 dark:text-white">{totalAllVisits.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 dark:text-zinc-400 w-full px-4">
                              {channelsData.map(c => (
                                <div key={c.key} className="flex items-center gap-1.5 justify-start">
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                                  <span className="truncate">{c.name}</span>
                                </div>
                              ))}
                            </div>
                            
                            <hr className="w-full border-gray-100 dark:border-zinc-800" />
                            
                            {/* Traffic Over Time line chart */}
                            <div className="w-full px-4 text-start">
                              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 block mb-2">{lang === 'ar' ? 'إجمالي حركة المرور بمرور الوقت' : 'Total Traffic Over Time'}</span>
                              <div className="w-full h-32 relative flex items-end">
                                <svg className="w-full h-full opacity-80" viewBox="0 0 100 40" preserveAspectRatio="none">
                                  <path d="M 0 35 Q 25 15, 50 20 T 100 5" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                                  <path d="M 0 37 Q 25 22, 50 30 T 100 12" fill="none" stroke="#1877F2" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M 0 38 Q 25 32, 50 28 T 100 18" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M 0 39 Q 25 35, 50 32 T 100 24" fill="none" stroke="#00F2EA" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {activeTab === 'funnel' && (
                    <div className="flex flex-col gap-6 py-2 text-start">
                      {(() => {
                        const directStats = trafficStats.find(s => s.key === 'direct') || { visits: 0, orders: 0 };
                        const facebookStats = trafficStats.find(s => s.key === 'facebook') || { visits: 0, orders: 0 };
                        const instagramStats = trafficStats.find(s => s.key === 'instagram') || { visits: 0, orders: 0 };
                        const tiktokStats = trafficStats.find(s => s.key === 'tiktok') || { visits: 0, orders: 0 };
                        const snapchatStats = trafficStats.find(s => s.key === 'snapchat') || { visits: 0, orders: 0 };

                        const channelsData = [
                          { visits: directStats.visits, orders: directStats.orders },
                          { visits: facebookStats.visits, orders: facebookStats.orders },
                          { visits: instagramStats.visits, orders: instagramStats.orders },
                          { visits: tiktokStats.visits, orders: tiktokStats.orders },
                          { visits: snapchatStats.visits, orders: snapchatStats.orders },
                        ];
                        const totalAllVisits = channelsData.reduce((sum, c) => sum + c.visits, 0);
                        const totalAllOrders = channelsData.reduce((sum, c) => sum + c.orders, 0);

                        return (
                          <>
                            {/* Conversion Funnel */}
                            <div className="flex flex-col gap-3">
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">{lang === 'ar' ? 'قمع التحويل' : 'Conversion Funnel'}</span>
                              {[
                                { label: 'View', labelAr: 'زيارة الصفحة', val: totalAllVisits, color: 'from-cyan-500 to-blue-600', pct: 100 },
                                { label: 'Click', labelAr: 'نقر على المنتج', val: Math.round(totalAllVisits * 0.6), color: 'from-emerald-400 to-teal-500', pct: totalAllVisits > 0 ? 60 : 0 },
                                { label: 'Cart', labelAr: 'إضافة للسلة', val: Math.round(totalAllVisits * 0.25), color: 'from-pink-500 to-purple-600', pct: totalAllVisits > 0 ? 25 : 0 },
                                { label: 'Purchase', labelAr: 'إتمام الشراء', val: totalAllOrders, color: 'from-yellow-400 to-orange-500', pct: totalAllVisits > 0 ? Math.round((totalAllOrders / totalAllVisits) * 100) : 0 },
                              ].map(bar => (
                                <div key={bar.label} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                    <span>{lang === 'ar' ? bar.labelAr : bar.label}</span>
                                    <span>{bar.val.toLocaleString()} ({bar.pct}%)</span>
                                  </div>
                                  <div className="w-full h-3 bg-gray-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-800">
                                    <div 
                                      className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-1000`}
                                      style={{ width: `${bar.pct}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <hr className="w-full border-gray-100 dark:border-zinc-800" />
                            
                            {/* World Heatmap outline */}
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">{lang === 'ar' ? 'الديموغرافية الجماهيرية' : 'Geographic Audience'}</span>
                              <div className="h-36 relative rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/80 flex items-center justify-center overflow-hidden">
                                <svg className="w-full h-full opacity-10" viewBox="0 0 1000 500" fill="currentColor">
                                  <path d="M150 150h50v50h-50zM250 100h80v40h-80zM350 200h120v80h-120zM600 120h200v100h-200zM800 250h100v150h-100zM180 350h80v80h-80zM480 320h150v100h-150z" />
                                </svg>
                                <div className="absolute top-1/4 left-1/4 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                                <div className="absolute top-1/4 left-1/4 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>

                                <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
                                <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"></div>

                                <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_#f472b6]"></div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Live Orders Map */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 flex flex-col h-full min-h-[400px]">
                  <div className="flex items-center justify-between mb-2 text-start">
                    <div>
                      <h2 className="text-[20px] font-black text-[#111827] dark:text-white mb-1">
                        {lang === 'ar' ? 'خريطة الطلبات' : 'Orders Map'}
                      </h2>
                    </div>
                  </div>

                  {/* Map Visual Container */}
                  <div className="flex-1 relative bg-slate-50 dark:bg-zinc-950/50 rounded-2xl border border-gray-100 dark:border-zinc-800/50 mt-4 overflow-hidden flex items-center justify-center min-h-[250px]">
                     {/* Map Grid Pattern */}
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30"></div>
                     
                     {/* Algeria Outlines SVG */}
                     <svg viewBox="0 0 1357.4062 1324.2812" className="w-full h-full max-h-[300px] object-contain relative z-10 p-2 select-none">
                         <AlgeriaMapPaths 
                             onHoverWilaya={setHoveredWilaya} 
                             hoveredWilaya={hoveredWilaya ? Object.keys(WILAYA_NAMES).find(key => WILAYA_NAMES[key] === hoveredWilaya) : null} 
                         />
                         
                         {/* Plot Order Dots */}
                         <g transform="translate(1132.1875,-994.78125)">
                             {mapPoints.map((point: any) => (
                                 <g key={point.id}>
                                     {/* Glowing Ring */}
                                     {point.isNew && (
                                         <circle cx={point.x} cy={point.y} r="25" className="fill-[#E91E63] opacity-50 animate-ping" />
                                     )}
                                     {/* Central Dot */}
                                     <circle cx={point.x} cy={point.y} r="8" className="fill-[#E91E63] filter drop-shadow-[0_0_12px_#E91E63] transition-all" />
                                 </g>
                             ))}
                         </g>
                     </svg>

                     {/* Hovered Wilaya Name Overlay */}
                     {hoveredWilaya && (
                         <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-gray-100 dark:border-zinc-800/80 px-3.5 py-1.5 rounded-xl shadow-lg z-20 text-[13px] font-black text-[#111827] dark:text-white">
                             {hoveredWilaya}
                         </div>
                     )}

                     {/* Latest Order Pop Notification Over the Map */}
                     {latestPop && (
                         <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-gray-100 dark:border-zinc-800/80 p-3.5 rounded-2xl shadow-xl z-20 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
                             <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-[#E91E63] flex items-center justify-center shrink-0">
                                 <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                             </div>
                             <div className="flex-1 min-w-0 text-start">
                                 <p className="text-[13px] font-black text-[#111827] dark:text-white truncate">
                                     {latestPop.product_name}
                                 </p>
                                 <p className="text-[11px] text-[#6B7280] dark:text-gray-400 font-bold">
                                     {latestPop.customer_name} ({latestPop.wilaya}) • {latestPop.total_price} د.ج
                                 </p>
                             </div>
                         </div>
                     )}
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

// Custom circular gauge speedometer component
const CustomGauge = ({ value, color, max = 20 }: { value: number; color: string; max?: number }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const angle = -90 + (percentage / 100) * 180;
    
    return (
        <div className="relative w-16 h-8 flex items-end justify-center overflow-hidden">
            <svg className="w-16 h-8" viewBox="0 0 100 50">
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-gray-200 dark:text-zinc-800"
                />
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (percentage / 100) * 125.6}
                    className="transition-all duration-1000"
                />
                <circle cx="50" cy="50" r="4" className="fill-slate-400 dark:fill-slate-600" />
                <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    transform={`rotate(${angle} 50 50)`}
                    className="transition-all duration-1000 origin-bottom text-slate-400 dark:text-slate-500"
                />
            </svg>
        </div>
    );
};

// Custom sparkline wave graph component
const Sparkline = ({ color }: { color: string }) => {
    return (
        <svg className="w-14 h-7" viewBox="0 0 100 30" fill="none">
            <path
                d="M 0 25 Q 15 5, 30 18 T 60 10 T 90 22 T 100 5"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M 0 25 Q 15 5, 30 18 T 60 10 T 90 22 T 100 5 L 100 30 L 0 30 Z"
                fill={`url(#grad-${color.replace('#', '')})`}
                opacity="0.15"
            />
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
};

// Social media icon component
const SocialIcon = ({ platform }: { platform: string }) => {
    const size = "w-4 h-4 fill-current";
    switch(platform) {
        case 'facebook': return <svg className={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>;
        case 'instagram': return <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
        case 'tiktok': return <svg className={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.31 16.29.93c-.15 1.52.32 3.03 1.3 4.2 1.25 1.48 3.07 2.37 5.04 2.47v3.52c-1.84-.04-3.62-.73-5.02-1.95v7.24c0 4.19-3.4 7.59-7.59 7.59-3.86 0-7.07-2.9-7.53-6.68C1.86 12.98 5.16 9.4 9.17 9.4c.59 0 1.17.07 1.73.2V.02h1.63zm-1.63 13c0-2.09-1.7-3.79-3.79-3.79-2.09 0-3.79 1.7-3.79 3.79s1.7 3.79 3.79 3.79 3.79-1.7 3.79-3.79z"/></svg>;
        case 'snapchat': return <svg className={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.015 2c-.628 0-1.25.04-1.854.122-.162.023-.326.061-.486.115-.71.24-1.393.618-2.003 1.11-1.365 1.1-2.39 2.656-2.94 4.398-.242.75-.332 1.558-.332 2.378 0 1.229.356 2.4 1.01 3.4.153.237.264.502.327.778.077.306-.017.625-.236.837l-.822.78c-.5.474-.754 1.144-.7 1.83.05.688.423 1.3 1.01 1.624.743.411 1.545.698 2.378.857.34.065.65.215.91.442.525.46 1.2.716 1.9.743.704-.027 1.376-.283 1.902-.743.26-.227.57-.377.91-.442.833-.16 1.635-.446 2.378-.857.588-.323.962-.936 1.012-1.624.053-.686-.2-1.356-.7-1.83l-.823-.78c-.218-.212-.313-.53-.235-.837.062-.276.174-.54.327-.778.654-1 1.01-2.171 1.01-3.4 0-.82-.09-1.628-.332-2.378-.55-1.742-1.575-3.298-2.94-4.398-.61-.492-1.293-.87-2.003-1.11a1.943 1.943 0 0 0-.486-.115A20.443 20.443 0 0 0 12.015 2z" /></svg>;
        case 'direct': return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
        default: return <span className="material-symbols-outlined text-[16px]">arrow_circle_right</span>;
    }
};

// Concentric progress rings SVG component
const ConcentricRings = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
    return (
        <svg className="w-36 h-36" viewBox="0 0 120 120">
            {data.map((item, idx) => {
                const radius = 25 + idx * 8;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (item.value / 100) * circumference;
                return (
                    <g key={item.name}>
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#1E293B"
                            strokeWidth="3.5"
                            className="opacity-20 dark:opacity-100"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth="3.5"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                            className="transition-all duration-1000"
                            style={{ filter: `drop-shadow(0 0 4px ${item.color}40)` }}
                        />
                    </g>
                );
            })}
        </svg>
    );
};
