'use client';
import { useI18n } from '@/context/I18nContext';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { getStoreContext } from '@/lib/storeContext';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  completed: boolean;
  color: string;
}

export default function StoreSetupGuide() {
    const { t } = useI18n();
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [storeDomain, setStoreDomain] = useState<string | null>(null);

  useEffect(() => {
    // Check if guide was dismissed permanently
    const wasDismissed = localStorage.getItem('souqai_setup_guide_dismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
      setLoading(false);
      return;
    }

    // Check if guide was collapsed
    const wasCollapsed = localStorage.getItem('souqai_setup_guide_collapsed');
    if (wasCollapsed === 'true') {
      setCollapsed(true);
    }

    loadSetupStatus();
  }, []);

  useEffect(() => {
    if (!loading && !dismissed) {
      const timer = setTimeout(() => setAnimateIn(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, dismissed]);

  async function loadSetupStatus() {
    try {
      const ctx = await getStoreContext();
      if (!ctx || !ctx.targetUserId) {
        setLoading(false);
        return;
      }

      const domain = ctx.storeDomain;
      setStoreDomain(domain);

      // Fetch store data
      const { data: storeData } = await insforge.database
        .from('stores')
        .select('*')
        .eq('user_id', ctx.targetUserId)
        .limit(1);

      const store = storeData?.[0];

      // Fetch products count
      const { count: productsCount } = await insforge.database
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ctx.targetUserId);

      // Fetch orders count
      let ordersCount = 0;
      if (domain) {
        const { count } = await insforge.database
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('store_domain', domain);
        ordersCount = count || 0;
      }

      const setupSteps: SetupStep[] = [
        {
          id: 'store_info',
          title: t('t_bb791028'),
          description: t('t_65e6a5a0'),
          icon: 'storefront',
          link: '/settings?tab=basic',
          completed: !!(store?.store_name && store?.logo_url && store?.logo_url !== 'https://placehold.co/400x400'),
          color: '#E91E63',
        },
        {
          id: 'add_product',
          title: t('t_ba3f0e76'),
          description: t('t_926676fe'),
          icon: 'inventory_2',
          link: '/inventory/add',
          completed: (productsCount || 0) > 0,
          color: '#9C27B0',
        },
        {
          id: 'customize_store',
          title: t('t_8f0a6b73'),
          description: t('t_8e1dd75e'),
          icon: 'palette',
          link: '/settings?tab=store-design',
          completed: !!(store?.store_color && store?.store_color !== '#008096' && store?.announcement_text),
          color: '#FF9800',
        },
        {
          id: 'delivery_settings',
          title: t('t_5c3d1037'),
          description: t('t_2554b88b'),
          icon: 'local_shipping',
          link: '/delivery-settings',
          completed: !!(store?.shipping_provider && store?.shipping_provider !== 'none'),
          color: '#4CAF50',
        },
        {
          id: 'share_store',
          title: t('t_813e2ebe'),
          description: t('t_601d2349'),
          icon: 'share',
          link: domain ? `/${domain}` : '/settings?tab=basic',
          completed: ordersCount > 0,
          color: '#2196F3',
        },
      ];

      setSteps(setupSteps);
    } catch (err) {
      console.error('Error loading setup status:', err);
    } finally {
      setLoading(false);
    }
  }

  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  const handleDismiss = () => {
    localStorage.setItem('souqai_setup_guide_dismissed', 'true');
    setDismissed(true);
  };

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('souqai_setup_guide_collapsed', String(newCollapsed));
  };

  if (loading || dismissed) return null;
  if (allCompleted) return null;

  // Find the active step (first uncompleted step)
  const activeStep = steps.find(s => !s.completed);
  const activeStepId = activeStep ? activeStep.id : null;

  return (
    <div
      className={`mb-8 transition-all duration-700 ease-out ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-gradient-to-br from-white via-white to-purple-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-purple-950/5 rounded-[32px] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-zinc-800/80 overflow-hidden transition-all duration-300">
        {/* Header */}
        <div
          className="p-6 pb-4 flex items-center justify-between cursor-pointer select-none"
          onClick={handleToggleCollapse}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E91E63] to-[#9C27B0] flex items-center justify-center shadow-lg shadow-[#E91E63]/25 relative overflow-hidden">
                <span className="material-symbols-outlined text-white text-[28px] relative z-10 animate-pulse">
                  rocket_launch
                </span>
                <div className="absolute -inset-1 bg-gradient-to-br from-white/20 to-transparent blur-sm rounded-2xl"></div>
              </div>
              {/* Progress badge */}
              <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-md border border-slate-100 dark:border-zinc-800">
                <span className="text-[10.5px] font-black text-[#E91E63]">
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                🚀 دليل إعداد المتجر السريع
                {progressPercent > 0 && progressPercent < 100 && (
                  <span className="text-[11px] font-black text-[#E91E63] bg-[#E91E63]/8 px-2.5 py-0.5 rounded-full">
                    {progressPercent}% مكتمل
                  </span>
                )}
              </h3>
              <p className="text-slate-500 dark:text-zinc-400 text-[13px] font-semibold mt-0.5">
                أكمل الخطوات المتبقية لتفعيل متجرك بالكامل واستقبال طلبات عملائك بنجاح!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
              title={t("t_76d876ba")}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800">
              <span
                className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${
                  collapsed ? 'rotate-180' : ''
                }`}
              >
                expand_less
              </span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="w-full h-3 rounded-full bg-slate-100/80 dark:bg-zinc-800/80 overflow-hidden p-[2.5px] border border-slate-200/40 dark:border-zinc-700/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#9C27B0] to-[#E91E63] shadow-[0_0_8px_rgba(233,30,99,0.3)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps Grid - Collapsible */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            collapsed ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'
          }`}
        >
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const isCompleted = step.completed;
              const isActive = step.id === activeStepId;
              const isShareStep = step.id === 'share_store';

              return (
                <Link
                  key={step.id}
                  href={step.link}
                  target={isShareStep && storeDomain ? '_blank' : undefined}
                  className={`group relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-full ${
                    isCompleted
                      ? 'bg-slate-50/40 dark:bg-zinc-800/10 border-slate-100/50 dark:border-zinc-800/30 opacity-75 hover:opacity-100 hover:shadow-sm'
                      : isActive
                      ? 'bg-white dark:bg-zinc-900 border-2 border-purple-500/50 dark:border-purple-500/40 shadow-[0_12px_30px_-8px_rgba(147,51,234,0.12)] ring-1 ring-purple-500/5 scale-[1.02] -translate-y-1 hover:border-purple-500'
                      : 'bg-white/60 dark:bg-zinc-900/60 border-slate-100 dark:border-zinc-800/80 hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Step Number / Status Icon */}
                  <div className="absolute top-4 end-4">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-white text-[14px] font-bold">
                          check
                        </span>
                      </div>
                    ) : isActive ? (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E91E63] to-[#9C27B0] text-white flex items-center justify-center text-[11px] font-black shadow-md shadow-[#E91E63]/20">
                        {index + 1}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center text-[11px] font-bold">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Active Step Badge */}
                  {isActive && (
                    <span className="absolute top-4 start-4 px-2 py-0.5 text-[9px] font-black text-white bg-gradient-to-r from-[#E91E63] to-[#9C27B0] rounded-full shadow-sm animate-pulse">
                      الخطوة التالية 🎯
                    </span>
                  )}

                  <div>
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${
                        isCompleted
                          ? 'bg-green-500/10 text-green-500 dark:text-green-400'
                          : isActive
                          ? 'bg-gradient-to-br from-[#E91E63] to-[#9C27B0] text-white shadow-md shadow-[#E91E63]/15'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {step.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <h4
                      className={`text-[14px] font-bold mb-1.5 leading-snug transition-colors ${
                        isCompleted
                          ? 'text-slate-400 dark:text-zinc-500 line-through decoration-slate-300 dark:decoration-zinc-700'
                          : isActive
                          ? 'text-slate-900 dark:text-white font-black'
                          : 'text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={`text-[11.5px] leading-relaxed ${
                        isCompleted
                          ? 'text-slate-400 dark:text-zinc-500'
                          : isActive
                          ? 'text-slate-600 dark:text-zinc-300'
                          : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Action Link Hint */}
                  {!isCompleted && (
                    <div
                      className={`mt-4 flex items-center gap-1.5 text-[11.5px] font-black transition-all ${
                        isActive
                          ? 'text-[#E91E63] opacity-100'
                          : 'text-purple-500 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span>{isShareStep && storeDomain ? t('t_23e1b2ad') : t('t_4c6018ec')}</span>
                      <span className="material-symbols-outlined text-[14px] font-black group-hover:-translate-x-1 transition-transform">
                        arrow_back
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
