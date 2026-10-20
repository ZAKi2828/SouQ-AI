'use client';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from "@/context/I18nContext";

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const { t } = useI18n();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 group ${
        resolvedTheme === 'dark'
          ? 'bg-[#1E293B] border-gray-700 hover:bg-[#334155] text-amber-400 hover:text-amber-300'
          : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
      } ${className}`}
      title={resolvedTheme === 'dark' ? t('t_acc72924') : t('t_accf54b2')}
      aria-label={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Sun Icon */}
      <span
        className={`material-symbols-outlined text-[20px] absolute transition-all duration-300 ${
          resolvedTheme === 'dark'
            ? 'opacity-0 rotate-90 scale-50'
            : 'opacity-100 rotate-0 scale-100'
        }`}
      >
        light_mode
      </span>
      {/* Moon Icon */}
      <span
        className={`material-symbols-outlined text-[20px] absolute transition-all duration-300 ${
          resolvedTheme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-50'
        }`}
      >
        dark_mode
      </span>
    </button>
  );
}
