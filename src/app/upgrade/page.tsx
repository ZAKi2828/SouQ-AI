'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import Sidebar from '@/components/Sidebar';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';

function UpgradePageContent() {
    const { t, lang } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Map DB plan values to Arabic display names and vice versa
    const planDbToArabic: Record<string, string> = { 'free': t('t_217db6d41'), 'pro': t('t_74dcec9f'), 'vip': t('t_15187dfac'), 'expired': t('t_e1f3b5d') };
    const planArabicToDb: Record<string, string> = { [t('t_217db6d41')]: 'free', [t('t_74dcec9f')]: 'pro', [t('t_15187dfac')]: 'vip' };
    const [currentPlan, setCurrentPlan] = useState(t('t_217db6d41'));
    const [isExpired, setIsExpired] = useState(false);
    const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
    const [previousPlan, setPreviousPlan] = useState<string>('free');
    const [proPrice, setProPrice] = useState('1000');
    const [vipPrice, setVipPrice] = useState('2500');
    const [loading, setLoading] = useState(true);
    const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
    const [storeName, setStoreName] = useState('');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [aiTextQuota, setAiTextQuota] = useState({ free: 0, pro: 0, vip: 'unlimited' });
    const [aiImageQuota, setAiImageQuota] = useState({ free: 0, pro: 0, vip: 'unlimited' });
    const [appPlans, setAppPlans] = useState<any>(null);
    const [customDomainPlans, setCustomDomainPlans] = useState<any>({ vip: true, pro: false, free: false });
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'canceled' | 'activating'>('idle');
    const [activatedPlan, setActivatedPlan] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const ctx = await getStoreContext();
                if (!ctx) { router.push('/login'); return; }

                // RBAC Guard: Only owners can manage upgrades
                if (ctx.role !== 'owner') {
                    router.push('/merchant');
                    return;
                }

                const userId = ctx.uid;

                // Get profile
                const { data: profile } = await insforge.database
                    .from('profiles')
                    .select('plan, store_name, full_name, plan_expires_at')
                    .eq('id', userId)
                    .single();

                if (profile) {
                    const dbPlan = profile.plan || 'free';
                    
                    // Check if plan is expired
                    if (dbPlan === 'expired') {
                        setIsExpired(true);
                        setCurrentPlan(t('t_e1f3b5d'));
                    } else if (profile.plan_expires_at) {
                        const expiresAt = new Date(profile.plan_expires_at);
                        setPlanExpiresAt(profile.plan_expires_at);
                        if (expiresAt < new Date()) {
                            setIsExpired(true);
                            setCurrentPlan(t('t_e1f3b5d'));
                        } else {
                            setCurrentPlan(planDbToArabic[dbPlan] || dbPlan);
                        }
                    } else {
                        setCurrentPlan(planDbToArabic[dbPlan] || dbPlan);
                    }
                    setPreviousPlan(dbPlan === 'expired' ? 'free' : dbPlan);
                    setStoreName(profile.store_name || profile.full_name || '');
                }

                // Get platform settings (prices)
                const { data: settings } = await insforge.database
                    .from('platform_settings')
                    .select('pro_price, vip_price, app_plans, custom_domain_plans')
                    .eq('id', 1)
                    .single();

                if (settings) {
                    setProPrice(settings.pro_price || '1000');
                    setVipPrice(settings.vip_price || '2500');
                    setAppPlans(settings.app_plans);
                    if (settings.custom_domain_plans) setCustomDomainPlans(settings.custom_domain_plans);
                }

                // Get AI quotas
                const { data: aiSettings } = await insforge.database
                    .from('ai_settings')
                    .select('free_text_quota, pro_text_quota, vip_text_quota, free_image_quota, pro_image_quota, vip_image_quota')
                    .eq('id', 1)
                    .single();

                if (aiSettings) {
                    setAiTextQuota({
                        free: aiSettings.free_text_quota || 0,
                        pro: aiSettings.pro_text_quota || 0,
                        vip: aiSettings.vip_text_quota || 'unlimited'
                    });
                    setAiImageQuota({
                        free: aiSettings.free_image_quota || 0,
                        pro: aiSettings.pro_image_quota || 0,
                        vip: aiSettings.vip_image_quota || 'unlimited'
                    });
                }

            } catch (err) {
                console.error('Error loading upgrade data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [router]);

    // Handle payment callback from Chargily
    useEffect(() => {
        const success = searchParams?.get('success');
        const canceled = searchParams?.get('canceled');
        const planParam = searchParams?.get('plan');

        if (success === 'true') {
            setPaymentStatus('activating');
            const planName = planParam ? decodeURIComponent(planParam) : '';
            confirmPlan(planName);
        } else if (canceled === 'true') {
            setPaymentStatus('canceled');
        }
    }, [searchParams]);

    const confirmPlan = async (plan: string) => {
        try {
            const { data: sessionData } = await insforge.auth.getCurrentSession();
            const userId = sessionData?.session?.user?.id;

            // If plan name is missing from URL, detect it from profile
            let finalPlan = plan;
            if (!finalPlan && userId) {
                const { data: profile } = await insforge.database
                    .from('profiles')
                    .select('plan')
                    .eq('id', userId)
                    .single();
                // If already upgraded by webhook, just show success
                if (profile?.plan && profile.plan !== 'free') {
                    const displayName = planDbToArabic[profile.plan] || profile.plan;
                    setActivatedPlan(displayName);
                    setCurrentPlan(displayName);
                    setPaymentStatus('success');
                    return;
                }
            }

            if (!finalPlan) {
                // Payment succeeded on Chargily but we can't determine which plan
                // Show success anyway since payment went through
                setActivatedPlan(t('t_6d08afdb'));
                setPaymentStatus('success');
                return;
            }

            if (sessionData?.session?.user) {
                const token = sessionData.session.accessToken || (sessionData.session as any).access_token;
                const response = await fetch('/api/subscriptions/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ plan: finalPlan })
                });

                const data = await response.json();
                if (data.success) {
                    setActivatedPlan(finalPlan);
                    setCurrentPlan(finalPlan);
                    setPaymentStatus('success');
                    return;
                }
            }

            // Even if confirm API failed, the payment was successful on Chargily
            // The webhook will handle the activation. Show success to the user.
            setActivatedPlan(finalPlan || t('t_6d08afdb'));
            setPaymentStatus('success');

        } catch (error) {
            console.error('Plan confirmation error:', error);
            // Payment DID succeed on Chargily, so don't show "canceled"
            // The webhook will eventually activate the plan
            setActivatedPlan(plan || t('t_6d08afdb'));
            setPaymentStatus('success');
        }
    };

    const handleUpgrade = async (plan: string) => {
        try {
            setUpgradeLoading(plan);
            const { data: sessionData } = await insforge.auth.getCurrentSession();
            if (!sessionData?.session?.user) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData.session.accessToken || (sessionData.session as any).access_token}`
                },
                body: JSON.stringify({ plan, billingCycle, action: isExpired ? 'renew' : 'upgrade' })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(t('t_f708123f'));
            }
        } catch (error) {
            console.error('Upgrade Error:', error);
            alert(t('t_103ee9ada'));
        } finally {
            setUpgradeLoading(null);
        }
    };

    const getYearlyPrice = (monthly: string) => {
        const m = Number(monthly);
        return Math.round(m * 10); // 2 months free
    };

    const isCurrentPlan = (plan: string) => !isExpired && currentPlan === plan;
    const isUpgrade = (plan: string) => {
        if (isExpired) return true; // When expired, all plans are available
        const ranks: Record<string, number> = { [t('t_217db6d41')]: 0, [t('t_74dcec9f')]: 1, [t('t_15187dfac')]: 2 };
        return (ranks[plan] || 0) > (ranks[currentPlan] || 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    const plans = [
        {
            id: t('t_217db6d41'),
            name: t('t_217db6d41'),
            subtitle: t('t_1cd3b78ac'),
            icon: '🚀',
            price: '0',
            color: 'slate',
            gradient: 'from-slate-500 to-slate-600',
            borderColor: 'border-slate-200 dark:border-zinc-800',
            bgCard: 'bg-white dark:bg-zinc-900',
            features: [
                { text: <><span className="font-bold mx-1">{appPlans?.products_limit?.free || 20}</span> منتج</>, icon: 'inventory_2' },
                { text: <><span className="font-bold mx-1">{appPlans?.orders_limit?.free || 50}</span> طلب / شهرياً</>, icon: 'shopping_cart' },
                { text: <><span className="font-bold mx-1">{appPlans?.team_limit?.free || 1}</span> عضو فريق</>, icon: 'badge' },
                { text: <><span className="font-bold mx-1">{aiTextQuota.free}</span>{t("t_94f4ef7f")}</>, icon: 'text_fields' },
                { text: <><span className="font-bold mx-1">{aiImageQuota.free}</span>{t("t_5d4072e6")}</>, icon: 'image' },
                { text: t('t_507b84ca'), icon: 'web' },
                { text: t('t_cba68fae'), icon: 'remove_shopping_cart' },
                { text: t('t_84007925'), icon: 'branding_watermark' },
                ...(customDomainPlans?.free ? [{ text: t('t_4ed755bb'), icon: 'public' }] : []),
            ],
            limitations: [
                t('t_17863738'),
                t('t_2378fec1'),
                t('t_717bc1c9'),
            ]
        },
        {
            id: t('t_74dcec9f'),
            name: t('t_74dcec9f'),
            subtitle: t('t_663d4f7f'),
            icon: '⭐',
            price: proPrice,
            color: 'primary',
            gradient: 'from-pink-500 to-rose-500',
            borderColor: 'border-pink-300 dark:border-pink-900/50',
            bgCard: 'bg-gradient-to-b from-pink-50/80 to-white dark:from-pink-950/20 dark:to-zinc-900',
            popular: true,
            features: [
                { text: <><span className="font-bold mx-1">{appPlans?.products_limit?.pro || 100}</span> منتج</>, icon: 'inventory_2' },
                { text: <><span className="font-bold mx-1">{appPlans?.orders_limit?.pro || 500}</span> طلب / شهرياً</>, icon: 'shopping_cart' },
                { text: <><span className="font-bold mx-1">{appPlans?.team_limit?.pro || 3}</span>{t("t_dba1904e")}</>, icon: 'badge' },
                { text: <><span className="font-bold mx-1">{aiTextQuota.pro}</span>{t("t_94f4ef7f")}</>, icon: 'text_fields' },
                { text: <><span className="font-bold mx-1">{aiImageQuota.pro}</span>{t("t_5d4072e6")}</>, icon: 'image' },
                { text: t('t_f9202393'), icon: 'web' },
                { text: t('t_18766810b'), icon: 'visibility_off' },
                { text: t('t_cba68fae'), icon: 'remove_shopping_cart' },
                ...(customDomainPlans?.pro ? [{ text: t('t_4ed755bb'), icon: 'public' }] : []),
                { text: <><span className="font-bold mx-1">{appPlans?.facebook?.pro || 5}</span>{t("t_4d3c3c4a")}</>, icon: 'monitoring' },
                { text: <><span className="font-bold mx-1">{appPlans?.tiktok?.pro || 5}</span>{t("t_26041373")}</>, icon: 'play_circle' },
                { text: 'Facebook CAPI', icon: 'cloud_sync' },
                { text: 'Google Analytics + GTM', icon: 'analytics' },
            ],
            limitations: []
        },
        {
            id: t('t_15187dfac'),
            name: t('t_15187dfac'),
            subtitle: t('t_14ccea959'),
            icon: '👑',
            price: vipPrice,
            color: 'amber',
            gradient: 'from-amber-500 to-orange-500',
            borderColor: 'border-amber-300 dark:border-amber-900/50',
            bgCard: 'bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-zinc-900',
            features: [
                { text: <><span className="font-bold mx-1">{appPlans?.products_limit?.vip || 10000}</span> منتج</>, icon: 'inventory_2' },
                { text: <><span className="font-bold mx-1">{appPlans?.orders_limit?.vip || 50000}</span> طلب / شهرياً</>, icon: 'shopping_cart' },
                { text: <><span className="font-bold mx-1">{appPlans?.team_limit?.vip || 10}</span>{t("t_dba1904e")}</>, icon: 'badge' },
                { text: aiTextQuota.vip === 'unlimited' ? t('t_1dd4bec3') : <><span className="font-bold mx-1">{aiTextQuota.vip}</span>{t("t_94f4ef7f")}</>, icon: 'text_fields' },
                { text: aiImageQuota.vip === 'unlimited' ? t('t_1fc06f0ff') : <><span className="font-bold mx-1">{aiImageQuota.vip}</span>{t("t_5d4072e6")}</>, icon: 'image' },
                { text: t('t_dbc2913a'), icon: 'web' },
                { text: t('t_18766810b'), icon: 'visibility_off' },
                { text: t('t_cba68fae'), icon: 'remove_shopping_cart' },
                { text: t('t_de628b'), icon: 'support_agent' },
                ...(customDomainPlans?.vip ? [{ text: t('t_4ed755bb'), icon: 'public' }] : []),
                { text: <><span className="font-bold mx-1">{appPlans?.facebook?.vip || 10}</span>{t("t_4d3c3c4a")}</>, icon: 'monitoring' },
                { text: <><span className="font-bold mx-1">{appPlans?.tiktok?.vip || 10}</span>{t("t_26041373")}</>, icon: 'play_circle' },
                { text: 'Facebook + TikTok CAPI', icon: 'cloud_sync' },
                { text: 'Google Analytics + GTM', icon: 'analytics' },
                { text: t('t_dffaa818'), icon: 'webhook' },
                { text: t('t_f51a425a'), icon: 'support_agent' },
            ],
            limitations: []
        }
    ];

    return (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex overflow-hidden bg-[#F8F9FC] dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-cairo">
            <Sidebar activePage="Upgrade" />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-slate-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                        <h1 className="text-lg font-black text-slate-800 dark:text-slate-100">{t('t_2ab02003')}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-zinc-800">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{storeName}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                currentPlan === t('t_15187dfac') ? 'bg-amber-100 text-amber-700' :
                                currentPlan === t('t_74dcec9f') ? 'bg-pink-100 text-pink-700' :
                                'bg-slate-100 text-slate-600 dark:text-slate-400'
                            }`}>
                                {currentPlan === t('t_15187dfac') ? '👑' : currentPlan === t('t_74dcec9f') ? '⭐' : '🆓'} {currentPlan}
                            </span>
                            {planExpiresAt && !isExpired && (
                                <span className="text-[10px] font-bold text-slate-500 mr-1 flex items-center gap-1 border-r border-slate-200 dark:border-zinc-700 pr-2">
                                    <span className="material-symbols-outlined text-[14px]">event</span>
                                    صالح لغاية: <span className="font-black text-slate-700 dark:text-slate-300 mx-1">{new Date(planExpiresAt).toLocaleDateString('ar-DZ')}</span>
                                </span>
                            )}
                            {isExpired && (
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full mr-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                    انتهت الصلاحية
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <StoreLinkButton />
                            <NotificationsDropdown />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 pt-16 md:pt-0">

                    {/* Payment Success Overlay */}
                    {paymentStatus === 'success' && (
                        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                                {/* Decorative circles */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-tr from-pink-400/20 to-purple-400/10 blur-2xl"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
                                        <span className="material-symbols-outlined text-white text-4xl">check_circle</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">{t('t_193856aac')}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{t('t_162fb05eb')}</p>
                                    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black mb-6 ${
                                        activatedPlan === t('t_15187dfac') ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-pink-100 text-pink-700 border border-pink-200'
                                    }`}>
                                        <span>{activatedPlan === t('t_15187dfac') ? '👑' : '⭐'}</span>
                                        {activatedPlan}
                                    </div>
                                    <p className="text-xs text-slate-400 mb-8">{t('t_73458369')}</p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button onClick={() => router.push('/merchant')} className="bg-gradient-to-l from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-pink-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                            
                                            {t('t_1484e09bf')}
                                        </button>
                                        <button onClick={() => { setPaymentStatus('idle'); window.history.replaceState({}, '', '/upgrade'); }} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            
                                            {t('t_15a397a67')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Activating Overlay */}
                    {paymentStatus === 'activating' && (
                        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('t_47b1a702')}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('t_1d1fcf812')}</p>
                            </div>
                        </div>
                    )}

                    {/* Payment Canceled Banner */}
                    {paymentStatus === 'canceled' && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in duration-300">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-red-700 dark:text-red-400">{t('t_8b538cef')}</h4>
                                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">{t('t_bde04fce')}</p>
                            </div>
                            <button onClick={() => { setPaymentStatus('idle'); window.history.replaceState({}, '', '/upgrade'); }} className="text-red-500 hover:bg-red-100 p-2 rounded-xl transition-colors flex-shrink-0">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    )}
                    {/* Expired Plan Banner */}
                    {isExpired && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in duration-300">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-red-500 text-2xl">timer_off</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-red-700 dark:text-red-400">{t("t_4e3a6c39")}</h4>
                                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">{t("t_d23f9551")}</p>
                            </div>
                        </div>
                    )}

                    {/* Hero Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-bold border border-primary/10 mb-4">
                            <span className="material-symbols-outlined text-[16px]">diamond</span>
                            
                            {t('t_6d3406e6')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
                            
                            {t('t_1bed588a5')} <span className="text-transparent bg-clip-text bg-gradient-to-l from-pink-500 to-rose-500">{t('t_23c9db960')}</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
                            
                            {t('t_9d7ac9ee')}
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>{t('t_2ea340c')}</span>
                            <button
                                onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-primary' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 shadow-md transition-all duration-300 ${billingCycle === 'yearly' ? 'right-1' : 'right-8'}`}></div>
                            </button>
                            <span className={`text-sm font-bold transition-colors ${billingCycle === 'yearly' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                                
                                {t('t_2e9beb5')}
                                <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-1.5 py-0.5 rounded-full mr-1 border border-emerald-100">{t('t_1372cc0ee')}</span>
                            </span>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
                        {plans.map((plan) => {
                            const isCurrent = isCurrentPlan(plan.id);
                            const canUpgrade = isUpgrade(plan.id);
                            const displayPrice = billingCycle === 'yearly' ? getYearlyPrice(plan.price) : Number(plan.price);
                            const period = billingCycle === 'yearly' ? t('t_2bceaa5') : t('t_2bcee8d');

                            return (
                                <div key={plan.id} className={`relative rounded-3xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                                    plan.popular ? `${plan.bgCard} ${plan.borderColor} shadow-lg shadow-pink-500/5 md:-translate-y-2` :
                                    isCurrent ? `bg-white dark:bg-zinc-900 border-primary/30 shadow-md` :
                                    `${plan.bgCard} ${plan.borderColor} hover:border-slate-300`
                                }`}>
                                    {/* Popular Badge */}
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-l from-pink-500 to-rose-500 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg shadow-pink-500/20">
                                            
                                            {t('t_5f53b441')}
                                        </div>
                                    )}

                                    {/* Current Plan Badge */}
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg">
                                            
                                            {t('t_10c77eda5')}
                                        </div>
                                    )}

                                    {/* Plan Header */}
                                    <div className="text-center mb-6 pt-2">
                                        <div className="text-3xl mb-2">{plan.icon}</div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{plan.subtitle}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-center mb-6">
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-black text-slate-900 dark:text-white">{displayPrice}  {t('t_17422d')}</span>
                                            <span className="text-slate-400 text-sm font-medium">{period}</span>
                                        </div>
                                        {billingCycle === 'yearly' && Number(plan.price) > 0 && (
                                            <p className="text-xs text-emerald-600 font-bold mt-1">
                                                
                                                {t('t_576deac0')} {Number(plan.price) * 12}  {t('t_1491e4168')} {Number(plan.price) * 2}  {t('t_17422d')}
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => canUpgrade ? handleUpgrade(plan.name) : null}
                                        disabled={isCurrent || !canUpgrade || upgradeLoading !== null}
                                        className={`w-full py-3 rounded-2xl font-bold text-sm transition-all mb-6 flex justify-center items-center gap-2 ${
                                            isCurrent ? 'bg-slate-100 text-slate-400 cursor-default' :
                                            canUpgrade && plan.popular ? `bg-gradient-to-l ${plan.gradient} text-white shadow-lg shadow-pink-500/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]` :
                                            canUpgrade ? `bg-gradient-to-l ${plan.gradient} text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]` :
                                            'bg-slate-50 dark:bg-slate-800/50 text-slate-300 cursor-default'
                                        }`}
                                    >
                                        {upgradeLoading === plan.name ? (
                                            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                        ) : isCurrent ? t('t_13eaf36ce') :
                                         canUpgrade ? `ترقية إلى ${plan.name}` :
                                         t('t_161806f8e')}
                                    </button>

                                    {/* Divider */}
                                    <div className="border-t border-slate-100 dark:border-zinc-800 mb-5"></div>

                                    {/* Features */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('t_64fa5018')}</p>
                                        {plan.features.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2.5">
                                                <span className={`material-symbols-outlined text-[16px] ${
                                                    plan.color === 'primary' ? 'text-pink-500' :
                                                    plan.color === 'amber' ? 'text-amber-500' :
                                                    'text-emerald-500'
                                                }`}>{f.icon}</span>
                                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{f.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Limitations */}
                                    {plan.limitations && plan.limitations.length > 0 && (
                                        <div className="mt-5 space-y-2">
                                            <p className="text-[10px] font-black text-red-300 uppercase tracking-wider">{t('t_ea9853f6')}</p>
                                            {plan.limitations.map((l, i) => (
                                                <div key={i} className="flex items-center gap-2.5">
                                                    <span className="material-symbols-outlined text-[16px] text-red-300">close</span>
                                                    <span className="text-sm text-slate-400 font-medium">{l}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto mt-16 mb-8">
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 text-center mb-8">{t('t_10588929e')}</h3>
                        <div className="space-y-4">
                            {[
                                { q: t('t_c6a8a9a2'), a: t('t_fbc961e3') },
                                { q: t('t_825e9f37'), a: t('t_1167593af') },
                                { q: t('t_acc0b26b'), a: t('t_8ef297d2') },
                                { q: t('t_22b362b2'), a: t('t_457c9255b') },
                            ].map((item, i) => (
                                <details key={i} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm ">
                                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.q}</span>
                                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                                    </summary>
                                    <div className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 pt-4">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}

export default function UpgradePage() {
    const { t, lang } = useI18n();
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        }>
            <UpgradePageContent />
        </Suspense>
    );
}
