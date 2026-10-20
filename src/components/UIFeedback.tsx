'use client';
import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    subMessage?: string;
    type?: ToastType;
    visible: boolean;
    onClose: () => void;
    duration?: number;
}

const icons: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'cancel',
    warning: 'warning',
    info: 'info',
};

const styles: Record<ToastType, { bg: string; icon: string; bar: string }> = {
    success: { bg: 'bg-emerald-500', icon: 'text-white', bar: 'bg-white/30' },
    error:   { bg: 'bg-red-500',     icon: 'text-white', bar: 'bg-white/30' },
    warning: { bg: 'bg-amber-500',   icon: 'text-white', bar: 'bg-white/30' },
    info:    { bg: 'bg-blue-500',    icon: 'text-white', bar: 'bg-white/30' },
};

export function Toast({ message, subMessage, type = 'success', visible, onClose, duration = 3500 }: ToastProps) {
    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [visible, duration, onClose]);

    const s = styles[type];

    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
            }`}
            dir="rtl"
        >
            <div className={`${s.bg} text-white rounded-2xl shadow-2xl flex items-start gap-3 py-4 px-5 min-w-[300px] max-w-sm`}>
                <span className={`material-symbols-outlined text-2xl flex-shrink-0 mt-0.5 ${s.icon}`}>
                    {icons[type]}
                </span>
                <div className="flex-1">
                    <p className="font-bold text-sm leading-snug">{message}</p>
                    {subMessage && <p className="text-white/80 text-xs mt-1 leading-relaxed">{subMessage}</p>}
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
        </div>
    );
}

// ── Confirm Modal ──────────────────────────────────────────────
interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    dangerous?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    visible, title, message,
    confirmLabel = "تأكيد", cancelLabel = "إلغاء",
    dangerous = false, onConfirm, onCancel,
}: ConfirmModalProps) {
    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
                visible ? 'opacity-100 backdrop-blur-sm bg-black/30' : 'opacity-0 pointer-events-none'
            }`}
            dir="rtl"
        >
            <div
                className={`bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 p-7 w-full max-w-sm transition-all duration-300 ${
                    visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                }`}
            >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dangerous ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <span className={`material-symbols-outlined text-3xl ${dangerous ? 'text-red-500' : 'text-blue-500'}`}>
                        {dangerous ? 'delete_forever' : 'help'}
                    </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white text-center mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:bg-slate-800/50 transition-all"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 ${
                            dangerous
                                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                                : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
