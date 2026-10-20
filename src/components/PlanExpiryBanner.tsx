'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/I18nContext';

interface PlanExpiryBannerProps {
    expiresAt: string; // ISO date string
    planName: string;
}

export default function PlanExpiryBanner({ expiresAt, planName }: PlanExpiryBannerProps) {
    const { t, lang } = useI18n();
    const router = useRouter();
    const [dismissed, setDismissed] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        // Check if banner was dismissed today
        const dismissKey = `plan_banner_dismissed_${new Date().toISOString().split('T')[0]}`;
        if (localStorage.getItem(dismissKey)) {
            setDismissed(true);
        }

        const calculateTimeLeft = () => {
            const diff = new Date(expiresAt).getTime() - Date.now();
            if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (dismissed || timeLeft.days > 5) return null;

    const handleDismiss = () => {
        const dismissKey = `plan_banner_dismissed_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(dismissKey, 'true');
        setDismissed(true);
    };

    const isUrgent = timeLeft.days <= 1;

    return (
        <div
            className={`w-full py-2.5 px-4 flex items-center justify-center gap-3 text-white text-sm font-bold animate-in slide-in-from-top duration-300 relative z-[60] ${
                isUrgent
                    ? 'bg-gradient-to-r from-red-600 via-rose-500 to-orange-500'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500'
            }`}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
            {/* Icon */}
            <span className={`material-symbols-outlined text-lg ${isUrgent ? 'animate-pulse' : ''}`}>
                {isUrgent ? 'warning' : 'schedule'}
            </span>

            {/* Message */}
            <span className="hidden sm:inline">
                {isUrgent ? t('t_20f269df') : t('t_c394c8e7')}
                {' — '}
                {t('t_44a')} {t(planName) || planName}
            </span>
            <span className="sm:hidden">
                {isUrgent ? t('t_8a88bf0a') : t('t_26b6bc74')}
            </span>

            {/* Countdown */}
            <div className="flex items-center gap-1.5" dir="ltr">
                {timeLeft.days > 0 && (
                    <>
                        <span className="bg-white/20 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs font-black tabular-nums min-w-[28px] text-center">
                            {timeLeft.days}
                        </span>
                        <span className="text-white/70 text-[10px]">{t('t_bf54')}</span>
                    </>
                )}
                <span className="bg-white/20 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs font-black tabular-nums min-w-[28px] text-center">
                    {timeLeft.hours}
                </span>
                <span className="text-white/70 text-[10px]">{t('t_62c')}</span>
                <span className="bg-white/20 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs font-black tabular-nums min-w-[28px] text-center">
                    {timeLeft.minutes}
                </span>
                <span className="text-white/70 text-[10px]">{t('t_62e')}</span>
            </div>

            {/* CTA Button */}
            <button
                onClick={() => router.push('/upgrade')}
                className="bg-white text-xs font-black px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md whitespace-nowrap"
                style={{ color: isUrgent ? '#dc2626' : '#d97706' }}
            >
                {t('t_25505c87')}
            </button>

            {/* Dismiss */}
            <button
                onClick={handleDismiss}
                className={`absolute ${lang === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors`}
            >
                <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
        </div>
    );
}
