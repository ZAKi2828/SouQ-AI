'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';

import { insforge } from '@/lib/insforge';

import SOUQAILoader from '@/components/SOUQAILoader';

import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';

import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';

import { useI18n } from "@/context/I18nContext";

import { getStoreContext } from '@/lib/storeContext';

import { hasPermission } from '@/lib/rbac';



const getTrackingApps = (t: any) => [

    {

        id: 'facebook',

        name: 'Facebook Pixel',

        nameAr: t('t_13362207'),

        description: t('t_19fa13567'),

        image: '/apps/facebook.png',

        color: '#1877F2',

        borderColor: 'border-blue-200',

        hoverBorder: 'hover:border-blue-300',

        activeBg: 'bg-blue-50',

        fields: [

            { key: 'facebook_pixel_id', label: t('t_2fb1146e1'), placeholder: '123456789012345', dir: 'ltr', multiple: true },

            { key: 'facebook_access_token', label: t('t_12a78b798'), placeholder: 'EAAxxxxxxx...', dir: 'ltr' },

        ],

        enableKey: 'facebook_enabled',

        docs: 'https://www.facebook.com/business/help/952192354843755',

        features: [t('t_3f5e98b2'), t('t_96d49316'), t('t_d33b266e'), t('t_f62e87da')],

        category: t('t_4319632'),

    },

    {

        id: 'fb_capi',

        name: 'Facebook Conversions API',

        nameAr: t('t_e1fa2bf6'),

        description: t('t_12a76a30e'),

        image: '/apps/fb_capi.png',

        color: '#1B2A4A',

        borderColor: 'border-indigo-200',

        hoverBorder: 'hover:border-indigo-300',

        activeBg: 'bg-indigo-50',

        fields: [

            { key: 'fb_capi_token', label: 'Access Token', placeholder: 'EAAxxxxxxxxxxxxxxx...', dir: 'ltr' },

            { key: 'fb_capi_test_code', label: t('t_97968a87'), placeholder: 'TEST12345', dir: 'ltr' },

        ],

        enableKey: 'fb_capi_enabled',

        docs: 'https://developers.facebook.com/docs/marketing-api/conversions-api',

        features: [t('t_16065fded'), t('t_bd08733e'), t('t_3e31fbe8'), t('t_168419ab3')],

        category: t('t_4319632'),

    },

    {

        id: 'tiktok',

        name: 'TikTok Pixel',

        nameAr: t('t_9101fd5a'),

        description: t('t_4b8748270'),

        image: '/apps/tiktok.png',

        color: '#000000',

        borderColor: 'border-gray-200 dark:border-zinc-800',

        hoverBorder: 'hover:border-gray-400',

        activeBg: 'bg-gray-50 dark:bg-zinc-900/50',

        fields: [

            { key: 'tiktok_pixel_id', label: t('t_173ec47fa'), placeholder: 'CXXXXXXXXXXXXXXXXX', dir: 'ltr', multiple: true },

        ],

        enableKey: 'tiktok_enabled',

        docs: 'https://ads.tiktok.com/help/article/tiktok-pixel',

        features: [t('t_2b551ea6'), t('t_4b9b3702'), t('t_c7a355ce'), t('t_12ffb49b5')],

        category: t('t_4319632'),

    },

    {

        id: 'tiktok_capi',

        name: 'TikTok Events API',

        nameAr: t('t_4479e5c0'),

        description: t('t_1cb0917a9'),

        image: '/apps/tiktok_capi.png',

        color: '#25F4EE',

        borderColor: 'border-cyan-200',

        hoverBorder: 'hover:border-cyan-300',

        activeBg: 'bg-cyan-50',

        fields: [

            { key: 'tiktok_capi_token', label: 'Access Token', placeholder: 'Server-side access token...', dir: 'ltr' },

        ],

        enableKey: 'tiktok_capi_enabled',

        docs: 'https://business-api.tiktok.com/portal/docs?id=1771100865818625',

        features: [t('t_16065fded'), t('t_85ddba36'), t('t_127a14a39'), t('t_1995cb273')],

        category: t('t_4319632'),

    },

    {

        id: 'google',

        name: 'Google Analytics 4',

        nameAr: t('t_1b4f556a'),

        description: t('t_1e3eea6ee'),

        image: '/apps/google.png',

        color: '#E37400',

        borderColor: 'border-orange-200',

        hoverBorder: 'hover:border-orange-300',

        activeBg: 'bg-orange-50',

        fields: [

            { key: 'google_analytics_id', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', dir: 'ltr' },

        ],

        enableKey: 'google_enabled',

        docs: 'https://support.google.com/analytics/answer/9304153',

        features: [t('t_10cf99969'), t('t_2dc51687'), t('t_10862eae5'), t('t_6a9d741')],

        category: t('t_7b98782'),

    },

    {

        id: 'gtm',

        name: 'Google Tag Manager',

        nameAr: t('t_25dcea475'),

        description: t('t_14178f8f1'),

        image: '/apps/gtm.png',

        color: '#4285F4',

        borderColor: 'border-sky-200',

        hoverBorder: 'hover:border-sky-300',

        activeBg: 'bg-sky-50',

        fields: [

            { key: 'gtm_id', label: 'Container ID', placeholder: 'GTM-XXXXXXX', dir: 'ltr' },

        ],

        enableKey: 'gtm_enabled',

        docs: 'https://support.google.com/tagmanager/answer/6103696',

        features: [t('t_29d85435'), t('t_3131f8d7'), t('t_128752a29'), t('t_17abf761b')],

        category: t('t_7b98782'),

    },

    {

        id: 'snapchat',

        name: 'Snapchat Pixel',

        nameAr: t('t_677a1c75'),

        description: t('t_1b5988e5e'),

        image: '/apps/snapchat.png',

        color: '#FFFC00',

        borderColor: 'border-yellow-200',

        hoverBorder: 'hover:border-yellow-400',

        activeBg: 'bg-yellow-50',

        fields: [

            { key: 'snapchat_pixel_id', label: 'Pixel ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx', dir: 'ltr' },

        ],

        enableKey: 'snapchat_enabled',

        docs: 'https://businesshelp.snapchat.com/s/article/snap-pixel-about',

        features: [t('t_e71257d6'), 'Snap Audience Match', t('t_4b9b3702'), 'Lookalike Audiences'],

        category: t('t_4319632'),

    },

    {

        id: 'webhook',

        name: 'Webhooks',

        nameAr: t('t_4ba22095'),

        description: t('t_d571d7b0'),

        image: '/apps/webhook.png',

        color: '#8B5CF6',

        borderColor: 'border-violet-200',

        hoverBorder: 'hover:border-violet-300',

        activeBg: 'bg-violet-50',

        fields: [

            { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://your-server.com/webhook', dir: 'ltr' },

            { key: 'webhook_secret', label: t('t_101bc5739'), placeholder: 'whsec_xxxxxxxx', dir: 'ltr' },

        ],

        enableKey: 'webhook_enabled',

        docs: 'https://zapier.com/blog/what-are-webhooks/',

        features: [t('t_23c2dd27'), t('t_bb138a90'), t('t_1056895bc'), t('t_1230a22d8')],

        category: t('t_595fdc7d'),

    },

    {

        id: 'gsheets',

        name: 'Google Sheets',

        nameAr: t('t_8e1ca690'),

        description: t('t_20794bf95'),

        image: '/apps/gsheets.png',

        color: '#0F9D58',

        borderColor: 'border-green-200',

        hoverBorder: 'hover:border-green-300',

        activeBg: 'bg-green-50',

        fields: [

            { key: 'gsheets_spreadsheet_id', label: 'Spreadsheet ID', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms', dir: 'ltr' },

            { key: 'gsheets_sheet_name', label: t('t_1726ef3c1'), placeholder: 'Orders', dir: 'ltr' },

        ],

        enableKey: 'gsheets_enabled',

        docs: 'https://support.google.com/docs/answer/6000292',

        features: [t('t_101cc28c8'), t('t_1b389a4e8'), t('t_82d51797'), t('t_bd11d73')],

        category: t('t_595fdc7d'),

    },

    {

        id: 'anti_fraud',

        name: 'SOUQ Security Shield',

        nameAr: t('t_7cc5d687'),

        description: t('t_ca723be8'),

        image: 'https://cdn-icons-png.flaticon.com/512/2070/2070894.png',

        color: '#E91E63',

        borderColor: 'border-pink-200',

        hoverBorder: 'hover:border-pink-400',

        activeBg: 'bg-pink-50 dark:bg-pink-900/10',

        fields: [

            { key: 'anti_fraud_max_orders_ip', label: t('t_e4661f71'), placeholder: '3', dir: 'ltr' },

            { key: 'anti_fraud_block_foreign', label: t('t_972eef00'), placeholder: 'true', dir: 'ltr' },

            { key: 'anti_fraud_captcha', label: t('t_9764e589'), placeholder: 'true', dir: 'ltr' },

            { key: 'anti_fraud_block_action', label: t('t_2b04f24e'), placeholder: 'block', dir: 'ltr' },

        ],

        enableKey: 'anti_fraud_enabled',

        docs: '#',

        features: [t('t_1f3e2bfe'), t('t_5b2fb5dc'), t('t_90b27ab8')],

        category: t('t_595fdc7d'),

    },

    {

        id: 'abandoned_forms',

        name: 'Abandoned Forms Recovery',

        nameAr: t('t_55decf0d'),

        description: t('t_f824d42a'),

        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',

        color: '#FF6B35',

        borderColor: 'border-orange-200',

        hoverBorder: 'hover:border-orange-400',

        activeBg: 'bg-orange-50 dark:bg-orange-900/10',

        fields: [

            { key: 'abandoned_forms_enabled', label: t('t_812cffd1'), placeholder: 'true/false', dir: 'ltr' },

            { key: 'abandoned_forms_retention_days', label: t('t_b8590081'), placeholder: '7', dir: 'ltr' },

            { key: 'abandoned_forms_notification', label: t('t_e87cc6bb'), placeholder: 'true/false', dir: 'ltr' },

        ],

        enableKey: 'abandoned_forms_enabled',

        docs: '#',

        features: [t('t_b1fbcd23'), t('t_5540bd28'), t('t_5fa86a4d'), t('t_9bf0e2e0')],

        category: t('t_595fdc7d'),

    },



    {

        id: 'upsell_feature',

        name: 'Smart Upsell',

        nameAr: t('t_354e77a0'),

        description: t('t_101c3967'),

        image: 'https://cdn-icons-png.flaticon.com/512/3141/3141113.png',

        color: '#10B981',

        borderColor: 'border-emerald-300',

        hoverBorder: 'hover:border-emerald-400',

        activeBg: 'bg-emerald-50 dark:bg-emerald-900/10',

        fields: [

            { key: 'upsell_title', label: t('t_5149eb9d'), placeholder: t('t_29e656f8'), dir: 'rtl' },

        ],

        enableKey: 'upsell_enabled',

        docs: '#',

        features: [t('t_aa25c451'), t('t_16e33592'), t('t_df57585')],

        category: t('t_595fdc7d'),

    },

];



export default function AppsPage() {

    const { t, lang } = useI18n();

    const { planExpired, currentPlan: guardPlan } = useExpiredPlanGuard();

    const router = useRouter();

    const TRACKING_APPS = getTrackingApps(t);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [userId, setUserId] = useState('');

    const [pixelData, setPixelData] = useState<any>({});

    const [selectedApp, setSelectedApp] = useState<string | null>(null);

    const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

    const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'vip'>('free');

    const [appLimits, setAppLimits] = useState<any>({});



    const showToast = (msg: string, type = 'success') => {

        setToast({ msg, type });

        setTimeout(() => setToast(null), 3000);

    };



    useEffect(() => {

        async function load() {

            try {

                const ctx = await getStoreContext();

                if (!ctx) { router.push('/login'); return; }



                // RBAC: Only owners and managers can manage apps

                if (!hasPermission(ctx.role, 'manage_apps')) {

                    router.push('/merchant');

                    return;

                }



                const uid = ctx.targetUserId;

                setUserId(uid);



                // Use plan from context

                let currentPlan = ctx.plan || 'free';

                setUserPlan(currentPlan as any);



                // Fetch App Limits from Super Admin Configs

                const { data: settings } = await insforge.database

                    .from('platform_settings')

                    .select('app_plans')

                    .eq('id', 1)

                    .single();

                if (settings?.app_plans) {

                    setAppLimits(settings.app_plans);

                }



                const { data, error } = await insforge.database

                    .from('store_pixels')

                    .select('*')

                    .eq('user_id', uid)

                    .single();



                if (data) {

                    setPixelData(data);

                } else if (error?.code === 'PGRST116') {

                    const { data: newRow } = await insforge.database

                        .from('store_pixels')

                        .insert({ user_id: uid })

                        .select()

                        .single();

                    if (newRow) setPixelData(newRow);

                }

            } catch (err) { console.error(err); }

            finally { setLoading(false); }

        }

        load();

    }, [router]);



    const handleSave = async () => {

        setSaving(true);

        try {

            const { id, user_id, created_at, ...updateData } = pixelData;

            const { error } = await insforge.database

                .from('store_pixels')

                .update({ ...updateData, updated_at: new Date().toISOString() })

                .eq('user_id', userId);



            if (!error) showToast(t('t_1fe0d7556'));

            else { console.error('[Apps Save Error]', error); showToast(t('t_3b403f21'), 'error'); }

        } catch (err) { console.error('[Apps Save Exception]', err); showToast(t('t_9634eda3'), 'error'); }

        finally { setSaving(false); }

    };



    const handleToggle = async (appId: string, enableKey: string) => {

        const newValue = !pixelData[enableKey];

        

        // Enforce limits if trying to enable

        if (newValue) {

            const limit = appLimits[appId]?.[userPlan] ?? 1;

            if (limit === 0) {

                showToast(`هذه الميزة غير متاحة في خطتك الحالية (${userPlan === 'free' ? t('t_217db6d41') : userPlan === 'pro' ? t('t_74dcec9f') : t('t_15187dfac')})`, 'error');

                return;

            }

        }



        const updated = { ...pixelData, [enableKey]: newValue };

        setPixelData(updated);



        try {

            const { error } = await insforge.database

                .from('store_pixels')

                .update({ [enableKey]: newValue, updated_at: new Date().toISOString() })

                .eq('user_id', userId);



            if (!error) showToast(newValue ? t('t_6247efc1') : t('t_26be36a0'));

            else { setPixelData({ ...pixelData }); showToast(t('t_93a04e88'), 'error'); }

        } catch { showToast(t('t_9634eda3'), 'error'); }

    };



    const updateField = (key: string, value: string) => {

        setPixelData((prev: any) => ({ ...prev, [key]: value }));

    };



    const currentApp = TRACKING_APPS.find(a => a.id === selectedApp);



    if (loading) {

        return (

            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

                <Sidebar activePage="Apps" />

                <main className="flex-1 flex items-center justify-center pt-16 md:pt-0"><SOUQAILoader size="md" text={t('t_e5005885')} /></main>

            </div>

        );

    }



    return (

        <>

        {planExpired && (

            <PlanExpiredOverlay planName={guardPlan === 'pro' ? 'خطة التاجر' : guardPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />

        )}

        <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

            <Sidebar activePage="Apps" />



            <main className="flex-1 overflow-y-auto h-screen custom-scrollbar pt-16 md:pt-0">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 space-y-6">



                    {/* Toast */}

                    {toast && (

                        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl text-[14px] font-bold ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>

                            {toast.msg}

                        </div>

                    )}



                    {/* ═══════════ HEADER ═══════════ */}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                        <div className="flex items-center gap-3">

                            <div className="w-12 h-12 rounded-2xl bg-[#E91E63]/10 flex items-center justify-center text-[#E91E63]">

                                <span className="material-symbols-outlined text-[26px]">extension</span>

                            </div>

                            <div>

                                <h1 className="text-[24px] font-black text-[#111827] dark:text-white">{t('t_a3a8932c')}</h1>

                                <p className="text-[13px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{t('t_2de14a38d')}</p>

                            </div>

                        </div>

                    </div>



                    {/* ═══════════ APP CARDS GRID ═══════════ */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {TRACKING_APPS.map((app) => {

                            const isEnabled = !!pixelData[app.enableKey];

                            const hasId = !!pixelData[app.fields[0].key];



                            return (

                                <div key={app.id}

                                    className={`bg-white dark:bg-zinc-900 rounded-3xl border-2 shadow-sm  overflow-hidden transition-all cursor-pointer group ${isEnabled ? `${app.borderColor} shadow-md` : 'border-gray-100 dark:border-zinc-800/30'

                                        } ${app.hoverBorder} hover:shadow-lg hover:-translate-y-1`}

                                    onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}>



                                    {/* Card Image */}

                                    <div className={`h-[160px] overflow-hidden relative ${isEnabled ? app.activeBg : 'bg-gray-50 dark:bg-zinc-900/50'}`}>

                                        <img src={app.image} alt={app.name}

                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                        {/* Status Badge */}

                                        <div className="absolute top-4 left-4">

                                            {isEnabled ? (

                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-lg shadow-emerald-500/30">

                                                    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-900 animate-pulse"></span>

                                                    

                                                    {t('t_5b4947f0')}

                                                </span>

                                            ) : (

                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-gray-500 dark:text-gray-400 text-[11px] font-bold shadow">

                                                    

                                                    {t('t_979897f1')}

                                                </span>

                                            )}

                                        </div>

                                        {/* Category Badge */}

                                        <div className="absolute top-4 right-4">

                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow ${app.category === t('t_4319632') ? 'bg-purple-500 text-white' :

                                                app.category === t('t_7b98782') ? 'bg-orange-500 text-white' : 'bg-violet-500 text-white'

                                                }`}>{app.category}</span>

                                        </div>

                                    </div>



                                    {/* Card Body */}

                                    <div className="p-5">

                                        <div className="flex items-center justify-between mb-2">

                                            <h3 className="text-[17px] font-black text-[#111827] dark:text-white">{app.name}</h3>

                                            {/* Toggle */}

                                            <button onClick={(e) => { e.stopPropagation(); handleToggle(app.id, app.enableKey); }}

                                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>

                                                <div className={`absolute top-0.5 w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow-sm  transition-all ${isEnabled ? 'left-0.5' : 'left-[22px]'}`}></div>

                                            </button>

                                        </div>

                                        <p className="text-[13px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">{app.description}</p>



                                        {/* Features chips */}

                                        <div className="flex flex-wrap gap-1.5">

                                            {app.features.map((f, i) => (

                                                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 dark:bg-zinc-900/50 text-[#6B7280] dark:text-gray-400 border border-gray-100 dark:border-zinc-800/30">{f}</span>

                                            ))}

                                        </div>



                                        {/* Status indicator */}

                                        {isEnabled && hasId && (

                                            <div className="flex items-center gap-1.5 mt-3 text-[12px] font-bold text-emerald-600">

                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>

                                                

                                                {t('t_357604c0')}

                                            </div>

                                        )}

                                        {isEnabled && !hasId && (

                                            <div className="flex items-center gap-1.5 mt-3 text-[12px] font-bold text-amber-600">

                                                <span className="material-symbols-outlined text-[14px]">warning</span>

                                                

                                                {t('t_250e556b')}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            );

                        })}

                    </div>



                    {/* ═══════════ COMING SOON ═══════════ */}

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800/30 shadow-sm  p-6 md:p-8">

                        <div className="flex items-center gap-2.5 mb-5">

                            <span className="material-symbols-outlined text-[22px] text-[#E91E63]">rocket_launch</span>

                            <h3 className="text-[17px] font-black text-[#111827] dark:text-white">{t('t_7e6d751')}</h3>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            {[

                                { name: 'WhatsApp Business', icon: '��', desc: t('t_63238c18') },

                                { name: t('t_b2fbdcb0'), icon: '��', desc: t('t_f50fdc9b') },

                                { name: 'Yalidine Express', icon: '��', desc: t('t_caba2221') },

                                { name: 'ZR Express', icon: '��', desc: t('t_1225db8bf') },

                                { name: t('t_1ade9f85d'), icon: '✍️', desc: t('t_845fdbb8') },

                                { name: t('t_1a1a9805'), icon: '��️', desc: t('t_a4392707') },

                            ].map((item, i) => (

                                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50/50 opacity-60">

                                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-[22px] flex-shrink-0">{item.icon}</div>

                                    <div>

                                        <h4 className="text-[14px] font-bold text-[#111827] dark:text-white">{item.name}</h4>

                                        <p className="text-[12px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400">{item.desc}</p>

                                    </div>

                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:text-gray-400 mr-auto flex-shrink-0">{t('t_7e6d751')}</span>

                                </div>

                            ))}

                        </div>

                    </div>



                    {/* ═══════════ SUGGEST AN APP ═══════════ */}

                    <div className="relative overflow-hidden rounded-3xl border border-emerald-200/50 dark:border-emerald-900/30 shadow-sm">

                        {/* Background */}

                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10"></div>

                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-full -mr-20 -mt-20"></div>

                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full -ml-16 -mb-16"></div>

                        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-emerald-300/40 rounded-full animate-pulse"></div>

                        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-teal-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>

                        

                        <div className="relative p-6 md:p-8">

                            <div className="flex flex-col md:flex-row items-center gap-6">

                                {/* Icon */}

                                <div className="shrink-0">

                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25 rotate-3 hover:rotate-0 transition-transform">

                                        <span className="material-symbols-outlined text-white text-3xl md:text-4xl">emoji_objects</span>

                                    </div>

                                </div>

                                

                                {/* Content */}

                                <div className="flex-1 text-center md:text-right">

                                    <h3 className="text-lg md:text-xl font-black text-[#111827] dark:text-white mb-2">

                                        لديك فكرة لإضافة جديدة؟ 💡

                                    </h3>

                                    <p className="text-[13px] md:text-sm text-[#6B7280] dark:text-gray-400 font-medium leading-relaxed max-w-xl">

                                        نحن دائماً نعمل على تطوير منصتنا بناءً على احتياجاتكم. إذا كانت لديك فكرة لإضافة أو تكامل جديد يساعدك في تنمية متجرك، لا تتردد في مشاركتنا إياها!

                                    </p>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">

                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50">{t("t_b7467fd1")}</span>

                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200/50">{t("t_5556bd76")}</span>

                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200/50">{t("t_f5f0a116")}</span>

                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/50">{t("t_901c9f40")}</span>

                                    </div>

                                </div>



                                {/* CTA Button */}

                                <div className="shrink-0">

                                    <a 

                                        href="https://wa.me/213665682628?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%82%D8%AA%D8%B1%D8%A7%D8%AD%20%D8%A5%D8%B6%D8%A7%D9%81%D8%A9%20%D8%AC%D8%AF%D9%8A%D8%A9%20%D9%84%D9%85%D9%86%D8%B5%D8%A9%20SOUQ%20AI" 

                                        target="_blank" 

                                        rel="noopener noreferrer"

                                        className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BD5A] hover:to-[#0E7A6E] text-white font-bold text-sm shadow-lg shadow-[#25D366]/25 hover:shadow-xl hover:shadow-[#25D366]/30 hover:scale-[1.03] active:scale-[0.97] transition-all"

                                    >

                                        <svg className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">

                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>

                                        </svg>

                                        <div className="flex flex-col">

                                            <span className="text-[13px] font-black leading-tight">{t("t_43c7525d")}</span>

                                            <span className="text-[10px] font-medium opacity-80">{t("t_b9c31e27")}</span>

                                        </div>

                                        <span className="material-symbols-outlined text-lg opacity-70 group-hover:translate-x-1 transition-transform" style={{transform: 'scaleX(-1)'}}>arrow_forward</span>

                                    </a>

                                </div>

                            </div>

                        </div>

                    </div>



                    {/* ═══════════ HELP SECTION ═══════════ */}

                    <div className="bg-gradient-to-l from-[#E91E63]/5 to-purple-50 rounded-3xl border border-[#E91E63]/10 p-6 md:p-8">

                        <div className="flex items-start gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-[#E91E63]/10 flex items-center justify-center text-[#E91E63] flex-shrink-0">

                                <span className="material-symbols-outlined text-[24px]">help</span>

                            </div>

                            <div>

                                <h3 className="text-[16px] font-black text-[#111827] dark:text-white mb-2">{t('t_2582288c0')}</h3>

                                <div className="space-y-3 text-[13px] text-[#6B7280] dark:text-gray-400">

                                    <div className="flex items-start gap-2">

                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">1</span>

                                        <p><strong className="text-[#111827] dark:text-white">{t('t_168ca25f')}</strong>  {t('t_8c7f67d0')}</p>

                                    </div>

                                    <div className="flex items-start gap-2">

                                        <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 dark:text-gray-300 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">2</span>

                                        <p><strong className="text-[#111827] dark:text-white">{t('t_49ffbeae')}</strong>  {t('t_2f3292d47')}</p>

                                    </div>

                                    <div className="flex items-start gap-2">

                                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">3</span>

                                        <p><strong className="text-[#111827] dark:text-white">{t('t_59ebf286')}</strong>  {t('t_33bf4c307')}</p>

                                    </div>

                                    <div className="flex items-start gap-2">

                                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">4</span>

                                        <p><strong className="text-[#111827] dark:text-white">GTM:</strong>  {t('t_296283ce2')}</p>

                                    </div>

                                    <div className="flex items-start gap-2">

                                        <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">5</span>

                                        <p><strong className="text-[#111827] dark:text-white">{t('t_5173fa69')}</strong>  {t('t_4fed977d')}</p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </main>



            {/* ═══════════ SETTINGS MODAL ═══════════ */}

            {selectedApp && currentApp && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header with Image */}

                        <div className={`h-[120px] overflow-hidden relative rounded-t-3xl ${currentApp.activeBg}`}>

                            <img src={currentApp.image} alt={currentApp.name} className="w-full h-full object-cover opacity-60" />

                            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>

                            <button onClick={() => setSelectedApp(null)} className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-[#6B7280] dark:text-gray-400 hover:bg-white dark:bg-zinc-900 shadow">

                                <span className="material-symbols-outlined text-[18px]">close</span>

                            </button>

                        </div>



                        <div className="p-6 -mt-6 relative">

                            <h3 className="text-[20px] font-black text-[#111827] dark:text-white mb-1">{t('t_3095246')} {currentApp.name}</h3>

                            <p className="text-[13px] font-bold text-[#9CA3AF] dark:text-gray-500 dark:text-gray-400 mb-5">{currentApp.description}</p>



                            {/* Fields */}

                            <div className="space-y-4 mb-5">

                                {currentApp.fields.map(field => {

                                    if ('multiple' in field && field.multiple) {

                                        // Parse current comma-separated values

                                        let values = (pixelData[field.key] || '').split(',').map((v: string) => v.trim()).filter(Boolean);

                                        if (values.length === 0) values = ['']; // Show at least one empty field

                                        

                                        const updateArrayField = (idx: number, newVal: string) => {

                                            const cleanVal = newVal.replace(/,/g, ''); // no commas allowed

                                            const newArray = [...values];

                                            newArray[idx] = cleanVal;

                                            updateField(field.key, newArray.join(','));

                                        };

                                        const addArrayField = () => {

                                            const limit = appLimits[currentApp!.id]?.[userPlan] ?? 1;

                                            if (values.length >= limit) {

                                                showToast(`لقد وصلت للحد الأقصى للبيكسلات المسموح بها (${limit}) في خطتك الحالية`, 'error');

                                                return;

                                            }

                                            updateField(field.key, [...values, ''].join(','));

                                        };

                                        const removeArrayField = (idx: number) => {

                                            const newArray = values.filter((_: any, i: number) => i !== idx);

                                            updateField(field.key, newArray.join(','));

                                        };



                                        return (

                                            <div key={field.key} className="space-y-2">

                                                <label className="text-[13px] font-bold text-[#111827] dark:text-white mb-1.5 block">{field.label}</label>

                                                {values.map((val: string, index: number) => (

                                                    <div key={index} className="flex gap-2">

                                                        <input

                                                            value={val}

                                                            onChange={(e) => updateArrayField(index, e.target.value)}

                                                            className="flex-1 h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-[14px] font-medium focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63] placeholder:text-gray-400"

                                                            placeholder={field.placeholder}

                                                            dir={field.dir}

                                                            type="text"

                                                        />

                                                        {values.length > 1 && (

                                                            <button title={t('t_17f4fe')} onClick={() => removeArrayField(index)} className="w-11 h-11 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">

                                                                <span className="material-symbols-outlined text-[20px]">delete</span>

                                                            </button>

                                                        )}

                                                    </div>

                                                ))}

                                                <button onClick={addArrayField} className="flex items-center gap-1.5 text-[12px] font-bold text-[#E91E63] hover:underline px-1 py-1">

                                                    <span className="material-symbols-outlined text-[16px]">add_circle</span>

                                                    

                                                    {t('t_7a6ebe55')}

                                                </button>

                                            </div>

                                        );

                                    }



                                    return (

                                        <div key={field.key}>

                                            <label className="text-[13px] font-bold text-[#111827] dark:text-white mb-1.5 block">{field.label}</label>

                                            <input

                                                value={pixelData[field.key] || ''}

                                                onChange={(e) => updateField(field.key, e.target.value)}

                                                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-[14px] font-medium focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63] placeholder:text-gray-400"

                                                placeholder={field.placeholder}

                                                dir={field.dir || 'rtl'}

                                                type="text"

                                            />

                                        </div>

                                    );

                                })}

                            </div>



                            {/* Status */}

                            {pixelData[currentApp.enableKey] && pixelData[currentApp.fields[0].key] && (

                                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-5">

                                    <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>

                                    <span className="text-[13px] font-bold text-emerald-700">{t('t_18cead508')}</span>

                                </div>

                            )}

                            {pixelData[currentApp.enableKey] && !pixelData[currentApp.fields[0].key] && (

                                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-5">

                                    <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>

                                    <span className="text-[13px] font-bold text-amber-700">{t('t_2714b63d')}</span>

                                </div>

                            )}



                            {/* Actions */}

                            <div className="flex items-center gap-3">

                                <button onClick={handleSave} disabled={saving}

                                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-[#E91E63] text-white text-[14px] font-bold hover:bg-[#C2185B] disabled:opacity-60 transition-all">

                                    {saving ? <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[16px]">save</span>}

                                    {saving ? t('t_92bc19d3') : t('t_a77d8c8d')}

                                </button>

                                <a href={currentApp.docs} target="_blank" rel="noopener noreferrer"

                                    className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#6B7280] dark:text-gray-400 text-[13px] font-bold hover:bg-gray-50 dark:bg-zinc-900/50">

                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>

                                    

                                    {t('t_252c1b94')}

                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

        </>

    );

}

