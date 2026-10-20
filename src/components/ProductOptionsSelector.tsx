'use client';

import React from 'react';
import { useProductOptions } from './ProductOptionsProvider';

type Variant = 'light' | 'dark' | 'minimal' | 'luxury' | 'fresh' | 'elegant' | 'bold' | 'classic' | 'fashion' | 'tech' | 'skincare' | 'food' | 'perfume' | 'decor' | 'digital' | 'form';

export default function ProductOptionsSelector({ options, variant = 'light' }: { options: any[], variant?: Variant }) {
    const { selectedOptions, setSelectedOptions } = useProductOptions();

    if (!options || !Array.isArray(options) || options.length === 0) return null;

    // Default to a sane layout wrapper
    const baseContainer = "flex flex-col gap-6 my-6 w-full";
    const baseOptContainer = "flex flex-col gap-2.5";
    const baseBtnGroup = "flex flex-wrap gap-2.5";
    const baseBtn = "px-5 py-2.5 text-sm font-bold transition-all duration-200 border-2";

    // Style map based on variant/template
    const styles: Record<string, { container: string, label: string, button: string, selectedButton: string }> = {
        light: {
            container: "bg-slate-50 dark:bg-slate-800/50/50 p-1 rounded-2xl",
            label: "text-slate-700 dark:text-slate-300 font-bold text-sm",
            button: "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-zinc-900 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 rounded-xl shadow-sm ",
            selectedButton: "border-blue-500 bg-blue-50 text-blue-700 shadow-sm "
        },
        classic: {
            container: "",
            label: "text-slate-800 dark:text-slate-100 font-black tracking-wide text-sm",
            button: "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-zinc-900 hover:border-slate-800 hover:text-slate-800 dark:text-slate-100 rounded-lg shadow-sm  border",
            selectedButton: "border-slate-900 bg-slate-900 text-white shadow-md border"
        },
        dark: {
            container: "",
            label: "text-white/80 font-bold text-sm",
            button: "border-white/10 text-white/70 bg-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl",
            selectedButton: "border-blue-500 bg-blue-500/20 text-white ring-1 ring-blue-500/50"
        },
        bold: {
            container: "p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md",
            label: "text-white font-black text-sm uppercase tracking-wider",
            button: "border-white/10 text-white/70 bg-black hover:border-white/30 rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.05)]",
            selectedButton: "border-[#e0fa4c] bg-[#e0fa4c]/10 text-[#e0fa4c] shadow-[0_0_15px_rgba(224,250,76,0.2)]"
        },
        tech: {
            container: "p-1",
            label: "text-slate-400 font-mono text-xs uppercase tracking-widest",
            button: "border-slate-700 text-slate-400 bg-slate-800/50 hover:bg-slate-700 hover:text-white rounded-lg",
            selectedButton: "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        },
        digital: {
            container: "",
            label: "text-sky-400 font-bold text-sm tracking-widest",
            button: "border-slate-700/50 text-slate-400 bg-slate-800/30 hover:bg-slate-800 hover:text-white rounded-xl backdrop-blur-sm",
            selectedButton: "border-sky-500 bg-sky-500/10 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]"
        },
        fashion: {
            container: "",
            label: "text-[#1a1814] font-black text-xs tracking-widest uppercase",
            button: "border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400 bg-transparent hover:border-slate-900 hover:text-slate-900 dark:text-white rounded-none",
            selectedButton: "border-slate-900 bg-slate-900 text-white border"
        },
        minimal: {
            container: "",
            label: "text-[#1a1a1a] font-bold text-xs uppercase tracking-[0.2em]",
            button: "border border-[#e5e5e5] text-[#525252] bg-transparent hover:border-[#1a1a1a] hover:text-[#1a1a1a] rounded-none",
            selectedButton: "border-[#1a1a1a] bg-transparent text-[#1a1a1a] border"
        },
        perfume: {
            container: "p-4 bg-white/40 backdrop-blur-md border border-[#d4af37]/20 rounded-2xl",
            label: "text-[#aa771c] font-bold text-sm",
            button: "border-[#d4af37]/30 text-[#5c5851] bg-white/60 hover:border-[#d4af37] hover:bg-white dark:bg-zinc-900 rounded-full",
            selectedButton: "border-[#d4af37] bg-gradient-to-r from-[#d4af37] to-[#aa771c] text-white shadow-lg shadow-[#d4af37]/20"
        },
        luxury: {
            container: "p-5 bg-black/40 backdrop-blur-lg border border-[#c9a84c]/20 rounded-none",
            label: "text-[#c9a84c] font-bold text-xs tracking-[0.3em] uppercase",
            button: "border border-[#c9a84c]/30 text-white/50 bg-transparent hover:text-white hover:border-[#c9a84c]/80 rounded-none",
            selectedButton: "border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c] border"
        },
        elegant: {
            container: "p-5 bg-white dark:bg-zinc-900 border border-[#e8dccf]/50 rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.05)]",
            label: "text-[#b09e88] font-bold text-xs tracking-[0.2em] uppercase",
            button: "border border-[#e8dccf] text-[#7a716a] bg-transparent hover:border-[#b09e88] hover:text-[#2d2926] rounded-xl",
            selectedButton: "border-[#2d2926] bg-[#2d2926] text-[#f8f5f1] border shadow-md"
        },
        decor: {
            container: "",
            label: "text-[#8c7d70] font-medium text-xs tracking-widest uppercase",
            button: "border border-[#e1ded8] text-[#64625e] bg-transparent hover:border-[#8c7d70] hover:text-[#2b2a28] rounded-none",
            selectedButton: "border-[#2b2a28] bg-[#f0ede6] text-[#2b2a28] border"
        },
        fresh: {
            container: "p-5 bg-white dark:bg-zinc-900 border-2 border-emerald-50 rounded-2xl shadow-sm ",
            label: "text-slate-800 dark:text-slate-100 font-black text-sm",
            button: "border-emerald-100 text-slate-500 dark:text-slate-400 bg-emerald-50/50 hover:border-emerald-300 hover:text-emerald-700 rounded-xl",
            selectedButton: "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm "
        },
        skincare: {
            container: "",
            label: "text-rose-900 font-bold text-sm",
            button: "border border-rose-100 text-slate-500 dark:text-slate-400 bg-white dark:bg-zinc-900 hover:border-rose-300 hover:text-rose-700 rounded-full shadow-sm ",
            selectedButton: "border-rose-400 bg-rose-50 text-rose-900 border"
        },
        food: {
            container: "bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm  border border-red-50",
            label: "text-slate-800 dark:text-slate-100 font-bold text-sm",
            button: "border border-amber-100 text-slate-600 dark:text-slate-400 bg-amber-50/30 hover:border-red-300 hover:text-red-600 rounded-xl",
            selectedButton: "border-red-500 bg-red-500 text-white shadow-md border shadow-red-500/20"
        },
        form: {
            container: "bg-slate-900/60 p-5 rounded-xl border border-slate-700/50",
            label: "text-slate-300 font-bold text-sm",
            button: "border border-slate-700 text-slate-400 bg-slate-900 hover:border-primary hover:text-white rounded-xl",
            selectedButton: "border-primary bg-primary/20 text-white ring-1 ring-primary/50 border"
        }
    };

    const currentStyle = styles[variant] || styles.light;

    return (
        <div className={baseContainer + " " + currentStyle.container}>
            {options.map((opt, index) => (
                <div key={index} className={baseOptContainer}>
                    <span className={currentStyle.label}>{opt.name}:</span>
                    <div className={baseBtnGroup}>
                        {opt.values && opt.values.map((val: string, vIndex: number) => {
                            const isSelected = selectedOptions[opt.name] === val;
                            return (
                                <button
                                    key={vIndex}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedOptions(prev => ({ ...prev, [opt.name]: val }));
                                    }}
                                    className={baseBtn + " " + (isSelected ? currentStyle.selectedButton : currentStyle.button)}
                                >
                                    {val}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
