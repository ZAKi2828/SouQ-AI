'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/context/I18nContext';

interface CountdownTimerProps {
    enabled: boolean;
    text?: string;
    duration?: number; // in minutes
}

export default function CountdownTimer({ enabled, text, duration = 60 }: CountdownTimerProps) {
    const { t, lang } = useI18n();
    const [timeLeft, setTimeLeft] = useState(0);
    const initialized = useRef(false);

    useEffect(() => {
        if (!enabled) return;

        // Use sessionStorage to persist countdown across re-renders but reset on new session
        const storageKey = `countdown_${duration}`;
        let endTime: number;

        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
            endTime = parseInt(stored, 10);
        } else {
            endTime = Date.now() + duration * 60 * 1000;
            sessionStorage.setItem(storageKey, endTime.toString());
        }

        const updateTimer = () => {
            const remaining = Math.max(0, endTime - Date.now());
            setTimeLeft(remaining);
            if (remaining <= 0) {
                // Reset when expired
                const newEnd = Date.now() + duration * 60 * 1000;
                sessionStorage.setItem(storageKey, newEnd.toString());
                setTimeLeft(duration * 60 * 1000);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        initialized.current = true;

        return () => clearInterval(interval);
    }, [enabled, duration]);

    if (!enabled || !initialized.current) return null;

    const totalSeconds = Math.floor(timeLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const displayText = text || 'ينتهي العرض خلال:'; // 'ينتهي العرض خلال:'

    const getLabel = (type: 'hours' | 'minutes' | 'seconds') => {
        if (lang === 'ar') {
            return type === 'hours' ? 'ساعة' : type === 'minutes' ? 'دقيقة' : 'ثانية';
        } else if (lang === 'fr') {
            return type === 'hours' ? 'heures' : type === 'minutes' ? 'minutes' : 'secondes';
        } else {
            return type === 'hours' ? 'hours' : type === 'minutes' ? 'minutes' : 'seconds';
        }
    };

    return (
        <div className="w-full rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-4 py-3 flex items-center justify-center gap-3 text-white">
                <span className="material-symbols-outlined text-xl animate-pulse">timer</span>
                <span className="font-bold text-sm md:text-base">{displayText}</span>
                <div className="flex items-center gap-1.5" dir="ltr">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 min-w-[40px] text-center">
                        <span className="font-black text-lg md:text-xl tabular-nums">{pad(hours)}</span>
                        <span className="block text-[9px] font-bold opacity-80 -mt-0.5">{getLabel('hours')}</span>
                    </div>
                    <span className="font-black text-lg animate-pulse">:</span>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 min-w-[40px] text-center">
                        <span className="font-black text-lg md:text-xl tabular-nums">{pad(minutes)}</span>
                        <span className="block text-[9px] font-bold opacity-80 -mt-0.5">{getLabel('minutes')}</span>
                    </div>
                    <span className="font-black text-lg animate-pulse">:</span>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 min-w-[40px] text-center">
                        <span className="font-black text-lg md:text-xl tabular-nums">{pad(seconds)}</span>
                        <span className="block text-[9px] font-bold opacity-80 -mt-0.5">{getLabel('seconds')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
