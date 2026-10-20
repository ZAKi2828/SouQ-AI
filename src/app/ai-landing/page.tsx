'use client';
import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import SOUQAILoader from '@/components/SOUQAILoader';
import { useRouter } from 'next/navigation';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { insforge } from '@/lib/insforge';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import StoreLinkButton from '@/components/StoreLinkButton';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';
import { useI18n } from "@/context/I18nContext";
import { generateAdPoster } from '@/lib/adCanvasGenerator';
export default function AILandingGenerator() {
    const { t, lang } = useI18n();
    const { planExpired, currentPlan } = useExpiredPlanGuard();
    const router = useRouter();
    const [selectedLanguage, setSelectedLanguage] = useState(t('t_2d61b8df'));
    const [selectedDimension, setSelectedDimension] = useState('1:1');
    const [showPrice, setShowPrice] = useState(false);
    const [price, setPrice] = useState('4500');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [aiCredits, setAiCredits] = useState<number | null>(null);
    const [userPlan, setUserPlan] = useState('free');
    const [isAiEnabled, setIsAiEnabled] = useState(true);
    const [copiedPrompt, setCopiedPrompt] = useState(false);

    useEffect(() => {
        const fetchCreditsAndPlan = async () => {
            const { data: sessionData } = await insforge.auth.getCurrentSession();
            if (sessionData?.session?.user?.id) {
                const { data: profile } = await insforge.database
                    .from('profiles')
                    .select('plan, ai_image_credits')
                    .eq('id', sessionData.session.user.id)
                    .single();
                if (profile) {
                    setUserPlan(profile.plan || 'free');
                    if (profile.ai_image_credits !== undefined) setAiCredits(profile.ai_image_credits);
                }
            }

            const { data: aiSettings } = await insforge.database.from('ai_settings').select('ai_enabled').eq('id', 1).single();
            if (aiSettings && aiSettings.ai_enabled === false) {
                setIsAiEnabled(false);
            }
        };
        fetchCreditsAndPlan();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!isAiEnabled) {
            alert(t('t_2069d0519'));
            return;
        }
        if (!imagePreviewUrl) {
            alert(t('t_cb0d0bea'));
            return;
        }

        setIsGenerating(true);
        try {
            // Get AI settings and user plan
            try {
                const { data: aiSettings } = await insforge.database
                    .from('ai_settings')
                    .select('ai_enabled, free_image_quota, pro_image_quota, vip_image_quota')
                    .eq('id', 1)
                    .single();

                const { data: session } = await insforge.auth.getCurrentSession();
                let uid = session?.session?.user?.id;
                let currentCredits = 0;
                let currentUserPlan = 'free';
                
                if (uid) {
                    const { data: profile } = await insforge.database
                        .from('profiles')
                        .select('plan, ai_image_credits')
                        .eq('id', uid)
                        .single();
                    if (profile?.plan) {
                        const p = profile.plan.toLowerCase();
                        if (p === 'vip' || p === t('t_15187dfac')) currentUserPlan = 'vip';
                        else if (p === t('t_74dcec9f') || p === 'pro') currentUserPlan = 'pro';
                        else currentUserPlan = 'free';
                    }
                    currentCredits = profile?.ai_image_credits || 0;
                    setAiCredits(currentCredits);
                    setUserPlan(currentUserPlan);
                }

                if (aiSettings) {
                    if (!aiSettings.ai_enabled) {
                        alert(t('t_2069d0519'));
                        setIsGenerating(false);
                        return;
                    }

                    const isUnlimited = currentUserPlan === 'vip' && aiSettings.vip_image_quota === 'unlimited';

                    if (!isUnlimited && currentCredits < 1) {
                        alert(t('t_fad9c3e4'));
                        setIsGenerating(false);
                        return;
                    }
                }
            } catch (e) { console.error('Error checking quota:', e); }

            const response = await fetch('/api/ai-landing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageBase64: imagePreviewUrl,
                    mimeType: imageFile?.type || 'image/jpeg',
                    language: selectedLanguage,
                    dimension: selectedDimension,
                    showPrice,
                    price
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || t('t_105db4f21'));
            }

            const data = await response.json();

            // Strategy 1: Nano Banana AI image generation & prompt
            setGeneratedData(data);

            // Restore direct RPC deduction logic
            if (aiCredits !== null && aiCredits !== 999999999) {
                const { data: sessionData } = await insforge.auth.getCurrentSession();
                const sessionUserId = sessionData?.session?.user?.id;
                if (sessionUserId) {
                    try {
                        const { error: rpcErr } = await insforge.database.rpc('deduct_ai_credit', {
                            p_user_id: sessionUserId,
                            p_credit_type: 'ai_image_credits',
                            p_new_balance: aiCredits - 1
                        });
                        
                        if (rpcErr) throw rpcErr;
                        setAiCredits(prev => prev !== null ? prev - 1 : null);
                    } catch (err) {
                        console.error('RPC deduction failed, trying direct fallback:', err);
                        // Fallback to direct update if RPC fails
                        await insforge.database
                            .from('profiles')
                            .update({ ai_image_credits: aiCredits - 1 })
                            .eq('id', sessionUserId);
                        setAiCredits(prev => prev !== null ? prev - 1 : null);
                    }
                }
            }

        } catch (error: any) {
            console.error("Generate error:", error);
            alert(t('t_cf973909') + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
        {planExpired && (
            <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
        )}
        <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar activePage="AILanding" />

            <main className="flex-1 h-full overflow-y-auto scroll-smooth custom-scrollbar relative pt-16 md:pt-0">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* BEGIN: Input Section (Left Column) */}
                        <section className="lg:col-span-5 space-y-6">
                            {/* Header Info */}
                            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="p-2 bg-pink-100 dark:bg-[#E91E63]/20 rounded-lg text-[#E91E63]">
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                            </svg>
                                        </span>
                                        <h1 className="text-[28px] font-black tracking-tight text-[#111827] dark:text-white">{t('t_d5814e31')}</h1>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">{t('t_799ec3c8')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StoreLinkButton />
                                    <NotificationsDropdown />
                                </div>
                            </header>

                            {/* Product Image Upload */}
                            <div className="bg-white dark:bg-white/5 p-6 rounded-3xl shadow-sm  border border-slate-100 dark:border-white/5 transition-all relative overflow-hidden">
                                <label className="block text-sm font-bold mb-4 text-[#111827] dark:text-white z-10 relative">{t('t_12fbbb689')}</label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all z-10 relative overflow-hidden
                                        ${imagePreviewUrl ? 'border-transparent p-0' : 'border-slate-300 dark:border-zinc-800 hover:border-[#E91E63] hover:bg-[#E91E63]/5 p-8'}`}
                                >
                                    {imagePreviewUrl ? (
                                        <div className="relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden group">
                                            <Image src={imagePreviewUrl} alt="Uploaded" fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <span className="text-white font-bold bg-white/20 px-4 py-2 rounded-xl border border-white/30 backdrop-blur-md">{t('t_10df13219')}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                            </svg>
                                            <p className="text-sm font-semibold mb-1 text-[#111827] dark:text-white">{t('t_49432bf0')}</p>
                                            <p className="text-xs text-slate-400">{t('t_e9a6e3c5')}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Settings: Language & Dimensions */}
                            <div className="bg-white dark:bg-white/5 p-6 rounded-3xl shadow-sm  border border-slate-100 dark:border-white/5 space-y-8">

                                {/* Language Selection */}
                                <div>
                                    <label className="block text-sm font-bold mb-4 text-[#111827] dark:text-white">{t('t_ba1c30ff')}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[t('t_2d61b8df'), t('t_46c9a4c7'), 'Français', 'English'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => setSelectedLanguage(lang)}
                                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${selectedLanguage === lang
                                                    ? 'bg-[#E91E63] text-white shadow-md shadow-[#E91E63]/30'
                                                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                                                    }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dimensions Selection */}
                                <div>
                                    <label className="block text-sm font-bold mb-4 text-[#111827] dark:text-white">{t('t_109df5334')}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div
                                            onClick={() => setSelectedDimension('9:32')}
                                            className={`cursor-pointer border-2 p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-colors ${selectedDimension === '9:32' ? 'border-[#E91E63] bg-[#E91E63]/5' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                        >
                                            <div className={`w-6 h-14 border-2 rounded flex items-center justify-center ${selectedDimension === '9:32' ? 'border-[#E91E63]/40 bg-[#E91E63]/10' : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5'}`}>
                                                <span className={`text-[8px] font-bold ${selectedDimension === '9:32' ? 'text-[#E91E63]' : 'text-slate-400'}`}>9:32</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-[#111827] dark:text-white">{t('t_12de5921d')}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('t_11b2e2862')}</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => setSelectedDimension('9:16')}
                                            className={`cursor-pointer border-2 p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-colors ${selectedDimension === '9:16' ? 'border-[#E91E63] bg-[#E91E63]/5' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                        >
                                            <div className={`w-8 h-12 border-2 rounded flex items-center justify-center ${selectedDimension === '9:16' ? 'border-[#E91E63]/40 bg-[#E91E63]/10' : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5'}`}>
                                                <span className={`text-[9px] font-bold ${selectedDimension === '9:16' ? 'text-[#E91E63]' : 'text-slate-400'}`}>9:16</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-[#111827] dark:text-white">{t('t_28708b1f')}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('t_24c709ce')}</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => setSelectedDimension('1:1')}
                                            className={`cursor-pointer border-2 p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-colors ${selectedDimension === '1:1' ? 'border-[#E91E63] bg-[#E91E63]/5' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 border-2 rounded flex items-center justify-center ${selectedDimension === '1:1' ? 'border-[#E91E63]/40 bg-[#E91E63]/10' : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5'}`}>
                                                <span className={`text-[10px] font-bold ${selectedDimension === '1:1' ? 'text-[#E91E63]' : 'text-slate-400'}`}>1:1</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-[#111827] dark:text-white">{t('t_16c63333')}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('t_3f6e1fcc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Toggle & Input */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-[#111827] dark:text-white">{t('t_829c2635')}</label>
                                        <button
                                            onClick={() => setShowPrice(!showPrice)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showPrice ? 'bg-[#E91E63]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                            role="switch"
                                        >
                                            <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow ring-0 transition duration-200 ease-in-out ${showPrice ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                        </button>
                                    </div>
                                    {showPrice && (
                                        <div className="relative mt-2">
                                            <input
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 font-bold text-lg focus:ring-[#E91E63] focus:border-[#E91E63] outline-none text-[#111827] dark:text-white"
                                                placeholder="4500"
                                                type="number"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-slate-400 font-bold">{t('t_17422d')}</span>
                                            </div>
                                            <label className="absolute -top-2.5 right-3 bg-white dark:bg-zinc-900 px-2 text-[10px] font-black text-[#E91E63] uppercase tracking-wider rounded">{t('t_5e14deab')}</label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CTA Action */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-[#111827] dark:text-white">{t('t_107ca281e')}</span>
                                {aiCredits !== null && (
                                    <div className="flex items-center gap-1.5 bg-[#E91E63]/10 text-[#E91E63] font-black px-3 py-1.5 rounded-lg text-xs border border-[#E91E63]/20 shadow-sm ">
                                        <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                                        
                                        {t('t_19be74526')} {aiCredits}  {t('t_5b260e97')}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={!isAiEnabled || isGenerating || (userPlan !== 'vip' && (aiCredits === null || aiCredits < 1))}
                                className={`w-full ${!isAiEnabled ? 'bg-slate-400' : 'bg-[#E91E63] hover:bg-[#C2185B]'} text-white font-extrabold py-5 px-8 rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all`}
                            >
                                <div className="flex items-center gap-2 text-lg">
                                    <span>{!isAiEnabled ? t('t_12d0da519') : isGenerating ? t('t_8f281e70') : t('t_35f5ed7')}</span>
                                </div>
                                {!isGenerating && (
                                    <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full border border-white/20">{t('t_1ce10a624')}</span>
                                )}
                            </button>
                        </section>

                        {/* BEGIN: Output Section (Right Column) */}
                        <section className="lg:col-span-7 space-y-6">

                            {isGenerating ? (
                                <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-white/5">
                                    <SOUQAILoader size="lg" text={t('t_27172dd41')} />
                                </div>
                            ) : generatedData ? (
                                <>
                                    {/* Generated Image Card or Product Photo with Notice */}
                                    <div className="bg-white dark:bg-zinc-900 p-4 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h2 className="text-xl font-extrabold flex items-center gap-2 text-[#111827] dark:text-white">
                                                <span className="text-[#E91E63] text-2xl">🎨</span>
                                                {generatedData.generated_image_b64 ? t('t_a3330cc7') : (lang === 'ar' ? 'صورة المنتج الأصلية' : 'Uploaded Product')}
                                            </h2>
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                <a
                                                    href={generatedData.generated_image_b64 || imagePreviewUrl || '#'}
                                                    download={`SouqAI_Ad_${generatedData.product_name || 'Product'}.jpg`}
                                                    className="h-10 px-4 flex items-center gap-2 rounded-xl bg-slate-100 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors text-sm shadow-md"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    {t('t_ad4726f4')}
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        localStorage.setItem('aiGeneratedProduct', JSON.stringify({
                                                            name: generatedData.product_name,
                                                            price: price,
                                                            description: generatedData.benefits?.join('\n') || '',
                                                            imageUrl: generatedData.generated_image_b64 || imagePreviewUrl,
                                                            template: 'image'
                                                        }));
                                                        router.push('/inventory/add');
                                                    }}
                                                    className="h-10 px-4 flex items-center gap-2 rounded-xl bg-[#E91E63] text-white font-bold hover:bg-[#C2185B] transition-colors text-sm shadow-md"
                                                >
                                                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                                    {t('t_167629ebb')}
                                                </button>
                                            </div>
                                        </div>

                                        {!generatedData.generated_image_b64 && (
                                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-start gap-2.5">
                                                <span className="text-base">⚠️</span>
                                                <span>
                                                    {lang === 'ar'
                                                        ? 'نموذج Nano Banana يتطلب مفتاح Gemini مفعل فيه الفوترة (Pay-as-you-go). تم استخراج برومبت Nano Banana ونصوص الإعلان بدقة بالأسفل ويمكنك نسخه واستخدامه فوراً!'
                                                        : 'Nano Banana requires a billed Gemini API key (Quota 0 on free tier). The full prompt and ad copy have been extracted below for immediate copy.'}
                                                </span>
                                            </div>
                                        )}

                                        <div className={`relative w-full rounded-2xl overflow-hidden shadow-lg border-4 border-slate-50 dark:border-white/5 mx-auto ${selectedDimension === '9:32' ? 'aspect-[9/32] max-w-sm' : selectedDimension === '9:16' ? 'aspect-[9/16] max-w-sm' : 'aspect-square max-w-lg'}`}>
                                            <Image
                                                src={generatedData.generated_image_b64 || imagePreviewUrl || ''}
                                                fill
                                                className="object-cover"
                                                alt={generatedData.product_name || t('t_42e207af')}
                                            />
                                        </div>
                                    </div>

                                    {/* Content Card: Ad Text Content */}
                                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                                            <h2 className="text-xl font-extrabold flex items-center gap-2 text-[#111827] dark:text-white">
                                                <span className="text-[#E91E63] text-2xl">✍️</span>
                                                {t('t_a6da44f1')}
                                            </h2>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('t_b33b7db9')}</p>
                                                <h3 className="text-2xl font-black text-[#111827] dark:text-white leading-snug">{generatedData.hero_headline || t('t_52c4c462')}</h3>
                                                {showPrice && <p className="inline-block mt-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg font-bold text-sm">{t('t_124928782')} {price} {t('t_17422d')}</p>}
                                            </div>

                                            <div className="bg-slate-50 dark:bg-zinc-950 p-6 rounded-2xl border-r-4 border-[#E91E63]">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('t_17614c937')}</p>
                                                <ul className="space-y-4 font-medium text-[#111827] dark:text-slate-300">
                                                    {generatedData.benefits?.map((benefit: string, idx: number) => (
                                                        <li key={idx} className="flex gap-3 items-start">
                                                            <span className="text-lg leading-none mt-0.5">•</span>
                                                            <span className="leading-relaxed">{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nano Banana Prompt Card */}
                                    {generatedData.image_generation_prompt && (
                                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                                                <h3 className="text-base font-extrabold flex items-center gap-2 text-[#111827] dark:text-white">
                                                    <span className="text-amber-500 text-xl">🍌</span>
                                                    <span>{lang === 'ar' ? 'برومبت نانو بنانة المخصص (Nano Banana Prompt)' : 'Nano Banana Prompt'}</span>
                                                </h3>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(generatedData.image_generation_prompt);
                                                        setCopiedPrompt(true);
                                                        setTimeout(() => setCopiedPrompt(false), 2000);
                                                    }}
                                                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/20 transition-colors text-xs flex items-center gap-1.5"
                                                >
                                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                                    <span>{copiedPrompt ? (lang === 'ar' ? 'تم النسخ! ✅' : 'Copied! ✅') : (lang === 'ar' ? 'نسخ البرومبت' : 'Copy Prompt')}</span>
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {lang === 'ar'
                                                    ? 'تم استخراج هذا البرومبت بالذكاء الاصطناعي مع هيكل وتدفق بصري مخصص لصورة منتجك. يمكنك نسخه مباشرة واستخدامه في نموذج Nano Banana.'
                                                    : 'Extracted AI prompt tailored for Nano Banana mobile ad creation.'}
                                            </p>
                                            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono max-h-56 overflow-y-auto whitespace-pre-wrap dir-ltr text-left select-all">
                                                {generatedData.image_generation_prompt}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5 text-slate-400">
                                    <span className="material-symbols-outlined">magic_button</span>
                                    <p className="font-bold text-lg mb-2 text-slate-500 dark:text-slate-400">{t('t_99bbac67')}</p>
                                    <p className="text-sm max-w-sm text-center">{t('t_1a58628e8')}</p>
                                </div>
                            )}

                        </section>

                    </div>

                    <footer className="mt-12 text-center text-slate-400 text-sm font-medium border-t border-gray-100 dark:border-zinc-800 pt-8">
                        <p>{t('t_fcf988ba')}</p>
                    </footer>
                </div>
            </main>
        </div>
        </>
    );
}
