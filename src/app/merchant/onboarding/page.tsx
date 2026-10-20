'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { useI18n } from "@/context/I18nContext";

export default function OnboardingPage() {
    const { t } = useI18n();
    const router = useRouter();
    const [step, setStep] = useState(0); // 0 = welcome, 1 = store setup, 2 = success
    const [storeName, setStoreName] = useState('');
    const [storeSlug, setStoreSlug] = useState('');
    const [industry, setIndustry] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [slugChecking, setSlugChecking] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        async function checkStore() {
            try {
                const { data: sessionData } = await insforge.auth.getCurrentSession();
                if (!sessionData?.session?.user) {
                    router.push('/login');
                    return;
                }
                const user = sessionData.session.user;
                setUserId(user.id);
                setUserEmail(user.email || '');
                setUserName(user.profile?.name?.split(' ')[0] || t('t_5a5fdf38'));

                // Check if the user is a team member (invited by an owner)
                if (user.email) {
                    const { data: member } = await insforge.database
                        .from('team_members')
                        .select('id, status')
                        .eq('member_email', user.email)
                        .maybeSingle();

                    if (member) {
                        if (member.status === 'pending') {
                            try {
                                // Activate the pendin invite
                                await insforge.database
                                    .from('team_members')
                                    .update({ status: 'active' })
                                    .eq('id', member.id);
                            } catch (e) {}
                        }
                        
                        // Process pending profile updates before redirecting
                        if (typeof window !== 'undefined') {
                            const pendingProfileJson = localStorage.getItem('pending_signup_profile');
                            if (pendingProfileJson) {
                                try {
                                    const pendingProfile = JSON.parse(pendingProfileJson);
                                    await insforge.database.from('profiles').update({
                                        full_name: pendingProfile.full_name,
                                        whatsapp_number: pendingProfile.whatsapp_number
                                    }).eq('id', user.id);
                                    localStorage.removeItem('pending_signup_profile');
                                } catch (e) {}
                            }
                        }
                        
                        window.location.href = '/merchant';
                        return;
                    }
                }

                // Check if they already own a store
                const { data: store } = await insforge.database
                    .from('stores')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (store) {
                    // Process pending profile updates before redirecting
                    if (typeof window !== 'undefined') {
                        const pendingProfileJson = localStorage.getItem('pending_signup_profile');
                        if (pendingProfileJson) {
                            try {
                                const pendingProfile = JSON.parse(pendingProfileJson);
                                await insforge.database.from('profiles').update({
                                    full_name: pendingProfile.full_name,
                                    whatsapp_number: pendingProfile.whatsapp_number
                                }).eq('id', user.id);
                                localStorage.removeItem('pending_signup_profile');
                            } catch (e) {}
                        }
                    }
                    
                    window.location.href = '/merchant';
                    return;
                }
                
                // Process pending profile updates for new users staying on onboarding
                if (typeof window !== 'undefined') {
                    const pendingProfileJson = localStorage.getItem('pending_signup_profile');
                    if (pendingProfileJson) {
                        try {
                            const pendingProfile = JSON.parse(pendingProfileJson);
                            await insforge.database.from('profiles').update({
                                full_name: pendingProfile.full_name,
                                whatsapp_number: pendingProfile.whatsapp_number
                            }).eq('id', user.id);
                            localStorage.removeItem('pending_signup_profile');
                            
                            // Immediately update userName in state so they see it in the welcome screen!
                            if (pendingProfile.full_name) {
                                setUserName(pendingProfile.full_name.split(' ')[0]);
                            }
                        } catch (e) {}
                    }
                }
            } catch (err) { }
            setChecking(false);
        }
        checkStore();
    }, [router]);

    useEffect(() => {
        if (storeName) {
            const slug = storeName
                .toLowerCase()
                .trim()
                .replace(/[\s\u0640]+/g, '-')
                .replace(/[^\w\u0621-\u064A-]/g, '')
                .replace(/--+/g, '-')
                .replace(/^-|-$/g, '');
            const latinSlug = slug
                .replace(/[^\w-]/g, '')
                .replace(/--+/g, '-')
                .replace(/^-|-$/g, '');
            setStoreSlug(latinSlug || slug.replace(/[^\w-]/g, ''));
        } else {
            setStoreSlug('');
        }
    }, [storeName]);

    useEffect(() => {
        if (!storeSlug || storeSlug.length < 3) {
            setSlugAvailable(null);
            return;
        }
        const timer = setTimeout(async () => {
            setSlugChecking(true);
            try {
                const { data } = await insforge.database
                    .from('stores')
                    .select('id')
                    .eq('store_domain', storeSlug)
                    .single();
                setSlugAvailable(!data);
            } catch {
                setSlugAvailable(true);
            }
            setSlugChecking(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [storeSlug]);

    const handleCreateStore = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            if (!storeSlug || storeSlug.length < 3) {
                throw new Error(t('t_184c8ff09'));
            }
            if (!slugAvailable) {
                throw new Error(t('t_1fefb6cde'));
            }

            const { error } = await insforge.database
                .from('stores')
                .insert({
                    user_id: userId,
                    store_name: storeName,
                    store_domain: storeSlug,
                    store_slug: storeSlug,
                    industry: industry || null,
                    description: description || null,
                    support_email: userEmail,
                });

            if (error) throw new Error(error.message);

            try {
                const now = new Date();
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(now.getDate() + 3);

                const { error: profileError } = await insforge.database
                    .from('profiles')
                    .update({ 
                        store_slug: storeSlug,
                        store_name: storeName,
                        email: userEmail,
                        plan: 'free',
                        plan_started_at: now.toISOString(),
                        plan_expires_at: threeDaysFromNow.toISOString()
                    })
                    .eq('id', userId);

                if (profileError) {
                    console.error('Failed to update profile with plan dates:', profileError);
                }
                    
                // Send Welcome Email
                fetch('/api/emails/welcome', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: userEmail, 
                        name: userName, 
                        storeUrl: `https://${storeSlug}.souqai.net` 
                    })
                }).catch(e => console.error('Failed to send welcome email', e));

            } catch (e) { 
                console.error('Profile update error during onboarding:', e);
            }

            setStep(2);
        } catch (err: any) {
            setErrorMsg(err.message || t('t_20d0afb9e'));
        } finally {
            setLoading(false);
        }
    };

    const industries = [
        { value: 'fashion', label: t('t_2a7afdad') },
        { value: 'electronics', label: t('t_1fcf9f5c') },
        { value: 'beauty', label: t('t_679dfb85') },
        { value: 'food', label: t('t_8c57125') },
        { value: 'home', label: t('t_8a99012a') },
        { value: 'sports', label: t('t_346c44e2') },
        { value: 'books', label: t('t_12c498447') },
        { value: 'other', label: t('t_8b4c2f9d') },
    ];

    if (checking) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">{t('t_f8bc40fe')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100" dir="rtl">
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                    @keyframes confetti { 0%,100% { transform: scale(1) rotate(0deg); } 25% { transform: scale(1.15) rotate(-6deg); } 50% { transform: scale(1.05) rotate(3deg); } 75% { transform: scale(1.1) rotate(-3deg); } }
                    body { font-family: 'Cairo', sans-serif; }
                `
            }} />

            {/* ========== FAKE DASHBOARD BACKGROUND ========== */}
            <div className="fixed inset-0 pointer-events-none select-none" style={{ filter: 'blur(3px)', opacity: 0.45 }}>
                {/* Fake Sidebar */}
                <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 p-6 flex flex-col gap-6">
                    <div className="h-10 w-32 bg-slate-200 rounded-lg mx-auto"></div>
                    <div className="flex flex-col gap-3 mt-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                                <div className={`h-4 bg-slate-${i === 1 ? '300' : '100'} rounded-md`} style={{ width: `${60 + i * 10}px` }}></div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Fake Main Content */}
                <div className="absolute top-0 left-0 right-64 bottom-0 p-8">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        </div>
                    </div>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm  border border-slate-100 dark:border-zinc-800">
                                <div className="h-3 w-20 bg-slate-100 rounded mb-3"></div>
                                <div className="h-6 w-24 bg-slate-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                    {/* Chart area */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm  border border-slate-100 dark:border-zinc-800 h-52">
                            <div className="h-3 w-32 bg-slate-100 rounded mb-4"></div>
                            <div className="flex items-end gap-2 h-32">
                                {[35, 55, 40, 70, 50, 85, 65, 90, 55, 75].map((h, i) => (
                                    <div key={i} className="flex-1 bg-primary/15 rounded-t-md" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm  border border-slate-100 dark:border-zinc-800 h-52">
                            <div className="h-3 w-24 bg-slate-100 rounded mb-4"></div>
                            <div className="flex flex-col gap-3 mt-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-3 w-full bg-slate-100 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== MODAL OVERLAY ========== */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/20 backdrop-blur-[2px]">

                {/* ===== Step 0: Welcome ===== */}
                {step === 0 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 w-full max-w-xl text-center" style={{ animation: 'slideUp 0.6s ease-out' }}>
                        {/* Logo */}
                        <Link href="/" className="inline-block mb-5">
                            <div className="h-16 flex items-center justify-center hover:scale-105 transition-transform">
                                <img src="/images/logo_cropped.png" alt="SOUQ AI" className="h-full object-contain dark:hidden" />
                                <img src="/images/logo_dark.png" alt="SOUQ AI" className="h-full object-contain hidden dark:block" />
                            </div>
                        </Link>

                        <div className="text-6xl mb-5" style={{ animation: 'confetti 2s ease-in-out infinite' }}>🎉</div>

                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                            
                            {t('t_dc29dd14')}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-pink-500">{userName}</span>!
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                            
                            {t('t_9827b91')} <strong className="text-slate-900 dark:text-white">SOUQ AI</strong>
                        </p>
                        <p className="text-base text-slate-400 mb-8">
                            
                            {t('t_82887f46')}
                        </p>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                                { emoji: '🛍️', title: t('t_89ca12f2'), sub: t('t_8953fe3') },
                                { emoji: '⚡', title: t('t_e974cb4b'), sub: t('t_24120ac23') },
                                { emoji: '📈', title: t('t_6db70d8'), sub: t('t_91e1774d') },
                            ].map((f, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                                    <div className="text-2xl mb-2">{f.emoji}</div>
                                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 mb-0.5">{f.title}</h3>
                                    <p className="text-[11px] text-slate-400">{f.sub}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="bg-gradient-to-r from-primary to-pink-500 text-white font-bold text-base py-3.5 px-10 rounded-full shadow-[0_4px_20px_rgba(233,32,99,0.35)] hover:shadow-[0_6px_30px_rgba(233,32,99,0.5)] transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                        >
                            <span>{t('t_d4cd737a')}</span>
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </button>

                        {/* Progress */}
                        <div className="mt-6 flex items-center gap-2 justify-center">
                            <div className="w-8 h-1.5 rounded-full bg-primary"></div>
                            <div className="w-5 h-1.5 rounded-full bg-slate-200"></div>
                            <div className="w-5 h-1.5 rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                )}

                {/* ===== Step 1: Store Setup ===== */}
                {step === 1 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 w-full max-w-2xl" style={{ animation: 'slideUp 0.5s ease-out' }}>

                        <div className="text-center mb-5">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary/25">
                                <span className="material-symbols-outlined text-2xl text-white">storefront</span>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-0.5">{t('t_166b92984')}</h2>
                            <p className="text-slate-400 text-xs">{t('t_8f510312')}</p>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-xl text-xs text-center font-bold mb-4">
                                {errorMsg}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                            {/* Store Name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('t_2d89ad92')} <span className="text-red-400">*</span></label>
                                <input
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary focus:border-primary py-2.5 px-3.5 text-sm transition-all outline-none text-right"
                                    placeholder={t('t_e8c3ede1')}
                                    required
                                />
                            </div>

                            {/* Store Slug */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('t_a12bd622')} <span className="text-red-400">*</span></label>
                                <input
                                    value={storeSlug}
                                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary focus:border-primary py-2.5 px-3.5 text-sm transition-all outline-none text-left font-mono"
                                    placeholder="my-store"
                                    dir="ltr"
                                    required
                                />
                                {storeSlug.length >= 3 && (
                                    <div className="flex items-center gap-1.5 text-[11px] mt-0.5 px-0.5">
                                        {slugChecking ? (
                                            <>
                                                <div className="w-2.5 h-2.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-slate-400">{t('t_f8bc40fe')}</span>
                                            </>
                                        ) : slugAvailable ? (
                                            <>
                                                <span className="material-symbols-outlined text-emerald-500 text-xs">check_circle</span>
                                                <span className="text-emerald-600 font-bold">{t('t_c924c5e')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-red-400 text-xs">cancel</span>
                                                <span className="text-red-500 font-bold">{t('t_f90b72c1')}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Domain Preview - full width */}
                            <div className="sm:col-span-2 bg-primary/5 border border-primary/15 rounded-xl p-3">
                                <p className="text-[11px] text-slate-400 mb-1">{t('t_a78ab6b2')}</p>
                                <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-zinc-900 rounded-lg py-2 px-3 border border-slate-200 dark:border-zinc-800">
                                    <span className="material-symbols-outlined text-emerald-500 text-base">link</span>
                                    <span className="text-emerald-600 font-mono font-bold text-sm" dir="ltr">
                                        {storeSlug || '____'}.souqai.net
                                    </span>
                                </div>
                            </div>

                            {/* Industry - full width */}
                            <div className="sm:col-span-2 flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('t_181885dbb')}</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {industries.map((ind) => (
                                        <button
                                            key={ind.value}
                                            type="button"
                                            onClick={() => setIndustry(ind.value)}
                                            className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all border ${industry === ind.value
                                                ? 'bg-primary/10 border-primary text-primary shadow-sm '
                                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                                }`}
                                        >
                                            <span>{ind.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description - full width */}
                            <div className="sm:col-span-2 flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('t_270dee0d')} <span className="text-slate-400 font-normal">{t('t_c119eb8')}</span></label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary focus:border-primary py-2.5 px-3.5 text-sm transition-all outline-none resize-none text-right"
                                    placeholder={t('t_373c59ce')}
                                    rows={2}
                                />
                            </div>

                            {/* Submit + Back - full width */}
                            <div className="sm:col-span-2 flex flex-col gap-2 mt-1">
                                <button
                                    onClick={handleCreateStore}
                                    disabled={loading || !storeName || !storeSlug || storeSlug.length < 3 || !slugAvailable}
                                    className={`w-full bg-gradient-to-r from-primary to-pink-500 text-white font-bold text-sm py-3 rounded-xl shadow-[0_4px_20px_rgba(233,32,99,0.3)] transition-all duration-300 flex items-center justify-center gap-2 ${loading || !storeName || !storeSlug || storeSlug.length < 3 || !slugAvailable
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:shadow-[0_6px_30px_rgba(233,32,99,0.5)] hover:-translate-y-0.5'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>{t('t_1ed9e084a')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">rocket_launch</span>
                                            <span>{t('t_b7f3264c')}</span>
                                        </>
                                    )}
                                </button>
                                <button type="button" onClick={() => setStep(0)} className="text-xs text-slate-400 hover:text-slate-700 dark:text-slate-300 transition-colors text-center">
                                    
                                    {t('t_12ee1faa')}
                                </button>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-4 flex items-center gap-2 justify-center">
                            <div className="w-5 h-1.5 rounded-full bg-primary/40"></div>
                            <div className="w-8 h-1.5 rounded-full bg-primary"></div>
                            <div className="w-5 h-1.5 rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                )}

                {/* ===== Step 2: Success ===== */}
                {step === 2 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 w-full max-w-lg text-center" style={{ animation: 'slideUp 0.6s ease-out' }}>

                        <div className="text-7xl mb-5" style={{ animation: 'confetti 2s ease-in-out infinite' }}>🎉</div>

                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                            
                            {t('t_5b3e9eb9')}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-pink-500">{t('t_59dd555b')}</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                            
                            {t('t_8993aea8')} <strong className="text-slate-900 dark:text-white">{storeName}</strong>  {t('t_405ead0c')}
                        </p>

                        {/* Store URL */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 my-6 mx-auto max-w-sm">
                            <p className="text-xs text-slate-400 mb-2">{t('t_92b1f87d')}</p>
                            <div className="bg-white dark:bg-zinc-900 rounded-xl py-3 px-4 border border-slate-200 dark:border-zinc-800 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">public</span>
                                <span className="text-emerald-600 font-mono font-bold text-base" dir="ltr">{storeSlug}.souqai.net</span>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 mb-6">
                            
                            {t('t_1adea8d70')}
                        </p>

                        <button
                            onClick={() => router.push('/merchant')}
                            className="bg-gradient-to-r from-primary to-pink-500 text-white font-bold text-base py-3.5 px-10 rounded-full shadow-[0_4px_20px_rgba(233,32,99,0.35)] hover:shadow-[0_6px_30px_rgba(233,32,99,0.5)] transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                        >
                            <span className="material-symbols-outlined text-lg">dashboard</span>
                            <span>{t('t_3aab4bd7')}</span>
                        </button>

                        {/* Progress */}
                        <div className="mt-6 flex items-center gap-2 justify-center">
                            <div className="w-5 h-1.5 rounded-full bg-primary/40"></div>
                            <div className="w-5 h-1.5 rounded-full bg-primary/40"></div>
                            <div className="w-8 h-1.5 rounded-full bg-primary"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
