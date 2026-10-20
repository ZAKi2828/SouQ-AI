'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';
import { hasPermission } from '@/lib/rbac';

export default function SettingsPage() {
    const { t, lang } = useI18n();
    const { planExpired, currentPlan: guardPlan } = useExpiredPlanGuard();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mockupDevice, setMockupDevice] = useState<'phone' | 'desktop'>('phone');
    const [activeDesignAccordion, setActiveDesignAccordion] = useState<string>('theme');

    // Store data states
    const [storeName, setStoreName] = useState('');
    const [storeSlug, setStoreSlug] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [industry, setIndustry] = useState('perfumes');
    const [supportEmail, setSupportEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [logoUrl, setLogoUrl] = useState('https://placehold.co/400x400');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');

    // Storefront Customization
    const [heroImageUrl, setHeroImageUrl] = useState('');
    const [announcementText, setAnnouncementText] = useState(t('t_ad0a6ea6'));
    const [storeColor, setStoreColor] = useState('#008096');
    const [storeLang, setStoreLang] = useState<'ar' | 'en' | 'fr'>('ar');

    // New design options
    const [storefrontTheme, setStorefrontTheme] = useState<'classic' | 'modern' | 'elegant' | 'bold'>('classic');
    const [storefrontFont, setStorefrontFont] = useState('Cairo');
    const [announcementAnimation, setAnnouncementAnimation] = useState(true);
    const [announcementBgColor, setAnnouncementBgColor] = useState('');
    const [announcementTextColor, setAnnouncementTextColor] = useState('#FFFFFF');
    const [heroBackgroundType, setHeroBackgroundType] = useState<'solid' | 'gradient' | 'image'>('gradient');
    const [heroGradientPreset, setHeroGradientPreset] = useState('blue');
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [heroCtaText, setHeroCtaText] = useState(t('t_df3c581e'));
    const [heroCtaStyle, setHeroCtaStyle] = useState<'pill' | 'rounded' | 'square' | 'outline'>('pill');
    const [productsCardStyle, setProductsCardStyle] = useState<'classic' | 'flat' | 'bold' | 'glass'>('classic');
    const [productsMobileColumns, setProductsMobileColumns] = useState<number>(2);
    const [productsDesktopColumns, setProductsDesktopColumns] = useState<number>(4);
    const [whatsappTooltip, setWhatsappTooltip] = useState(t('t_a3a01fb7'));
    const [whatsappPulse, setWhatsappPulse] = useState(true);
    const [trustBadges, setTrustBadges] = useState<any[]>([
      { icon: 'local_shipping', title: t('t_c13563e0'), description: t('t_6e189c4a') },
      { icon: 'payments', title: t('t_52243fb5'), description: t('t_a0dc650a') },
      { icon: 'verified', title: t('t_ce0705f8'), description: t('t_2420ff21') }
    ]);

    const [headerTransparent, setHeaderTransparent] = useState(false);
    const [showDarkModeToggle, setShowDarkModeToggle] = useState(true);
    const [footerBgColor, setFooterBgColor] = useState('');
    const [footerTextColor, setFooterTextColor] = useState('#FFFFFF');
    const [showReviewsHomepage, setShowReviewsHomepage] = useState(true);
    const [customCss, setCustomCss] = useState('');
    const [trustImageUrl, setTrustImageUrl] = useState('');


    // Checkout Customization
    const [checkoutBgColor, setCheckoutBgColor] = useState('#F8F9FC');
    const [checkoutInputBg, setCheckoutInputBg] = useState('#FFFFFF');
    const [checkoutInputBorder, setCheckoutInputBorder] = useState('#e5dce3');
    const [checkoutPriceBg, setCheckoutPriceBg] = useState('#f3f4f6');
    const [checkoutPriceBorder, setCheckoutPriceBorder] = useState('#e5e7eb');
    const [checkoutBadgeBg, setCheckoutBadgeBg] = useState('#ef4444');
    const [checkoutShowWhatsapp, setCheckoutShowWhatsapp] = useState(true);
    const [checkoutShowFakeReviews, setCheckoutShowFakeReviews] = useState(true);
    const [checkoutUseCustom, setCheckoutUseCustom] = useState(false);
    const [checkoutButtonText, setCheckoutButtonText] = useState('اطلب الآن');
    const [checkoutButtonIcon, setCheckoutButtonIcon] = useState('check_circle');
    const [checkoutButtonBg, setCheckoutButtonBg] = useState('#E91E63');
    const [checkoutButtonColor, setCheckoutButtonColor] = useState('#ffffff');

    // Shipping Configuration
    const [shippingProvider, setShippingProvider] = useState('none');
    const [shippingApiToken, setShippingApiToken] = useState('');
    const [shippingApiId, setShippingApiId] = useState('');
    const [shippingFromWilaya, setShippingFromWilaya] = useState('');
    const [shippingUseStock, setShippingUseStock] = useState(false);
    const [shippingEcotrackBoutique, setShippingEcotrackBoutique] = useState('');
    const [shippingIsExchange, setShippingIsExchange] = useState(false);
    const [shippingIsInsured, setShippingIsInsured] = useState(false);
    const [shippingIsExpress, setShippingIsExpress] = useState(false);

    // Auth context
    const [userId, setUserId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'basic' | 'store-design' | 'order-form' | 'account' | 'payment' | 'domains' | 'subscription' | 'notifications'>('basic');
    const [userPlan, setUserPlan] = useState(t('t_217db6d41'));
    const [isPaid, setIsPaid] = useState(false);

    // Subscription details
    const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
    const [dbPlanKey, setDbPlanKey] = useState<string>('free');
    const [isExpired, setIsExpired] = useState(false);
    const [appPlans, setAppPlans] = useState<any>(null);
    const [aiTextQuota, setAiTextQuota] = useState({ free: 0, pro: 0, vip: 'unlimited' as string | number });
    const [aiImageQuota, setAiImageQuota] = useState({ free: 0, pro: 0, vip: 'unlimited' as string | number });

    // Notifications
    const [settingsNotifications, setSettingsNotifications] = useState<any[]>([]);
    const [notifLoading, setNotifLoading] = useState(true);
    const [notifUnreadCount, setNotifUnreadCount] = useState(0);
    const [notifFilter, setNotifFilter] = useState<'all' | 'orders' | 'system' | 'stock' | 'abandoned'>('all');

    // Custom Domain
    const [customDomain, setCustomDomain] = useState('');
    const [canUseCustomDomain, setCanUseCustomDomain] = useState(false);
    const [showDomainHelp, setShowDomainHelp] = useState(false);

    // Domain Purchase
    const [domainSearch, setDomainSearch] = useState('');
    const [domainResults, setDomainResults] = useState<{name: string; tld: string; price: number; available: boolean}[]>([]);
    const [domainSearching, setDomainSearching] = useState(false);
    const [domainRequests, setDomainRequests] = useState<any[]>([]);
    const [domainRequestSending, setDomainRequestSending] = useState(false);
    const [domainModal, setDomainModal] = useState<{show: boolean; domain: any | null; success: boolean}>({show: false, domain: null, success: false});

    // Account Settings
    const [merchantFullName, setMerchantFullName] = useState('');
    const [merchantEmail, setMerchantEmail] = useState('');
    const [merchantWhatsapp, setMerchantWhatsapp] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordChanging, setPasswordChanging] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);
    const [showProfileSavedModal, setShowProfileSavedModal] = useState(false);
    const [savingAccount, setSavingAccount] = useState(false);

    // Map DB plan values to Arabic display names
    const planDbToArabic: Record<string, string> = { 'free': t('t_217db6d41'), 'pro': t('t_74dcec9f'), 'vip': t('t_15187dfac') };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target?.result as string;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const maxSize = 400; // Small logo size

                        if (width > height && width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        } else if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        // 0.7 quality to make base64 very tiny
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    };
                };
            });
            setLogoUrl(dataUrl);
            alert(t('t_3391dd84'));
        } catch (err) {
            alert(t('t_1b0381a67'));
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleHashAndQuery = () => {
                const params = new URLSearchParams(window.location.search);
                const tab = params.get('tab');
                if (tab && ['basic', 'store-design', 'order-form', 'account', 'payment', 'domains', 'subscription', 'notifications'].includes(tab)) {
                    setActiveTab(tab as any);
                } else {
                    const hash = window.location.hash.replace('#', '');
                    if (hash && ['basic', 'store-design', 'order-form', 'account', 'payment', 'domains', 'subscription', 'notifications'].includes(hash)) {
                        setActiveTab(hash as any);
                    }
                }
            };
            handleHashAndQuery();
            window.addEventListener('popstate', handleHashAndQuery);
            window.addEventListener('hashchange', handleHashAndQuery);
            return () => {
                window.removeEventListener('popstate', handleHashAndQuery);
                window.removeEventListener('hashchange', handleHashAndQuery);
            };
        }
    }, []);

    useEffect(() => {
        async function loadStoreData() {
            try {
                const ctx = await getStoreContext();
                if (!ctx) {
                    router.push('/login');
                    return;
                }
                const uid = ctx.targetUserId;
                setUserId(uid);

                // RBAC: Only owners can access settings
                if (!hasPermission(ctx.role, 'manage_settings')) {
                    router.push('/merchant');
                    return;
                }

                // Fetch store details
                const { data, error } = await insforge.database
                    .from('stores')
                    .select('*')
                    .eq('user_id', uid)
                    .limit(1);

                let storeRecord: any = null;
                if (data && data.length > 0) {
                    storeRecord = data[0];
                    setStoreName(storeRecord.store_name || '');
                    setStoreSlug(storeRecord.store_domain || '');
                    setStoreDescription(storeRecord.description || '');
                    setSupportEmail(storeRecord.support_email || '');
                    setPhoneNumber(storeRecord.phone_number || '');
                    if (storeRecord.logo_url) setLogoUrl(storeRecord.logo_url);
                    if (storeRecord.industry) setIndustry(storeRecord.industry);
                    if (storeRecord.facebook_url) setFacebookUrl(storeRecord.facebook_url);
                    if (storeRecord.instagram_url) setInstagramUrl(storeRecord.instagram_url);
                    if (storeRecord.tiktok_url) setTiktokUrl(storeRecord.tiktok_url);
                    if (storeRecord.shipping_provider) setShippingProvider(storeRecord.shipping_provider);
                    if (storeRecord.shipping_api_token) setShippingApiToken(storeRecord.shipping_api_token);
                    if (storeRecord.shipping_api_id) setShippingApiId(storeRecord.shipping_api_id);
                    if (storeRecord.shipping_from_wilaya) setShippingFromWilaya(storeRecord.shipping_from_wilaya);
                    if (storeRecord.shipping_use_stock !== undefined) setShippingUseStock(storeRecord.shipping_use_stock);
                    if (storeRecord.shipping_ecotrack_boutique) setShippingEcotrackBoutique(storeRecord.shipping_ecotrack_boutique);
                    if (storeRecord.shipping_is_exchange !== undefined) setShippingIsExchange(storeRecord.shipping_is_exchange);
                    if (storeRecord.shipping_is_insured !== undefined) setShippingIsInsured(storeRecord.shipping_is_insured);
                    if (storeRecord.shipping_is_express !== undefined) setShippingIsExpress(storeRecord.shipping_is_express);
                    if (storeRecord.custom_domain) setCustomDomain(storeRecord.custom_domain);
                    if (storeRecord.hero_image_url) setHeroImageUrl(storeRecord.hero_image_url);
                    if (storeRecord.announcement_text) setAnnouncementText(storeRecord.announcement_text);
                    if (storeRecord.store_color) setStoreColor(storeRecord.store_color);
                    if (storeRecord.store_lang) setStoreLang(storeRecord.store_lang);
                    
                    if (storeRecord.checkout_bg_color) setCheckoutBgColor(storeRecord.checkout_bg_color);
                    if (storeRecord.checkout_input_bg) setCheckoutInputBg(storeRecord.checkout_input_bg);
                    if (storeRecord.checkout_input_border) setCheckoutInputBorder(storeRecord.checkout_input_border);
                    if (storeRecord.checkout_price_bg) setCheckoutPriceBg(storeRecord.checkout_price_bg);
                    if (storeRecord.checkout_price_border) setCheckoutPriceBorder(storeRecord.checkout_price_border);
                    if (storeRecord.checkout_badge_bg) setCheckoutBadgeBg(storeRecord.checkout_badge_bg);
                    if (storeRecord.checkout_show_whatsapp !== undefined) setCheckoutShowWhatsapp(storeRecord.checkout_show_whatsapp);
                    if (storeRecord.checkout_show_fake_reviews !== undefined) setCheckoutShowFakeReviews(storeRecord.checkout_show_fake_reviews);
                    if (storeRecord.checkout_use_custom !== undefined) setCheckoutUseCustom(storeRecord.checkout_use_custom);
                    if (storeRecord.checkout_button_text) setCheckoutButtonText(storeRecord.checkout_button_text);
                    if (storeRecord.checkout_button_icon !== undefined) setCheckoutButtonIcon(storeRecord.checkout_button_icon);
                    if (storeRecord.checkout_button_bg) setCheckoutButtonBg(storeRecord.checkout_button_bg);
                    if (storeRecord.checkout_button_color) setCheckoutButtonColor(storeRecord.checkout_button_color);

                    // Load design options
                    if (storeRecord.storefront_theme) setStorefrontTheme(storeRecord.storefront_theme);
                    if (storeRecord.storefront_font) setStorefrontFont(storeRecord.storefront_font);
                    if (storeRecord.announcement_animation !== undefined) setAnnouncementAnimation(storeRecord.announcement_animation);
                    if (storeRecord.announcement_bg_color) setAnnouncementBgColor(storeRecord.announcement_bg_color);
                    if (storeRecord.announcement_text_color) setAnnouncementTextColor(storeRecord.announcement_text_color);
                    if (storeRecord.hero_background_type) setHeroBackgroundType(storeRecord.hero_background_type);
                    if (storeRecord.hero_gradient_preset) setHeroGradientPreset(storeRecord.hero_gradient_preset);
                    if (storeRecord.hero_title) setHeroTitle(storeRecord.hero_title);
                    if (storeRecord.hero_subtitle) setHeroSubtitle(storeRecord.hero_subtitle);
                    if (storeRecord.hero_cta_text) setHeroCtaText(storeRecord.hero_cta_text);
                    if (storeRecord.hero_cta_style) setHeroCtaStyle(storeRecord.hero_cta_style);
                    if (storeRecord.products_card_style) setProductsCardStyle(storeRecord.products_card_style);
                    if (storeRecord.products_mobile_columns !== undefined) setProductsMobileColumns(storeRecord.products_mobile_columns);
                    if (storeRecord.products_desktop_columns !== undefined) setProductsDesktopColumns(storeRecord.products_desktop_columns);
                    if (storeRecord.whatsapp_tooltip) setWhatsappTooltip(storeRecord.whatsapp_tooltip);
                    if (storeRecord.whatsapp_pulse !== undefined) setWhatsappPulse(storeRecord.whatsapp_pulse);
                    if (storeRecord.trust_badges_json) setTrustBadges(storeRecord.trust_badges_json);
                    if (storeRecord.header_transparent !== undefined) setHeaderTransparent(storeRecord.header_transparent);
                    if (storeRecord.show_dark_mode_toggle !== undefined) setShowDarkModeToggle(storeRecord.show_dark_mode_toggle);
                    if (storeRecord.footer_bg_color) setFooterBgColor(storeRecord.footer_bg_color);
                    if (storeRecord.footer_text_color) setFooterTextColor(storeRecord.footer_text_color);
                    if (storeRecord.show_reviews_homepage !== undefined) setShowReviewsHomepage(storeRecord.show_reviews_homepage);
                    if (storeRecord.custom_css) setCustomCss(storeRecord.custom_css);
                    if (storeRecord.trust_image_url) setTrustImageUrl(storeRecord.trust_image_url);

                }

                // Set email from context
                setMerchantEmail(ctx.email || '');

                // Get full name from auth user metadata as fallback
                const { data: userData } = await insforge.auth.getCurrentUser();
                let fallbackName = '';
                if (userData?.user) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const u = userData.user as any;
                    fallbackName = u.profile?.name || u.user_metadata?.full_name || u.user_metadata?.name || u.metadata?.full_name || '';
                    if (fallbackName) {
                        setMerchantFullName(fallbackName);
                    }
                }

                // Fetch user plan from profiles based on owner 
                const { data: profileData } = await insforge.database
                    .from('profiles')
                    .select('plan, is_paid, plan_expires_at, full_name, whatsapp_number')
                    .eq('id', uid)
                    .single();

                if (profileData) {
                    if (profileData.full_name) {
                        setMerchantFullName(profileData.full_name);
                    } else if (fallbackName) {
                        setMerchantFullName(fallbackName);
                    }
                    if (profileData.whatsapp_number) {
                        setMerchantWhatsapp(profileData.whatsapp_number);
                        // Auto-fill store phone from merchant's WhatsApp if store has no phone yet
                        if (!storeRecord?.phone_number) {
                            setPhoneNumber(profileData.whatsapp_number);
                        }
                    }
                    const dbPlan = profileData.plan || 'free';
                    setDbPlanKey(dbPlan === 'expired' ? 'free' : dbPlan);
                    
                    // Check if plan is expired
                    if (dbPlan === 'expired') {
                        setIsExpired(true);
                        setUserPlan(t('t_e1f3b5d'));
                    } else if (profileData.plan_expires_at) {
                        const expiresAt = new Date(profileData.plan_expires_at);
                        setPlanExpiresAt(profileData.plan_expires_at);
                        if (expiresAt < new Date()) {
                            setIsExpired(true);
                            setUserPlan(t('t_e1f3b5d'));
                        } else {
                            setUserPlan(planDbToArabic[dbPlan] || dbPlan);
                        }
                    } else {
                        setUserPlan(planDbToArabic[dbPlan] || dbPlan);
                    }
                    setIsPaid(profileData.is_paid || false);
                    
                    // Fetch platform settings to check custom domain eligibility + app_plans
                    const { data: settingsData } = await insforge.database
                        .from('platform_settings')
                        .select('custom_domain_plans, app_plans')
                        .eq('id', 1)
                        .single();
                    
                    if (settingsData?.custom_domain_plans) {
                        if (settingsData.custom_domain_plans[dbPlan] === true) {
                            setCanUseCustomDomain(true);
                        }
                    }
                    if (settingsData?.app_plans) {
                        setAppPlans(settingsData.app_plans);
                    }

                    // Fetch AI quotas
                    const { data: aiSettings } = await insforge.database
                        .from('ai_settings')
                        .select('free_text_quota, pro_text_quota, vip_text_quota, free_image_quota, pro_image_quota, vip_image_quota')
                        .eq('id', 1)
                        .single();

                    if (aiSettings) {
                        setAiTextQuota({
                            free: aiSettings.free_text_quota || 0,
                            pro: aiSettings.pro_text_quota || 0,
                            vip: aiSettings.vip_text_quota || 'unlimited'
                        });
                        setAiImageQuota({
                            free: aiSettings.free_image_quota || 0,
                            pro: aiSettings.pro_image_quota || 0,
                            vip: aiSettings.vip_image_quota || 'unlimited'
                        });
                    }

                    // Load domain requests
                    const { data: existingRequests } = await insforge.database
                        .from('domain_requests')
                        .select('*')
                        .eq('user_id', uid)
                        .order('created_at', { ascending: false });
                    if (existingRequests) {
                        setDomainRequests(existingRequests);
                    }
                }
            } catch (err) {
                console.error('Error loading store data', err);
            } finally {
                setLoading(false);
            }
        }
        loadStoreData();
    }, [router]);

    // Fetch notifications for the notifications tab
    useEffect(() => {
        let isMounted = true;
        const fetchNotifications = async () => {
            try {
                const ctx = await getStoreContext();
                if (!ctx) return;
                const targetUserId = ctx.targetUserId;
                const storeDomain = ctx.storeDomain;

                const { data: profile } = await insforge.database
                    .from('profiles')
                    .select('plan, plan_expires_at, created_at')
                    .eq('id', targetUserId)
                    .single();

                if (!isMounted) return;
                const notifs: any[] = [];
                const now = new Date();

                if (profile) {
                    if (profile.created_at) {
                        const createdAt = new Date(profile.created_at);
                        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
                        if (diffDays < 7) {
                            notifs.push({ id: `sys_welcome`, type: 'system', title: '\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643 \u0641\u064a SOUQai \u2728', message: '\u0646\u062a\u0645\u0646\u0649 \u0644\u0643 \u062a\u062c\u0631\u0628\u0629 \u062a\u062c\u0627\u0631\u0629 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0646\u0627\u062c\u062d\u0629 \u0648\u0645\u0631\u0628\u062d\u0629 \u0645\u0639\u0646\u0627!', time: createdAt.getTime(), link: '/settings', icon: 'waving_hand', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10', isNew: true });
                        }
                    }
                    if (profile.plan === 'free') {
                        notifs.push({ id: `sys_upgrade`, type: 'system', title: '\u062a\u0631\u0642\u064a\u0629 \u0628\u0627\u0642\u062a\u0643 \ud83d\ude80', message: '\u0623\u0646\u062a \u0627\u0644\u0622\u0646 \u0639\u0644\u0649 \u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629. \u0642\u0645 \u0628\u0627\u0644\u062a\u0631\u0642\u064a\u0629 \u0644\u0641\u062a\u062d \u0645\u0645\u064a\u0632\u0627\u062a \u0645\u062a\u0642\u062f\u0645\u0629!', time: now.getTime(), link: '/upgrade', icon: 'rocket_launch', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', isNew: true });
                    }
                    if (profile.plan_expires_at) {
                        const endDate = new Date(profile.plan_expires_at);
                        const diffDays = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                        if (diffDays < 0) {
                            notifs.push({ id: `sys_expired`, type: 'system', title: '\u0627\u0646\u062a\u0647\u062a \u0627\u0644\u062e\u0637\u0629 \u26a0\ufe0f', message: '\u0644\u0642\u062f \u0627\u0646\u062a\u0647\u062a \u0641\u062a\u0631\u0629 \u062e\u0637\u062a\u0643. \u064a\u0631\u062c\u0649 \u0627\u0644\u062a\u062c\u062f\u064a\u062f \u0644\u062a\u062c\u0646\u0628 \u062a\u0648\u0642\u0641 \u0645\u062a\u062c\u0631\u0643.', time: now.getTime(), link: '/upgrade', icon: 'error', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', isNew: true });
                        } else if (diffDays <= 7) {
                            notifs.push({ id: `sys_ending`, type: 'system', title: '\u062e\u0637\u062a\u0643 \u0634\u0627\u0631\u0641\u062a \u0639\u0644\u0649 \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621 \ud83d\udd14', message: `\u062a\u0646\u062a\u0647\u064a \u062e\u0637\u062a\u0643 \u0628\u0639\u062f ${diffDays} \u064a\u0648\u0645. \u064a\u0631\u062c\u0649 \u0627\u0644\u062a\u062c\u062f\u064a\u062f \u0642\u0631\u064a\u0628\u0627\u064b.`, time: now.getTime(), link: '/upgrade', icon: 'history', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', isNew: true });
                        }
                    }
                }

                if (storeDomain) {
                    const { data: latestOrders } = await insforge.database
                        .from('orders')
                        .select('id, product_name, total_price, created_at, customer_name, status')
                        .eq('store_domain', storeDomain)
                        .eq('status', 'pending')
                        .order('created_at', { ascending: false })
                        .limit(15);
                    if (latestOrders && latestOrders.length > 0) {
                        latestOrders.forEach((order: any) => {
                            notifs.push({ id: `order_${order.id}`, type: 'orders', title: `\u0637\u0644\u0628 \u062c\u062f\u064a\u062f \ud83d\udce6`, message: `\u0637\u0644\u0628 \u0645\u0646 ${order.customer_name || '\u0639\u0645\u064a\u0644'} \u0628\u0642\u064a\u0645\u0629 ${order.total_price} \u062f.\u062c`, time: new Date(order.created_at).getTime(), link: `/orders/${order.id}`, icon: 'shopping_bag', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', isNew: true });
                        });
                    }

                    const { data: latestAbandoned } = await insforge.database
                        .from('abandoned_forms')
                        .select('id, product_name, customer_name, customer_phone, created_at')
                        .eq('store_domain', storeDomain)
                        .eq('status', 'pending')
                        .order('created_at', { ascending: false })
                        .limit(10);
                    if (latestAbandoned && latestAbandoned.length > 0) {
                        latestAbandoned.forEach((form: any) => {
                            notifs.push({ id: `abandoned_${form.id}`, type: 'abandoned', title: '\u0633\u0644\u0629 \u0645\u062a\u0631\u0648\u0643\u0629 \ud83d\uded2', message: `\u0642\u0627\u0645 ${form.customer_name || form.customer_phone || '\u0639\u0645\u064a\u0644'} \u0628\u062a\u0631\u0643 \u0633\u0644\u0629 \u0627\u0644\u062a\u0633\u0648\u0642`, time: new Date(form.created_at).getTime(), link: '/abandoned-carts', icon: 'remove_shopping_cart', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10', isNew: true });
                        });
                    }

                    const { data: lowStock } = await insforge.database
                        .from('products')
                        .select('id, name, stock_quantity')
                        .eq('store_domain', storeDomain)
                        .lte('stock_quantity', 5)
                        .limit(10);
                    if (lowStock && lowStock.length > 0) {
                        lowStock.forEach((product: any) => {
                            notifs.push({ id: `stock_${product.id}`, type: 'stock', title: '\u0645\u062e\u0632\u0648\u0646 \u0645\u0646\u062e\u0641\u0636 \u26a0\ufe0f', message: `\u0627\u0644\u0645\u0646\u062a\u062c "${product.name}" \u0639\u0644\u0649 \u0648\u0634\u0643 \u0627\u0644\u0646\u0641\u0627\u062f (${product.stock_quantity} \u0645\u062a\u0628\u0642\u064a)`, time: Date.now(), link: `/inventory/${product.id}`, icon: 'warning', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', isNew: true });
                        });
                    }
                }

                if (!isMounted) return;
                notifs.sort((a, b) => b.time - a.time);
                setSettingsNotifications(notifs);
                setNotifUnreadCount(notifs.length);
            } catch (err) {
                console.error('Error fetching notifications:', err);
            } finally {
                if (isMounted) setNotifLoading(false);
            }
        };
        fetchNotifications();
        return () => { isMounted = false; };
    }, []);

    const validatePhone = (phone: string) => {
        if (!phone) return '';
        const regex = /^(05|06|07)\d{8}$/;
        if (!regex.test(phone)) {
            return t('t_9a8ee4d8_error') || t('t_42adfd01');
        }
        return '';
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 10);
        setPhoneNumber(val);
        setPhoneError(validatePhone(val));
    };

    const handleSave = async () => {
        const pErr = validatePhone(phoneNumber);
        if (pErr) {
            setPhoneError(pErr);
            alert(pErr);
            return;
        }
        if (!userId) return;
        setSaving(true);
        try {
            // Check if store exists first
            const { data: existingStoreResult } = await insforge.database
                .from('stores')
                .select('id')
                .eq('user_id', userId)
                .limit(1);

            const existingStore = existingStoreResult && existingStoreResult.length > 0 ? existingStoreResult[0] : null;

            const parsedCustomDomain = customDomain ? customDomain.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9.-]/g, '') : null;

            if (canUseCustomDomain && parsedCustomDomain) {
                const { data: duplicateDomainStore } = await insforge.database
                    .from('stores')
                    .select('id')
                    .eq('custom_domain', parsedCustomDomain)
                    .neq('user_id', userId)
                    .limit(1);

                if (duplicateDomainStore && duplicateDomainStore.length > 0) {
                    alert('عذراً، هذا النطاق المخصص مستخدم بالفعل مع متجر آخر.');
                    setSaving(false);
                    return;
                }
            }

            const storeData = {
                store_name: storeName,
                store_domain: storeSlug,
                custom_domain: canUseCustomDomain ? parsedCustomDomain : null,
                description: storeDescription,
                industry: industry,
                support_email: supportEmail,
                phone_number: phoneNumber,
                logo_url: logoUrl,
                facebook_url: facebookUrl,
                instagram_url: instagramUrl,
                tiktok_url: tiktokUrl,
                shipping_provider: shippingProvider,
                shipping_api_token: shippingApiToken,
                shipping_api_id: shippingApiId,
                shipping_from_wilaya: shippingFromWilaya,
                shipping_use_stock: shippingUseStock,
                shipping_ecotrack_boutique: shippingEcotrackBoutique,
                shipping_is_exchange: shippingIsExchange,
                shipping_is_insured: shippingIsInsured,
                shipping_is_express: shippingIsExpress,
                hero_image_url: heroImageUrl || null,
                announcement_text: announcementText,
                store_color: storeColor,
                store_lang: storeLang,
                checkout_bg_color: checkoutBgColor,
                checkout_input_bg: checkoutInputBg,
                checkout_input_border: checkoutInputBorder,
                checkout_price_bg: checkoutPriceBg,
                checkout_price_border: checkoutPriceBorder,
                checkout_badge_bg: checkoutBadgeBg,
                checkout_show_whatsapp: checkoutShowWhatsapp,
                checkout_show_fake_reviews: checkoutShowFakeReviews,
                checkout_use_custom: checkoutUseCustom,
                checkout_button_text: checkoutButtonText,
                checkout_button_icon: checkoutButtonIcon,
                checkout_button_bg: checkoutButtonBg,
                checkout_button_color: checkoutButtonColor,
                
                // Design settings
                storefront_theme: storefrontTheme,
                storefront_font: storefrontFont,
                announcement_animation: announcementAnimation,
                announcement_bg_color: announcementBgColor || null,
                announcement_text_color: announcementTextColor,
                hero_background_type: heroBackgroundType,
                hero_gradient_preset: heroGradientPreset,
                hero_title: heroTitle || null,
                hero_subtitle: heroSubtitle || null,
                hero_cta_text: heroCtaText,
                hero_cta_style: heroCtaStyle,
                products_card_style: productsCardStyle,
                products_mobile_columns: productsMobileColumns,
                products_desktop_columns: productsDesktopColumns,
                whatsapp_tooltip: whatsappTooltip,
                whatsapp_pulse: whatsappPulse,
                trust_badges_json: trustBadges,
                header_transparent: headerTransparent,
                show_dark_mode_toggle: showDarkModeToggle,
                footer_bg_color: footerBgColor || null,
                footer_text_color: footerTextColor || null,
                show_reviews_homepage: showReviewsHomepage,
                custom_css: customCss || null,
                trust_image_url: trustImageUrl || null,
                
                updated_at: new Date().toISOString()
            };

            let saveError: any = null;

            if (existingStore) {
                const res = await insforge.database
                    .from('stores')
                    .update(storeData)
                    .eq('user_id', userId);
                saveError = res.error;
            } else {
                const res = await insforge.database
                    .from('stores')
                    .insert({ user_id: userId, ...storeData });
                saveError = res.error;
            }

            if (saveError && Object.keys(saveError).length > 0) {
                console.error("Save Error:", saveError);
                throw new Error(saveError.message || t('t_4bd7a5ec7'));
            }

            // Also update the profile slug and custom domain for linking
            await insforge.database
                .from('profiles')
                .update({ 
                    store_slug: storeSlug,
                    custom_domain: canUseCustomDomain ? parsedCustomDomain : null,
                    full_name: merchantFullName,
                    whatsapp_number: merchantWhatsapp || null
                })
                .eq('id', userId);

            setShowProfileSavedModal(true);
        } catch (err: any) {
            alert(err.message || t('t_48edca8'));
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAccountInfo = async () => {
        if (!userId) return;
        setSavingAccount(true);
        try {
            // 1. FIRST: Sync name to auth.users (User column in InsForge dashboard)
            try {
                const profileUpdate: any = {};
                if (merchantFullName) profileUpdate.name = merchantFullName;
                if (merchantWhatsapp) profileUpdate.phone_number = merchantWhatsapp;
                const { data: profileData, error: profileError } = await insforge.auth.setProfile(profileUpdate);
                console.log('[AccountSave] setProfile result:', { profileData, profileError });
            } catch (authErr) {
                console.error('[AccountSave] setProfile error:', authErr);
            }

            // 2. THEN: Update profiles table (full_name + whatsapp_number)
            const { error, data } = await insforge.database
                .from('profiles')
                .update({
                    full_name: merchantFullName || null,
                    whatsapp_number: merchantWhatsapp || null
                })
                .eq('id', userId);

            console.log('[AccountSave] profiles update result:', { data, error });

            if (error && Object.keys(error).length > 0) {
                throw new Error(error.message || '\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u062d\u0641\u0638 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a');
            }

            setShowProfileSavedModal(true);
        } catch (err: any) {
            console.error('[AccountSave] Final error:', err);
            alert(err.message || '\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u062d\u0641\u0638 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a');
        } finally {
            setSavingAccount(false);
        }
    };
    return (
        <>
            {planExpired && (
                <PlanExpiredOverlay planName={guardPlan === 'pro' ? 'خطة التاجر' : guardPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
        body {
            font-family: 'Cairo', sans-serif;
        }
        /* Custom scrollbar for better aesthetic */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #e5dce3;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #cbb8c5;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        `}} />

            <div className="bg-[#F8F9FC] dark:bg-zinc-950 text-[#181116] dark:text-white min-h-screen flex overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Settings" />

                <main className="flex-1 flex flex-col h-screen overflow-hidden relative pt-16 md:pt-0">
                    <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                        <div className="flex items-center gap-3">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border border-primary" style={{ backgroundImage: `url('${logoUrl}')` }}></div>
                            <h1 className="font-bold text-lg">{storeName || t('t_5b3e9ec0')}</h1>
                        </div>
                        <button className="text-[#181116] p-2">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 lg:py-10">
                        <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-20">

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-[#181116] dark:text-white text-3xl md:text-4xl font-black tracking-tight">{t('t_306d9a61')}</h1>
                                    <p className="text-[#88637e] dark:text-gray-400 text-base font-normal">{t('t_1f490249')}</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <StoreLinkButton />
                                    <NotificationsDropdown />
                                    <button onClick={handleSave} disabled={saving || loading} className="flex items-center justify-center gap-2 bg-primary hover:bg-[#c22a99] text-white px-6 py-3 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                                        {saving ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-xl">save</span>
                                                <span className="font-bold text-sm">{t('t_b33df88b')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="border-b border-[#e5dce3] dark:border-[#4a3b45] sticky top-0 bg-[#F8F9FC] dark:bg-zinc-950 z-10 pt-2">
                                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                                    <button onClick={() => setActiveTab('basic')} className={`flex items-center gap-2 border-b-[3px] pb-3 transition-colors whitespace-nowrap ${activeTab === 'basic' ? 'border-primary text-primary' : 'border-transparent text-[#88637e] hover:text-[#181116] dark:text-gray-400 dark:hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">storefront</span>
                                        <span className="text-sm font-bold">{t('t_86a862fb')}</span>
                                    </button>
                                    <button onClick={() => setActiveTab('store-design')} className={`flex items-center gap-2 border-b-[3px] pb-3 transition-colors whitespace-nowrap ${activeTab === 'store-design' ? 'border-primary text-primary' : 'border-transparent text-[#88637e] hover:text-[#181116] dark:text-gray-400 dark:hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">palette</span>
                                        <span className="text-sm font-bold">{t("t_8cdbad8b")}</span>
                                    </button>
                                    <button onClick={() => setActiveTab('order-form')} className={`flex items-center gap-2 border-b-[3px] pb-3 transition-colors whitespace-nowrap ${activeTab === 'order-form' ? 'border-primary text-primary' : 'border-transparent text-[#88637e] hover:text-[#181116] dark:text-gray-400 dark:hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                                        <span className="text-sm font-bold">{t("t_bf7f2403")}</span>
                                    </button>
                                    <button onClick={() => setActiveTab('account')} className={`flex items-center gap-2 border-b-[3px] pb-3 transition-colors whitespace-nowrap ${activeTab === 'account' ? 'border-primary text-primary' : 'border-transparent text-[#88637e] hover:text-[#181116] dark:text-gray-400 dark:hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">manage_accounts</span>
                                        <span className="text-sm font-bold">{t("t_f41e65dc")}</span>
                                    </button>
                                    <button onClick={() => setActiveTab('payment')} className={`flex items-center gap-2 border-b-[3px] pb-3 transition-colors whitespace-nowrap ${activeTab === 'payment' ? 'border-primary text-primary' : 'border-transparent text-[#88637e] hover:text-[#181116] dark:text-gray-400 dark:hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">credit_card</span>
                                        <span className="text-sm font-bold">{t('t_618929f0')}</span>
                                    </button>
                                    <button onClick={() => setActiveTab('domains')} className={`flex items-center gap-2 border-b-[3px] pb-3 transition-colors whitespace-nowrap ${activeTab === 'domains' ? 'border-primary text-primary' : 'border-transparent text-[#88637e] hover:text-[#181116] dark:text-gray-400 dark:hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">public</span>
                                        <span className="text-sm font-bold">{t("t_3ecaacee")}</span>
                                    </button>
                                    <button onClick={() => setActiveTab('subscription')} className={`flex items-center gap-2 border-b-[3px] pb-3 transition-colors whitespace-nowrap ${activeTab === 'subscription' ? 'border-primary text-primary' : 'border-transparent text-[#88637e] hover:text-[#181116] dark:text-gray-400 dark:hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">workspace_premium</span>
                                        <span className="text-sm font-bold">{t('t_9929d1d3')}</span>
                                    </button>
                                    <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-2 border-b-[3px] pb-3 transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-[#88637e] hover:text-[#181116] dark:text-gray-400 dark:hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">notifications</span>
                                        <span className="text-sm font-bold">{t('t_10af21e1a')}</span>
                                        {notifUnreadCount > 0 && (
                                            <span className="min-w-[20px] h-[20px] px-1.5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                                {notifUnreadCount > 99 ? '99+' : notifUnreadCount}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center p-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                        <p className="text-[#88637e] font-bold animate-pulse">{t('t_92bc19d3')}</p>
                                    </div>
                                </div>
                            ) : activeTab === 'basic' ? (
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                    <div className="p-6 md:p-8 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                            <div className="relative group cursor-pointer shrink-0">
                                                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-cover bg-center border-4 border-white dark:border-[#2d1b28] shadow-md overflow-hidden" data-alt={t('t_446a3ce5')} style={{ backgroundImage: `url('${logoUrl}')` }}>
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-[#2d1b28] flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 flex-1">
                                                <h3 className="text-xl font-bold text-[#181116] dark:text-white">{t('t_768799a8')}</h3>
                                                <p className="text-[#88637e] dark:text-gray-400 text-sm leading-relaxed max-w-lg">
                                                    
                                                    {t('t_d0636e25')}
                                                    <br />
                                                    <span className="text-xs opacity-75">{t('t_28b2e522c')}</span>
                                                </p>
                                                <div className="flex gap-3 mt-2">
                                                    <div className="relative">
                                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title={t('t_e02a3e2')} />
                                                        <button className="px-4 py-2 bg-[#F8F9FC] dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#181116] dark:text-white rounded-lg text-sm font-bold transition-colors">
                                                            
                                                            {t('t_41c8489d')}
                                                        </button>
                                                    </div>
                                                    <button onClick={() => setLogoUrl('https://placehold.co/400x400')} className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors">
                                                        
                                                        {t('t_17f4fe')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8 flex flex-col gap-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_2d89ad92')} <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input required value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full h-12 pr-10 pl-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium placeholder-gray-400" placeholder={t('t_1ae991cac')} type="text" />
                                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#88637e]">storefront</span>
                                                </div>
                                                <p className="text-xs text-[#88637e] dark:text-gray-500 dark:text-gray-400">{t('t_aa8efd8')}</p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_3c0b64e1')}</label>
                                                <div className="relative">
                                                    <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full h-12 pr-10 pl-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none cursor-pointer">
                                                        <option value="perfumes">{t('t_bd94a2cc')}</option>
                                                        <option value="fashion">{t('t_189e8a833')}</option>
                                                        <option value="electronics">{t('t_46c7871f')}</option>
                                                        <option value="food">{t('t_1963d44ac')}</option>
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#88637e] pointer-events-none">category</span>
                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#88637e] pointer-events-none">expand_more</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_a12bd622')}</label>
                                            <div className="flex items-center h-12 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                                <div className="h-full px-4 bg-gray-100 dark:bg-white/5 border-l border-[#e5dce3] dark:border-[#4a3b45] flex items-center justify-center text-[#88637e] dark:text-gray-400 text-sm font-medium dir-ltr" dir="ltr">
                                                    souqai.net/
                                                </div>
                                                <input value={storeSlug} onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="flex-1 h-full px-4 bg-transparent border-none focus:ring-0 text-[#181116] dark:text-white text-sm font-medium text-left dir-ltr" dir="ltr" placeholder="my-store" type="text" />
                                                <button className="h-8 px-3 ml-2 bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] rounded-lg text-[#88637e] hover:text-primary transition-colors flex items-center justify-center" title={t('t_1216da01')}>
                                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                                </button>
                                            </div>
                                            <p className="text-xs text-[#88637e] dark:text-gray-500 dark:text-gray-400">{t('t_10bdbecbb')}</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_a12bd622')}</label>
                                            <div className="relative">
                                                <textarea value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} className="w-full p-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none placeholder-gray-400" placeholder={t('t_190f633c')} rows={4} maxLength={500}></textarea>
                                                <div className="absolute bottom-3 left-3 text-xs text-[#88637e] dark:text-gray-500 dark:text-gray-400 bg-[#F8F9FC] dark:bg-black/40 px-2 py-1 rounded">{storeDescription.length}/500</div>
                                            </div>
                                            <p className="text-xs text-[#88637e] dark:text-gray-500 dark:text-gray-400">{t('t_111d0fdda')}</p>
                                        </div>

                                        <div className="h-px w-full bg-[#e5dce3] dark:bg-zinc-800 my-2"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_1cc87930e')}</label>
                                                <div className="relative">
                                                    <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full h-12 pr-10 pl-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-left dir-ltr placeholder-gray-400" dir="ltr" type="email" placeholder="support@yourstore.com" />
                                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#88637e]">mail</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_d581c00')}</label>
                                                <div className="relative">
                                                    <input 
                                                        value={phoneNumber} 
                                                        onChange={handlePhoneChange} 
                                                        className={`w-full h-12 pr-10 pl-4 rounded-xl border ${phoneError ? 'border-red-500 bg-red-50/10' : 'border-[#e5dce3] dark:border-[#4a3b45]'} bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-left dir-ltr placeholder-gray-400`} 
                                                        dir="ltr" 
                                                        type="tel" 
                                                        placeholder="0512345678" 
                                                    />
                                                    <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 ${phoneError ? 'text-red-500' : 'text-[#88637e]'}`}>call</span>
                                                </div>
                                                {phoneError && <p className="text-[11px] text-red-500 font-bold mt-1 animate-pulse">{phoneError}</p>}
                                            </div>
                                        </div>

                                        <div className="h-px w-full bg-[#e5dce3] dark:bg-zinc-800 my-2"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_cdd63094')}</label>
                                                <div className="relative">
                                                    <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-left dir-ltr placeholder-gray-400" dir="ltr" type="url" placeholder="https://facebook.com/..." />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_80e8d968')}</label>
                                                <div className="relative">
                                                    <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-left dir-ltr placeholder-gray-400" dir="ltr" type="url" placeholder="https://instagram.com/..." />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_d59c3f93')}</label>
                                                <div className="relative">
                                                    <input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-left dir-ltr placeholder-gray-400" dir="ltr" type="url" placeholder="https://tiktok.com/@..." />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px w-full bg-[#e5dce3] dark:bg-zinc-800 my-2"></div>

                                        <div className="flex flex-col gap-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-[#181116] dark:text-white">{t('t_62197456')}</h3>
                                                <p className="text-sm text-[#88637e] dark:text-gray-400">{t('t_a20dc465')}</p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#181116] dark:text-gray-200">{t('t_d21cfd51')}</label>
                                                    <div className="relative">
                                                        <select value={shippingProvider} onChange={(e) => setShippingProvider(e.target.value)} className="w-full h-12 pr-10 pl-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none cursor-pointer">
                                                            <option value="none">{t('t_44b95a98')}</option>
                                                            <option value="yalidine">{t('t_c21948da')}</option>
                                                            <option value="zrexpress">Procolis / ZR Express</option>
                                                            <option value="mayesto">Mayesto Delivery</option>
                                                            <option value="ecotrack">EcoTrack / UPS</option>
                                                            <option value="kazitour">KaziTour</option>
                                                            <option value="nordouest">NordOuest</option>
                                                            <option value="guidex">GuiDex</option>
                                                        </select>
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#88637e] pointer-events-none">local_shipping</span>
                                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#88637e] pointer-events-none">expand_more</span>
                                                    </div>
                                                </div>

                                                {shippingProvider !== 'none' && (
                                                    <div className="bg-[#f9fafc] dark:bg-white/5 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                        <div className={`grid grid-cols-1 ${['yalidine', 'zrexpress', 'nordouest'].includes(shippingProvider) ? 'md:grid-cols-2' : ''} gap-6`}>
                                                            {['yalidine', 'zrexpress', 'nordouest'].includes(shippingProvider) && (
                                                                <div className="flex flex-col gap-2">
                                                                    <label className="text-sm font-bold text-[#181116] dark:text-white">
                                                                        {shippingProvider === 'yalidine' ? t('t_f5ab2e7a') : t('t_9d480fe0')}
                                                                    </label>
                                                                    <input value={shippingApiId} onChange={(e) => setShippingApiId(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/40 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-left dir-ltr" dir="ltr" type="text" placeholder="XXXXXXXX" />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-sm font-bold text-[#181116] dark:text-white">{t('t_280e1016e')}</label>
                                                                <input value={shippingApiToken} onChange={(e) => setShippingApiToken(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/40 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-left dir-ltr" dir="ltr" type="password" placeholder="••••••••••••••••••••••••••" />
                                                            </div>
                                                        </div>

                                                        {shippingProvider === 'yalidine' && (
                                                            <div className="flex flex-col gap-2 mt-6 border-t border-blue-100 dark:border-blue-900/30 pt-6">
                                                                <h4 className="text-sm font-bold text-primary">{t('t_90921ed9')}</h4>
                                                                <label className="text-sm font-bold text-[#181116] dark:text-gray-300 mt-2">{t('t_265cc4067')}</label>
                                                                <input value={shippingFromWilaya} onChange={(e) => setShippingFromWilaya(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/40 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-left dir-ltr" dir="ltr" type="text" placeholder="e.g. Alger, Oran, Setif..." />
                                                                <p className="text-[11px] text-[#88637e]">{t('t_11f230d70')}</p>

                                                                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/20 cursor-pointer mt-2">
                                                                    <div className="relative flex items-center">
                                                                        <input type="checkbox" checked={shippingIsInsured} onChange={(e) => setShippingIsInsured(e.target.checked)} className="peer sr-only" />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-zinc-900 after:border-gray-300 dark:border-zinc-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-700 peer-checked:bg-primary"></div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-[#181116] dark:text-white">{t('t_ccf61b55')}</span>
                                                                        <span className="text-xs text-[#88637e] dark:text-gray-400">{t('t_5bbeaff0')}</span>
                                                                    </div>
                                                                </label>
                                                                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/20 cursor-pointer mt-2">
                                                                    <div className="relative flex items-center">
                                                                        <input type="checkbox" checked={shippingIsExchange} onChange={(e) => setShippingIsExchange(e.target.checked)} className="peer sr-only" />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-zinc-900 after:border-gray-300 dark:border-zinc-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-700 peer-checked:bg-primary"></div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-[#181116] dark:text-white">{t('t_20ad65411')}</span>
                                                                        <span className="text-xs text-[#88637e] dark:text-gray-400">{t('t_300c5f272')}</span>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        )}

                                                        {['ecotrack', 'kazitour', 'guidex'].includes(shippingProvider) && (
                                                            <div className="flex flex-col gap-4 mt-6 border-t border-blue-100 dark:border-blue-900/30 pt-6">
                                                                <h4 className="text-sm font-bold text-primary">{t('t_9bb3cc3f')}</h4>

                                                                <div className="flex flex-col gap-2">
                                                                    <label className="text-sm font-bold text-[#181116] dark:text-gray-300">{t('t_cd2036c1')}</label>
                                                                    <input value={shippingEcotrackBoutique} onChange={(e) => setShippingEcotrackBoutique(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/40 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium" type="text" placeholder={t('t_43b713fb5')} />
                                                                </div>

                                                                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/20 cursor-pointer">
                                                                    <div className="relative flex items-center">
                                                                        <input type="checkbox" checked={shippingUseStock} onChange={(e) => setShippingUseStock(e.target.checked)} className="peer sr-only" />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-zinc-900 after:border-gray-300 dark:border-zinc-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-700 peer-checked:bg-primary"></div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-[#181116] dark:text-white">{t('t_1956f84ef')}</span>
                                                                        <span className="text-xs text-[#88637e] dark:text-gray-400">{t('t_d054a480')}</span>
                                                                    </div>
                                                                </label>

                                                                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/20 cursor-pointer mt-2">
                                                                    <div className="relative flex items-center">
                                                                        <input type="checkbox" checked={shippingIsExchange} onChange={(e) => setShippingIsExchange(e.target.checked)} className="peer sr-only" />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-zinc-900 after:border-gray-300 dark:border-zinc-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-700 peer-checked:bg-primary"></div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-[#181116] dark:text-white">{t('t_166931e51')}</span>
                                                                        <span className="text-xs text-[#88637e] dark:text-gray-400">{t('t_300c5f272')}</span>
                                                                    </div>
                                                                </label>

                                                            </div>
                                                        )}

                                                        {['zrexpress', 'nordouest'].includes(shippingProvider) && (
                                                            <div className="flex flex-col gap-4 mt-6 border-t border-blue-100 dark:border-blue-900/30 pt-6">
                                                                <h4 className="text-sm font-bold text-primary">{t('t_f2e21c3e')}</h4>
                                                                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/20 cursor-pointer mt-2">
                                                                    <div className="relative flex items-center">
                                                                        <input type="checkbox" checked={shippingIsExchange} onChange={(e) => setShippingIsExchange(e.target.checked)} className="peer sr-only" />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-zinc-900 after:border-gray-300 dark:border-zinc-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-700 peer-checked:bg-primary"></div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-[#181116] dark:text-white">{t('t_1ee3166fb')}</span>
                                                                        <span className="text-xs text-[#88637e] dark:text-gray-400">{t('t_300c5f272')}</span>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        )}

                                                        {shippingProvider === 'mayesto' && (
                                                            <div className="flex flex-col gap-4 mt-6 border-t border-blue-100 dark:border-blue-900/30 pt-6">
                                                                <h4 className="text-sm font-bold text-primary">{t('t_25944655')}</h4>
                                                                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/20 cursor-pointer mt-2">
                                                                    <div className="relative flex items-center">
                                                                        <input type="checkbox" checked={shippingIsExpress} onChange={(e) => setShippingIsExpress(e.target.checked)} className="peer sr-only" />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-zinc-900 after:border-gray-300 dark:border-zinc-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-700 peer-checked:bg-primary"></div>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-[#181116] dark:text-white">{t('t_26d210ad7')}</span>
                                                                        <span className="text-xs text-[#88637e] dark:text-gray-400">{t('t_10935f1a7')}</span>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        )}

                                                        <p className="text-xs text-[#88637e] dark:text-gray-400 mt-4 leading-relaxed">
                                                            {['yalidine', 'zrexpress', 'nordouest'].includes(shippingProvider)
                                                                ? t('t_f5eb661b')
                                                                : `ملاحظة: شركة ${shippingProvider.toUpperCase()} تطلب فقط رمز (API Token / Bearer Token) للمصادقة وتوليد البوليصة.`
                                                            }
                                                            <br />{t('t_1c8239dd8')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#F8F9FC] dark:bg-black/10 px-8 py-4 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-end gap-3">
                                        <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-xl border border-transparent text-[#88637e] hover:text-[#181116] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold text-sm transition-colors">
                                            
                                            {t('t_5987b375')}
                                        </button>
                                        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#c22a99] text-white font-bold text-sm shadow-md shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                            {saving ? t('t_92bc19d3') : t('t_b33df88b')}
                                        </button>
                                    </div>
                                </div>
                            ) : activeTab === 'store-design' ? (
                                /* ===== STOREFRONT DESIGN CUSTOMIZATION TAB ===== */
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative animate-fadeIn" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                                    
                                    {/* ━━━━━━ RIGHT SIDE: CONTROL PANEL ━━━━━━ */}
                                    <div className="lg:col-span-6 flex flex-col gap-6">
                                        
                                        {/* Header Title Card */}
                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] p-6 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#008096] to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                                    <span className="material-symbols-outlined text-white text-2xl">palette</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-[#181116] dark:text-white">{t("t_7e503808")}</h3>
                                                    <p className="text-[#88637e] dark:text-gray-400 text-xs mt-0.5">{t("t_9235ccc4")}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ━━━ ACCORDION SECTIONS ━━━ */}
                                        <div className="space-y-4">
                                            
                                            {/* Section 1: Themes & Fonts */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'theme' ? '' : 'theme')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">style</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_7e4255d4")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'theme' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'theme' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        {/* Storefront Layout selection */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_a26fb9c9")}</label>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {[
                                                                    { id: 'classic', name: t('t_679b6819'), desc: t('t_4be83402'), icon: 'grid_view' },
                                                                    { id: 'modern', name: t('t_64b58157'), desc: t('t_90eb709a'), icon: 'splitscreen' },
                                                                    { id: 'elegant', name: t('t_c99eddd3'), desc: t('t_606332b4'), icon: 'auto_awesome' },
                                                                    { id: 'bold', name: t('t_64af8c5e'), desc: t('t_f57e51ee'), icon: 'ad_units' }
                                                                ].map(theme => (
                                                                    <button 
                                                                        key={theme.id}
                                                                        onClick={() => setStorefrontTheme(theme.id as any)}
                                                                        className={`p-4 rounded-xl border text-right transition-all flex flex-col gap-1.5 hover:scale-[1.02] ${storefrontTheme === theme.id ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                                    >
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <span className={`material-symbols-outlined text-lg ${storefrontTheme === theme.id ? 'text-primary' : 'text-[#88637e]'}`}>{theme.icon}</span>
                                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${storefrontTheme === theme.id ? 'border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                                                                                {storefrontTheme === theme.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-xs font-bold text-[#181116] dark:text-white mt-1">{theme.name}</span>
                                                                        <span className="text-[10px] text-[#88637e] dark:text-gray-400 font-medium leading-relaxed">{theme.desc}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Primary Store Color (اللون العام للمتجر) */}
                                                        <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-zinc-800 pb-5">
                                                            <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_c9c63b4c")}</label>
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative w-12 h-11 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                                                                    <input 
                                                                        type="color" 
                                                                        value={storeColor} 
                                                                        onChange={(e) => setStoreColor(e.target.value)}
                                                                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                                                                    />
                                                                </div>
                                                                <input 
                                                                    type="text" 
                                                                    value={storeColor} 
                                                                    onChange={(e) => setStoreColor(e.target.value)}
                                                                    className="flex-grow h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold font-mono text-left" 
                                                                    placeholder="#008096"
                                                                    dir="ltr"
                                                                />
                                                            </div>
                                                            <p className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_ef3ec1e9")}</p>
                                                        </div>

                                                        {/* Custom Font selection */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_bf2cb1b9")}</label>
                                                            <div className="relative">
                                                                <select 
                                                                    value={storefrontFont} 
                                                                    onChange={(e) => setStorefrontFont(e.target.value)}
                                                                    className="w-full h-11 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold appearance-none cursor-pointer"
                                                                >
                                                                    <option value="Cairo">{t("t_c4eb1d82")}</option>
                                                                    <option value="Tajawal">{t("t_3236afd7")}</option>
                                                                    <option value="Almarai">{t("t_3d99d9fc")}</option>
                                                                    <option value="ElMessiri">{t("t_5e0da060")}</option>
                                                                    <option value="Montserrat">{t("t_95996b71")}</option>
                                                                </select>
                                                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg pointer-events-none">font_download</span>
                                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#88637e] pointer-events-none">expand_more</span>
                                                            </div>

                                                        {/* Store Language selection */}
                                                        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800/50">
                                                            <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_21d238e2")}</label>
                                                            <div className="relative">
                                                                <select 
                                                                    value={storeLang} 
                                                                    onChange={(e) => setStoreLang(e.target.value as any)}
                                                                    className="w-full h-11 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold appearance-none cursor-pointer"
                                                                >
                                                                    <option value="ar">{t("t_ba646b3")}</option>
                                                                    <option value="en">{t("t_2f8a2f5d")}</option>
                                                                    <option value="fr">{t("t_ccc97bde")}</option>
                                                                </select>
                                                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg pointer-events-none">language</span>
                                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#88637e] pointer-events-none">expand_more</span>
                                                            </div>
                                                            <p className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_b5c5a82f")}</p>
                                                        </div>
                                                            <p className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_8047b6ce")}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 2: Announcement Bar */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'announcement' ? '' : 'announcement')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">campaign</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_6d5fbf47")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'announcement' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'announcement' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        
                                                        {/* Text input */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_4cbcefc1")}</label>
                                                            <input 
                                                                value={announcementText}
                                                                onChange={(e) => setAnnouncementText(e.target.value)}
                                                                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                                                                placeholder={t("t_815b5d15")}
                                                                type="text"
                                                            />
                                                        </div>

                                                        {/* Animation toggler */}
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-[#181116] dark:text-white">{t("t_8f92fcb1")}</span>
                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_5b7ff6b4")}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => setAnnouncementAnimation(!announcementAnimation)}
                                                                className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${announcementAnimation ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${announcementAnimation ? 'right-0.5' : 'right-[calc(100%-1.375rem)]'}`} />
                                                            </button>
                                                        </div>

                                                        {/* Colors selection */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_920a735b")}</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="color" 
                                                                        value={announcementBgColor || storeColor} 
                                                                        onChange={(e) => setAnnouncementBgColor(e.target.value)}
                                                                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5"
                                                                    />
                                                                    <input 
                                                                        type="text" 
                                                                        value={announcementBgColor || storeColor} 
                                                                        onChange={(e) => setAnnouncementBgColor(e.target.value)}
                                                                        className="flex-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white text-[11px] font-mono dir-ltr text-left" 
                                                                        dir="ltr"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_c8111f79")}</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="color" 
                                                                        value={announcementTextColor} 
                                                                        onChange={(e) => setAnnouncementTextColor(e.target.value)}
                                                                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5"
                                                                    />
                                                                    <input 
                                                                        type="text" 
                                                                        value={announcementTextColor} 
                                                                        onChange={(e) => setAnnouncementTextColor(e.target.value)}
                                                                        className="flex-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white text-[11px] font-mono dir-ltr text-left" 
                                                                        dir="ltr"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 3: Hero Section */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'hero' ? '' : 'hero')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">image</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_1619db49")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'hero' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'hero' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        
                                                        {/* Hero Title & Subtitle */}
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_12f4a23b")}</label>
                                                                <input 
                                                                    value={heroTitle}
                                                                    onChange={(e) => setHeroTitle(e.target.value)}
                                                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                                                                    placeholder={storeName || t("t_2865d8c6")}
                                                                    type="text"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_8700cc30")}</label>
                                                                <textarea 
                                                                    value={heroSubtitle}
                                                                    onChange={(e) => setHeroSubtitle(e.target.value)}
                                                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold resize-none"
                                                                    placeholder={t("t_7ab0fb79")}
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Hero Background Type */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_dce55786")}</label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {[
                                                                    { id: 'gradient', name: t('t_557809d8'), icon: 'gradient' },
                                                                    { id: 'solid', name: t('t_de34824c'), icon: 'colors' },
                                                                    { id: 'image', name: t('t_32f9de0b'), icon: 'image' }
                                                                ].map(type => (
                                                                    <button
                                                                        key={type.id}
                                                                        onClick={() => setHeroBackgroundType(type.id as any)}
                                                                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${heroBackgroundType === type.id ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">{type.icon}</span>
                                                                        {type.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Condition 1: Gradients Presets */}
                                                        {heroBackgroundType === 'gradient' && (
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_dcc4a4f3")}</label>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {[
                                                                        { id: 'blue', name: t('t_4b073ac2'), css: 'linear-gradient(135deg, #008096 0%, #084c59 100%)' },
                                                                        { id: 'purple', name: t('t_f970be0'), css: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' },
                                                                        { id: 'orange', name: t('t_89fa28f1'), css: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' },
                                                                        { id: 'green', name: t('t_6b281115'), css: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)' },
                                                                        { id: 'gold', name: t('t_c6f57ff5'), css: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)' },
                                                                        { id: 'dark', name: t('t_a7e26ab5'), css: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)' }
                                                                    ].map(preset => (
                                                                        <button
                                                                            key={preset.id}
                                                                            onClick={() => setHeroGradientPreset(preset.id)}
                                                                            className={`py-2 px-2.5 rounded-xl border text-right transition-all flex flex-col gap-1 hover:scale-[1.03] ${heroGradientPreset === preset.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 dark:border-gray-700'}`}
                                                                        >
                                                                            <div className="w-full h-8 rounded-lg shadow-inner" style={{ background: preset.css }} />
                                                                            <span className="text-[10px] font-bold text-[#181116] dark:text-gray-300 mt-1 self-center">{preset.name}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Condition 2: Custom Image background */}
                                                        {heroBackgroundType === 'image' && (
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_6f4d67d9")}</label>
                                                                <div className="relative group">
                                                                    <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                                        {heroImageUrl ? (
                                                                            <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center gap-1 text-[#88637e] dark:text-gray-400">
                                                                                <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                                                                <span className="text-[10px] font-bold">{t("t_92a7377a")}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                                                        </div>
                                                                    </div>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;
                                                                            try {
                                                                                const dataUrl = await new Promise<string>((resolve) => {
                                                                                    const reader = new FileReader();
                                                                                    reader.readAsDataURL(file);
                                                                                    reader.onload = (event) => {
                                                                                        const img = new Image();
                                                                                        img.src = event.target?.result as string;
                                                                                        img.onload = () => {
                                                                                            const canvas = document.createElement('canvas');
                                                                                            let w = img.width;
                                                                                            let h = img.height;
                                                                                            const max = 1200;
                                                                                            if (w > h && w > max) { h *= max / w; w = max; }
                                                                                            else if (h > max) { w *= max / h; h = max; }
                                                                                            canvas.width = w;
                                                                                            canvas.height = h;
                                                                                            canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                                                                                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                                                                                        };
                                                                                    };
                                                                                });
                                                                                setHeroImageUrl(dataUrl);
                                                                            } catch (err) {
                                                                                alert('خطأ في تحميل الصورة');
                                                                            }
                                                                        }}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                                    />
                                                                </div>
                                                                {heroImageUrl && (
                                                                    <button onClick={() => setHeroImageUrl('')} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 self-start p-1 mt-1">
                                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                                        حذف الصورة الحالية
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Hero CTA Button customize */}
                                                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_881a59c3")}</label>
                                                                <input 
                                                                    value={heroCtaText}
                                                                    onChange={(e) => setHeroCtaText(e.target.value)}
                                                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                                                                    placeholder={t("t_e5bde50d")}
                                                                    type="text"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_302b5cd3")}</label>
                                                                <div className="relative">
                                                                    <select
                                                                        value={heroCtaStyle}
                                                                        onChange={(e) => setHeroCtaStyle(e.target.value as any)}
                                                                        className="w-full h-11 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="pill">{t("t_31c09558")}</option>
                                                                        <option value="rounded">{t("t_fabda7c8")}</option>
                                                                        <option value="square">{t("t_648719de")}</option>
                                                                        <option value="outline">{t("t_a2b7e0e5")}</option>
                                                                    </select>
                                                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg pointer-events-none">crop_free</span>
                                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#88637e] pointer-events-none">expand_more</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 4: Products Grid */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'products' ? '' : 'products')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_9b38eb29")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'products' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'products' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        
                                                        {/* Products Layout columns */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_c3e0d1e7")}</label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[1, 2].map(col => (
                                                                        <button
                                                                            key={col}
                                                                            onClick={() => setProductsMobileColumns(col)}
                                                                            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${productsMobileColumns === col ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                                                                        >
                                                                            <span className="material-symbols-outlined text-[16px]">{col === 1 ? 'web_asset' : 'grid_view'}</span>
                                                                            {col === 1 ? t('t_bcb681ae') : t('t_f9a4458f')}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_4b4484fd")}</label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[3, 4].map(col => (
                                                                        <button
                                                                            key={col}
                                                                            onClick={() => setProductsDesktopColumns(col)}
                                                                            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${productsDesktopColumns === col ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                                                                        >
                                                                            <span className="material-symbols-outlined text-[16px]">{col === 3 ? 'dashboard' : 'table_rows'}</span>
                                                                            {col === 3 ? t('t_19df907c') : t('t_4ec5cbbd')}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Product Card design style */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_8a377e9b")}</label>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {[
                                                                    { id: 'classic', name: t('t_67c8509f'), desc: t('t_f3db2ec6') },
                                                                    { id: 'flat', name: t('t_d048f417'), desc: t('t_cb351d98') },
                                                                    { id: 'bold', name: t('t_dae9d02e'), desc: t('t_584c56ae') },
                                                                    { id: 'glass', name: t('t_7278192a'), desc: t('t_8d3bf768') }
                                                                ].map(style => (
                                                                    <button
                                                                        key={style.id}
                                                                        onClick={() => setProductsCardStyle(style.id as any)}
                                                                        className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 hover:scale-[1.02] ${productsCardStyle === style.id ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                                    >
                                                                        <span className="text-xs font-bold text-[#181116] dark:text-white">{style.name}</span>
                                                                        <span className="text-[9px] text-[#88637e] dark:text-gray-400 font-medium leading-relaxed mt-1">{style.desc}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Show/Hide reviews on homepage */}
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 mt-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-[#181116] dark:text-white">{t("t_4eeba01a")}</span>
                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_b6e1883b")}</span>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setShowReviewsHomepage(!showReviewsHomepage)}
                                                                className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${showReviewsHomepage ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${showReviewsHomepage ? 'right-0.5' : 'right-[calc(100%-1.375rem)]'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>

                                            {/* Section 5: WhatsApp floating Widget */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'whatsapp' ? '' : 'whatsapp')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">chat</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_647ec50")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'whatsapp' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'whatsapp' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        
                                                        {/* Toggle visibility */}
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-[#181116] dark:text-white">{t("t_658290a4")}</span>
                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_38314e12")}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => setCheckoutShowWhatsapp(!checkoutShowWhatsapp)}
                                                                className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${checkoutShowWhatsapp ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/20' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${checkoutShowWhatsapp ? 'right-0.5' : 'right-[calc(100%-1.375rem)]'}`} />
                                                            </button>
                                                        </div>

                                                        {/* WhatsApp Tooltip Text */}
                                                        {checkoutShowWhatsapp && (
                                                            <>
                                                                <div className="flex flex-col gap-2">
                                                                    <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_618e3097")}</label>
                                                                    <input 
                                                                        value={whatsappTooltip}
                                                                        onChange={(e) => setWhatsappTooltip(e.target.value)}
                                                                        className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                                                                        placeholder={t("t_e7fcb6ae")}
                                                                        type="text"
                                                                    />
                                                                </div>

                                                                {/* WhatsApp pulse toggler */}
                                                                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold text-[#181116] dark:text-white">{t("t_c2809876")}</span>
                                                                        <span className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_f7db8c45")}</span>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => setWhatsappPulse(!whatsappPulse)}
                                                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${whatsappPulse ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                                    >
                                                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${whatsappPulse ? 'right-0.5' : 'right-[calc(100%-1.375rem)]'}`} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 6: Trust Image */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'badges' ? '' : 'badges')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">verified</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_a3171af1")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'badges' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'badges' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        <p className="text-[10px] text-[#88637e] dark:text-gray-400 font-medium">{t("t_6e23a77f")}</p>
                                                        <div className="relative group">
                                                            <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                                {trustImageUrl ? (
                                                                    <img src={trustImageUrl} alt="Trust Banner" className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-1 text-[#88637e] dark:text-gray-400">
                                                                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                                                        <span className="text-[10px] font-bold">{t("t_4651a883")}</span>
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                                                </div>
                                                            </div>
                                                            <input 
                                                                type="file" 
                                                                accept="image/*" 
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    try {
                                                                        const dataUrl = await new Promise<string>((resolve) => {
                                                                            const reader = new FileReader();
                                                                            reader.readAsDataURL(file);
                                                                            reader.onload = (event) => {
                                                                                const img = new Image();
                                                                                img.src = event.target?.result as string;
                                                                                img.onload = () => {
                                                                                    const canvas = document.createElement('canvas');
                                                                                    let w = img.width;
                                                                                    let h = img.height;
                                                                                    const max = 1200;
                                                                                    if (w > h && w > max) { h *= max / w; w = max; }
                                                                                    else if (h > max) { w *= max / h; h = max; }
                                                                                    canvas.width = w;
                                                                                    canvas.height = h;
                                                                                    canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                                                                                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                                                                                };
                                                                            };
                                                                        });
                                                                        setTrustImageUrl(dataUrl);
                                                                    } catch (err) {
                                                                        alert('خطأ في تحميل الصورة');
                                                                    }
                                                                }}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                            />
                                                        </div>
                                                        {trustImageUrl && (
                                                            <button onClick={() => setTrustImageUrl('')} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 self-start p-1 mt-1">
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                                حذف صورة الضمان
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 7: Navigation & Header Customization */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'header_settings' ? '' : 'header_settings')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">menu</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_4d42758f")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'header_settings' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'header_settings' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-[#181116] dark:text-white">{t("t_bb887590")}</span>
                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_e234fef6")}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => setHeaderTransparent(!headerTransparent)}
                                                                className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${headerTransparent ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${headerTransparent ? 'right-0.5' : 'right-[calc(100%-1.375rem)]'}`} />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-[#181116] dark:text-white">{t("t_de4789ad")}</span>
                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400">{t("t_3a2cdb27")}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => setShowDarkModeToggle(!showDarkModeToggle)}
                                                                className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${showDarkModeToggle ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${showDarkModeToggle ? 'right-0.5' : 'right-[calc(100%-1.375rem)]'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 8: Footer Custom Styling */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'footer_settings' ? '' : 'footer_settings')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">footprint</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_b2f9552f")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'footer_settings' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'footer_settings' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_9210ae9f")}</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="color" 
                                                                        value={footerBgColor || '#181116'} 
                                                                        onChange={(e) => setFooterBgColor(e.target.value)}
                                                                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5"
                                                                    />
                                                                    <input 
                                                                        type="text" 
                                                                        value={footerBgColor || '#181116'} 
                                                                        onChange={(e) => setFooterBgColor(e.target.value)}
                                                                        className="flex-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white text-[11px] font-mono dir-ltr text-left" 
                                                                        dir="ltr"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_e8cc7c11")}</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="color" 
                                                                        value={footerTextColor || '#FFFFFF'} 
                                                                        onChange={(e) => setFooterTextColor(e.target.value)}
                                                                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5"
                                                                    />
                                                                    <input 
                                                                        type="text" 
                                                                        value={footerTextColor || '#FFFFFF'} 
                                                                        onChange={(e) => setFooterTextColor(e.target.value)}
                                                                        className="flex-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[#181116] dark:text-white text-[11px] font-mono dir-ltr text-left" 
                                                                        dir="ltr"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 9: Advanced Custom CSS Editor */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden transition-all shadow-sm">
                                                <button 
                                                    onClick={() => setActiveDesignAccordion(activeDesignAccordion === 'custom_css' ? '' : 'custom_css')} 
                                                    className="w-full p-5 flex items-center justify-between border-b border-[#e5dce3] dark:border-[#4a3b45] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-xl">code</span>
                                                        <span className="font-bold text-[#181116] dark:text-white text-sm">{t("t_b51c4923")}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#88637e] transition-transform duration-300" style={{ transform: activeDesignAccordion === 'custom_css' ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                </button>
                                                
                                                {activeDesignAccordion === 'custom_css' && (
                                                    <div className="p-6 space-y-5 animate-scaleIn" style={{ animation: 'scaleIn 0.2s ease-out' }}>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-xs font-bold text-[#181116] dark:text-gray-300">{t("t_69108cd")}</label>
                                                            <textarea 
                                                                value={customCss}
                                                                onChange={(e) => setCustomCss(e.target.value)}
                                                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-zinc-950 text-emerald-400 focus:ring-2 focus:ring-primary/20 transition-all text-xs font-mono resize-none leading-relaxed"
                                                                placeholder="/* اكتب أكواد CSS هنا وسوف تطبق فوراً على متجرك */&#10;.sf-btn-buy {&#10;    background: #000;&#10;}"
                                                                rows={6}
                                                            />
                                                            <p className="text-[9px] text-[#88637e] dark:text-gray-400">{t("t_3ccaddd")}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                        {/* Reset & Save buttons */}
                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] p-5 flex justify-end gap-3 shadow-sm">
                                            <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl border border-transparent text-[#88637e] hover:text-[#181116] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold text-xs transition-colors">{t("t_fa259bbc")}</button>
                                            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#c22a99] text-white font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed">
                                                {saving ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-base">save</span>
                                                        <span>{t("t_d46fd04e")}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* ━━━━━━ LEFT SIDE: LIVE RESPONSIVE PREVIEW MOCKUP ━━━━━━ */}
                                    <div className="lg:col-span-6 sticky top-24 hidden md:flex flex-col gap-4 items-center self-start">
                                        
                                        {/* Device switcher and mock header */}
                                        <div className="flex items-center justify-between w-full max-w-[390px] bg-white dark:bg-zinc-900 border border-[#e5dce3] dark:border-[#4a3b45] px-4 py-2.5 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{t("t_5c2906bc")}</span>
                                            </div>
                                            
                                            {/* Mobile / Desktop select toggle */}
                                            <div className="flex bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-gray-200/50 dark:border-gray-700">
                                                <button 
                                                    onClick={() => setMockupDevice('phone')}
                                                    className={`py-1 px-3 rounded-md text-[10px] font-black transition-colors flex items-center gap-1 ${mockupDevice === 'phone' ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">phone_iphone</span>
                                                    موبايل
                                                </button>
                                                <button 
                                                    onClick={() => setMockupDevice('desktop')}
                                                    className={`py-1 px-3 rounded-md text-[10px] font-black transition-colors flex items-center gap-1 ${mockupDevice === 'desktop' ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">desktop_mac</span>
                                                    كمبيوتر
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mockup viewport container */}
                                        <div className="w-full flex justify-center">
                                            
                                            {/* PHONE VIEWPORT: iPhone 15 frame mockup */}
                                            {mockupDevice === 'phone' && (
                                                <div className="relative w-[340px] h-[610px] bg-slate-900 rounded-[48px] p-2.5 shadow-2xl border-[5px] border-slate-800/90 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
                                                    
                                                    {/* Screen notch / Dynamic Island */}
                                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40" />
                                                        <div className="w-3.5 h-1 bg-zinc-800 rounded-full" />
                                                    </div>

                                                    {/* Inner Scrollable Screen */}
                                                    <div 
                                                        className="flex-1 w-full bg-[#fbfbfb] dark:bg-zinc-950 rounded-[40px] overflow-y-auto overflow-x-hidden flex flex-col relative no-scrollbar select-none"
                                                        style={{ 
                                                            fontFamily: `${storefrontFont}, Cairo, sans-serif`,
                                                            scrollBehavior: 'smooth'
                                                        }}
                                                    >
                                                        {/* Styled Announcement Bar */}
                                                        <div 
                                                            style={{ 
                                                                background: announcementBgColor || storeColor,
                                                                color: announcementTextColor
                                                            }} 
                                                            className="h-8 flex items-center justify-center px-4 overflow-hidden relative shrink-0"
                                                        >
                                                            <p className={`text-[10px] font-bold text-center truncate ${announcementAnimation ? 'animate-marquee' : ''}`} style={{ animation: announcementAnimation ? 'sfMarquee 15s linear infinite' : 'none' }}>
                                                                {announcementText || t('t_b267eeb2')}
                                                            </p>
                                                        </div>

                                                        {/* Mock Navbar */}
                                                        <div 
                                                            style={{ 
                                                                position: headerTransparent ? 'absolute' : 'relative',
                                                                top: headerTransparent ? '32px' : '0px',
                                                                left: 0,
                                                                right: 0,
                                                                zIndex: 10,
                                                                background: headerTransparent ? 'transparent' : undefined,
                                                                color: headerTransparent ? '#FFFFFF' : undefined,
                                                                borderBottom: headerTransparent ? '1px solid rgba(255,255,255,0.1)' : undefined,
                                                                boxShadow: headerTransparent ? 'none' : undefined
                                                            }}
                                                            className={`${!headerTransparent ? 'bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800' : ''} px-4 py-2.5 flex items-center justify-between shrink-0 shadow-sm`}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-5 h-5 rounded-full bg-cover bg-center border" style={{ backgroundImage: `url('${logoUrl !== 'https://placehold.co/400x400' ? logoUrl : 'https://placehold.co/100x100'}')` }} />
                                                                <span className={`text-[11px] font-black truncate max-w-[90px] ${headerTransparent ? 'text-white' : ''}`}>{storeName || t('t_d276526e')}</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <span className={`material-symbols-outlined text-[15px] ${headerTransparent ? 'text-white' : 'text-gray-500'}`}>search</span>
                                                                <span className={`material-symbols-outlined text-[15px] ${headerTransparent ? 'text-white' : 'text-gray-500'}`}>menu</span>
                                                            </div>
                                                        </div>

                                                        {/* Mock Hero Section */}
                                                        <div 
                                                            className="relative w-full py-10 px-4 flex flex-col justify-center items-center text-center shrink-0 overflow-hidden"
                                                            style={{ 
                                                                minHeight: '160px',
                                                                background: heroBackgroundType === 'image' && heroImageUrl 
                                                                    ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${heroImageUrl}') center/cover`
                                                                    : heroBackgroundType === 'solid' 
                                                                        ? storeColor 
                                                                        : heroGradientPreset === 'purple' ? 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)'
                                                                        : heroGradientPreset === 'orange' ? 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
                                                                        : heroGradientPreset === 'green' ? 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)'
                                                                        : heroGradientPreset === 'gold' ? 'linear-gradient(135deg, #d97706 0%, #78350f 100%)'
                                                                        : heroGradientPreset === 'dark' ? 'linear-gradient(135deg, #27272a 0%, #09090b 100%)'
                                                                        : `linear-gradient(135deg, ${storeColor} 0%, #0a3d47 100%)`
                                                            }}
                                                        >
                                                            <h4 className="text-white text-base font-black leading-snug max-w-[240px] drop-shadow-md">
                                                                {heroTitle || storeName || t("t_71d74959")}
                                                            </h4>
                                                            <p className="text-white/80 text-[9px] mt-1.5 max-w-[200px] leading-relaxed">
                                                                {heroSubtitle || storeDescription || t("t_b38e55a7")}
                                                            </p>
                                                            <button 
                                                                style={{ 
                                                                    background: heroCtaStyle === 'outline' ? 'transparent' : storeColor,
                                                                    color: '#FFFFFF',
                                                                    border: heroCtaStyle === 'outline' ? '1.5px solid #FFFFFF' : 'none',
                                                                    borderRadius: heroCtaStyle === 'pill' ? '20px' : heroCtaStyle === 'rounded' ? '8px' : '0px'
                                                                }}
                                                                className="mt-4 px-5 py-1.5 text-[9px] font-black shadow-md shadow-black/10 hover:scale-105 transition-all flex items-center gap-1"
                                                            >
                                                                <span className="material-symbols-outlined text-[10px]">shopping_bag</span>
                                                                {heroCtaText || t("t_df3c581e")}
                                                            </button>
                                                        </div>

                                                        {/* Mock Categories list */}
                                                        <div className="px-3 py-3 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
                                                            {(storeLang === 'en' ? ['All', 'Men Perfumes', 'Women Perfumes', 'Bundles'] : storeLang === 'fr' ? ['Tout', 'Parfums Homme', 'Parfums Femme', 'Packs'] : ['الكل', t('t_b5e05530'), t('t_da184e24'), t('t_c4ebc953')]).map((cat, i) => (
                                                                <span 
                                                                    key={i} 
                                                                    className={`px-3 py-1 rounded-full text-[9px] font-bold border transition-colors shrink-0 ${i === 0 ? 'text-white' : 'text-gray-500 bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-800'}`}
                                                                    style={{ 
                                                                        backgroundColor: i === 0 ? storeColor : '',
                                                                        borderColor: i === 0 ? storeColor : ''
                                                                    }}
                                                                >
                                                                    {cat}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {/* Mock Products Grid */}
                                                        <div className="px-3 pb-4 shrink-0">
                                                            <div className={`grid ${productsMobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                                                                {[
                                                                    { name: t("t_df8eed79"), price: t("t_40f75b0a"), image: "https://placehold.co/400x400" },
                                                                    { name: t("t_226b0a2a"), price: t("t_a8d4b70f"), image: "https://placehold.co/400x400" }
                                                                ].map((p, i) => (
                                                                    <div 
                                                                        key={i}
                                                                        className={`overflow-hidden flex flex-col bg-white dark:bg-zinc-900 ${
                                                                            productsCardStyle === 'flat' ? 'border-none shadow-none rounded-none' : 
                                                                            productsCardStyle === 'bold' ? 'border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 
                                                                            productsCardStyle === 'glass' ? 'bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-md rounded-2xl shadow-sm' :
                                                                            'border border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl'
                                                                        }`}
                                                                    >
                                                                        <div className="aspect-square relative bg-gray-50 overflow-hidden">
                                                                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                                                                            <span style={{ background: '#ef4444' }} className="absolute top-1.5 left-1.5 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full">{t("t_d6af7328")}</span>
                                                                        </div>
                                                                        <div className="p-2.5 flex flex-col flex-grow text-center items-center justify-between">
                                                                            <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{p.name}</span>
                                                                            
                                                                            {/* Review rating stars toggle */}
                                                                            {showReviewsHomepage && (
                                                                                <div className="flex gap-0.5 items-center mt-1">
                                                                                    {[1,2,3,4,5].map(s => (
                                                                                        <span key={s} className="text-[10px] text-amber-400">★</span>
                                                                                    ))}
                                                                                    <span className="text-[8px] text-gray-400 font-bold mr-0.5">(+99)</span>
                                                                                </div>
                                                                            )}

                                                                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2">{p.price}</span>
                                                                            
                                                                            <button 
                                                                                style={{ 
                                                                                    background: storeColor,
                                                                                    borderRadius: productsCardStyle === 'flat' ? '0px' : productsCardStyle === 'bold' ? '0px' : '8px'
                                                                                }}
                                                                                className="w-full mt-2 py-1.5 text-white text-[8px] font-black flex items-center justify-center gap-1 hover:scale-105 transition-all"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[9px]">shopping_cart</span>
                                                                                {storeLang === 'en' ? 'Buy Now' : storeLang === 'fr' ? 'Acheter' : t('t_d028c48a')}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Mock Trust image block uploader replace */}
                                                        <div className="px-3 py-3 shrink-0 flex justify-center bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800">
                                                            <img 
                                                                src={trustImageUrl || '/images/trust-banner.jpg'} 
                                                                alt="Trust Banner" 
                                                                className="w-full h-auto object-contain rounded-xl max-h-16" 
                                                            />
                                                        </div>

                                                        {/* Mock Footer */}
                                                        <div 
                                                            style={{ 
                                                                backgroundColor: footerBgColor || undefined,
                                                                backgroundImage: footerBgColor ? 'none' : undefined,
                                                                background: !footerBgColor ? '#18181b' : undefined,
                                                                color: footerTextColor || '#ffffff'
                                                            }}
                                                            className="py-4 px-4 text-center shrink-0 border-t border-white/5 flex flex-col items-center gap-2 transition-colors duration-300"
                                                        >
                                                            <span className="text-[9px] opacity-70">© {new Date().getFullYear()} {storeName || t('t_c953eeb')}. {storeLang === 'en' ? 'All rights reserved.' : storeLang === 'fr' ? 'Tous droits réservés.' : t('t_6a54b2')}</span>
                                                            <div className="flex gap-1.5 items-center">
                                                                <span className="text-[8px] opacity-50 font-bold">Powered by</span>
                                                                <img src="/logo_dark.png" alt="" className="h-3 object-contain opacity-50 brightness-0 invert" />
                                                            </div>
                                                        </div>

                                                        {/* Floating WhatsApp button */}
                                                        {checkoutShowWhatsapp && (
                                                            <div 
                                                                className={`fixed z-[99] bottom-4 left-4 w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-lg cursor-pointer ${whatsappPulse ? 'animate-pulse' : ''}`}
                                                                title={whatsappTooltip}
                                                            >
                                                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* DESKTOP VIEWPORT: Safari browser mockup */}
                                            {mockupDevice === 'desktop' && (
                                                <div className="relative w-full max-w-[480px] h-[480px] bg-slate-100 dark:bg-zinc-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 flex flex-col overflow-hidden animate-scaleIn">
                                                    
                                                    {/* Browser window top bar */}
                                                    <div className="bg-gray-200 dark:bg-zinc-900/80 px-4 py-2 flex items-center justify-between border-b border-gray-300/30 dark:border-zinc-800 shrink-0">
                                                        <div className="flex gap-1.5">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                                        </div>
                                                        <div className="h-5 px-6 rounded bg-white dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-700 text-[9px] text-gray-400 text-center flex items-center font-mono w-56 truncate justify-center select-none" dir="ltr">
                                                            {`https://${storeSlug || 'store'}.souqai.net`}
                                                        </div>
                                                        <div className="w-8" />
                                                    </div>

                                                    {/* Desktop scrollable screen inside */}
                                                    <div 
                                                        className="flex-1 w-full bg-[#fbfbfb] dark:bg-zinc-950 overflow-y-auto overflow-x-hidden flex flex-col relative no-scrollbar select-none"
                                                        style={{ 
                                                            fontFamily: `${storefrontFont}, Cairo, sans-serif`,
                                                            scrollBehavior: 'smooth'
                                                        }}
                                                    >
                                                        {/* Styled Announcement Bar */}
                                                        <div 
                                                            style={{ 
                                                                background: announcementBgColor || storeColor,
                                                                color: announcementTextColor
                                                            }} 
                                                            className="h-8 flex items-center justify-center px-6 overflow-hidden relative shrink-0"
                                                        >
                                                            <p className={`text-[10px] font-bold text-center truncate ${announcementAnimation ? 'animate-marquee' : ''}`} style={{ animation: announcementAnimation ? 'sfMarquee 15s linear infinite' : 'none' }}>
                                                                {announcementText || t('t_b267eeb2')}
                                                            </p>
                                                        </div>

                                                        {/* Desktop Header */}
                                                        <div 
                                                            style={{
                                                                position: headerTransparent ? 'absolute' : 'relative',
                                                                top: headerTransparent ? '32px' : '0px',
                                                                left: 0,
                                                                right: 0,
                                                                zIndex: 10,
                                                                background: headerTransparent ? 'transparent' : undefined,
                                                                color: headerTransparent ? '#FFFFFF' : undefined,
                                                                borderBottom: headerTransparent ? '1px solid rgba(255,255,255,0.1)' : undefined,
                                                                boxShadow: headerTransparent ? 'none' : undefined
                                                            }}
                                                            className={`${!headerTransparent ? 'bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800' : ''} px-6 py-4 flex items-center justify-between shrink-0 shadow-sm`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-cover bg-center border" style={{ backgroundImage: `url('${logoUrl !== 'https://placehold.co/400x400' ? logoUrl : 'https://placehold.co/100x100'}')` }} />
                                                                <span className={`text-xs font-black truncate ${headerTransparent ? 'text-white' : ''}`}>{storeName || t('t_d276526e')}</span>
                                                            </div>
                                                            <div className={`flex gap-5 text-[10px] font-bold ${headerTransparent ? 'text-white/80' : 'text-gray-500'}`}>
                                                                <span className={headerTransparent ? 'text-white' : 'text-primary'}>{t("t_772ff2da")}</span>
                                                                <span>{t("t_9b052503")}</span>
                                                                <span>اتصل بنا</span>
                                                            </div>
                                                            <div className="w-16" />
                                                        </div>

                                                        {/* Desktop Hero Section */}
                                                        <div 
                                                            className="relative w-full py-12 px-6 flex flex-col justify-center items-center text-center shrink-0 overflow-hidden"
                                                            style={{ 
                                                                minHeight: '180px',
                                                                background: heroBackgroundType === 'image' && heroImageUrl 
                                                                    ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${heroImageUrl}') center/cover`
                                                                    : heroBackgroundType === 'solid' 
                                                                        ? storeColor 
                                                                        : heroGradientPreset === 'purple' ? 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)'
                                                                        : heroGradientPreset === 'orange' ? 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
                                                                        : heroGradientPreset === 'green' ? 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)'
                                                                        : heroGradientPreset === 'gold' ? 'linear-gradient(135deg, #d97706 0%, #78350f 100%)'
                                                                        : heroGradientPreset === 'dark' ? 'linear-gradient(135deg, #27272a 0%, #09090b 100%)'
                                                                        : `linear-gradient(135deg, ${storeColor} 0%, #0a3d47 100%)`
                             
                                                            }}
                                                        >
                                                            <h4 className="text-white text-lg font-black leading-snug max-w-[340px] drop-shadow-md">
                                                                {heroTitle || storeName || t("t_71d74959")}
                                                            </h4>
                                                            <p className="text-white/80 text-[10px] mt-1.5 max-w-[300px] leading-relaxed">
                                                                {heroSubtitle || storeDescription || t("t_b38e55a7")}
                                                            </p>
                                                            <button 
                                                                style={{ 
                                                                    background: heroCtaStyle === 'outline' ? 'transparent' : storeColor,
                                                                    color: '#FFFFFF',
                                                                    border: heroCtaStyle === 'outline' ? '1.5px solid #FFFFFF' : 'none',
                                                                    borderRadius: heroCtaStyle === 'pill' ? '20px' : heroCtaStyle === 'rounded' ? '8px' : '0px'
                                                                }}
                                                                className="mt-4 px-6 py-2 text-[10px] font-black shadow-md shadow-black/10 hover:scale-105 transition-all flex items-center gap-1.5"
                                                            >
                                                                <span className="material-symbols-outlined text-[11px]">shopping_bag</span>
                                                                {heroCtaText || t("t_df3c581e")}
                                                            </button>
                                                        </div>

                                                        {/* Desktop Products */}
                                                        <div className="px-6 py-6 shrink-0">
                                                            <h5 style={{ color: storeColor }} className="text-xs font-black text-center mb-4">{storeLang === 'en' ? 'Our Latest Products' : storeLang === 'fr' ? 'Nos Derniers Produits' : t('t_a79cc46c')}</h5>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {[
                                                                    { name: t("t_df8eed79"), price: t("t_40f75b0a"), image: "https://placehold.co/400x400" },
                                                                    { name: t("t_226b0a2a"), price: t("t_a8d4b70f"), image: "https://placehold.co/400x400" }
                                                                ].map((p, i) => (
                                                                    <div 
                                                                        key={i}
                                                                        className={`overflow-hidden flex flex-col bg-white dark:bg-zinc-900 ${
                                                                            productsCardStyle === 'flat' ? 'border-none shadow-none rounded-none' : 
                                                                            productsCardStyle === 'bold' ? 'border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 
                                                                            productsCardStyle === 'glass' ? 'bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-md rounded-2xl shadow-sm' :
                                                                            'border border-gray-100 dark:border-zinc-800 shadow-sm rounded-2xl'
                                                                        }`}
                                                                    >
                                                                        <div className="aspect-square relative bg-gray-50 overflow-hidden">
                                                                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                                                                            <span style={{ background: '#ef4444' }} className="absolute top-1.5 left-1.5 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full">{t("t_d6af7328")}</span>
                                                                        </div>
                                                                        <div className="p-3.5 flex flex-col flex-grow text-center items-center justify-between">
                                                                            <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{p.name}</span>
                                                                            {showReviewsHomepage && (
                                                                                <div className="flex gap-0.5 items-center mt-1">
                                                                                    {[1,2,3,4,5].map(s => (
                                                                                        <span key={s} className="text-[10px] text-amber-400">★</span>
                                                                                    ))}
                                                                                    <span className="text-[8px] text-gray-400 font-bold mr-0.5">(+99)</span>
                                                                                </div>
                                                                            )}
                                                                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2">{p.price}</span>
                                                                            <button 
                                                                                style={{ 
                                                                                    background: storeColor,
                                                                                    borderRadius: productsCardStyle === 'flat' ? '0px' : productsCardStyle === 'bold' ? '0px' : '8px'
                                                                                }}
                                                                                className="w-full mt-3 py-2 text-white text-[9px] font-black flex items-center justify-center gap-1.5 hover:scale-105 transition-all"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[10px]">shopping_cart</span>
                                                                                {storeLang === 'en' ? 'Buy Now' : storeLang === 'fr' ? 'Acheter' : t('t_d028c48a')}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Mock Trust badges block */}
                                                        <div className="px-6 py-5 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800 shrink-0 grid grid-cols-3 gap-3">
                                                            {trustBadges.map((badge, i) => (
                                                                <div key={i} className="flex flex-col items-center text-center">
                                                                    <div style={{ color: storeColor }} className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0 mb-1">
                                                                        <span className="material-symbols-outlined text-lg">{badge.icon || 'verified'}</span>
                                                                    </div>
                                                                    <span className="text-[9px] font-black text-gray-800 dark:text-gray-200">{badge.title || t('t_e395fdbe')}</span>
                                                                    <span className="text-[7px] text-[#88637e] dark:text-gray-400 mt-0.5 leading-snug">{badge.description || t('t_65515e2a')}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Mock Footer */}
                                                        <div className="bg-zinc-900 text-white py-5 px-6 text-center shrink-0 border-t border-white/5 flex flex-col items-center gap-2">
                                                            <span className="text-[9px] text-gray-400">© {new Date().getFullYear()} {storeName || t('t_c953eeb')}. {storeLang === 'en' ? 'All rights reserved.' : storeLang === 'fr' ? 'Tous droits réservés.' : t('t_6a54b2')}</span>
                                                            <div className="flex gap-1.5 items-center">
                                                                <span className="text-[8px] text-gray-500 font-bold">Powered by</span>
                                                                <img src="/logo_dark.png" alt="" className="h-3 object-contain opacity-50" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'order-form' ? (
                                /* ===== ORDER FORM CUSTOMIZATION TAB ===== */
                                <div className="space-y-6">
                                    {/* Header Card */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                                        <span className="material-symbols-outlined text-white text-2xl">receipt_long</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#181116] dark:text-white">{t("t_8f37403f")}</h3>
                                                        <p className="text-[#88637e] dark:text-gray-400 text-sm mt-0.5">{t("t_f87526d8")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Use Custom Toggle */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                                                        <span className="material-symbols-outlined text-white text-xl">tune</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[#181116] dark:text-white text-base">{t("t_f8606af1")}</h4>
                                                        <p className="text-[#88637e] dark:text-gray-400 text-xs mt-0.5">{t("t_554d00d4")}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setCheckoutUseCustom(!checkoutUseCustom)}
                                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${checkoutUseCustom ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${checkoutUseCustom ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'}`}></div>
                                                </button>
                                            </div>

                                            {!checkoutUseCustom && (
                                                <div className="mt-5 flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                    <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
                                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{t("t_225b43a8")}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {checkoutUseCustom && (
                                        <>
                                            {/* ━━━ FORM COLORS ━━━ */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                                <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20">
                                                            <span className="material-symbols-outlined text-white text-lg">palette</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#181116] dark:text-white text-sm">{t("t_6177e4fc")}</h4>
                                                            <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_efefb235")}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 md:p-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {/* Form Background */}
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-teal-500">format_paint</span>
                                                                خلفية الاستمارة
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="color" value={checkoutBgColor} onChange={(e) => setCheckoutBgColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#e5dce3] dark:border-[#4a3b45] p-1" />
                                                                <input type="text" value={checkoutBgColor} onChange={(e) => setCheckoutBgColor(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-xs font-mono text-left dir-ltr" dir="ltr" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {['#F8F9FC', '#f0f9fa', '#fdf2f8', '#f0fdf4', '#fefce8', '#1a1a2e', '#0f172a', '#18181b'].map(c => (
                                                                    <button key={c} onClick={() => setCheckoutBgColor(c)} className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${checkoutBgColor === c ? 'ring-2 ring-offset-1 ring-teal-400 border-white shadow-md' : 'border-gray-200 dark:border-gray-700'}`} style={{ background: c }} title={c} />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Input Background */}
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-teal-500">text_fields</span>
                                                                خلفية حقول الإدخال
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="color" value={checkoutInputBg} onChange={(e) => setCheckoutInputBg(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#e5dce3] dark:border-[#4a3b45] p-1" />
                                                                <input type="text" value={checkoutInputBg} onChange={(e) => setCheckoutInputBg(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-xs font-mono text-left dir-ltr" dir="ltr" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {['#FFFFFF', '#f8fafc', '#f0f9fa', '#fefce8', '#0f172a', '#1e293b', '#18181b', '#27272a'].map(c => (
                                                                    <button key={c} onClick={() => setCheckoutInputBg(c)} className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${checkoutInputBg === c ? 'ring-2 ring-offset-1 ring-teal-400 border-white shadow-md' : 'border-gray-200 dark:border-gray-700'}`} style={{ background: c }} title={c} />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Input Border */}
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-teal-500">border_style</span>
                                                                لون إطار الحقول
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="color" value={checkoutInputBorder} onChange={(e) => setCheckoutInputBorder(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#e5dce3] dark:border-[#4a3b45] p-1" />
                                                                <input type="text" value={checkoutInputBorder} onChange={(e) => setCheckoutInputBorder(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-xs font-mono text-left dir-ltr" dir="ltr" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {['#e5dce3', '#e2e8f0', '#0094B1', '#d1d5db', '#334155', '#475569', '#3f3f46', '#52525b'].map(c => (
                                                                    <button key={c} onClick={() => setCheckoutInputBorder(c)} className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${checkoutInputBorder === c ? 'ring-2 ring-offset-1 ring-teal-400 border-white shadow-md' : 'border-gray-200 dark:border-gray-700'}`} style={{ background: c }} title={c} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ━━━ PRICE COLORS ━━━ */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                                <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                                                            <span className="material-symbols-outlined text-white text-lg">payments</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#181116] dark:text-white text-sm">{t("t_5ad66d2b")}</h4>
                                                            <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_9f8bcddc")}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 md:p-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {/* Price Box Background */}
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-emerald-500">sell</span>
                                                                خلفية مربع السعر
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="color" value={checkoutPriceBg} onChange={(e) => setCheckoutPriceBg(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#e5dce3] dark:border-[#4a3b45] p-1" />
                                                                <input type="text" value={checkoutPriceBg} onChange={(e) => setCheckoutPriceBg(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-xs font-mono text-left dir-ltr" dir="ltr" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {['#f3f4f6', '#f0f9fa', '#ecfdf5', '#fef3c7', '#0f172a', '#1e293b', '#18181b', '#1c1917'].map(c => (
                                                                    <button key={c} onClick={() => setCheckoutPriceBg(c)} className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${checkoutPriceBg === c ? 'ring-2 ring-offset-1 ring-emerald-400 border-white shadow-md' : 'border-gray-200 dark:border-gray-700'}`} style={{ background: c }} title={c} />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Price Box Border */}
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-emerald-500">crop_square</span>
                                                                إطار مربع السعر
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="color" value={checkoutPriceBorder} onChange={(e) => setCheckoutPriceBorder(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#e5dce3] dark:border-[#4a3b45] p-1" />
                                                                <input type="text" value={checkoutPriceBorder} onChange={(e) => setCheckoutPriceBorder(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-xs font-mono text-left dir-ltr" dir="ltr" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {['#e5e7eb', '#0094B1', '#10b981', '#d1d5db', '#334155', '#475569', '#3f3f46', '#a3a3a3'].map(c => (
                                                                    <button key={c} onClick={() => setCheckoutPriceBorder(c)} className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${checkoutPriceBorder === c ? 'ring-2 ring-offset-1 ring-emerald-400 border-white shadow-md' : 'border-gray-200 dark:border-gray-700'}`} style={{ background: c }} title={c} />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Discount Badge */}
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-emerald-500">local_offer</span>
                                                                خلفية شارة التخفيض
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="color" value={checkoutBadgeBg} onChange={(e) => setCheckoutBadgeBg(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#e5dce3] dark:border-[#4a3b45] p-1" />
                                                                <input type="text" value={checkoutBadgeBg} onChange={(e) => setCheckoutBadgeBg(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-xs font-mono text-left dir-ltr" dir="ltr" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'].map(c => (
                                                                    <button key={c} onClick={() => setCheckoutBadgeBg(c)} className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${checkoutBadgeBg === c ? 'ring-2 ring-offset-1 ring-emerald-400 border-white shadow-md' : 'border-gray-200 dark:border-gray-700'}`} style={{ background: c }} title={c} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ━━━ EXTRA FEATURES ━━━ */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                                <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md shadow-pink-500/20">
                                                            <span className="material-symbols-outlined text-white text-lg">extension</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#181116] dark:text-white text-sm">{t("t_cc52de74")}</h4>
                                                            <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_6708993a")}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 md:p-8 space-y-5">
                                                    {/* WhatsApp Toggle */}
                                                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FC] dark:bg-white/5 border border-[#e5dce3] dark:border-[#4a3b45] hover:border-green-300 dark:hover:border-green-700 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-[#181116] dark:text-white text-sm">{t("t_491e17e3")}</h5>
                                                                <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_a7a23559")}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setCheckoutShowWhatsapp(!checkoutShowWhatsapp)}
                                                            className={`relative w-14 h-7 rounded-full transition-all duration-300 shrink-0 ${checkoutShowWhatsapp ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${checkoutShowWhatsapp ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'}`}></div>
                                                        </button>
                                                    </div>

                                                    {/* Fake Reviews Toggle */}
                                                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FC] dark:bg-white/5 border border-[#e5dce3] dark:border-[#4a3b45] hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-amber-500 text-xl">star_rate</span>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-[#181116] dark:text-white text-sm">{t("t_16f19f91")}</h5>
                                                                <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_7de82c44")}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setCheckoutShowFakeReviews(!checkoutShowFakeReviews)}
                                                            className={`relative w-14 h-7 rounded-full transition-all duration-300 shrink-0 ${checkoutShowFakeReviews ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${checkoutShowFakeReviews ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'}`}></div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ━━━ ORDER BUTTON CUSTOMIZATION ━━━ */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                                <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center shadow-md shadow-primary/20">
                                                            <span className="material-symbols-outlined text-white text-lg">smart_button</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#181116] dark:text-white text-sm">تخصيص زر "اطلب الآن"</h4>
                                                            <p className="text-[#88637e] dark:text-gray-400 text-[11px]">تخصيص النص والأيقونة والألوان لزر إرسال الطلب في المتجر</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 md:p-8 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Button Text */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200">نص الزر</label>
                                                            <input 
                                                                type="text" 
                                                                value={checkoutButtonText} 
                                                                onChange={(e) => setCheckoutButtonText(e.target.value)} 
                                                                placeholder="اطلب الآن"
                                                                className="w-full h-11 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-sm font-medium focus:outline-none focus:border-primary"
                                                            />
                                                        </div>

                                                        {/* Button Icon */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200">أيقونة الزر (اسم الأيقونة من Material Icons)</label>
                                                            <div className="relative">
                                                                <input 
                                                                    type="text" 
                                                                    value={checkoutButtonIcon} 
                                                                    onChange={(e) => setCheckoutButtonIcon(e.target.value)} 
                                                                    placeholder="check_circle"
                                                                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-sm font-medium focus:outline-none focus:border-primary"
                                                                />
                                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{checkoutButtonIcon || 'check_circle'}</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-400">أمثلة: check_circle, shopping_cart, send, local_shipping</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Button Background Color */}
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200">لون خلفية الزر</label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="color" value={checkoutButtonBg} onChange={(e) => setCheckoutButtonBg(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#e5dce3] dark:border-[#4a3b45] p-1" />
                                                                <input type="text" value={checkoutButtonBg} onChange={(e) => setCheckoutButtonBg(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-xs font-mono text-left dir-ltr" dir="ltr" />
                                                            </div>
                                                        </div>

                                                        {/* Button Text Color */}
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-sm font-bold text-[#181116] dark:text-gray-200">لون نص الزر</label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="color" value={checkoutButtonColor} onChange={(e) => setCheckoutButtonColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#e5dce3] dark:border-[#4a3b45] p-1" />
                                                                <input type="text" value={checkoutButtonColor} onChange={(e) => setCheckoutButtonColor(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white text-xs font-mono text-left dir-ltr" dir="ltr" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ━━━ LIVE PREVIEW ━━━ */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                                <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                                                            <span className="material-symbols-outlined text-white text-lg">preview</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#181116] dark:text-white text-sm">{t("t_21aeb0eb")}</h4>
                                                            <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_769f019a")}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 md:p-8">
                                                    <div className="max-w-lg mx-auto rounded-2xl overflow-hidden shadow-xl border" style={{ background: checkoutBgColor, borderColor: checkoutInputBorder }}>
                                                        {/* Preview Header */}
                                                        <div className="p-5 text-center">
                                                            <h3 className="text-lg font-black" style={{ color: checkoutBgColor === '#F8F9FC' || checkoutBgColor === '#FFFFFF' || checkoutBgColor === '#f0f9fa' || checkoutBgColor === '#fdf2f8' || checkoutBgColor === '#f0fdf4' || checkoutBgColor === '#fefce8' || checkoutBgColor === '#f3f4f6' || checkoutBgColor === '#ecfdf5' || checkoutBgColor === '#fef3c7' ? '#181116' : '#ffffff' }}>{t("t_411defc6")}</h3>
                                                        </div>


                                                        {/* Preview Price */}
                                                        <div className="mx-5 mb-4 p-4 rounded-xl flex items-center justify-between" style={{ background: checkoutPriceBg, border: `2px dashed ${checkoutPriceBorder}` }}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold" style={{ color: checkoutPriceBg === '#f3f4f6' || checkoutPriceBg === '#f0f9fa' || checkoutPriceBg === '#ecfdf5' || checkoutPriceBg === '#fef3c7' ? '#181116' : '#ffffff' }}>{t("t_dad5838c")}</span>
                                                                <span className="text-xl font-black text-green-500">{t("t_fb6307a3")}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm line-through opacity-50" style={{ color: checkoutPriceBg === '#f3f4f6' || checkoutPriceBg === '#f0f9fa' || checkoutPriceBg === '#ecfdf5' || checkoutPriceBg === '#fef3c7' ? '#666' : '#aaa' }}>{t("t_b83054a6")}</span>
                                                                <span className="px-2.5 py-1 rounded-lg text-white text-xs font-black" style={{ background: checkoutBadgeBg }}>{t("t_2df60f2d")}</span>
                                                            </div>
                                                        </div>

                                                        {/* Preview Fields */}
                                                        <div className="px-5 pb-5 space-y-3">
                                                            <input readOnly className="w-full h-11 px-4 rounded-xl text-sm font-medium" placeholder={t("t_5cc117da")} style={{ background: checkoutInputBg, border: `1.5px solid ${checkoutInputBorder}`, color: checkoutInputBg === '#FFFFFF' || checkoutInputBg === '#f8fafc' || checkoutInputBg === '#f0f9fa' || checkoutInputBg === '#fefce8' ? '#333' : '#eee' }} />
                                                            <input readOnly className="w-full h-11 px-4 rounded-xl text-sm font-medium" placeholder={t("t_4cf96882")} style={{ background: checkoutInputBg, border: `1.5px solid ${checkoutInputBorder}`, color: checkoutInputBg === '#FFFFFF' || checkoutInputBg === '#f8fafc' || checkoutInputBg === '#f0f9fa' || checkoutInputBg === '#fefce8' ? '#333' : '#eee' }} />
                                                            <input readOnly className="w-full h-11 px-4 rounded-xl text-sm font-medium" placeholder={t("t_9d6e27ed")} style={{ background: checkoutInputBg, border: `1.5px solid ${checkoutInputBorder}`, color: checkoutInputBg === '#FFFFFF' || checkoutInputBg === '#f8fafc' || checkoutInputBg === '#f0f9fa' || checkoutInputBg === '#fefce8' ? '#333' : '#eee' }} />
                                                            <button 
                                                                className="w-full h-12 rounded-xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2" 
                                                                style={{ 
                                                                    background: checkoutButtonBg, 
                                                                    color: checkoutButtonColor 
                                                                }}
                                                            >
                                                                {checkoutButtonIcon && (
                                                                    <span className="material-symbols-outlined text-lg">{checkoutButtonIcon}</span>
                                                                )}
                                                                <span>{checkoutButtonText}</span>
                                                            </button>
                                                            <div className="flex items-center justify-center gap-1.5 pt-1">
                                                                <span className="material-symbols-outlined text-green-500 text-sm">shield</span>
                                                                <span className="text-[11px] opacity-60" style={{ color: checkoutBgColor === '#F8F9FC' || checkoutBgColor === '#FFFFFF' || checkoutBgColor === '#f0f9fa' || checkoutBgColor === '#fdf2f8' || checkoutBgColor === '#f0fdf4' || checkoutBgColor === '#fefce8' || checkoutBgColor === '#f3f4f6' || checkoutBgColor === '#ecfdf5' || checkoutBgColor === '#fef3c7' ? '#666' : '#aaa' }}>{t("t_5e7cfbef")}</span>
                                                            </div>
                                                        </div>

                                                        {/* Preview Fake Reviews */}
                                                        {checkoutShowFakeReviews && (
                                                            <div className="mx-5 mb-5 p-3 rounded-xl flex items-center justify-center gap-2" style={{ background: checkoutPriceBg, border: `1px solid ${checkoutPriceBorder}` }}>
                                                                <div className="flex">
                                                                    {[1,2,3,4,5].map(s => (
                                                                        <span key={s} className="text-amber-400 text-sm">★</span>
                                                                    ))}
                                                                </div>
                                                                <span className="text-xs font-bold" style={{ color: checkoutPriceBg === '#f3f4f6' || checkoutPriceBg === '#f0f9fa' || checkoutPriceBg === '#ecfdf5' || checkoutPriceBg === '#fef3c7' ? '#181116' : '#ffffff' }}>{t("t_b0ffd2cd")}</span>
                                                            </div>
                                                        )}

                                                        {/* Preview WhatsApp */}
                                                        {checkoutShowWhatsapp && (
                                                            <div className="relative pb-5 pr-5 flex justify-end">
                                                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40 animate-bounce" style={{ animationDuration: '2s' }}>
                                                                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="bg-[#F8F9FC] dark:bg-black/10 px-8 py-4 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-end gap-3 rounded-2xl">
                                        <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-xl border border-transparent text-[#88637e] hover:text-[#181116] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold text-sm transition-colors">
                                            {t('t_5987b375')}
                                        </button>
                                        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#c22a99] text-white font-bold text-sm shadow-md shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                            {saving ? t('t_92bc19d3') : t('t_b33df88b')}
                                        </button>
                                    </div>
                                </div>
                            ) : activeTab === 'account' ? (
                                /* ===== ACCOUNT SETTINGS TAB ===== */
                                <div className="space-y-6">
                                    {/* Header Card */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                                        <span className="material-symbols-outlined text-white text-2xl">manage_accounts</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#181116] dark:text-white">{t("t_f41e65dc")}</h3>
                                                        <p className="text-[#88637e] dark:text-gray-400 text-sm mt-0.5">{t("t_df9dfe09")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ━━━ MERCHANT INFO ━━━ */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md shadow-primary/20">
                                                    <span className="material-symbols-outlined text-white text-lg">person</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#181116] dark:text-white text-sm">المعلومات الشخصية</h4>
                                                    <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_9fc6ef62")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8">
                                            <div className="flex items-center gap-5 mb-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                                                    <span className="text-2xl font-black text-white">{(merchantFullName || 'T')[0].toUpperCase()}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <h3 className="text-lg font-black text-[#181116] dark:text-white truncate">{merchantFullName || t('t_1567b847')}</h3>
                                                    <p className="text-sm text-[#88637e] dark:text-gray-400 font-medium truncate dir-ltr text-right" dir="ltr">{merchantEmail || '—'}</p>
                                                    {merchantWhatsapp && (
                                                        <p className="text-sm text-[#88637e] dark:text-gray-400 font-medium flex items-center gap-1.5 dir-ltr" dir="ltr">
                                                            <span className="material-symbols-outlined text-[14px] text-green-500">phone</span>
                                                            {merchantWhatsapp}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${dbPlanKey === 'vip' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-700 dark:text-amber-400' : dbPlanKey === 'pro' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                                            <span className="material-symbols-outlined text-[12px]">{dbPlanKey === 'vip' ? 'diamond' : dbPlanKey === 'pro' ? 'workspace_premium' : 'person'}</span>
                                                            {userPlan}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
                                                        الاسم الكامل
                                                    </label>
                                                    <div className="relative">
                                                        <input 
                                                            value={merchantFullName} 
                                                            onChange={(e) => setMerchantFullName(e.target.value)}
                                                            className="w-full h-12 pr-10 pl-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" 
                                                            type="text" 
                                                        />
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary">person</span>
                                                    </div>
                                                    <p className="text-xs text-[#88637e] dark:text-gray-400">{t("t_8112f256")}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                                                        البريد الإلكتروني
                                                    </label>
                                                    <div className="relative">
                                                        <input 
                                                            value={merchantEmail} 
                                                            readOnly
                                                            className="w-full h-12 pr-10 pl-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-gray-50 dark:bg-black/10 text-[#181116] dark:text-white/70 text-sm font-medium text-left dir-ltr cursor-not-allowed" 
                                                            dir="ltr"
                                                            type="email" 
                                                        />
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary">mail</span>
                                                    </div>
                                                    <p className="text-xs text-[#88637e] dark:text-gray-400">{t("t_dd763171")}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-primary">phone</span>
                                                        رقم الواتساب
                                                    </label>
                                                    <div className="relative flex">
                                                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 border border-l-0 border-[#e5dce3] dark:border-[#4a3b45] rounded-r-xl px-3 text-sm font-bold text-[#88637e] dark:text-gray-400 select-none" dir="ltr">
                                                            <span>🇩🇿</span>
                                                            <span>+213</span>
                                                        </div>
                                                        <input 
                                                            value={merchantWhatsapp} 
                                                            onChange={(e) => setMerchantWhatsapp(e.target.value.replace(/\D/g, ''))}
                                                            className="w-full h-12 px-4 rounded-l-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-left dir-ltr" 
                                                            dir="ltr"
                                                            type="tel" 
                                                            placeholder="0551234567"
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-[#88637e] dark:text-gray-400">{t("t_a2667f9f")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ━━━ CHANGE PASSWORD ━━━ */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20">
                                                    <span className="material-symbols-outlined text-white text-lg">lock</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#181116] dark:text-white text-sm">تغيير كلمة المرور</h4>
                                                    <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_ee1b83d0")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8">
                                            {passwordSuccess && (
                                                <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-900/30 animate-pulse">
                                                    <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                                                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-bold">{passwordSuccess}</p>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-5">
                                                {/* Current Password */}
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-rose-500">key</span>
                                                        كلمة المرور الحالية
                                                    </label>
                                                    <div className="relative">
                                                        <input 
                                                            value={currentPassword} 
                                                            onChange={(e) => { setCurrentPassword(e.target.value); setPasswordSuccess(''); }}
                                                            className="w-full h-12 pr-10 pl-12 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm font-medium text-left dir-ltr placeholder-gray-400" 
                                                            dir="ltr"
                                                            type={showCurrentPassword ? 'text' : 'password'} 
                                                            placeholder="••••••••"
                                                        />
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-rose-400">lock</span>
                                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88637e] hover:text-[#181116] dark:hover:text-white transition-colors">
                                                            <span className="material-symbols-outlined text-xl">{showCurrentPassword ? 'visibility_off' : 'visibility'}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="h-px w-full bg-[#e5dce3] dark:bg-zinc-800"></div>

                                                {/* New Password */}
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-rose-500">lock_reset</span>
                                                        كلمة المرور الجديدة
                                                    </label>
                                                    <div className="relative">
                                                        <input 
                                                            value={newPassword} 
                                                            onChange={(e) => { setNewPassword(e.target.value); setPasswordSuccess(''); }}
                                                            className="w-full h-12 pr-10 pl-12 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm font-medium text-left dir-ltr placeholder-gray-400" 
                                                            dir="ltr"
                                                            type={showNewPassword ? 'text' : 'password'} 
                                                            placeholder="••••••••"
                                                            minLength={6}
                                                        />
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-rose-400">lock_reset</span>
                                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88637e] hover:text-[#181116] dark:hover:text-white transition-colors">
                                                            <span className="material-symbols-outlined text-xl">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                                                        </button>
                                                    </div>
                                                    {newPassword && newPassword.length < 6 && (
                                                        <p className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">info</span>
                                                            كلمة المرور يجب أن تكون 6 أحرف على الأقل
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Confirm Password */}
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-rose-500">verified</span>
                                                        تأكيد كلمة المرور الجديدة
                                                    </label>
                                                    <div className="relative">
                                                        <input 
                                                            value={confirmPassword} 
                                                            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordSuccess(''); }}
                                                            className={`w-full h-12 pr-10 pl-4 rounded-xl border ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400 bg-red-50/10 focus:ring-red-500/20 focus:border-red-500' : 'border-[#e5dce3] dark:border-[#4a3b45] focus:ring-rose-500/20 focus:border-rose-500'} bg-[#F8F9FC] dark:bg-black/20 text-[#181116] dark:text-white transition-all text-sm font-medium text-left dir-ltr placeholder-gray-400`}
                                                            dir="ltr"
                                                            type="password" 
                                                            placeholder="••••••••"
                                                        />
                                                        <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 ${confirmPassword && confirmPassword !== newPassword ? 'text-red-400' : 'text-rose-400'}`}>verified</span>
                                                    </div>
                                                    {confirmPassword && confirmPassword !== newPassword && (
                                                        <p className="text-[11px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                                                            <span className="material-symbols-outlined text-sm">error</span>
                                                            كلمات المرور غير متطابقة
                                                        </p>
                                                    )}
                                                    {confirmPassword && confirmPassword === newPassword && newPassword.length >= 6 && (
                                                        <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                                            كلمات المرور متطابقة
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                {/* OTP Code (Only visible after requesting change) */}
                                                {showOtpInput && (
                                                    <div className="flex flex-col gap-2 mt-2 p-5 border border-rose-200 dark:border-rose-900/30 rounded-xl bg-rose-50/50 dark:bg-rose-900/10">
                                                        <label className="text-sm font-bold text-[#181116] dark:text-gray-200 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[16px] text-rose-500">pin</span>{t("t_1461ff22")}</label>
                                                        <div className="relative">
                                                            <input 
                                                                value={otpCode} 
                                                                onChange={(e) => setOtpCode(e.target.value)}
                                                                className="w-full h-12 px-4 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-white dark:bg-black/40 text-[#181116] dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-lg font-black text-center tracking-[0.5em] dir-ltr placeholder-gray-300" 
                                                                dir="ltr"
                                                                type="text"
                                                                maxLength={6}
                                                                placeholder="------"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium text-center mt-1">{t("t_2598c034")}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Security Tips */}
                                            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                                <div className="flex items-start gap-3">
                                                    <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">tips_and_updates</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">{t("t_74680702")}</p>
                                                        <ul className="text-[11px] text-blue-600/80 dark:text-blue-400/80 space-y-1 list-inside">
                                                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">check</span>{t("t_754621c4")}</li>
                                                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">check</span>{t("t_e31a8852")}</li>
                                                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">check</span>{t("t_108a9801")}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#F8F9FC] dark:bg-black/10 px-8 py-4 border-t border-[#e5dce3] dark:border-[#4a3b45] flex justify-end">
                                            <button 
                                                onClick={async () => {
                                                    if (showOtpInput) {
                                                        if (!otpCode || otpCode.length !== 6) {
                                                            alert('يرجى إدخال رمز التحقق المكون من 6 أرقام بشكل صحيح');
                                                            return;
                                                        }
                                                        setPasswordChanging(true);
                                                        setPasswordSuccess('');
                                                        try {
                                                            const { data: exchangeData, error: exchangeError } = await insforge.auth.exchangeResetPasswordToken({
                                                                email: merchantEmail,
                                                                code: otpCode
                                                            });
                                                            if (exchangeError) throw exchangeError;
                                                            if (!exchangeData?.token) throw new Error(t('t_f33e540'));

                                                            const { error: resetError } = await insforge.auth.resetPassword({
                                                                newPassword: newPassword,
                                                                otp: exchangeData.token
                                                            });
                                                            if (resetError) throw resetError;

                                                            setCurrentPassword('');
                                                            setNewPassword('');
                                                            setConfirmPassword('');
                                                            setOtpCode('');
                                                            setShowOtpInput(false);
                                                            setPasswordSuccess('');
                                                            setShowPasswordSuccessModal(true);
                                                        } catch (err: any) {
                                                            alert(err.message || t('t_2440fbf8'));
                                                        } finally {
                                                            setPasswordChanging(false);
                                                        }
                                                        return;
                                                    }

                                                    if (!currentPassword || !newPassword || !confirmPassword) {
                                                        alert('يرجى ملء جميع الحقول');
                                                        return;
                                                    }
                                                    if (newPassword.length < 6) {
                                                        alert('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
                                                        return;
                                                    }
                                                    if (newPassword !== confirmPassword) {
                                                        alert('كلمات المرور غير متطابقة');
                                                        return;
                                                    }
                                                    setPasswordChanging(true);
                                                    setPasswordSuccess('');
                                                    try {
                                                        // Re-authenticate with current password
                                                        const { error: signInError } = await insforge.auth.signInWithPassword({
                                                            email: merchantEmail,
                                                            password: currentPassword,
                                                        });
                                                        if (signInError) {
                                                            alert('كلمة المرور الحالية غير صحيحة');
                                                            setPasswordChanging(false);
                                                            return;
                                                        }
                                                        // Send reset email to get OTP
                                                        const { error: resetError } = await insforge.auth.sendResetPasswordEmail({ email: merchantEmail });
                                                        if (resetError) throw resetError;
                                                        
                                                        setShowOtpInput(true);
                                                        setPasswordSuccess(t('t_2372ac28'));
                                                    } catch (err: any) {
                                                        alert(err.message || t('t_fc4499e4'));
                                                    } finally {
                                                        setPasswordChanging(false);
                                                    }
                                                }}
                                                disabled={passwordChanging || (!showOtpInput && (!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6)) || (showOtpInput && otpCode.length !== 6)}
                                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-rose-500 disabled:hover:to-pink-600"
                                            >
                                                {passwordChanging ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <span className="material-symbols-outlined text-lg">{showOtpInput ? 'check_circle' : 'lock_reset'}</span>
                                                )}
                                                {passwordChanging ? t('t_c3f1a68a') : (showOtpInput ? t('t_4a9bd896') : t('t_64e5f49a'))}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Save Button for Account Tab */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md shadow-primary/20">
                                                    <span className="material-symbols-outlined text-white text-lg">save</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#181116] dark:text-white text-sm">حفظ التغييرات</h4>
                                                    <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_76e0088a")}</p>
                                                </div>
                                            </div>
                                            <button onClick={handleSaveAccountInfo} disabled={savingAccount} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-[#9b59b6] hover:from-[#c22a99] hover:to-[#8e44ad] text-white font-bold text-sm shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                                                {savingAccount ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                )}
                                                {savingAccount ? 'جاري الحفظ...' : t('t_457c3517')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'domains' ? (
                                /* ===== DOMAINS TAB ===== */
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <span className="material-symbols-outlined text-white text-2xl">public</span>
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black text-[#181116] dark:text-white">{t("t_d36d7c23")}</h2>
                                                    <p className="text-[#88637e] dark:text-gray-400 text-sm">{t("t_46e87fd5")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ━━━ SECTION 1: Custom Domain Linking ━━━ */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md shadow-primary/20">
                                                    <span className="material-symbols-outlined text-white text-lg">link</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#181116] dark:text-white text-sm">{t("t_e4dd8c9b")}</h4>
                                                    <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_34f36df4")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8">
                                            {canUseCustomDomain ? (
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center h-12 rounded-xl border border-primary/20 dark:border-primary/40 bg-[#F8F9FC] dark:bg-black/20 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                                        <div className="h-full px-4 bg-primary/5 dark:bg-primary/20 border-l border-primary/20 dark:border-primary/40 flex items-center justify-center text-primary dark:text-primary-light text-sm font-medium">
                                                            <span className="material-symbols-outlined text-sm mr-1">public</span>
                                                            https://
                                                        </div>
                                                        <input 
                                                            value={customDomain} 
                                                            onChange={(e) => setCustomDomain(e.target.value.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9.-]/g, ''))} 
                                                            className="flex-1 h-full px-4 bg-transparent border-none focus:ring-0 text-[#181116] dark:text-white text-sm font-medium text-left dir-ltr" 
                                                            dir="ltr" 
                                                            placeholder="www.mystore.com" 
                                                            type="text" 
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => setShowDomainHelp(!showDomainHelp)} className="flex items-center gap-2 text-primary dark:text-primary-light text-xs font-bold hover:underline w-fit">
                                                        <span className="material-symbols-outlined text-[16px]">help</span>
                                                        كيفية ربط النطاق الخاص بك
                                                    </button>
                                                    {showDomainHelp && (
                                                        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-xl p-4">
                                                            <div className="flex items-start gap-3">
                                                                <span className="material-symbols-outlined text-primary text-lg mt-0.5">help_center</span>
                                                                <div className="flex flex-col gap-2">
                                                                    <p className="text-xs font-bold text-primary dark:text-primary-light">{t("t_79633158")}</p>
                                                                    <p className="text-[11px] text-[#88637e] dark:text-gray-400 leading-relaxed">{t("t_5ed108dd")}<strong>DNS</strong>{t("t_2ecd9f2a")}</p>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                                                        <div className="bg-white dark:bg-black/20 p-3 rounded-lg border border-primary/20 dark:border-primary/20">
                                                                            <p className="text-[10px] text-primary font-black mb-1">{t("t_5e8b6875")}</p>
                                                                            <div className="flex items-center gap-2 text-sm text-[#181116] dark:text-gray-200 font-mono font-bold dir-ltr text-left">
                                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400 font-sans font-normal">Name:</span> @
                                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400 font-sans font-normal mr-2">→</span>
                                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400 font-sans font-normal">Value:</span> 216.150.1.1
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-white dark:bg-black/20 p-3 rounded-lg border border-primary/20 dark:border-primary/20">
                                                                            <p className="text-[10px] text-primary font-black mb-1">{t("t_69c9c5b")}</p>
                                                                            <div className="flex items-center gap-2 text-sm text-[#181116] dark:text-gray-200 font-mono font-bold dir-ltr text-left">
                                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400 font-sans font-normal">Name:</span> www
                                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400 font-sans font-normal mr-2">→</span>
                                                                                <span className="text-[10px] text-[#88637e] dark:text-gray-400 font-sans font-normal">Value:</span> souqai.net
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-500/10 px-2 py-1.5 rounded-md w-fit">
                                                                        <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                                                                        قد يستغرق تفعيل النطاق من بضع دقائق إلى 48 ساعة حسب مزود الخدمة.
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#9b59b6] hover:from-[#c22a99] hover:to-[#8e44ad] text-white font-bold text-sm shadow-md shadow-primary/20 transition-all disabled:opacity-70 w-fit flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-lg">save</span>
                                                        {saving ? 'جاري الحفظ...' : t('t_617e6885')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-center py-6 gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-gray-400 text-3xl">lock</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-[#181116] dark:text-white">{t("t_6e21cd")}</p>
                                                    <p className="text-xs text-[#88637e] dark:text-gray-400">{t("t_5616f739")}</p>
                                                    <button onClick={() => router.push('/upgrade')} className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#9b59b6] text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                                        ترقية الخطة
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ━━━ SECTION 2: Buy a Domain ━━━ */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-5 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-md shadow-primary/20">
                                                    <span className="material-symbols-outlined text-white text-lg">shopping_cart</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#181116] dark:text-white text-sm">{t("t_8f912909")}</h4>
                                                    <p className="text-[#88637e] dark:text-gray-400 text-[11px]">{t("t_d686b2de")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8">
                                            {/* Search Bar */}
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="flex-1 flex items-center h-12 rounded-xl border border-[#e5dce3] dark:border-[#4a3b45] bg-[#F8F9FC] dark:bg-black/20 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                                    <span className="material-symbols-outlined text-[#88637e] mr-3 pr-3">search</span>
                                                    <input 
                                                        value={domainSearch}
                                                        onChange={(e) => setDomainSearch(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && domainSearch.length >= 2 && !domainSearching) {
                                                                setDomainSearching(true);
                                                                const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app';
                                                                fetch(`${baseUrl}/functions/check-domain?domain=${encodeURIComponent(domainSearch)}`)
                                                                    .then(r => r.json())
                                                                    .then(data => { setDomainResults(data.results || []); setDomainSearching(false); })
                                                                    .catch(() => { setDomainSearching(false); });
                                                            }
                                                        }}
                                                        className="flex-1 h-full px-3 bg-transparent border-none focus:ring-0 text-[#181116] dark:text-white text-sm font-medium text-left dir-ltr" 
                                                        dir="ltr"
                                                        placeholder={t("t_c39f64fc")}
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        if (domainSearch.length < 2) return;
                                                        setDomainSearching(true);
                                                        const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app';
                                                        fetch(`${baseUrl}/functions/check-domain?domain=${encodeURIComponent(domainSearch)}`)
                                                            .then(r => r.json())
                                                            .then(data => { setDomainResults(data.results || []); setDomainSearching(false); })
                                                            .catch(() => { setDomainSearching(false); });
                                                    }}
                                                    disabled={domainSearching || domainSearch.length < 2}
                                                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-[#9b59b6] text-white font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {domainSearching ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-lg">search</span>
                                                    )}
                                                    بحث
                                                </button>
                                            </div>

                                            {/* Results */}
                                            {domainSearching && (
                                                <div className="flex flex-col items-center py-10 gap-3">
                                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                    <p className="text-sm font-bold text-[#88637e] dark:text-gray-400 animate-pulse">{t("t_51a9362f")}</p>
                                                </div>
                                            )}

                                            {!domainSearching && domainResults.length > 0 && (
                                                <div className="flex flex-col gap-3">
                                                    <p className="text-xs font-bold text-[#88637e] dark:text-gray-400 mb-1">{t("t_167cc72b")}</p>
                                                    {domainResults.map((d, i) => (
                                                        <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${d.available 
                                                            ? 'border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10 hover:shadow-md' 
                                                            : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 opacity-60'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${d.available 
                                                                    ? 'bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-light' 
                                                                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-400'}`}>
                                                                    {d.available ? '✓' : '✗'}
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm font-bold dir-ltr text-left ${d.available ? 'text-[#181116] dark:text-white' : 'text-gray-400 line-through'}`}>{d.name}</p>
                                                                    <p className="text-[10px] text-[#88637e] dark:text-gray-500">{d.available ? t('t_ae4ada2c') : t('t_1567ac0a')}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-left">
                                                                    <p className={`text-sm font-black ${d.available ? 'text-primary dark:text-primary-light' : 'text-gray-400'}`}>
                                                                        {d.price.toLocaleString()} <span className="text-[10px] font-bold">{t("t_c14dcf34")}</span>
                                                                    </p>
                                                                </div>
                                                                {d.available && (
                                                                    <button 
                                                                        onClick={() => setDomainModal({show: true, domain: d, success: false})}
                                                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-[#9b59b6] text-white text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                                                                        طلب شراء
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <p className="text-[10px] text-center text-[#88637e] dark:text-gray-500 mt-2">{t("t_f8dcef8a")}</p>
                                                </div>
                                            )}

                                            {/* Previous Requests */}
                                            {domainRequests.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-[#e5dce3] dark:border-[#4a3b45]">
                                                    <h4 className="text-sm font-bold text-[#181116] dark:text-white mb-4 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-lg text-amber-500">history</span>
                                                        طلباتك السابقة
                                                    </h4>
                                                    <div className="flex flex-col gap-2">
                                                        {domainRequests.map((req, i) => (
                                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-amber-500 text-lg">pending</span>
                                                                    <span className="text-sm font-bold text-[#181116] dark:text-white dir-ltr">{req.requested_domain}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-bold text-emerald-600">{req.price_dzd?.toLocaleString()} د.ج</span>
                                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {req.status === 'pending' ? t('t_40f65e24') : req.status === 'completed' ? 'مكتمل' : t('t_2f1e42f')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'subscription' ? (
                                /* ===== SUBSCRIPTION TAB ===== */
                                <div className="space-y-6">

                                    {/* Expired Banner */}
                                    {isExpired && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center gap-4 animate-pulse">
                                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-red-500 text-2xl">timer_off</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-black text-red-700 dark:text-red-400">{t("t_79131b08")}</h4>
                                                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">{t("t_5ca57405")}</p>
                                            </div>
                                            <button onClick={() => router.push('/upgrade')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px]">autorenew</span>
                                                تجديد الآن
                                            </button>
                                        </div>
                                    )}

                                    {/* Current Plan Card */}
                                    <div className={`rounded-2xl border-2 overflow-hidden ${userPlan === t('t_15187dfac') ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-zinc-900' : userPlan === t('t_74dcec9f') ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/10 dark:to-zinc-900' : isExpired ? 'border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50/50 to-white dark:from-red-900/5 dark:to-zinc-900' : 'border-[#e5dce3] dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}>
                                        <div className="p-6 md:p-8">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${userPlan === t('t_15187dfac') ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20' : userPlan === t('t_74dcec9f') ? 'bg-gradient-to-br from-pink-400 to-rose-500 shadow-pink-500/20' : isExpired ? 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-500/20' : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/20'}`}>
                                                        {userPlan === t('t_15187dfac') ? '👑' : userPlan === t('t_74dcec9f') ? '⭐' : isExpired ? '⏰' : '🚀'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#181116] dark:text-white">{userPlan}</h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${isExpired ? 'bg-red-100 text-red-700 border border-red-200' : isPaid ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500 animate-pulse' : isPaid ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                                {isExpired ? t('t_18a93454') : isPaid ? t('t_5b4947f0') : t('t_5b3f7744')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {(userPlan !== t('t_15187dfac') || isExpired) && (
                                                    <button onClick={() => router.push('/upgrade')} className="bg-gradient-to-l from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-pink-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">{isExpired ? 'autorenew' : 'upgrade'}</span>
                                                        {isExpired ? t('t_cd19477b') : t('t_2b56cd77')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subscription Expiry Info */}
                                        {planExpiresAt && !isExpired && (
                                            <div className="border-t border-[#e5dce3] dark:border-[#4a3b45] px-6 md:px-8 py-4 bg-gradient-to-l from-blue-50/50 to-transparent dark:from-blue-900/5 dark:to-transparent">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-blue-500 text-xl">event</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[#88637e] dark:text-gray-400">{t("t_7b7b072f")}</p>
                                                            <p className="text-sm font-black text-[#181116] dark:text-white">{new Date(planExpiresAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                    {(() => {
                                                        const now = new Date();
                                                        const exp = new Date(planExpiresAt);
                                                        const diffMs = exp.getTime() - now.getTime();
                                                        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                                        const isUrgent = diffDays <= 7;
                                                        const isWarning = diffDays <= 14;
                                                        return (
                                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border ${isUrgent ? 'bg-red-50 dark:bg-red-900/10 text-red-600 border-red-200 dark:border-red-800' : isWarning ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-200 dark:border-emerald-800'}`}>
                                                                <span className="material-symbols-outlined text-[14px]">{isUrgent ? 'warning' : isWarning ? 'schedule' : 'verified'}</span>
                                                                {diffDays <= 0 ? t('t_2f8c9f9b') : diffDays === 1 ? t('t_9e7833e8') : `متبقي ${diffDays} يوم`}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                        {planExpiresAt && isExpired && (
                                            <div className="border-t border-red-200 dark:border-red-900/30 px-6 md:px-8 py-4 bg-gradient-to-l from-red-50 to-transparent dark:from-red-900/10 dark:to-transparent">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-red-500 text-xl">event_busy</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-red-400">{t("t_5a05aa89")}</p>
                                                        <p className="text-sm font-black text-red-600 dark:text-red-400">{new Date(planExpiresAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Plan Quotas / Limits */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-6 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                                    <span className="material-symbols-outlined text-white text-xl">dashboard_customize</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#181116] dark:text-white">{t("t_790b0b25")}</h4>
                                                    <p className="text-[#88637e] dark:text-gray-400 text-xs">{t("t_37436b22")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {/* Products */}
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/5 rounded-xl p-4 border border-blue-100 dark:border-blue-900/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-blue-500 text-lg">inventory_2</span>
                                                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{t("t_9b052503")}</span>
                                                    </div>
                                                    <p className="text-2xl font-black text-[#181116] dark:text-white">{appPlans?.products_limit?.[dbPlanKey] ?? (dbPlanKey === 'vip' ? '10,000' : dbPlanKey === 'pro' ? '100' : '20')}</p>
                                                    <p className="text-[10px] text-[#88637e] dark:text-gray-400 mt-1">{t("t_fd4dbfb5")}</p>
                                                </div>
                                                {/* Orders */}
                                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/10 dark:to-emerald-900/5 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-emerald-500 text-lg">shopping_cart</span>
                                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">الطلبات</span>
                                                    </div>
                                                    <p className="text-2xl font-black text-[#181116] dark:text-white">{appPlans?.orders_limit?.[dbPlanKey] ?? (dbPlanKey === 'vip' ? '50,000' : dbPlanKey === 'pro' ? '500' : '50')}</p>
                                                    <p className="text-[10px] text-[#88637e] dark:text-gray-400 mt-1">طلب / شهرياً</p>
                                                </div>
                                                {/* Team */}
                                                <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/10 dark:to-violet-900/5 rounded-xl p-4 border border-violet-100 dark:border-violet-900/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-violet-500 text-lg">badge</span>
                                                        <span className="text-xs font-bold text-violet-700 dark:text-violet-400">{t("t_dadbcbc5")}</span>
                                                    </div>
                                                    <p className="text-2xl font-black text-[#181116] dark:text-white">{appPlans?.team_limit?.[dbPlanKey] ?? (dbPlanKey === 'vip' ? '10' : dbPlanKey === 'pro' ? '3' : '1')}</p>
                                                    <p className="text-[10px] text-[#88637e] dark:text-gray-400 mt-1">{t("t_4e28e54b")}</p>
                                                </div>
                                                {/* AI Text */}
                                                <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/10 dark:to-pink-900/5 rounded-xl p-4 border border-pink-100 dark:border-pink-900/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-pink-500 text-lg">text_fields</span>
                                                        <span className="text-xs font-bold text-pink-700 dark:text-pink-400">{t("t_cf32c0ec")}</span>
                                                    </div>
                                                    <p className="text-2xl font-black text-[#181116] dark:text-white">{(aiTextQuota as any)[dbPlanKey] === 'unlimited' ? '∞' : (aiTextQuota as any)[dbPlanKey] ?? 0}</p>
                                                    <p className="text-[10px] text-[#88637e] dark:text-gray-400 mt-1">{(aiTextQuota as any)[dbPlanKey] === 'unlimited' ? t('t_978f59cf') : t('t_94f4ef7f')}</p>
                                                </div>
                                                {/* AI Images */}
                                                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-900/5 rounded-xl p-4 border border-amber-100 dark:border-amber-900/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-amber-500 text-lg">image</span>
                                                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{t("t_f2d935aa")}</span>
                                                    </div>
                                                    <p className="text-2xl font-black text-[#181116] dark:text-white">{(aiImageQuota as any)[dbPlanKey] === 'unlimited' ? '∞' : (aiImageQuota as any)[dbPlanKey] ?? 0}</p>
                                                    <p className="text-[10px] text-[#88637e] dark:text-gray-400 mt-1">{(aiImageQuota as any)[dbPlanKey] === 'unlimited' ? t('t_978f59cf') : t('t_5d4072e6')}</p>
                                                </div>
                                                {/* Facebook Pixels */}
                                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/10 dark:to-cyan-900/5 rounded-xl p-4 border border-cyan-100 dark:border-cyan-900/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-cyan-500 text-lg">monitoring</span>
                                                        <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">{t("t_4d3c3c4a")}</span>
                                                    </div>
                                                    <p className="text-2xl font-black text-[#181116] dark:text-white">{appPlans?.facebook?.[dbPlanKey] ?? (dbPlanKey === 'vip' ? '10' : dbPlanKey === 'pro' ? '5' : '0')}</p>
                                                    <p className="text-[10px] text-[#88637e] dark:text-gray-400 mt-1">{t("t_e15a5eff")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan Features Checklist */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-6 border-b border-[#e5dce3] dark:border-[#4a3b45]">
                                            <h4 className="font-bold text-[#181116] dark:text-white flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-xl">checklist</span>
                                                {t('t_a3e9ce93')}
                                            </h4>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {(dbPlanKey === 'vip' ? [
                                                    { icon: 'web', text: t('t_260dc668'), active: true },
                                                    { icon: 'visibility_off', text: t('t_18766810b'), active: true },
                                                    { icon: 'remove_shopping_cart', text: t('t_cba68fae'), active: true },
                                                    { icon: 'support_agent', text: t('t_de628b'), active: true },
                                                    { icon: 'public', text: t('t_4ed755bb'), active: canUseCustomDomain },
                                                    { icon: 'cloud_sync', text: 'Facebook + TikTok CAPI', active: true },
                                                    { icon: 'analytics', text: 'Google Analytics + GTM', active: true },
                                                    { icon: 'webhook', text: t('t_dffaa818'), active: true },
                                                    { icon: 'support_agent', text: t('t_3d6efe9d'), active: true },
                                                ] : dbPlanKey === 'pro' ? [
                                                    { icon: 'web', text: t('t_f9202393'), active: true },
                                                    { icon: 'visibility_off', text: t('t_18766810b'), active: true },
                                                    { icon: 'remove_shopping_cart', text: t('t_cba68fae'), active: true },
                                                    { icon: 'public', text: t('t_4ed755bb'), active: canUseCustomDomain },
                                                    { icon: 'cloud_sync', text: 'Facebook CAPI', active: true },
                                                    { icon: 'analytics', text: 'Google Analytics + GTM', active: true },
                                                    { icon: 'webhook', text: t('t_dffaa818'), active: false },
                                                    { icon: 'support_agent', text: t('t_3d6efe9d'), active: false },
                                                ] : [
                                                    { icon: 'web', text: t('t_507b84ca'), active: true },
                                                    { icon: 'remove_shopping_cart', text: t('t_cba68fae'), active: true },
                                                    { icon: 'branding_watermark', text: t('t_adaba58a'), active: true },
                                                    { icon: 'public', text: t('t_4ed755bb'), active: canUseCustomDomain },
                                                    { icon: 'visibility_off', text: t('t_18766810b'), active: false },
                                                    { icon: 'monitoring', text: t('t_20859b5f'), active: false },
                                                    { icon: 'webhook', text: 'Webhook', active: false },
                                                    { icon: 'support_agent', text: t('t_74a5d7e4'), active: false },
                                                ]).map((f, i) => (
                                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${f.active ? 'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/15' : 'bg-slate-50 dark:bg-black/10 opacity-50'}`}>
                                                        <span className={`material-symbols-outlined text-lg ${f.active ? 'text-emerald-500' : 'text-slate-300'}`}>{f.active ? 'check_circle' : 'cancel'}</span>
                                                        <span className={`text-sm font-medium ${f.active ? 'text-[#181116] dark:text-white' : 'text-slate-400 line-through'}`}>{f.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'notifications' ? (
                                /* ===== NOTIFICATIONS TAB ===== */
                                <div className="space-y-6">
                                    {/* Header Card */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                                        <span className="material-symbols-outlined text-white text-2xl">notifications_active</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#181116] dark:text-white">{t("t_ff168a15")}</h3>
                                                        <p className="text-[#88637e] dark:text-gray-400 text-sm mt-0.5">{t("t_122649a")}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {notifUnreadCount > 0 && (
                                                        <button onClick={() => setNotifUnreadCount(0)} className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold text-xs transition-colors">
                                                            <span className="material-symbols-outlined text-[16px]">done_all</span>
                                                            تعليم الكل كمقروء
                                                        </button>
                                                    )}
                                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-xl">
                                                        <span className="material-symbols-outlined text-[16px] text-slate-500">inbox</span>
                                                        <span className="text-xs font-black text-slate-600 dark:text-slate-400">{settingsNotifications.length} إشعار</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filter Tabs */}
                                    <div className="flex gap-2 flex-wrap">
                                        {[
                                            { key: 'all' as const, label: 'الكل', icon: 'apps', count: settingsNotifications.length },
                                            { key: 'orders' as const, label: 'الطلبات', icon: 'shopping_bag', count: settingsNotifications.filter(n => n.type === 'orders').length },
                                            { key: 'abandoned' as const, label: t('t_cba68fae'), icon: 'remove_shopping_cart', count: settingsNotifications.filter(n => n.type === 'abandoned').length },
                                            { key: 'stock' as const, label: 'المخزون', icon: 'inventory_2', count: settingsNotifications.filter(n => n.type === 'stock').length },
                                            { key: 'system' as const, label: t('t_dade27ad'), icon: 'settings', count: settingsNotifications.filter(n => n.type === 'system').length },
                                        ].map(tab => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setNotifFilter(tab.key)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                    notifFilter === tab.key
                                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                        : 'bg-white dark:bg-zinc-900 text-[#88637e] dark:text-gray-400 border border-[#e5dce3] dark:border-[#4a3b45] hover:border-primary/30 hover:text-primary'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                                                {tab.label}
                                                {tab.count > 0 && (
                                                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-black ${
                                                        notifFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                                                    }`}>{tab.count}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Notifications List */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5dce3] dark:border-[#4a3b45] overflow-hidden">
                                        {notifLoading ? (
                                            <div className="p-12 flex flex-col items-center justify-center gap-3">
                                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <p className="text-sm font-bold text-[#88637e] dark:text-gray-400 animate-pulse">{t("t_f03b5444")}</p>
                                            </div>
                                        ) : (() => {
                                            const filtered = notifFilter === 'all' ? settingsNotifications : settingsNotifications.filter(n => n.type === notifFilter);
                                            if (filtered.length === 0) {
                                                return (
                                                    <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
                                                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-gray-600">notifications_paused</span>
                                                        </div>
                                                        <h4 className="text-base font-bold text-[#181116] dark:text-white">{t("t_97d66095")}</h4>
                                                        <p className="text-xs text-[#88637e] dark:text-gray-400 max-w-xs">{t("t_91018deb")}</p>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="divide-y divide-[#e5dce3]/50 dark:divide-[#4a3b45]/50">
                                                    {filtered.map((notif: any, index: number) => (
                                                        <button
                                                            key={notif.id}
                                                            onClick={() => router.push(notif.link)}
                                                            className={`w-full flex items-start gap-4 p-5 text-right hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group ${
                                                                notif.isNew && notifUnreadCount > 0 ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''
                                                            }`}
                                                        >
                                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.bg} transition-transform group-hover:scale-110`}>
                                                                <span className={`material-symbols-outlined text-xl ${notif.color}`}>{notif.icon}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-3 mb-1">
                                                                    <span className={`text-sm font-bold ${notif.isNew && notifUnreadCount > 0 ? 'text-[#181116] dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                        {notif.title}
                                                                    </span>
                                                                    <span className="text-[11px] font-medium text-[#88637e] dark:text-gray-500 whitespace-nowrap flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                                        {(() => {
                                                                            const diff = Date.now() - notif.time;
                                                                            const minutes = Math.floor(diff / 60000);
                                                                            if (minutes < 1) return 'الآن';
                                                                            if (minutes < 60) return `منذ ${minutes} د`;
                                                                            const hours = Math.floor(minutes / 60);
                                                                            if (hours < 24) return `منذ ${hours} س`;
                                                                            const days = Math.floor(hours / 24);
                                                                            return `منذ ${days} يوم`;
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                                <p className={`text-xs leading-relaxed ${notif.isNew && notifUnreadCount > 0 ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                                                                    {notif.message}
                                                                </p>
                                                            </div>
                                                            <span className="material-symbols-outlined text-[18px] text-slate-300 dark:text-gray-600 group-hover:text-primary transition-colors mt-1">chevron_left</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#e5dce3] dark:border-[#4a3b45] p-8 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">construction</span>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('t_466d041')}</p>
                                </div>
                            )}

                            <div className="border border-red-200 dark:border-red-900/30 rounded-2xl bg-red-50 dark:bg-red-900/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-red-700 dark:text-red-400 font-bold text-lg">{t('t_a852a18')}</h3>
                                    <p className="text-red-600/70 dark:text-red-400/70 text-sm">{t('t_2aa8c2e19')}</p>
                                </div>
                                <button className="px-6 py-3 bg-white dark:bg-transparent border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-900/50 hover:border-red-600 font-bold text-sm rounded-xl transition-all whitespace-nowrap">
                                    {t('t_139e5210b')}
                                </button>
                            </div>

                            <footer className="mt-8 text-center text-[#88637e] dark:text-gray-500 dark:text-gray-400 text-sm">
                                {t('t_329656d17')}
                            </footer>
                        </div>
                    </div>
                </main >
            </div >

            {/* ═══ Domain Purchase Modal ═══ */}
            {domainModal.show && domainModal.domain && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => !domainRequestSending && setDomainModal({show: false, domain: null, success: false})}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-[#e5dce3] dark:border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        {!domainModal.success ? (
                            <>
                                <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mt-8" />
                                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mb-4" />
                                    <div className="relative">
                                        <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                                            <span className="material-symbols-outlined text-white text-3xl">shopping_cart</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white">{t("t_e1499c18")}</h3>
                                        <p className="text-white/80 text-sm mt-1">{t("t_a00bba6a")}</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-5 mb-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold text-[#88637e] dark:text-gray-400">{t("t_7b2c0084")}</span>
                                            <span className="text-base font-black text-[#181116] dark:text-white dir-ltr">{domainModal.domain.name}</span>
                                        </div>
                                        <div className="h-px bg-gray-200 dark:bg-zinc-700 mb-4" />
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold text-[#88637e] dark:text-gray-400">{t("t_8e4abe71")}</span>
                                            <span className="text-sm font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">{domainModal.domain.tld}</span>
                                        </div>
                                        <div className="h-px bg-gray-200 dark:bg-zinc-700 mb-4" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-[#88637e] dark:text-gray-400">{t("t_e0c36324")}</span>
                                            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{domainModal.domain.price.toLocaleString()} <span className="text-sm">د.ج</span></span>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 mb-5 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">info</span>
                                        <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">{t("t_a54ac09e")}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setDomainModal({show: false, domain: null, success: false})} disabled={domainRequestSending} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-bold text-[#88637e] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50">
                                            إلغاء
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (!userId || !storeSlug) return;
                                                setDomainRequestSending(true);
                                                try {
                                                    await insforge.database.from('domain_requests').insert({
                                                        user_id: userId, store_domain: storeSlug,
                                                        requested_domain: domainModal.domain.name,
                                                        tld: domainModal.domain.tld,
                                                        price_dzd: domainModal.domain.price,
                                                        status: 'pending',
                                                    });
                                                    setDomainRequests(prev => [...prev, { requested_domain: domainModal.domain.name, tld: domainModal.domain.tld, price_dzd: domainModal.domain.price, status: 'pending', created_at: new Date().toISOString() }]);
                                                    setDomainModal(prev => ({...prev, success: true}));
                                                } catch (err) {
                                                    alert('حدث خطأ أثناء حفظ الطلب');
                                                } finally {
                                                    setDomainRequestSending(false);
                                                }
                                            }}
                                            disabled={domainRequestSending}
                                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {domainRequestSending ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><span className="material-symbols-outlined text-lg">check_circle</span>{t("t_4af5a62d")}</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-black text-[#181116] dark:text-white mb-2">{t("t_90981dcd")}</h3>
                                <p className="text-sm text-[#88637e] dark:text-gray-400 mb-2">{t("t_c7f69f12")}</p>
                                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mb-1 dir-ltr">{domainModal.domain.name}</p>
                                <p className="text-sm font-bold text-[#181116] dark:text-white mb-5">{domainModal.domain.price.toLocaleString()} د.ج/سنة</p>
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-3 mb-6 flex items-start gap-2 text-right">
                                    <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">support_agent</span>
                                    <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">{t("t_177db3be")}</p>
                                </div>
                                <button onClick={() => setDomainModal({show: false, domain: null, success: false})} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all">
                                    حسناً، فهمت!
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ Password Success Modal ═══ */}
            {showPasswordSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowPasswordSuccessModal(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-[#e5dce3] dark:border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 p-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mt-8" />
                            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mb-4" />
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-white text-4xl">verified_user</span>
                                </div>
                                <h3 className="text-xl font-black text-white">{t("t_a2ca8f24")}</h3>
                            </div>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-[#88637e] dark:text-gray-400 mb-6 text-sm font-medium leading-relaxed">
                                لقد تم تحديث كلمة المرور الخاصة بحسابك بنجاح. يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول في المرة القادمة.
                            </p>
                            <button onClick={() => setShowPasswordSuccessModal(false)} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all">
                                حسناً، فهمت
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Profile Saved Success Modal ═══ */}
            {showProfileSavedModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowProfileSavedModal(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-[#e5dce3] dark:border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-br from-primary via-[#d633a0] to-[#9b59b6] p-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mt-8" />
                            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mb-4" />
                            <div className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-full" />
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-white text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-black text-white">{t("t_9138153b")}</h3>
                            </div>
                        </div>
                        <div className="p-8 text-center">
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                                    <span className="text-lg font-black text-white">{(merchantFullName || 'T')[0].toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col gap-0.5 text-right min-w-0">
                                    <span className="text-sm font-black text-[#181116] dark:text-white truncate">{merchantFullName || t('t_1567b847')}</span>
                                    <span className="text-xs text-[#88637e] dark:text-gray-400 truncate dir-ltr text-right" dir="ltr">{merchantEmail}</span>
                                    {merchantWhatsapp && (
                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1 dir-ltr" dir="ltr">
                                            <span className="material-symbols-outlined text-[12px]">phone</span>
                                            {merchantWhatsapp}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-[#88637e] dark:text-gray-400 mb-6 text-sm font-medium leading-relaxed">
                                لقد تم تحديث معلومات حسابك وإعدادات متجرك بنجاح. التغييرات سارية المفعول الآن.
                            </p>
                            <button onClick={() => setShowProfileSavedModal(false)} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-[#9b59b6] text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                حسناً، فهمت
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
