'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import { useStoreContext } from '@/lib/useStoreContext';
import ThemeToggle from '@/components/ThemeToggle';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import MerchantAiAssistant from '@/components/MerchantAiAssistant';
import { canAccessNavItem, getRoleLabel } from '@/lib/rbac';

const navItems = [
    { id: 'Dashboard', key: 'dashboard', icon: 'dashboard', href: '/merchant' },
    { id: 'Orders', key: 'orders', icon: 'shopping_cart', href: '/orders' },
    { id: 'Inventory', key: 'inventory', icon: 'inventory_2', href: '/inventory' },
    { id: 'Customers', key: 'customers', icon: 'people', href: '/customers' },
    { id: 'Analytics', key: 'analytics', icon: 'analytics', href: '/analytics' },
    { id: 'Trending', key: 'trending', icon: 'trending_up', href: '/trending' },
    { id: 'AbandonedCarts', key: 'abandoned_carts', icon: 'shopping_bag', href: '/abandoned-carts' },
    { id: 'Templates', key: 'templates', icon: 'dashboard_customize', href: '/builder' },
    { id: 'AILanding', key: 'ai_landing', icon: 'auto_awesome', href: '/ai-landing' },
    { id: 'Team', key: 'team', icon: 'group', href: '/team' },
    { id: 'Apps', key: 'apps', icon: 'extension', href: '/apps' },
    { id: 'DeliverySettings', key: 'delivery_settings', icon: 'local_shipping', href: '/delivery-settings' },
    { id: 'Settings', key: 'settings', icon: 'settings', href: '/settings' },
];

export default function Sidebar({ activePage }: { activePage: string }) {
    const { resolvedTheme } = useTheme();
    const { lang, setLang, t } = useI18n();
    const [storeName, setStoreName] = useState('My Store');
    const [userName, setUserName] = useState('Merchant');
    const [storeDomain, setStoreDomain] = useState('');
    const [customDomain, setCustomDomain] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(t('t_217db6d41'));

    const [isLocal, setIsLocal] = useState(false);

    // Persist collapse state
    useEffect(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        if (saved === 'true') setCollapsed(true);
        if (typeof window !== 'undefined') setIsLocal(window.location.hostname.includes('localhost'));
    }, []);

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('sidebar_collapsed', String(next));
    };

    const { context, loading: contextLoading } = useStoreContext();

    useEffect(() => {
        if (!contextLoading && context) {
            setUserName(context.ownerName || 'Merchant');
            setStoreName(context.storeName || 'My Store');
            setLogoUrl(context.logoUrl || '');
            setStoreDomain(context.storeDomain || '');
            setCustomDomain(context.customDomain || null);
            
            if (context.plan === t('t_5b402b99') || context.plan === 'blocked') {
                window.location.href = '/blocked';
            } else {
                setCurrentPlan(context.plan || t('t_217db6d41'));
            }
        }
    }, [context, contextLoading, t]);

    const linkClass = (isActive: boolean) =>
        `flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-200 group relative ${isActive
            ? 'bg-primary/10 text-primary'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
        }`;

    // Tooltip (shows item label when collapsed)
    const Tooltip = ({ label }: { label: string }) => (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-xl">
            {label}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-800"></div>
        </div>
    );

    const SidebarContent = () => (
        <aside
            className={`flex flex-col h-full bg-white dark:bg-zinc-950 border-e border-gray-100 dark:border-zinc-800 shadow-sm  z-20 transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-64'
                }`}
        >
            {/* Logo + Toggle */}
            <div className={`flex items-center h-20 border-b border-gray-100 dark:border-zinc-800 dark:overflow-visible overflow-hidden transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
                {!collapsed && (
                    <div className="h-10 flex items-center justify-center">
                        <img src="/logo_cropped.png" alt="SOUQAI" className="h-10 object-contain dark:hidden" />
                        <img src="/logo_dark.png" alt="SOUQAI" className="h-10 object-contain hidden dark:block" />
                    </div>
                )}
                {collapsed && (
                    <div className="w-10 h-10 flex items-center justify-center p-1 hover:scale-110 transition-transform">
                        <img src="/logo_icon.png" alt="S" className="w-full h-full object-contain" />
                    </div>
                )}
                <div className="flex items-center gap-1">
                    {!collapsed && (
                        <>
                            <button
                                onClick={() => setLang(lang === 'ar' ? 'en' : lang === 'en' ? 'fr' : 'ar')}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 transition-colors border border-gray-100 dark:border-zinc-800"
                            >
                                {lang.toUpperCase()}
                            </button>
                            <ThemeToggle className="w-9 h-9 border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white" />
                        </>
                    )}
                    <button
                        onClick={() => toggleCollapse()}
                        className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors ${collapsed ? 'hidden' : ''}`}
                        title={collapsed ? t('expand_menu') : t('collapse_menu')}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {collapsed ? 'menu_open' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Toggle buttons when collapsed — shown below logo */}
            {collapsed && (
                <div className="flex flex-col items-center gap-2 mt-2 mb-1">
                    <button
                        onClick={() => setLang(lang === 'ar' ? 'en' : lang === 'en' ? 'fr' : 'ar')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-[11px] font-black text-gray-500 dark:text-gray-400 transition-colors border border-gray-100 dark:border-zinc-800"
                    >
                        {lang.toUpperCase()}
                    </button>
                    <ThemeToggle className="w-10 h-10 border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white" />
                    <button
                        onClick={() => toggleCollapse()}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary transition-colors"
                        title={t('expand_menu')}
                    >
                        <span className="material-symbols-outlined text-[20px]">menu_open</span>
                    </button>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {navItems.filter(item => canAccessNavItem(context?.role, item.id)).map((item) => {
                    const isActive = item.id === activePage;
                    return (
                        <Link key={item.id} href={item.href} className={linkClass(isActive)}>
                            <span className={`material-icons-round text-[22px] flex-shrink-0 ${isActive ? 'text-primary' : ''}`}>
                                {item.icon}
                            </span>
                            <span
                                className={`text-[14px] whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                            >
                                {t(item.key)}
                            </span>
                            {/* Tooltip on hover when collapsed */}
                            {collapsed && <Tooltip label={t(item.key)} />}
                        </Link>
                    );
                })}

            </nav>



            {/* Upgrade Card */}
            {!collapsed && context?.role === 'owner' && (
                <div className="px-4 pb-4">
                    <Link href="/upgrade" className="block w-full rounded-2xl bg-gradient-to-br from-[#1C1527] to-[#120E1A] border border-white/5 overflow-hidden group shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300 p-4 relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl z-0"></div>
                        
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('current_plan')}</p>
                                <h4 className="text-sm font-bold text-white mb-3">
                                    {(currentPlan === 'vip' || currentPlan === t('vip_plan') || currentPlan === t('t_15187dfac')) && <span className="text-amber-400 font-black">{t('vip_plan')}</span>}
                                    {(currentPlan === 'pro' || currentPlan === t('pro_plan') || currentPlan === t('t_74dcec9f')) && <span className="text-pink-400 font-black">{t('pro_plan')}</span>}
                                    {(currentPlan === 'free' || !currentPlan || currentPlan === t('free_plan') || currentPlan === t('t_217db6d41')) && <span className="text-white font-black">{t('free_plan')}</span>}
                                </h4>
                            </div>
                            {currentPlan !== t('t_15187dfac') && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-pink-500 group-hover:border-pink-500 transition-colors">
                                    <span className="material-symbols-outlined text-[16px] text-white">arrow_upward</span>
                                </div>
                            )}
                        </div>

                        {currentPlan !== t('t_15187dfac') && (
                            <div className="relative z-10 mt-1">
                                <span className="inline-block w-full py-2 bg-white/10 group-hover:bg-white dark:bg-zinc-900 text-white group-hover:text-slate-900 dark:text-white border border-white/10 rounded-xl text-xs font-bold text-center transition-all duration-300">
                                    {t('upgrade_plan')}
                                </span>
                            </div>
                        )}
                    </Link>
                </div>
            )}

            {/* Bottom Profile */}
            <div className="p-2 border-t border-gray-100 dark:border-zinc-800/50 relative">
                <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                    {logoUrl ? (
                        <img alt="Store Logo" className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-zinc-800 shadow-sm  flex-shrink-0" src={logoUrl} />
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                            {storeName.charAt(0)}
                        </div>
                    )}
                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0 text-start">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <p className="text-[13px] font-bold text-[#111827] dark:text-white truncate">{storeName || t('my_store')}</p>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" title="مباشر نشط"></span>
                                </div>
                                {context?.role && context.role !== 'owner' ? (
                                    <p className="text-[11px] font-bold text-primary truncate flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">security</span>
                                        {getRoleLabel(context.role)}
                                    </p>
                                ) : (
                                    <p className="text-[11px] font-medium text-[#6B7280] dark:text-gray-400 truncate">{t('souqai_platform')}</p>
                                )}
                            </div>
                            <span className={`material-symbols-outlined text-[18px] text-gray-400 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_less</span>
                        </>
                    )}
                </div>

                {isDropdownOpen && (
                    <div className={`absolute bottom-full mb-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 ${collapsed ? 'left-full mr-2 w-48' : 'left-2 right-2'}`}>
                        <div className="p-2 space-y-1">
                            {storeDomain && (
                                <a
                                    href={isLocal ? `http://${storeDomain || customDomain}.localhost:3000` : (customDomain ? `https://${customDomain}` : `https://${storeDomain}.souqai.net`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-[#111827] dark:text-white text-[14px] font-bold transition-colors text-start"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-[#6B7280] dark:text-gray-400">storefront</span>
                                    {t('store_preview')}
                                </a>
                            )}
                            <Link href="/settings" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-[#111827] dark:text-white text-[14px] font-bold transition-colors text-start">
                                <span className="material-symbols-outlined text-[18px] text-[#6B7280] dark:text-gray-400">settings</span>
                                {t('settings')}
                            </Link>
                            <button
                                onClick={async () => { await insforge.auth.signOut(); window.location.href = '/login'; }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 text-[14px] font-bold transition-colors text-start"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:flex h-full">
                <SidebarContent />
            </div>

            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 z-40 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">menu</span>
                    </button>
                    <div className="h-8 flex items-center justify-center">
                        <img src="/logo_cropped.png" alt="SOUQAI" className="h-8 object-contain dark:hidden" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <img src="/logo_dark.png" alt="SOUQAI" className="h-8 object-contain hidden dark:block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLang(lang === 'ar' ? 'en' : lang === 'en' ? 'fr' : 'ar')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-800 text-[10px] font-black text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-zinc-700"
                    >
                        {lang.toUpperCase()}
                    </button>
                    <ThemeToggle className="w-8 h-8 border-none bg-gray-50 dark:bg-zinc-800 rounded-lg text-gray-500 dark:text-gray-400" />
                </div>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="flex h-full">
                        <SidebarContent />
                    </div>
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                </div>
            )}

            <WhatsAppWidget />
            <MerchantAiAssistant />
        </>
    );
}
