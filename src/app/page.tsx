'use client';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from "@/context/I18nContext";

const dashImages = ['/images/dash1.png', '/images/dash2.png', '/images/dash3.png'];
const aiImages = ['/images/ai_gen1.png', '/images/ai_gen2.jpg', '/images/ai_gen3.jpg'];

const getTrackingApps = (t: any) => [
  {
    id: 'facebook',
    name: 'Facebook Pixel',
    nameAr: t('t_13362207'),
    desc: t('t_19fa13567'),
    image: '/apps/facebook.png',
    color: '#1877F2',
    glowColor: 'rgba(24, 119, 242, 0.15)',
    glowBorder: 'rgba(24, 119, 242, 0.4)',
    category: 'tracking',
    simulatedEvent: {
      type: 'Purchase',
      value: '8,900 DA',
      desc: t('t_c745efc5'),
      icon: 'shopping_cart'
    }
  },
  {
    id: 'fb_capi',
    name: 'Facebook Conversions API',
    nameAr: t('t_e1fa2bf6'),
    desc: t('t_12a76a30e'),
    image: '/apps/fb_capi.png',
    color: '#0064E0',
    glowColor: 'rgba(0, 100, 224, 0.15)',
    glowBorder: 'rgba(0, 100, 224, 0.4)',
    category: 'tracking',
    simulatedEvent: {
      type: 'Server-Side Purchase',
      value: '12,500 DA',
      desc: t('t_3696b38d'),
      icon: 'dns'
    }
  },
  {
    id: 'tiktok',
    name: 'TikTok Pixel',
    nameAr: t('t_9101fd5a'),
    desc: t('t_4b8748270'),
    image: '/apps/tiktok.png',
    color: '#FE2C55',
    glowColor: 'rgba(254, 44, 85, 0.15)',
    glowBorder: 'rgba(254, 44, 85, 0.4)',
    category: 'tracking',
    simulatedEvent: {
      type: 'AddToCart',
      value: 'ساعة S-Alpha',
      desc: t('t_dea9da7b'),
      icon: 'add_shopping_cart'
    }
  },
  {
    id: 'tiktok_capi',
    name: 'TikTok Events API',
    nameAr: t('t_4479e5c0'),
    desc: t('t_1cb0917a9'),
    image: '/apps/tiktok_capi.png',
    color: '#25F4EE',
    glowColor: 'rgba(37, 244, 238, 0.15)',
    glowBorder: 'rgba(37, 244, 238, 0.4)',
    category: 'tracking',
    simulatedEvent: {
      type: 'Server Purchase',
      value: '6,400 DA',
      desc: t('t_32bf16e4'),
      icon: 'cloud_done'
    }
  },
  {
    id: 'google',
    name: 'Google Analytics 4',
    nameAr: t('t_1b4f556a'),
    desc: t('t_1e3eea6ee'),
    image: '/apps/google.png',
    color: '#E37400',
    glowColor: 'rgba(227, 116, 0, 0.15)',
    glowBorder: 'rgba(227, 116, 0, 0.4)',
    category: 'tracking',
    simulatedEvent: {
      type: 'User Journey',
      value: 'Sessions: 5, CTR: 12%',
      desc: t('t_dc5314e6'),
      icon: 'insights'
    }
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    nameAr: t('t_25dcea475'),
    desc: t('t_14178f8f1'),
    image: '/apps/gtm.png',
    color: '#2480F4',
    glowColor: 'rgba(36, 128, 244, 0.15)',
    glowBorder: 'rgba(36, 128, 244, 0.4)',
    category: 'automation',
    simulatedEvent: {
      type: 'Custom Tag Fired',
      value: 'Clarity Active',
      desc: t('t_f68cd637'),
      icon: 'integration_instructions'
    }
  },
  {
    id: 'snapchat',
    name: 'Snapchat Pixel',
    nameAr: t('t_677a1c75'),
    desc: t('t_1b5988e5e'),
    image: '/apps/snapchat.png',
    color: '#FFFC00',
    glowColor: 'rgba(255, 252, 0, 0.1)',
    glowBorder: 'rgba(255, 252, 0, 0.4)',
    category: 'tracking',
    simulatedEvent: {
      type: 'PageActive',
      value: 'Swipe Up User',
      desc: t('t_eca6de5d'),
      icon: 'swipe_up'
    }
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    nameAr: t('t_4ba22095'),
    desc: t('t_d571d7b0'),
    image: '/apps/webhook.png',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    glowBorder: 'rgba(139, 92, 246, 0.4)',
    category: 'automation',
    simulatedEvent: {
      type: 'Webhook Triggered',
      value: 'Zapier / Make Sent',
      desc: t('t_9d93dfc4'),
      icon: 'bolt'
    }
  },
  {
    id: 'gsheets',
    name: 'Google Sheets',
    nameAr: t('t_8e1ca690'),
    desc: t('t_20794bf95'),
    image: '/apps/gsheets.png',
    color: '#0F9D58',
    glowColor: 'rgba(15, 157, 88, 0.15)',
    glowBorder: 'rgba(15, 157, 88, 0.4)',
    category: 'automation',
    simulatedEvent: {
      type: 'Row Added',
      value: 'Order #2045 Synced',
      desc: t('t_5d0ac8ee'),
      icon: 'table_rows'
    }
  }
];

export default function Page() {
    const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const trackingApps = getTrackingApps(t);
  const [activeAppId, setActiveAppId] = useState('facebook');
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'tracking' | 'automation'>('all');

  const [activeTemplate, setActiveTemplate] = useState<'fashion' | 'tech' | 'beauty' | 'food'>('fashion');
  const [launchTimer, setLaunchTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLaunchTimer(prev => (prev >= 10 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const mockTemplates = [
    {
      id: 'fashion',
      name: t('t_881a057a'),
      desc: t('t_936528aa'),
      primaryColor: '#E91E63',
      glowColor: 'rgba(233, 30, 99, 0.2)',
      bgColor: 'bg-slate-900',
      textColor: 'text-white',
      accentColor: 'text-[#E91E63]',
      productImage: '/images/fashion_product.png',
      productName: t('t_24bf2087'),
      price: t('t_65a20412'),
      discountPrice: '12,500 د.ج',
      gradient: 'from-[#2D1627] to-[#140E1B]',
      badge: t('t_95708f2e')
    },
    {
      id: 'tech',
      name: t('t_120d1e0d5'),
      desc: t('t_26f4a8f36'),
      primaryColor: '#00D2FF',
      glowColor: 'rgba(0, 210, 255, 0.2)',
      bgColor: 'bg-zinc-950',
      textColor: 'text-zinc-100',
      accentColor: 'text-[#00D2FF]',
      productImage: '/images/tech_product.png',
      productName: t('t_e928e887'),
      price: t('t_d69eeefd'),
      discountPrice: t('t_e85c2cfe'),
      gradient: 'from-[#0C1E36] to-[#050C16]',
      badge: t('t_3d2e5060')
    },
    {
      id: 'beauty',
      name: t('t_2650bbf4b'),
      desc: t('t_1608d3184'),
      primaryColor: '#D4AF37',
      glowColor: 'rgba(212, 175, 55, 0.2)',
      bgColor: 'bg-[#0E0B07]',
      textColor: 'text-[#F3EFE9]',
      accentColor: 'text-[#D4AF37]',
      productImage: '/images/beauty_product.png',
      productName: t('t_db9c58cd'),
      price: t('t_cacd8749'),
      discountPrice: t('t_9209170e'),
      gradient: 'from-[#241A0E] to-[#0A0704]',
      badge: t('t_625b30ef')
    },
    {
      id: 'food',
      name: t('t_78cd2b6'),
      desc: t('t_1ee411b59'),
      primaryColor: '#FF6B00',
      glowColor: 'rgba(255, 107, 0, 0.2)',
      bgColor: 'bg-neutral-900',
      textColor: 'text-neutral-50',
      accentColor: 'text-[#FF6B00]',
      productImage: '/images/trust-banner.jpg',
      productName: t('t_ff95959'),
      price: t('t_e5775c44'),
      discountPrice: t('t_842a0e07'),
      gradient: 'from-[#2F1F10] to-[#140E0A]',
      badge: t('t_75059d82')
    }
  ];


  useEffect(() => {
    if (hoveredAppId) return; // Stop auto-cycling when hovering

    const filteredApps = trackingApps.filter(app => activeTab === 'all' || app.category === activeTab);
    if (filteredApps.length === 0) return;

    const interval = setInterval(() => {
      setActiveAppId(currentId => {
        const currentIndex = filteredApps.findIndex(app => app.id === currentId);
        const nextIndex = (currentIndex + 1) % filteredApps.length;
        return filteredApps[nextIndex]?.id || filteredApps[0].id;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [hoveredAppId, activeTab]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Show modal on initial landing if not dismissed in this session
    const isDismissed = sessionStorage.getItem('souqai_welcome_modal_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('souqai_welcome_modal_dismissed', 'true');
  };
  const [session, setSession] = useState<any>(null);
  const [userInitial, setUserInitial] = useState<string>('');
  const [loadingSession, setLoadingSession] = useState(true);
  const [userRole, setUserRole] = useState<string>('merchant');
  const [appPlans, setAppPlans] = useState<any>(null);
  const [proPrice, setProPrice] = useState<number>(1000);
  const [vipPrice, setVipPrice] = useState<number>(2500);
  const [customDomainPlans, setCustomDomainPlans] = useState<any>(null);
  const [aiQuotas, setAiQuotas] = useState<any>({ free_text: 0, pro_text: 0, vip_text: 'unlimited', free_image: 0, pro_image: 0, vip_image: 'unlimited' });

  // Interactive Profit Calculator States
  const [calcPrice, setCalcPrice] = useState<number>(3800);
  const [calcCost, setCalcCost] = useState<number>(1400);
  const [calcAdCost, setCalcAdCost] = useState<number>(350);
  const [calcShipping, setCalcShipping] = useState<number>(650);
  const [calcSuccessRate, setCalcSuccessRate] = useState<number>(85);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await insforge.auth.getCurrentSession();
        if (data?.session) {
          setSession(data.session);
          const userId = data.session.user?.id;
          if (userId) {
            const { data: profile } = await insforge.database
              .from('profiles')
              .select('full_name, store_name, role')
              .eq('id', userId)
              .single();
            const name = profile?.full_name?.split(' ')[0] || profile?.store_name || t('t_62a');
            setUserInitial(name.charAt(0).toUpperCase());
            setUserRole(profile?.role || 'merchant');
          }
        }

        // Fetch platform settings for pricing & app limits
        const { data: settings } = await insforge.database
          .from('platform_settings')
          .select('app_plans, pro_price, vip_price, custom_domain_plans')
          .eq('id', 1)
          .single();
        if (settings) {
          if (settings.app_plans) setAppPlans(settings.app_plans);
          if (settings.custom_domain_plans) setCustomDomainPlans(settings.custom_domain_plans);
          if (settings.pro_price) setProPrice(Number(settings.pro_price));
          if (settings.vip_price) setVipPrice(Number(settings.vip_price));
        }

        // Fetch AI quotas
        const { data: aiSettings } = await insforge.database
          .from('ai_settings')
          .select('free_text_quota, pro_text_quota, vip_text_quota, free_image_quota, pro_image_quota, vip_image_quota')
          .eq('id', 1)
          .single();
        if (aiSettings) {
          setAiQuotas({
            free_text: aiSettings.free_text_quota || 0,
            pro_text: aiSettings.pro_text_quota || 0,
            vip_text: aiSettings.vip_text_quota === null ? 'unlimited' : aiSettings.vip_text_quota,
            free_image: aiSettings.free_image_quota || 0,
            pro_image: aiSettings.pro_image_quota || 0,
            vip_image: aiSettings.vip_image_quota === null ? 'unlimited' : aiSettings.vip_image_quota,
          });
        }
      } catch (err) {
        console.error('Session error', err);
      } finally {
        setLoadingSession(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % dashImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white font-cairo selection:bg-pink-500/30 overflow-hidden transition-colors duration-500">
      
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-xl border-b ${
        resolvedTheme === 'dark' ? 'bg-[#070B14]/80 border-white/5' : 'bg-white/80 border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
               <div className="h-12 md:h-14 flex items-center justify-center">
                 <img src="/images/logo_cropped.png" alt="SOUQ AI" className="h-full object-contain dark:hidden" />
                 <img src="/images/logo_dark.png" alt="SOUQ AI" className="h-full object-contain hidden dark:block" />
               </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 space-x-reverse">
              <a className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-pink-600 dark:hover:text-white transition-colors" href="#templates">{t('t_80b5bbe8')}</a>
              <a className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-pink-600 dark:hover:text-white transition-colors" href="#features">{t('t_8de9b932')}</a>
              <a className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-pink-600 dark:hover:text-white transition-colors" href="#profit-calculator">حاسبة الأرباح</a>
              <a className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-pink-600 dark:hover:text-white transition-colors" href="#pricing">{t('t_7ef79796')}</a>
              <Link className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-pink-600 dark:hover:text-white transition-colors" href="/login">{t('t_60a05e7e')}</Link>
              <button 
                onClick={() => setShowWelcomeModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold border border-pink-500/20 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>فيديو ترحيبي</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle className="hidden sm:flex border-slate-200 dark:border-white/10" />

              {!loadingSession && (
                <>
                  {!session ? (
                    <div className="flex items-center gap-3">
                      <Link href="/login" className="bg-gradient-to-l from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-pink-500/30 flex items-center gap-2">
                        <span>{t('t_b1a1b65')}</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Link href={userRole === 'super_admin' ? '/super-admin' : '/merchant'} className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-pink-600 dark:hover:text-white transition-colors hidden md:block">{t('t_62962e62')}</Link>
                      <Link href={userRole === 'super_admin' ? '/super-admin' : '/merchant'} className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-md hover:scale-105 transition-transform border border-white/20 overflow-hidden">
                        {userInitial}
                      </Link>
                    </div>
                  )}
                </>
              )}
              
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle className="flex sm:hidden border-slate-200 dark:border-white/10" />
                <button className="text-slate-500 dark:text-slate-300 hover:text-pink-600 dark:hover:text-white">
                  <span className="material-symbols-outlined text-3xl">menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* --- Hero Section --- */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-600/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Right Column: Text, Badge, Buttons */}
              <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-right">
                
                <motion.div 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                   className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 mb-8 backdrop-blur-sm">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                    {t('t_129894aff')}
                  </span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.3] mb-6 tracking-tight">
                  {t('t_be13d55c')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">{t('t_59a47411')}</span>
                  <br />
                  {t('t_af432ab6')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">{t('t_1059106f0')}</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
                  className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-10 font-medium">
                  {t('t_d2189e4b')}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8 lg:mb-0 w-full sm:w-auto">
                  {!loadingSession && (
                    <>
                      {!session ? (
                        <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-l from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white rounded-xl font-bold text-lg shadow-xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2">
                          {t('t_25204ce53')}
                        </Link>
                      ) : (
                        <Link href={userRole === 'super_admin' ? '/super-admin' : '/merchant'} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-l from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white rounded-xl font-bold text-lg shadow-xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2">
                          {t('t_3aab4bd7')}
                        </Link>
                      )}
                    </>
                  )}

                  <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                    {t('t_890878d5')}
                    <span className="material-symbols-outlined text-[20px]">play_circle</span>
                  </button>
                </motion.div>

              </div>

              {/* Left Column: Dashboard Mockup */}
              <div className="lg:col-span-6 w-full">
                <div className="relative mx-auto max-w-2xl p-1 rounded-2xl bg-gradient-to-b from-slate-200/50 to-transparent dark:from-white/10 dark:to-transparent shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="aspect-[16/9] w-full bg-[#0F1523] rounded-xl border border-slate-200 dark:border-white/5 relative overflow-hidden flex items-center justify-center">
                     <video
                       src={t("t_e9c7e01b")}
                       autoPlay
                       loop
                       muted
                       playsInline
                       className="w-full h-full object-cover rounded-xl"
                     />
                     
                     {/* Bottom Right: "souqai" Diamond Badge */}
                     <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-lg shadow-cyan-500/30 z-20 hover:scale-105 transition-transform duration-300">
                        <span className="material-symbols-outlined text-cyan-400 text-[16px] animate-pulse">diamond</span>
                        <span className="text-xs font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-blue-200 font-sans">souqai</span>
                     </div>

                     {/* Bottom Left: Live Status Badge */}
                     <div className="absolute bottom-4 left-4 bg-emerald-500/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 z-20">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        <span className="text-[10px] font-bold text-white font-cairo">نشط الآن</span>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- Magic of AI Section --- */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          id="features" className="py-24 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white relative inline-block">
                
                {t('t_16dd4ad7')}
                <div className="absolute -bottom-3 right-0 w-1/2 h-1 bg-pink-500 rounded-full"></div>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image/Video Column */}
              <motion.div 
                 initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                 className="relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden group">
                 <video
                   src="/images/12.mp4"
                   autoPlay
                   loop
                   muted
                   playsInline
                   className="w-full h-full object-cover rounded-3xl relative z-10 scale-100 group-hover:scale-105 transition-all duration-500"
                 />

                 {/* Bottom Right: "souqai" Diamond Badge */}
                 <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-lg shadow-cyan-500/30 z-20 hover:scale-105 transition-transform duration-300">
                    <span className="material-symbols-outlined text-cyan-400 text-[16px] animate-pulse">diamond</span>
                    <span className="text-xs font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-blue-200 font-sans">souqai</span>
                 </div>
              </motion.div>

              {/* Features List Column */}
              <div className="space-y-10">
                
                {/* Feature 1 */}
                <div className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-500/20 transition-colors">
                    <span className="material-symbols-outlined text-pink-500">monochrome_photos</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('t_1a1fdabc6')}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                      
                      {t('t_c3340864')}
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                    <span className="material-symbols-outlined text-purple-400">edit_note</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('t_b33d6cbd')}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                      
                      {t('t_2b36501cc')}
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <span className="material-symbols-outlined text-emerald-400">speed</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('t_1c027b53f')}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                      
                      {t('t_5a4bad165')}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.section>

        {/* --- Integrations Showcase Section (Redesigned) --- */}
        <section id="integrations" className="py-24 border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#090D18] relative overflow-hidden">
          {/* Ambient Lighting Background Blobs */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 mb-6 leading-tight">
                {t('t_e4e8d386')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed max-w-xl mx-auto">
                اربط متجرك بضغطة زر واحدة بجميع أدوات التسويق والتحليلات والأتمتة لزيادة مبيعاتك وتتبع زوارك بدقة متناهية.
              </p>

              {/* Tab Selector */}
              <div className="inline-flex p-1.5 rounded-full bg-slate-200/50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 backdrop-blur-md mt-8 gap-1.5">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'tracking', label: t('t_8de4dc89') },
                  { id: 'automation', label: t('t_20178e1b') }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      // Set active app to first in filtered list
                      const filtered = trackingApps.filter(app => tab.id === 'all' || app.category === tab.id);
                      if (filtered.length > 0) setActiveAppId(filtered[0].id);
                    }}
                    className={`relative px-6 py-2 rounded-full text-xs font-black transition-colors ${
                      activeTab === tab.id ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabBg"
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                        style={{ zIndex: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Right Column: Visual Apps Grid (lg:col-span-7) */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div 
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  onMouseEnter={() => setHoveredAppId(activeAppId)}
                  onMouseLeave={() => setHoveredAppId(null)}
                >
                  {trackingApps
                    .filter(app => activeTab === 'all' || app.category === activeTab)
                    .map(app => {
                      const isActive = app.id === activeAppId;
                      return (
                        <motion.div
                          key={app.id}
                          onClick={() => {
                            setActiveAppId(app.id);
                            setHoveredAppId(app.id);
                          }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className={`cursor-pointer rounded-3xl p-5 border transition-all duration-500 relative overflow-hidden flex flex-col items-center justify-center text-center ${
                             isActive
                               ? 'bg-slate-100 dark:bg-slate-900/60 border-slate-300 dark:border-white/20 shadow-xl'
                               : 'bg-white dark:bg-[#111726]/30 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-[#111726]/50'
                           }`}
                          style={{
                            boxShadow: isActive ? `0 0 30px ${app.glowColor}` : undefined,
                            borderColor: isActive ? app.color : undefined
                          }}
                        >
                          {/* Inner glowing radial for active state */}
                          {isActive && (
                            <div 
                              className="absolute inset-0 pointer-events-none opacity-40 blur-xl"
                              style={{
                                background: `radial-gradient(circle at center, ${app.color} 0%, transparent 70%)`
                              }}
                            />
                          )}

                          {/* App Logo Container */}
                          <div 
                             className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 transition-transform duration-500 ${
                               isActive ? 'scale-110 shadow-lg' : 'opacity-80'
                             }`}
                             style={{
                               background: resolvedTheme === 'dark' ? (isActive ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)') : (isActive ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.01)'),
                               border: isActive ? `1px solid ${app.glowBorder}` : (resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)')
                             }}
                           >
                            <img 
                              src={app.image} 
                              alt={app.name} 
                              className="w-8 h-8 object-contain transition-transform" 
                            />
                          </div>

                          {/* App Name */}
                          <h4 className={`text-[13px] font-black tracking-wide mb-1 transition-colors ${
                             isActive ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-600 dark:text-slate-300'
                           }`}>
                            {app.nameAr}
                          </h4>

                          {/* Connection Status Badge */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span 
                              className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}
                            />
                            <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-500'}`}>
                              {isActive ? t('t_70955579') : t('t_d09d97f1')}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>

              {/* Left Column: Live Integration Simulation Hub (lg:col-span-5) */}
              <div className="lg:col-span-5">
                {trackingApps
                  .filter(app => app.id === activeAppId)
                  .map(app => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-gradient-to-br from-white to-slate-50 dark:from-[#111726]/80 dark:to-[#0A0D18] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden shadow-2xl"
                      onMouseEnter={() => setHoveredAppId(app.id)}
                      onMouseLeave={() => setHoveredAppId(null)}
                    >
                      {/* Top Soft Brand Glow */}
                      <div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 pointer-events-none opacity-30 blur-2xl transition-all duration-500"
                        style={{
                          background: `radial-gradient(circle, ${app.color} 0%, transparent 100%)`
                        }}
                      />

                      <div>
                        {/* Simulation Hub Graphics */}
                        <div className="h-28 flex items-center justify-center relative mb-8">
                          {/* SOUQ AI Central Node */}
                          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-2 border-pink-500 flex items-center justify-center relative z-20 shadow-xl shadow-pink-500/20">
                            <img src="/logo_icon.png" alt="SOUQ AI Logo" className="w-9 h-9 object-contain" />
                            <div className="absolute -inset-1 rounded-full border border-pink-500/30 animate-ping opacity-60"></div>
                          </div>

                          {/* SVG Connection Path */}
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <svg className="w-full h-full max-w-[200px]" viewBox="0 0 200 100" fill="none">
                              <path 
                                d="M 30,50 L 170,50" 
                                stroke={resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                              />
                              <motion.path 
                                d="M 30,50 L 170,50" 
                                stroke={app.color} 
                                strokeWidth="3" 
                                strokeLinecap="round"
                                strokeDasharray="8,8"
                                animate={{ strokeDashoffset: [0, -16] }}
                                transition={{ repeat: Infinity, ease: "linear", duration: 1.2 }}
                              />
                            </svg>
                          </div>

                          {/* App Node */}
                          <div 
                            className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-2 flex items-center justify-center relative z-20 shadow-xl"
                            style={{
                              borderColor: app.color,
                              boxShadow: `0 0 20px ${app.glowColor}`
                            }}
                          >
                            <img src={app.image} alt={app.name} className="w-9 h-9 object-contain" />
                            <div 
                              className="absolute -inset-1 rounded-full border opacity-50 animate-pulse"
                              style={{ borderColor: app.color }}
                            ></div>
                          </div>
                        </div>

                        {/* Title and description */}
                        <div className="mb-6">
                          <span 
                            className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-2 inline-block border"
                            style={{
                              backgroundColor: `rgba(${parseInt(app.color.slice(1,3), 16)}, ${parseInt(app.color.slice(3,5), 16)}, ${parseInt(app.color.slice(5,7), 16)}, 0.1)`,
                              borderColor: app.glowBorder,
                              color: resolvedTheme === 'dark' ? '#fff' : app.color
                            }}
                          >
                            تكامل نشط وفوري
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            {app.nameAr}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                            {app.desc}
                          </p>
                        </div>
                      </div>

                      {/* Live Telemetry Display */}
                      <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 relative overflow-hidden font-mono text-left">
                        {/* Pulse Live Event Badge */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            <span className="w-2 h-2 rounded-full bg-rose-500 absolute"></span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-wide select-none">LIVE TELEMETRY MONITOR</span>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE DATA STREAM</span>
                        </div>

                        {/* Simulated event container */}
                        <div className="space-y-3" dir="rtl">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                              style={{
                                backgroundColor: `rgba(${parseInt(app.color.slice(1,3), 16)}, ${parseInt(app.color.slice(3,5), 16)}, ${parseInt(app.color.slice(5,7), 16)}, 0.05)`,
                                borderColor: app.glowBorder
                              }}
                            >
                              <span className="material-symbols-outlined text-[20px]" style={{ color: app.color }}>
                                {app.simulatedEvent.icon}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-white">{app.simulatedEvent.type}</span>
                                <span className="text-xs font-black text-emerald-400" dir="ltr">{app.simulatedEvent.value}</span>
                              </div>
                              <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                {app.simulatedEvent.desc}
                              </p>
                            </div>
                          </div>

                          {/* Small Mock Stream Details */}
                          <div className="text-[9px] text-slate-600 font-mono border-t border-white/5 pt-2 flex justify-between items-center" dir="ltr">
                            <span>SOUQAI.NET -{'>'} {app.id}_API</span>
                            <span className="text-emerald-500/70 font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">done_all</span>
                              SECURE_SYNC: OK (18ms)
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>

            </div>
          </div>
        </section>

        {/* --- Local Logistics & Payments Showcase --- */}
        <section className="py-24 bg-slate-50 dark:bg-[#090D18] border-b border-slate-200 dark:border-white/5 relative overflow-hidden">
          {/* Ambient Lighting Background Blobs */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Text & Features Column (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-8 text-right" dir="rtl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-3 inline-block border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    شركاء الخدمات اللوجستية والشحن
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 mb-4 leading-tight">
                    {t('t_log_title')}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                    {t('t_log_subtitle')}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-6">
                  {/* Feature 1 */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <span className="material-symbols-outlined text-blue-400 text-xl">sync_alt</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t("t_75ffe2cb")}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                        أرسل طلبات عملائك مباشرة إلى شركة التوصيل بضغطة زر واحدة دون الحاجة لكتابة البيانات يدوياً.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                      <span className="material-symbols-outlined text-purple-400 text-xl">print</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t("t_708a957b")}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                        اطبع بوليصة الشحن الخاصة بكل طرد مباشرة من لوحة التحكم لتسريع عملية التجهيز والتسليم.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                      <span className="material-symbols-outlined text-emerald-400 text-xl">query_stats</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t("t_72dfebec")}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                        تتبع طرودك لحظة بلحظة مع تحديث حالة التوصيل تلقائياً في متجرك لضمان الشفافية وزيادة نسب التسليم.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphic/Image Column (lg:col-span-5) */}
              <div className="lg:col-span-5 flex justify-center">
                <motion.div 
                  whileHover={{ y: -6 }}
                  className="w-full max-w-[340px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
                  style={{
                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.1)',
                  }}
                >
                  {/* Top Glowing Ribbon */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">{t("t_70955579")}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">SUPPORTED CARRIERS</span>
                  </div>

                  {/* Real Image Container */}
                  <div className="bg-white rounded-2xl p-6 flex items-center justify-center border border-slate-150 dark:border-white/10 shadow-inner group/img relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                    <img 
                      src="/images/sh.png" 
                      alt={t("t_b8a258e2")} 
                      className="w-full max-h-[300px] object-contain transition-transform duration-500 group-hover/img:scale-105"
                    />
                  </div>

                  {/* Card Footer Info */}
                  <div className="mt-6 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t("t_c56cc79f")}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{t("t_2daa00f9")}</p>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* --- Interactive Profit Calculator Section --- */}
        <section id="profit-calculator" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#070B14]/10 border-b border-slate-200 dark:border-white/5">
          {/* Neon BG Gradients */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-right" dir="rtl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-3 inline-block border border-pink-500/30 bg-pink-500/10 text-pink-400">
                حاسبة الأرباح الذكية للتجارة الإلكترونية في الجزائر 🇩🇿
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 mb-6 leading-tight">
                احسب أرباحك الصافية الحقيقية (COD)
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed max-w-xl mx-auto">
                محاكي الدفع عند الاستلام الذكي. أدخل تكاليف المنتج، الإعلانات، والشحن، واكتشف صافي ربحك الحقيقي بعد احتساب نسبة المرتجعات (RTS).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Inputs Form (lg:col-span-7) */}
              <div className="lg:col-span-7 bg-white dark:bg-[#111726]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between space-y-6">
                
                {/* Selling Price */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
                    <span className="font-bold text-slate-750 dark:text-slate-350">سعر بيع المنتج للزبون</span>
                    <span className="font-black text-pink-600 dark:text-pink-450 text-sm">{calcPrice.toLocaleString()} د.ج</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={15000}
                    step={100}
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                    <span>1,000 د.ج</span>
                    <span>15,000 د.ج</span>
                  </div>
                </div>

                {/* Wholesale Cost */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
                    <span className="font-bold text-slate-755 dark:text-slate-355">سعر شراء المنتج بالجملة</span>
                    <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{calcCost.toLocaleString()} د.ج</span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={8000}
                    step={50}
                    value={calcCost}
                    onChange={(e) => setCalcCost(parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-600 dark:accent-slate-400"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                    <span>300 د.ج</span>
                    <span>8,000 د.ج</span>
                  </div>
                </div>

                {/* Ad Cost per Purchase */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
                    <span className="font-bold text-slate-755 dark:text-slate-355">تكلفة الإشهار لكل مبيعة مؤكدة (Ad Cost per Sale)</span>
                    <span className="font-black text-[#8B5CF6] text-sm">{calcAdCost.toLocaleString()} د.ج</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={calcAdCost}
                    onChange={(e) => setCalcAdCost(parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                    <span>0 د.ج (عضوي)</span>
                    <span>2,000 د.ج</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Cost */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
                      <span>تكلفة التوصيل (ياليدين)</span>
                      <span className="font-black text-cyan-600 dark:text-cyan-400">{calcShipping.toLocaleString()} د.ج</span>
                    </div>
                    <input
                      type="range"
                      min={350}
                      max={1500}
                      step={50}
                      value={calcShipping}
                      onChange={(e) => setCalcShipping(parseInt(e.target.value) || 0)}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                      <span>350 د.ج</span>
                      <span>1,500 د.ج</span>
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
                      <span>نسبة تسليم الطرود المقدرة (Delivery Rate)</span>
                      <span className="font-black text-emerald-500">{calcSuccessRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={98}
                      step={1}
                      value={calcSuccessRate}
                      onChange={(e) => setCalcSuccessRate(parseInt(e.target.value) || 0)}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                      <span>40% (منخفضة)</span>
                      <span>98% (مثالية)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Outputs Summary Card (lg:col-span-5) */}
              <div className="lg:col-span-5">
                {(() => {
                  const successRate = calcSuccessRate / 100;
                  const failedRate = 1 - successRate;
                  
                  const expectedRevenue = calcPrice * successRate;
                  const expectedProductCost = calcCost * successRate;
                  const expectedAdCost = calcAdCost;
                  const expectedShippingCost = (calcShipping * successRate) + (calcShipping * 0.5 * failedRate);
                  
                  const netProfit = expectedRevenue - (expectedProductCost + expectedAdCost + expectedShippingCost);
                  const finalProfit = Math.round(netProfit);
                  
                  const totalCostPerSale = (calcCost * successRate) + calcAdCost + expectedShippingCost;
                  const roi = totalCostPerSale > 0 ? Math.round((finalProfit / totalCostPerSale) * 100) : 0;
                  
                  const targetIncome = 100000; // 10 million centimes
                  const ordersNeeded = finalProfit > 0 ? Math.ceil(targetIncome / finalProfit) : 0;
                  const ordersPerDay = finalProfit > 0 ? (ordersNeeded / 30).toFixed(1) : '0';

                  return (
                    <div 
                      className="bg-gradient-to-br from-slate-900 via-[#131927] to-[#0A0D18] border border-slate-800 dark:border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden shadow-2xl text-start text-white animate-fade-in"
                      style={{
                        boxShadow: '0 20px 40px -15px rgba(233,30,99,0.15)'
                      }}
                    >
                      {/* Brand Glowing Ring */}
                      <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>

                      <div className="space-y-6">
                        {/* Title telemetry */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span className="text-[9px] font-black text-pink-500 tracking-wider">COD SIMULATOR LIVE OUTCOME</span>
                          <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">REALTIME CALCULATION</span>
                        </div>

                        {/* Net profit per order */}
                        <div className="text-center py-4 bg-white/3 hover:bg-white/5 rounded-2xl border border-white/5 transition-all">
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wide">صافي الربح المتوقع لكل طلب مُرسَل</h4>
                          <p className="text-3xl md:text-4xl font-black text-emerald-400 mt-2 tracking-tight">
                            {finalProfit > 0 ? `+${finalProfit.toLocaleString()}` : finalProfit.toLocaleString()} د.ج
                          </p>
                          <div className="inline-flex items-center gap-1 mt-2.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black">
                            <span>عائد الاستثمار المقدر: {roi}% ROI</span>
                          </div>
                        </div>

                        {/* Financial Local Goal Tracker */}
                        <div className="space-y-3.5 pt-2">
                          <p className="text-[11px] font-bold text-slate-400 text-center leading-relaxed">
                            لتحقيق هدف <span className="text-white font-black text-xs">10 ملايين سنتيم (100,000 د.ج)</span> صافي ربح شهرياً، تحتاج فقط إلى:
                          </p>

                          {finalProfit > 0 ? (
                            <div className="grid grid-cols-2 gap-3.5 text-center">
                              <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                <span className="text-lg font-black text-white block leading-tight">{ordersNeeded}</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-1 block">طرد مُسلّم شهرياً</span>
                              </div>
                              <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                <span className="text-lg font-black text-pink-500 block leading-tight">{ordersPerDay}</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-1 block">طلب يومياً</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-rose-400 text-xs font-bold">
                              ⚠️ هامش الربح غير كافٍ. يرجى رفع سعر البيع أو تقليل تكاليف الشراء والإعلان.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CTA Start Button */}
                      <div className="mt-8 pt-4 border-t border-white/5">
                        <Link 
                          href="/login" 
                          className="w-full py-4 bg-gradient-to-l from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white rounded-xl font-black text-sm text-center block shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.01] active:scale-95"
                        >
                          ابدأ متجرك مجاناً الآن وضاعف أرباحك 🚀
                        </Link>
                      </div>

                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        </section>

        {/* --- Bento Grid Section (Why Choose SOUQ AI) --- */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          id="why-us" className="py-24 relative overflow-hidden">
          {/* Subtle Ambient light behind grid */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 leading-tight">
                {t('t_7c654a62')}
              </h2>
            </div>
            
            {/* Bento Grid Layout RTL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Right Column (visually right due to RTL, left in code) -> The 3 smaller cards (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* 1. Launch Speed Card (سرعة الانطلاق) */}
                <div className="bg-slate-50/50 dark:bg-[#111726]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/10 transition-colors"></div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-500">rocket_launch</span>
                      {t('t_7aefbcaa')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                      {t('t_2e2d48c1a')}
                    </p>
                  </div>

                  {/* Visual AI Launcher Progress Widget (Kept as sleek dark console) */}
                  <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 font-mono relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[9px] text-pink-500 font-bold tracking-wider">AI STORE BUILDER</span>
                      <span className="text-[9px] text-slate-550">{launchTimer}s / 10s</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Circular Progress SVG */}
                      <div className="relative w-10 h-10 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.03)" strokeWidth="3" fill="transparent" />
                          <circle 
                            cx="20" 
                            cy="20" 
                            r="16" 
                            stroke="#E91E63" 
                            strokeWidth="3" 
                            fill="transparent" 
                            strokeDasharray="100.5" 
                            strokeDashoffset={100.5 - (launchTimer / 10) * 100.5} 
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                          {Math.round((launchTimer / 10) * 100)}%
                        </div>
                      </div>

                      {/* AI Generating Info Text */}
                      <div className="flex-1 text-right text-[10px] font-sans font-semibold text-slate-300">
                        {launchTimer <= 3 && (
                          <span className="text-blue-400 animate-pulse flex items-center gap-1 justify-end">
                            <span>{t("t_906d019b")}</span>
                            <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
                          </span>
                        )}
                        {launchTimer >= 4 && launchTimer <= 6 && (
                          <span className="text-purple-400 animate-pulse flex items-center gap-1 justify-end">
                            <span>{t("t_91636de7")}</span>
                            <span className="material-symbols-outlined text-[12px]">edit_note</span>
                          </span>
                        )}
                        {launchTimer >= 7 && launchTimer <= 9 && (
                          <span className="text-amber-400 animate-pulse flex items-center gap-1 justify-end">
                            <span>{t("t_2c2ca285")}</span>
                            <span className="material-symbols-outlined text-[12px]">extension</span>
                          </span>
                        )}
                        {launchTimer === 10 && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                            <span>{t("t_8625e2ec")}</span>
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-1000"
                        style={{ width: `${(launchTimer / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Row Formed by 2 Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* 2. Mobile Friendly Card (متوافق مع الهواتف) */}
                  <div className="bg-slate-50/50 dark:bg-[#111726]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-6 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between items-center text-center overflow-hidden relative group">
                    <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-cyan-400">devices</span>
                        {t('t_c5110971')}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                        {t('t_1051d0700')}
                      </p>
                    </div>

                    {/* Visual Mock iPhone Device Frame */}
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="w-28 h-40 bg-zinc-950 border-4 border-zinc-800 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl p-1 shrink-0"
                    >
                      {/* Top Camera Notch */}
                      <div className="w-10 h-2.5 bg-zinc-800 rounded-full mx-auto mb-1"></div>
                      
                      {/* Mock Store content */}
                      <div className="flex-1 bg-slate-900 rounded-2xl p-1 flex flex-col justify-between text-right overflow-hidden select-none">
                        {/* Mini Image */}
                        <div className="h-24 rounded-xl bg-white/5 overflow-hidden relative">
                          <img src="/images/ai_gen2.jpg" alt="Nike Shoe" className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform" />
                        </div>
                        {/* Title and price */}
                        <div className="space-y-0.5 mt-1">
                          <div className="w-12 h-1.5 bg-white/20 rounded mr-auto"></div>
                          <div className="w-8 h-1 bg-emerald-400 rounded mr-auto"></div>
                        </div>
                        {/* Purchase Button */}
                        <div className="h-4 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 mt-1.5">
                          <span className="text-[6px] text-white font-black">{t("t_d028c48a")}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* 3. Support 24/7 Card (دعم فني) */}
                  <div className="bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-[#1C1527]/40 dark:to-[#120E1A]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-6 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">contact_support</span>
                        {t('t_8f9fdaf6')}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                        {t('t_2b558491f')}
                      </p>
                    </div>

                    {/* Live Support Chat Simulation */}
                    <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-2xl p-3 flex flex-col gap-2 font-sans text-right relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-1.5 mb-0.5">
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          دعم متصل الآن
                        </span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono">SUPPORT ONLINE</span>
                      </div>

                      {/* Chat Bubble 1 */}
                      <div className="bg-white dark:bg-white/5 border border-slate-150 dark:border-transparent rounded-xl p-1.5 max-w-[90%] mr-auto rounded-tr-none text-[8px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
                        مرحباً! كيف أفعل بيكسل تتبع الفيسبوك؟
                      </div>

                      {/* Chat Bubble 2 */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2 }}
                        className="bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-500/30 rounded-xl p-1.5 max-w-[90%] ml-auto rounded-tl-none text-[8px] font-bold text-purple-600 dark:text-purple-300 text-left"
                        dir="ltr"
                      >
                        Hello! Just insert your Pixel ID in Settings ➔ Apps ✅
                      </motion.div>
                    </div>
                  </div>

                </div>

              </div>
              
              {/* Left Column (visually left, right in code) -> The Large Card / Templates Showcase (lg:col-span-7) */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50 dark:from-[#111A2D]/80 dark:to-[#0A0E18] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 hover:border-slate-350 dark:hover:border-white/20 transition-all duration-500 relative overflow-hidden shadow-2xl group/large">
                {/* Visual glow background matching the template primary color */}
                {mockTemplates.filter(temp => temp.id === activeTemplate).map(temp => (
                  <div 
                    key={temp.id}
                    className="absolute inset-0 pointer-events-none opacity-5 blur-3xl transition-all duration-700"
                    style={{
                      background: `radial-gradient(circle at bottom left, ${temp.primaryColor} 0%, transparent 70%)`
                    }}
                  />
                ))}

                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400">auto_awesome_motion</span>
                      {t('t_13342eeca')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed max-w-md">
                      {t('t_87af6532')}
                    </p>
                  </div>

                  {/* Template selector tabs */}
                  <div className="flex flex-wrap p-1 rounded-xl bg-slate-200/50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 backdrop-blur-md gap-1">
                    {mockTemplates.map(temp => (
                      <button
                        key={temp.id}
                        onClick={() => setActiveTemplate(temp.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                          activeTemplate === temp.id ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        style={{
                          backgroundColor: activeTemplate === temp.id ? temp.primaryColor : undefined
                        }}
                      >
                        {temp.id === 'fashion' && 'أزياء'}
                        {temp.id === 'tech' && t('t_59cd718d')}
                        {temp.id === 'beauty' && t('t_59c36dbd')}
                        {temp.id === 'food' && t('t_5b4475c1')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Store Viewport Container */}
                {mockTemplates.filter(temp => temp.id === activeTemplate).map(temp => (
                  <motion.div
                    key={temp.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden min-h-[350px] relative p-0.5 shadow-2xl"
                    style={{
                      boxShadow: `0 0 40px ${temp.glowColor}`
                    }}
                  >
                    {/* Mock Web Browser Header */}
                    <div className="h-8 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 px-4 flex items-center justify-between select-none">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></span>
                      </div>
                      <div className="bg-slate-200/60 dark:bg-slate-950/90 border border-slate-300 dark:border-white/5 px-6 py-0.5 rounded-md text-[8px] text-slate-500 font-mono tracking-wide" dir="ltr">
                        https://store.souqai.net/{temp.id}-shop
                      </div>
                      <div className="w-8"></div>
                    </div>

                    {/* Simulated Store Page Content */}
                    <div className={`flex-1 p-5 ${temp.bgColor} ${temp.textColor} text-right flex flex-col justify-between transition-colors duration-500 relative`}>
                      
                      {/* Badge / Category */}
                      <div className="flex justify-between items-center mb-4">
                        <span 
                          className="px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border"
                          style={{
                            color: temp.primaryColor,
                            borderColor: temp.primaryColor,
                            backgroundColor: `${temp.primaryColor}10`
                          }}
                        >
                          {temp.badge}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 tracking-wide">SOUQ AI ENGINE</span>
                      </div>

                      {/* Main Store Area Split */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-center">
                        {/* Text Product Details */}
                        <div className="order-2 md:order-1 space-y-3">
                          <h4 className="text-[17px] font-black tracking-tight leading-tight">{temp.productName}</h4>
                          <p className="text-[10px] font-semibold text-slate-400 leading-relaxed line-clamp-3">
                            {temp.desc}
                          </p>
                          
                          {/* Pricing */}
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-black" style={{ color: temp.primaryColor }}>{temp.price}</span>
                            <span className="text-[11px] font-semibold text-slate-500 line-through">{temp.discountPrice}</span>
                          </div>

                          {/* Purchase Button */}
                          <button 
                            className="w-full h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-lg transition-transform hover:scale-[1.02]"
                            style={{
                              backgroundColor: temp.primaryColor,
                              boxShadow: `0 8px 16px ${temp.glowColor}`
                            }}
                          >
                            اشترِ الآن - الدفع عند الاستلام
                          </button>
                        </div>

                        {/* Product Image Panel */}
                        <div className="order-1 md:order-2 h-64 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden bg-slate-100 dark:bg-white/5 flex items-center justify-center relative p-1 group/item">
                          <img 
                            src={temp.productImage} 
                            alt={temp.productName} 
                            className="w-full h-full object-cover rounded-xl transition-all duration-700 scale-100 group-hover/large:scale-105" 
                          />
                        </div>
                      </div>

                      {/* Performance indicators footer */}
                      <div className="flex justify-between items-center border-t border-slate-150 dark:border-white/5 pt-3.5 mt-4 text-[9px] text-slate-500 font-mono" dir="ltr">
                        <span>PAGE_LOAD: 0.3s (SECURE)</span>
                        <span className="text-emerald-400 font-black">CONVERSION: +42% 📈</span>
                      </div>

                    </div>

                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </motion.section>

        {/* --- SOUQ AI vs Competitors Comparison Table --- */}
        <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-[#070B14]/20 border-t border-slate-200 dark:border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[160px] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 leading-tight">
                {t('t_comp_title')}
              </h2>
            </div>

            <div className="bg-white dark:bg-[#111726]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-4 md:p-8 shadow-xl dark:shadow-2xl overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="py-5 px-4 text-sm font-black text-slate-500 dark:text-slate-400 w-1/3">{t('t_comp_feature')}</th>
                    <th className="py-5 px-4 text-sm font-black text-slate-900 dark:text-white w-1/3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
                      {t('t_comp_souq')}
                    </th>
                    <th className="py-5 px-4 text-sm font-black text-slate-400 dark:text-slate-500 w-1/3">{t('t_comp_others')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {[
                    { name: t('t_comp_f1'), souq: t('t_comp_f1_souq'), others: t('t_comp_f1_others') },
                    { name: t('t_comp_f2'), souq: t('t_comp_f2_souq'), others: t('t_comp_f2_others') },
                    { name: t('t_comp_f3'), souq: t('t_comp_f3_souq'), others: t('t_comp_f3_others') },
                    { name: t('t_comp_f4'), souq: t('t_comp_f4_souq'), others: t('t_comp_f4_others') },
                    { name: t('t_comp_f5'), souq: t('t_comp_f5_souq'), others: t('t_comp_f5_others') }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-6 px-4 text-sm font-bold text-slate-800 dark:text-slate-300 leading-relaxed">{row.name}</td>
                      <td className="py-6 px-4 text-sm text-emerald-400 font-bold leading-relaxed">
                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0 mt-0.5">check_circle</span>
                          <span>{row.souq}</span>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-sm text-slate-500 leading-relaxed">
                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-rose-500/60 text-[20px] shrink-0 mt-0.5">cancel</span>
                          <span>{row.others}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- Pricing Section --- */}
        <section id="pricing" className="py-24 relative">
          <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">{t('t_fcac3c7e')}</h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium">{t('t_2589bfc9b')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              
              {/* ═══════ Free Plan ═══════ */}
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 flex flex-col shadow-sm dark:shadow-none">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚀</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('t_217db6d41')}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('t_1cd3b78ac')}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{t('t_2ca363d')}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{t('t_2bcee8d')}</span>
                </div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    {appPlans?.products_limit?.free || 20} {t('t_2f1e9a3')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    {appPlans?.orders_limit?.free || 50} {t('t_c6f5d4c6')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    {appPlans?.team_limit?.free || 1} {t('t_4d385e83')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    {aiQuotas.free_text} {t('t_77ce7f2')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    {aiQuotas.free_image} {t('t_a2bf8d1a')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    
                    {t('t_507b84ca')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>{t("t_cba68fae")}</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    
                    {t('t_84007925')}
                  </li>
                  {customDomainPlans?.free && (
                    <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>{t("t_4ed755bb")}</li>
                  )}
                </ul>
                {/* Limitations */}
                <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-100 dark:border-white/5">
                  <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium list-none">
                    <span className="material-symbols-outlined text-red-400/60 text-[18px]">cancel</span>
                    
                    {t('t_17863738')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium list-none">
                    <span className="material-symbols-outlined text-red-400/60 text-[18px]">cancel</span>
                    
                    {t('t_2378fec1')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium list-none">
                    <span className="material-symbols-outlined text-red-400/60 text-[18px]">cancel</span>
                    
                    {t('t_717bc1c9')}
                  </li>
                </div>
                <Link href="/login" className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-center block">
                  
                  {t('t_e69fc755')}
                </Link>
              </div>

              {/* ═══════ Pro Plan ═══════ */}
              <div className="bg-gradient-to-b from-purple-50/90 to-pink-50/90 dark:from-[#1C142A] dark:to-[#120D1C] border border-pink-500/30 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-pink-500/10 scale-[1.02] flex flex-col">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  
                  {t('t_5f53b441')}
                </div>
                <div className="mb-6 pt-2">
                  <div className="flex items-center gap-2 mb-2 justify-center">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('t_74dcec9f')}</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium text-center">{t('t_663d4f7f')}</p>
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{proPrice}  {t('t_17422d')}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{t('t_2bcee8d')}</span>
                </div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    {appPlans?.products_limit?.pro || 100} {t('t_2f1e9a3')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    {appPlans?.orders_limit?.pro || 500} {t('t_c6f5d4c6')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    {appPlans?.team_limit?.pro || 3} {t('t_1245e6fb2')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    {aiQuotas.pro_text} {t('t_77ce7f2')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    {aiQuotas.pro_image} {t('t_a2bf8d1a')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    {t('t_f9202393')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    {t('t_18766810b')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>{t("t_cba68fae")}</li>
                  {customDomainPlans?.pro && (
                    <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                      <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>{t("t_4ed755bb")}</li>
                  )}
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    {appPlans?.facebook?.pro || 5} {t('t_10e1aa2b')} {appPlans?.tiktok?.pro || 5} {t('t_1fb04f1e')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    Facebook CAPI
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-pink-500 text-[18px]">check_circle</span>
                    Google Analytics + GTM
                  </li>
                </ul>
                <Link href="/login" className="w-full py-3 rounded-xl bg-gradient-to-l from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-colors text-center block">
                  
                  {t('t_cc256a2e')}
                </Link>
              </div>

              {/* ═══════ VIP Plan ═══════ */}
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-amber-500/20 rounded-3xl p-8 hover:border-slate-300 dark:hover:border-amber-500/40 transition-all duration-300 flex flex-col shadow-sm dark:shadow-none">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👑</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('t_15187dfac')}</h3>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400/70 font-medium">{t('t_14ccea959')}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{vipPrice}  {t('t_17422d')}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{t('t_2bcee8d')}</span>
                </div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {appPlans?.products_limit?.vip || 10000} {t('t_2f1e9a3')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {appPlans?.orders_limit?.vip || 50000} {t('t_c6f5d4c6')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {appPlans?.team_limit?.vip || 10} {t('t_1245e6fb2')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {aiQuotas.vip_text === 'unlimited' ? t('t_1dd4bec3') : `${aiQuotas.vip_text} نص بالذكاء الاصطناعي`}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {aiQuotas.vip_image === 'unlimited' ? t('t_1fc06f0ff') : `${aiQuotas.vip_image} صورة إعلانية`}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {t('t_dbc2913a')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {t('t_18766810b')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>{t("t_cba68fae")}</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>{t("t_de628b")}</li>
                  {customDomainPlans?.vip && (
                    <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>{t("t_4ed755bb")}</li>
                  )}
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {appPlans?.facebook?.vip || 10} {t('t_10e1aa2b')} {appPlans?.tiktok?.vip || 10} {t('t_1fb04f1e')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    Facebook + TikTok CAPI
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    Google Analytics + GTM
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {t('t_dffaa818')}
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    {t('t_f51a425a')}
                  </li>
                </ul>

                <Link href="/login" className="w-full py-3.5 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-colors text-center block">
                  
                  {t('t_c88c742b')}
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* --- Testimonials --- */}
        <section className="py-24 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#090D18]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{t('t_197877cb3')}</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Review 1 */}
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex text-yellow-500 mb-4 text-sm">★★★★★</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed mb-6">
                  
                  {t('t_6ce89fa6')}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold text-sm">{t('t_a303f435')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('t_b954d9a1')}</div>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex text-yellow-500 mb-4 text-sm">★★★★★</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed mb-6">
                  
                  {t('t_24d969840')}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold text-sm">{t('t_46b684c')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('t_13a1da640')}</div>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex text-yellow-500 mb-4 text-sm">★★★★★</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed mb-6">
                  
                  {t('t_263b659a2')}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold text-sm">{t('t_489368c6')}</div>
                    <div className="text-slate-550 dark:text-slate-400 text-xs">{t('t_1772b38ec')}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- FAQ Accordion Section --- */}
        <section id="faq" className="py-24 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#070B14]/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none"></div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400">
                {t('t_faq_title')}
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { q: t('t_faq_q1'), a: t('t_faq_a1') },
                { q: t('t_faq_q2'), a: t('t_faq_a2') },
                { q: t('t_faq_q3'), a: t('t_faq_a3') },
                { q: t('t_faq_q4'), a: t('t_faq_a4') },
                { q: t('t_faq_q5'), a: t('t_faq_a5') }
              ].map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-[#111726]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-6 flex items-center justify-between font-bold text-slate-900 dark:text-white text-right text-base gap-4"
                    >
                      <span className="flex-1 leading-relaxed text-right">{item.q}</span>
                      <span 
                        className={`material-symbols-outlined shrink-0 transform transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-pink-500' : 'text-slate-400'
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-slate-100 dark:border-white/5"
                        >
                          <div className="p-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-[#05080F] border-t border-slate-200 dark:border-white/5 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                 <div className="h-14 flex items-center justify-center">
                   <img src="/images/logo_cropped.png" alt="SOUQ AI" className="h-full object-contain dark:hidden" />
                   <img src="/images/logo_dark.png" alt="SOUQ AI" className="h-full object-contain hidden dark:block" />
                 </div>
              </div>
              <p className="text-slate-650 dark:text-slate-400 text-sm max-w-sm leading-relaxed font-medium">
                
                {t('t_1e1621bac')}
              </p>
            </div>

            {/* Links 1 */}
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-4">{t('t_5042603b')}</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">{t('t_80e110f3')}</a></li>
                <li><a href="#pricing" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">{t('t_7ef79796')}</a></li>
                <li><a href="#templates" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">{t('t_80b5bbe8')}</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">{t('t_4ec5bf24')}</a></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-4">{t('t_75896ab')}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">{t('t_19a8405b6')}</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">{t('t_759343ac')}</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">{t('t_1d2a501b4')}</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              
              {t('t_476be64e4')}
            </p>
          </div>
        </div>
      </footer>

      {/* Judges / Welcome Video Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseWelcomeModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-[#0B0F19] border border-pink-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-pink-500/20 overflow-hidden z-10"
              dir="rtl"
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 right-1/4 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button X */}
              <button
                onClick={handleCloseWelcomeModal}
                className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 transition-all hover:scale-105"
                title="إغلاق"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              {/* Header Badge & Title */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-3">
                  <span className="text-amber-400 text-sm">👑</span>
                  <span className="text-xs font-bold text-pink-300">مرحباً بلجنة التحكيم الموقرين</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  عرض تعريفي سريع لمنصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">SOUQ AI</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                  شاهد الفيديو الترحيبي للتعرف على أبرز ميزات المنصة وكواليس العمل
                </p>
              </div>

              {/* Video Player Box */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-inner group">
                <video
                  src="/welcome_judges.mp4"
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                >
                  متصفحك لا يدعم تشغيل الفيديو.
                </video>
              </div>

              {/* Footer Actions / Quick Navigation */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>تصفح المنصة مباشرة أو ادخل للوحة التاجر</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href="/login"
                    onClick={handleCloseWelcomeModal}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center gap-2"
                  >
                    <span>تجربة المنصة / دخول</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  </Link>

                  <button
                    onClick={handleCloseWelcomeModal}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs sm:text-sm transition-all"
                  >
                    متابعة التصفح
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
