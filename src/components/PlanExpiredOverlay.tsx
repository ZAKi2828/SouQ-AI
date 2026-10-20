'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/I18nContext';

interface PlanExpiredOverlayProps {
    planName: string;
    onRenew?: () => void;
}

export default function PlanExpiredOverlay({ planName, onRenew }: PlanExpiredOverlayProps) {
    const router = useRouter();
    const { t } = useI18n();

    const handleUpgrade = () => {
        router.push('/upgrade');
    };

    const handleRenew = () => {
        if (onRenew) {
            onRenew();
        } else {
            // Redirect to upgrade page with renew action
            router.push(`/upgrade?action=renew&plan=${encodeURIComponent(planName)}`);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.6)' }}>
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-500/10 to-orange-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-500">
                {/* Header */}
                <div className="bg-gradient-to-bl from-red-500 to-rose-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <span className="material-symbols-outlined text-white text-4xl">timer_off</span>
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">{t("t_4e3a6c39")}</h2>
                        <p className="text-white/80 text-sm font-medium">
                            لوحة التحكم مقفلة حالياً
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-6">
                    {/* Plan info */}
                    <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-5 py-2.5 rounded-full text-sm font-bold border border-red-100 dark:border-red-800">
                        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                        خطة {planName} — منتهية
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        متجرك لا يزال مرئياً للعملاء ويمكنهم تصفحه بشكل طبيعي.
                        لكنك لن تتمكن من الوصول للوحة التحكم لإدارة المنتجات أو الطلبات حتى تقوم بتجديد اشتراكك.
                    </p>

                    {/* Features locked */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2">
                        {[
                            t('t_d723ac14'),
                            t('t_a1f5590'),
                            t('t_8e2cb1ef'),
                            'إعدادات المتجر',
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="material-symbols-outlined text-[16px] text-red-400">lock</span>
                                {feature}
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={handleRenew}
                            className="w-full bg-gradient-to-l from-pink-500 to-rose-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-pink-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">autorenew</span>{t("t_cd19477b")}</button>
                        <button
                            onClick={handleUpgrade}
                            className="w-full bg-gradient-to-l from-amber-500 to-orange-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">upgrade</span>
                            ترقية الخطة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
