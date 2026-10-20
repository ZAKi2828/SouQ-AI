'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { insforge } from '@/lib/insforge';
import SOUQAILoader from '@/components/SOUQAILoader';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StoreLinkButton from '@/components/StoreLinkButton';
import { Toast } from '@/components/UIFeedback';
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';
import { useI18n } from "@/context/I18nContext";
import { getStoreContext } from '@/lib/storeContext';
import { hasPermission } from '@/lib/rbac';
function AddProductPageContent() {
    const { t, lang } = useI18n();
    const { planExpired, currentPlan } = useExpiredPlanGuard();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams?.get('edit');
    const isEditMode = !!editId;
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [storeDomainState, setStoreDomainState] = useState('');
    const [toast, setToast] = useState<{ visible: boolean; message: string; subMessage?: string; type: 'success' | 'error' | 'warning' | 'info' }>({ visible: false, message: '', type: 'success' });
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', subMessage?: string) => setToast({ visible: true, message, subMessage, type });
    const hideToast = () => setToast(t => ({ ...t, visible: false }));

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [compareAtPrice, setCompareAtPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [stock, setStock] = useState('0');
    const [template, setTemplate] = useState('tech');
    const [status, setStatus] = useState('active');
    const [imageUrl, setImageUrl] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [category, setCategory] = useState('');
    const [shippingFree, setShippingFree] = useState(false);
    const [shippingOfficeFree, setShippingOfficeFree] = useState(false);
    const [shippingHomePrice, setShippingHomePrice] = useState('0');
    const [shippingOfficePrice, setShippingOfficePrice] = useState('0');
    const [options, setOptions] = useState<{ name: string, values: string[] }[]>([]);
    
    // Smart Promotions
    const [productCountdownEnabled, setProductCountdownEnabled] = useState(false);
    const [countdownText, setCountdownText] = useState(t('t_a61cb099'));
    const [countdownDuration, setCountdownDuration] = useState('60');
    const [upsellEnabled, setUpsellEnabled] = useState(false);
    const [upsellTitle, setUpsellTitle] = useState(t('t_4344879c'));
    const [upsellBundles, setUpsellBundles] = useState<{ quantity: number, price: number, label: string, freeDelivery: boolean }[]>([]);

    const [aiDescLoading, setAiDescLoading] = useState(false);
    const [activeTemplateSlugs, setActiveTemplateSlugs] = useState<string[]>([]);
    const [userPlan, setUserPlan] = useState('free');
    const [aiCredits, setAiCredits] = useState<number | null>(null);
    const [isAiEnabled, setIsAiEnabled] = useState(true);

    // Load existing product data in edit mode
    useEffect(() => {
        if (!editId) return;
        const loadProduct = async () => {
            setPageLoading(true);
            try {
                const ctx = await getStoreContext();
                if (!ctx) { router.push('/login'); return; }
                if (!hasPermission(ctx.role, 'manage_inventory')) { router.push('/inventory'); return; }

                const { data: product, error } = await insforge.database
                    .from('products')
                    .select('*')
                    .eq('id', editId)
                    .single();

                if (error || !product) {
                    showToast(t('t_baf17890'), 'error');
                    router.push('/inventory');
                    return;
                }

                // Pre-fill all form fields
                setName(product.name || '');
                setSlug(product.product_slug || '');
                setDescription(product.description || '');
                setPrice(product.price?.toString() || '');
                setCompareAtPrice(product.compare_at_price?.toString() || '');
                setCostPrice(product.cost_price?.toString() || '');
                setStock(product.stock_quantity?.toString() || '0');
                setTemplate(product.template || 'tech');
                setStatus(product.status || 'active');
                setImageUrl(product.image_url || '');
                setCategory(product.category || '');
                setShippingFree(product.shipping_free || false);
                setShippingOfficeFree(product.shipping_office_free || false);
                setShippingHomePrice(product.shipping_home_price?.toString() || '0');
                setShippingOfficePrice(product.shipping_office_price?.toString() || '0');
                setStoreDomainState(product.store_domain || '');

                // Load images
                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                    setImages(product.images);
                } else if (product.image_url) {
                    setImages([product.image_url]);
                }

                // Load options
                if (product.options && Array.isArray(product.options) && product.options.length > 0) {
                    setOptions(product.options);
                }

                // Load Smart Promotions
                setProductCountdownEnabled(product.product_countdown_enabled || false);
                setCountdownText(product.countdown_text || t('t_a61cb099'));
                setCountdownDuration(product.countdown_duration || '60');
                setUpsellEnabled(product.upsell_enabled || false);
                setUpsellTitle(product.upsell_title || t('t_4344879c'));
                if (product.upsell_bundles && Array.isArray(product.upsell_bundles)) {
                    setUpsellBundles(product.upsell_bundles.map((b: any) => ({ ...b, freeDelivery: b.freeDelivery || false })));
                }

            } catch (err) {
                console.error('Failed to load product for editing:', err);
                showToast(t('t_a36f1653'), 'error');
            } finally {
                setPageLoading(false);
            }
        };
        loadProduct();
    }, [editId, router]);

    // Fetch active templates and user plan from DB
    useEffect(() => {
        const loadTemplatesAndPlan = async () => {
            try {
                // Fetch user plan first
                let currentPlan = 'free';
                const ctx = await getStoreContext();
                if (ctx) {
                    if (!hasPermission(ctx.role, 'manage_inventory')) { router.push('/inventory'); return; }

                    const { data: profile } = await insforge.database
                        .from('profiles')
                        .select('plan, is_paid, ai_text_credits')
                        .eq('id', ctx.targetUserId)
                        .single();
                    
                    const dbPlan = profile?.plan?.toLowerCase();
                    if (dbPlan === 'vip' || profile?.plan === t('t_15187dfac')) currentPlan = 'vip';
                    else if (dbPlan === 'pro' || profile?.plan === t('t_74dcec9f') || profile?.is_paid) currentPlan = 'pro';
                    else currentPlan = 'free';

                    if (profile?.ai_text_credits !== undefined) {
                        setAiCredits(profile.ai_text_credits);
                    }
                }
                setUserPlan(currentPlan);

                // Fetch active templates
                const { data: dbTemplates } = await insforge.database
                    .from('templates')
                    .select('slug, is_active, plan')
                    .eq('is_active', true);
                
                if (dbTemplates && dbTemplates.length > 0) {
                    // Filter templates based on user's plan
                    // مجاني = free plan users can use
                    // برو = pro and التاجر المحترف users can use  
                    // التاجر المحترف = only التاجر المحترف users can use
                    const allowedPlans: string[] = [t('t_217db6d41'), 'free', 'الخطة المجانية'];
                    if (currentPlan === 'pro') allowedPlans.push(t('t_74dcec9f'), 'pro', 'خطة التاجر');
                    if (currentPlan === 'vip') { 
                        allowedPlans.push(t('t_74dcec9f'), 'pro', 'خطة التاجر'); 
                        allowedPlans.push(t('t_15187dfac'), 'vip', 'التاجر المحترف'); 
                    }

                    const filtered = dbTemplates.filter((t: any) => allowedPlans.includes(t.plan || t('t_217db6d41')));
                    setActiveTemplateSlugs(filtered.map((t: any) => t.slug));
                } else {
                    // Fallback: if no templates in DB, show all
                    setActiveTemplateSlugs(['tech','fashion','perfume','food','skincare','digital','decor','image','minimal','bold','classic','elegant','fresh','luxury','simple','classic-pro']);
                }

                const { data: aiSettings } = await insforge.database.from('ai_settings').select('ai_enabled').eq('id', 1).single();
                if (aiSettings && aiSettings.ai_enabled === false) {
                    setIsAiEnabled(false);
                }
            } catch (err) {
                console.error('Failed to load templates or plan:', err);
                // Fallback
                setActiveTemplateSlugs(['tech','fashion','perfume','food','skincare','digital','decor','image','minimal','bold','classic','elegant','fresh','luxury','simple','classic-pro']);
            }
        };
        loadTemplatesAndPlan();
    }, []);

    useEffect(() => {
        if (isEditMode) return; // Don't auto-set options in edit mode
        if (options.length === 0) {
            if (category === t('t_5b4a5c73') || category === t('t_59994ca9')) {
                setOptions([{ name: t('t_2522273a'), values: [] }, { name: t('t_59a40c25'), values: [] }]);
            } else if (category === t('t_9d15119e')) {
                setOptions([{ name: t('t_831aa50'), values: [] }, { name: t('t_59a40c25'), values: [] }]);
            } else if (category === t('t_483d2f75')) {
                setOptions([{ name: t('t_59a3b269'), values: [] }]);
            }
        }
    }, [category]);

    const handleAddOption = () => setOptions([...options, { name: '', values: [] }]);
    const handleUpdateOptionName = (index: number, newName: string) => { const newOptions = [...options]; newOptions[index].name = newName; setOptions(newOptions); };
    const handleAddOptionValue = (index: number, value: string) => { if (!value.trim()) return; const newOptions = [...options]; if (!newOptions[index].values.includes(value.trim())) { newOptions[index].values.push(value.trim()); } setOptions(newOptions); };
    const handleRemoveOptionValue = (optIndex: number, valIndex: number) => { const newOptions = [...options]; newOptions[optIndex].values.splice(valIndex, 1); setOptions(newOptions); };
    const handleRemoveOption = (index: number) => { const newOptions = [...options]; newOptions.splice(index, 1); setOptions(newOptions); };

    useEffect(() => {
        const stored = localStorage.getItem('aiGeneratedProduct');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.name) {
                    setName(data.name);
                    let safeSlug = data.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A0-9-]/g, '').replace(/(^-|-$)/g, '');
                    safeSlug = safeSlug ? `${safeSlug}-${Math.floor(1000 + Math.random() * 9000)}` : `product-${Date.now()}`;
                    setSlug(safeSlug);
                }
                if (data.price) setPrice(data.price.toString());
                if (data.description) setDescription(data.description);
                if (data.imageUrl) {
                    // Compress large AI base64 to avoid Payload Too Large errors
                    const img = new window.Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let w = img.width;
                        let h = img.height;
                        const maxDim = 1600;
                        if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
                        else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
                        canvas.width = w; canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, w, h);
                        const safeB64 = canvas.toDataURL('image/jpeg', 0.85);
                        setImageUrl(safeB64);
                    };
                    img.onerror = () => {
                        console.error('Failed to load image for compression, using original');
                        setImageUrl(data.imageUrl);
                    };
                    img.src = data.imageUrl;
                }
                if (data.template) setTemplate(data.template);
                localStorage.removeItem('aiGeneratedProduct');
            } catch (e) {
                console.error("Failed to parse aiGeneratedProduct", e);
            }
        }
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            const newImages = await Promise.all(
                files.map((file) => new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target?.result as string;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const maxSize = 1400;

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

                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        };
                    };
                }))
            );

            setImages(prev => [...prev, ...newImages]);
            if (!imageUrl && newImages.length > 0) {
                setImageUrl(newImages[0]);
            }
        } catch (err) {
            showToast(t('t_1b8403b3a'), 'error');
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        if (newImages.length > 0) setImageUrl(newImages[0]);
        else setImageUrl('');
    };

    const handleGenerateAIDescription = async () => {
        if (!name.trim()) {
            showToast(t('t_21639a45b'), 'warning', t('t_60c9b075'));
            return;
        }
        setAiDescLoading(true);
        try {
            // Fetch AI settings from database
            let aiModel = 'deepseek/deepseek-v3.2';
            let aiTemperature = 0.7;
            let aiSystemPrompt = '';
            try {
                // Get AI settings
                const { data: aiSettings } = await insforge.database
                    .from('ai_settings')
                    .select('description_model, description_temperature, description_prompt, ai_enabled, free_text_quota, pro_text_quota, vip_text_quota')
                    .eq('id', 1)
                    .single();

                // Get User Profile for AI Credits
                const ctx = await getStoreContext();
                const uid = ctx?.targetUserId;
                let currentCredits = 0;
                let userPlan = 'free';

                if (uid) {
                    const { data: profile } = await insforge.database
                        .from('profiles')
                        .select('plan, ai_text_credits')
                        .eq('id', uid)
                        .single();
                    if (profile?.plan) {
                        const p = profile.plan.toLowerCase();
                        if (p === 'vip' || p === t('t_15187dfac')) userPlan = 'vip';
                        else if (p === t('t_74dcec9f') || p === 'pro') userPlan = 'pro';
                        else userPlan = 'free';
                    }
                    currentCredits = profile?.ai_text_credits || 0;
                    setAiCredits(currentCredits); // Update state to latest
                }

                if (aiSettings) {
                    if (!aiSettings.ai_enabled) {
                        showToast(t('t_2069d0519'), 'warning');
                        setAiDescLoading(false);
                        return;
                    }

                    // For التاجر المحترف "unlimited", we don't block. For others, check wallet.
                    const isUnlimited = userPlan === 'vip' && aiSettings.vip_text_quota === 'unlimited';
                    
                    if (!isUnlimited && currentCredits < 1) {
                        showToast(t('t_594ff339'), 'error', t('t_1d2204c7d'));
                        setAiDescLoading(false);
                        return;
                    }

                    aiModel = aiSettings.description_model || aiModel;
                    aiTemperature = Number(aiSettings.description_temperature) || aiTemperature;
                    aiSystemPrompt = aiSettings.description_prompt || '';
                }
            } catch (e) { console.error('Error fetching AI settings or user plan:', e); }

            const prompt = `${aiSystemPrompt ? aiSystemPrompt + '\n\n' : ''}أنت خبير تسويق إلكتروني محترف. اكتب وصفاً تسويقياً جذاباً ومقنعاً باللغة العربية لمنتج بعنوان: "${name}"${category ? ` في فئة: ${category}` : ''}.

المطلوب:
- وصف احترافي مكون من 3-5 سطور
- يبرز مميزات وفوائد المنتج
- يستخدم لغة تسويقية تشجع على الشراء
- لا تستخدم عبارات مبالغة
- أضف إيموجي مناسبة بشكل خفيف
- اكتب الوصف فقط بدون مقدمات أو عناوين`;

            const completion = await insforge.ai.chat.completions.create({
                model: aiModel,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: aiTemperature,
                maxTokens: 500,
            });

            const aiText = completion.choices[0]?.message?.content;
            if (aiText) {
                setDescription(aiText.trim());
                showToast(t('t_94b3d899'), 'success', t('t_1630b8582'));
                
                // Restore direct RPC deduction logic
                if (aiCredits !== null && aiCredits !== 999999999) {
                    const { data: sessionData } = await insforge.auth.getCurrentSession();
                    const user = sessionData?.session?.user;
                    if (user?.id) {
                        try {
                            const { error: rpcErr } = await insforge.database.rpc('deduct_ai_credit', {
                                p_user_id: user.id,
                                p_credit_type: 'ai_text_credits',
                                p_new_balance: aiCredits - 1
                            });
                            
                            if (rpcErr) throw rpcErr;
                            setAiCredits(prev => prev !== null ? prev - 1 : null);
                        } catch (err) {
                            console.error('Text RPC deduction failed, trying direct fallback:', err);
                            // Fallback to direct update if RPC fails
                            await insforge.database
                                .from('profiles')
                                .update({ ai_text_credits: aiCredits - 1 })
                                .eq('id', user.id);
                            setAiCredits(prev => prev !== null ? prev - 1 : null);
                        }
                    }
                }

            } else {
                showToast(t('t_2cf25595'), 'warning');
            }
        } catch (err: any) {
            console.error('AI Error:', err);
            showToast(t('t_cba4479d'), 'error', err.message || t('t_690b1d4f'));
        } finally {
            setAiDescLoading(false);
        }
    };

    const handlePreview = () => {
        const domain = storeDomainState;
        if (!domain || !slug) {
            showToast(t('t_e8b741ec'), 'warning');
            return;
        }
        const isLocal = window.location.hostname.includes('localhost');
        const link = isLocal
            ? `http://${domain}.localhost:3000/${slug}`
            : `https://${domain}.souqai.net/${slug}`;
        window.open(link, '_blank');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !slug || !price) {
            showToast(t('t_24fe45daa'), 'warning', t('t_1b2b1c4fe'));
            return;
        }

        setLoading(true);
        try {
            const ctx = await getStoreContext();
            if (!ctx) throw new Error(t('t_19b3c9b86'));
            
            const targetUserId = ctx.targetUserId;
            let storeDomain = ctx.storeDomain;
            let userPlan = ctx.plan || 'free';

            // Product Limits Check (only for new products)
            if (!isEditMode) {
                try {
                    const { data: settings } = await insforge.database
                        .from('platform_settings')
                        .select('app_plans')
                        .eq('id', 1)
                        .single();
                    
                    const productsLimit = settings?.app_plans?.products_limit?.[userPlan] ?? (userPlan === 'vip' ? 10000 : userPlan === 'pro' ? 100 : 10);

                    const { count: productsCount, error: countError } = await insforge.database
                        .from('products')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', targetUserId);

                    if (!countError && productsCount !== null && productsCount >= productsLimit) {
                        showToast(t('t_1b7c60f0f'), 'error');
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error("Failed to check limits", err);
                }
            }

            const productData = {
                product_slug: slug,
                name,
                description,
                price: parseFloat(price),
                compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
                cost_price: parseFloat(costPrice || '0'),
                stock_quantity: parseInt(stock, 10) || 0,
                template,
                status,
                image_url: images.length > 0 ? images[0] : (imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
                images: images,
                category: category,
                shipping_free: shippingFree,
                shipping_office_free: shippingOfficeFree,
                shipping_home_price: parseFloat(shippingHomePrice || '0'),
                shipping_office_price: parseFloat(shippingOfficePrice || '0'),
                options: options.filter(opt => opt.name && opt.values.length > 0),
                product_countdown_enabled: productCountdownEnabled,
                countdown_text: countdownText,
                countdown_duration: countdownDuration,
                upsell_enabled: upsellEnabled,
                upsell_title: upsellTitle,
                upsell_bundles: upsellBundles
            };

            let error;

            if (isEditMode) {
                // UPDATE existing product
                const result = await insforge.database
                    .from('products')
                    .update(productData)
                    .eq('id', editId);
                error = result.error;
            } else {
                // INSERT new product
                const result = await insforge.database
                    .from('products')
                    .insert({
                        user_id: targetUserId,
                        store_domain: storeDomain,
                        ...productData
                    });
                error = result.error;
            }

            if (error) {
                console.error("DB Error Details:", error);
                if (error.code === '23505') {
                    throw new Error(t('t_1435e147a'));
                }
                if (error.code === '22001') {
                    throw new Error(t('t_de156a8e'));
                }
                if (error.code === '401' || (error.message && error.message.toLowerCase().includes('token'))) {
                    throw new Error(t('t_4d285812'));
                }
                throw new Error(error.message || t('t_2b7e4096d'));
            }

            const isLocal = window.location.hostname.includes('localhost');
            const newLink = isLocal
                ? `http://${storeDomain}.localhost:3000/${slug}`
                : `https://${storeDomain}.souqai.net/${slug}`;

            navigator.clipboard.writeText(newLink);
            showToast(isEditMode ? t('t_858332d1') : t('t_425d64f6'), 'success', `رابط منتجك: ${newLink}`);
            setTimeout(() => router.push(isEditMode ? `/inventory/${editId}` : '/inventory'), 2000);
        } catch (err: any) {
            showToast(err.message || (isEditMode ? t('t_4b39bcb8') : t('t_147a9ff19')), 'error');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Inventory" />
                <main className="flex-1 flex items-center justify-center pt-16 md:pt-0">
                    <SOUQAILoader size="md" text={t('t_369e35a2')} />
                </main>
            </div>
        );
    }

    return (
        <>
            {planExpired && (
                <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
            )}
            <Toast
                visible={toast.visible}
                message={toast.message}
                subMessage={toast.subMessage}
                type={toast.type}
                onClose={hideToast}
            />
            <style dangerouslySetInnerHTML={{
                __html: `
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #F8F9FC;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
    
`}} />
            <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-800/50 overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Inventory" />
                <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                    <form onSubmit={handleSubmit} className="bg-background-light dark:bg-zinc-950 text-slate-800 dark:text-slate-100 antialiased overflow-x-hidden min-h-screen">
                        <main className="p-6 lg:p-10 pt-16 md:pt-0">
                            <div className="mx-auto max-w-6xl">

                                <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                            <span>{t('t_64fadafd')}</span>
                                            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                            <span className="text-primary font-medium">{isEditMode ? t('t_4f28bf06') : t('t_a1bf959b')}</span>
                                        </div>
                                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{isEditMode ? t('t_4f28bf06') : t('t_1c7476c3')}</h1>
                                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">{isEditMode ? t('t_9e692923') : t('t_231400c0f')}</p>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <div className="hidden md:flex md:items-center md:gap-3">
                                            <StoreLinkButton />
                                            <NotificationsDropdown />
                                        </div>
                                        {isEditMode && (
                                            <button type="button" onClick={handlePreview} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:bg-slate-800/50 transition-colors shadow-sm  flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                
                                                {t('t_d66b77a')}
                                            </button>
                                        )}
                                    </div>
                                </header>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                    <div className="lg:col-span-8 flex flex-col gap-6">

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 lg:p-8 border border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                                    <span className="material-symbols-outlined text-[20px]">edit_document</span>
                                                </span>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('t_86a862fb')}</h3>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('t_2d8944b9')}</label>
                                                    <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-primary transition-all shadow-sm " placeholder={t('t_140cd362f')} type="text" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('t_3dc6bc5b')}</label>
                                                    <div className="flex rounded-xl shadow-sm ">
                                                        <span className="inline-flex items-center rounded-r-xl border border-l-0 border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-slate-800/50 px-3 text-slate-500 dark:text-slate-400 text-sm dir-ltr">
                                                            souqai.net/
                                                        </span>
                                                        <input required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="block w-full min-w-0 flex-1 rounded-none rounded-l-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary ltr:text-left text-left" dir="ltr" placeholder="apple-airpods-pro-2" type="text" />
                                                    </div>
                                                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t('t_13d8dc3a3')}</p>
                                                </div>
                                                {template !== 'image' && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-4">
                                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('t_270d8534')}</label>
                                                                {aiCredits !== null && (
                                                                    <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold border border-indigo-100 dark:border-indigo-900/50">
                                                                        <span className="material-symbols-outlined text-[14px]">stars</span>
                                                                        
                                                                        {t('t_14e315a0')} {aiCredits}  {t('t_5b260e97')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleGenerateAIDescription}
                                                                disabled={!isAiEnabled || aiDescLoading}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isAiEnabled || aiDescLoading
                                                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm  hover:shadow-md hover:-translate-y-0.5'
                                                                }`}
                                                            >
                                                                {!isAiEnabled ? (
                                                                    <span>{t('t_12d0da519')}</span>
                                                                ) : aiDescLoading ? (
                                                                    <>
                                                                        <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                                                                        <span>{t('t_7c117cec')}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                                                        <span>{t('t_105e887ac')}</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm ">
                                                            <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-zinc-800 p-2 flex gap-1">
                                                                <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                                                                <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                                                                <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"><span className="material-symbols-outlined text-[18px]">format_underlined</span></button>
                                                                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
                                                                <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                                                                <button type="button" className="p-1.5 rounded hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"><span className="material-symbols-outlined text-[18px]">link</span></button>
                                                            </div>
                                                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full border-0 p-4 text-slate-700 dark:text-slate-300 focus:ring-0 min-h-[160px] bg-white dark:bg-zinc-900 resize-y ${aiDescLoading ? 'animate-pulse bg-purple-50/50' : ''}`} placeholder={t('t_34bc19d7c')}></textarea>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 lg:p-8 border border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                                        <span className="material-symbols-outlined text-[20px]">image</span>
                                                    </span>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('t_3a8084a2')}</h3>
                                                </div>
                                                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{t('t_5407ec12')}</span>
                                            </div>
                                            <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-900 p-10 flex flex-col items-center justify-center text-center group hover:border-primary/50 hover:bg-primary/5 transition-all relative overflow-hidden">
                                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title={t('t_1628dd909')} />
                                                <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-900 shadow-sm  flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                    <span className="material-symbols-outlined text-3xl text-primary">add_photo_alternate</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{t('t_fb6aee42')}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">{t('t_10b437332')}</p>
                                            </div>

                                            <div className="flex gap-4 mt-6 overflow-x-auto pb-2 no-scrollbar">
                                                {images.map((img, index) => (
                                                    <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex-shrink-0 group">
                                                        <img className="w-full h-full object-cover" src={img} alt={`Preview ${index}`} />
                                                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                                                            <button type="button" onClick={() => handleRemoveImage(index)} className="text-white hover:text-red-400">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 flex flex-col gap-6">

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 border border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600">
                                                    <span className="material-symbols-outlined text-[20px]">payments</span>
                                                </span>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('t_7f5a405a')}</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('t_57f51328')}</label>
                                                    <div className="relative">
                                                        <input required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-3.5 pl-12 text-slate-900 dark:text-white focus:border-primary focus:ring-primary transition-all ltr" placeholder="0.00" min="0" step="0.01" type="number" />
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">{t('t_17422d')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('t_3ba72c4d')} <span className="text-xs font-normal text-slate-400">{t('t_c119eb8')}</span></label>
                                                    <div className="relative">
                                                        <input value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-3.5 pl-12 text-slate-900 dark:text-white focus:border-primary focus:ring-primary transition-all ltr" placeholder="0.00" min="0" step="0.01" type="number" />
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">{t('t_17422d')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t("t_80aa3736")}<span className="text-xs font-normal text-slate-400">{t("t_8caad63e")}</span></label>
                                                    <div className="relative">
                                                        <input required value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-3.5 pl-12 text-slate-900 dark:text-white focus:border-primary focus:ring-primary transition-all ltr" placeholder="0.00" min="0" step="0.01" type="number" />
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">{t('t_17422d')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-2 flex items-center gap-2">
                                                    <input className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" id="tax" type="checkbox" />
                                                    <label className="text-sm text-slate-600 dark:text-slate-400 select-none cursor-pointer" htmlFor="tax">{t('t_ab9e8209')}</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 border border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600">
                                                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                                                </span>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('t_80d45aaa')}</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('t_e01499df')}</label>
                                                    <div className="relative">
                                                        <input required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-3.5 pl-12 text-slate-900 dark:text-white focus:border-primary focus:ring-primary transition-all ltr" placeholder="0" min="0" type="number" />
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">{t('t_2f05605')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 border border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600">
                                                    <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
                                                </span>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("t_109a327a")}</h3>
                                            </div>

                                            {/* Countdown */}
                                            <div className="space-y-4 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{t("t_1c3c9ce6")}</h4>
                                                        <p className="text-xs text-slate-500">{t("t_ce75fe06")}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={productCountdownEnabled} onChange={e => setProductCountdownEnabled(e.target.checked)} className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                                {productCountdownEnabled && (
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t("t_2e4426c")}</label>
                                                            <input value={countdownText} onChange={e => setCountdownText(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2 text-sm text-slate-900 dark:text-white" placeholder={t("t_b1629691")} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t("t_22d7dc14")}</label>
                                                            <input type="number" value={countdownDuration} onChange={e => setCountdownDuration(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2 text-sm text-slate-900 dark:text-white" placeholder="60" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upsell / Quantity Breaks */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{t("t_1b793b9c")}</h4>
                                                        <p className="text-xs text-slate-500">{t("t_d2085f19")}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={upsellEnabled} onChange={e => setUpsellEnabled(e.target.checked)} className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                                {upsellEnabled && (
                                                    <div className="mt-4">
                                                        <div className="mb-4">
                                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t("t_dca2f75b")}</label>
                                                            <input value={upsellTitle} onChange={e => setUpsellTitle(e.target.value)} className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2 text-sm text-slate-900 dark:text-white" placeholder={t("t_4344879c")} />
                                                        </div>
                                                        <div className="space-y-3">
                                                            {upsellBundles.map((bundle, idx) => (
                                                                <div key={idx} className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-slate-100 dark:border-zinc-700/50">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1">
                                                                            <input value={bundle.label} onChange={e => { const nb = [...upsellBundles]; nb[idx].label = e.target.value; setUpsellBundles(nb); }} className="w-full rounded dark:bg-zinc-900 text-slate-900 dark:text-white text-xs p-1.5 border border-slate-200 dark:border-zinc-700 mb-2" placeholder={t("t_32a343b4")} />
                                                                            <div className="flex items-center gap-2">
                                                                                <input type="number" value={bundle.quantity} onChange={e => { const nb = [...upsellBundles]; nb[idx].quantity = parseInt(e.target.value)||0; setUpsellBundles(nb); }} className="w-16 rounded dark:bg-zinc-900 text-slate-900 dark:text-white text-xs p-1.5 border border-slate-200 dark:border-zinc-700 text-center" placeholder={t("t_dadcff7e")} min="2" />
                                                                                <span className="text-xs text-slate-500">{t("t_2abafc85")}</span>
                                                                                <input type="number" value={bundle.price} onChange={e => { const nb = [...upsellBundles]; nb[idx].price = parseFloat(e.target.value)||0; setUpsellBundles(nb); }} className="w-24 rounded dark:bg-zinc-900 text-slate-900 dark:text-white text-xs p-1.5 border border-slate-200 dark:border-zinc-700 text-center" placeholder="السعر" />
                                                                            </div>
                                                                        </div>
                                                                        <button type="button" onClick={() => { const nb = [...upsellBundles]; nb.splice(idx, 1); setUpsellBundles(nb); }} className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40">
                                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                                        </button>
                                                                    </div>
                                                                    {/* Free Delivery Toggle */}
                                                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700/50">
                                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                                            <input type="checkbox" checked={bundle.freeDelivery || false} onChange={e => { const nb = [...upsellBundles]; nb[idx].freeDelivery = e.target.checked; setUpsellBundles(nb); }} className="sr-only peer" />
                                                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-green-500"></div>
                                                                        </label>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="material-symbols-outlined text-[16px] text-green-600">local_shipping</span>
                                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">توصيل مجاني</span>
                                                                        </div>
                                                                        {bundle.freeDelivery && (
                                                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">{t("t_ae1736e3")}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <button type="button" onClick={() => setUpsellBundles([...upsellBundles, { quantity: 2, price: 0, label: '', freeDelivery: false }])} className="w-full py-2 border border-dashed border-primary/50 text-primary text-xs font-bold rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                                                                + إضافة عرض كمية جديد
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 border border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-50 text-pink-600">
                                                        <span className="material-symbols-outlined text-[20px]">style</span>
                                                    </span>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('t_214ad0048')}</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('t_5afe40f1a')}</p>
                                                {options.map((opt, optIndex) => (
                                                    <div key={optIndex} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <input value={opt.name} onChange={(e) => handleUpdateOptionName(optIndex, e.target.value)} placeholder={t('t_47cbc65')} className="w-1/2 rounded-lg border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-primary shadow-sm" />
                                                            <button type="button" onClick={() => handleRemoveOption(optIndex)} className="text-red-500 hover:text-red-700 p-1 flex items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-lg w-8 h-8">
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {opt.values.map((val, valIndex) => (
                                                                <span key={valIndex} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm ">
                                                                    {val}
                                                                    <button type="button" onClick={() => handleRemoveOptionValue(optIndex, valIndex)} className="text-slate-400 hover:text-red-500 flex items-center">
                                                                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <input type="text" placeholder={t('t_7c2a1566')} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOptionValue(optIndex, e.currentTarget.value); e.currentTarget.value = ''; } }} className="w-full rounded-lg border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-primary h-11 shadow-sm px-3" />
                                                    </div>
                                                ))}
                                                <button type="button" onClick={handleAddOption} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline pt-2">
                                                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                                    
                                                    {t('t_6cc92833')}
                                                </button>
                                            </div>
                                        </div>

                                        {template === 'image' ? (
                                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm  p-6 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
                                                <div className="absolute -left-6 -top-6 text-indigo-200/50 rotate-12">
                                                    <span className="material-symbols-outlined text-8xl">auto_awesome</span>
                                                </div>
                                                <div className="flex flex-col gap-3 relative z-10">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/300 text-white shadow-md">
                                                            <span className="material-symbols-outlined text-[20px]">magic_button</span>
                                                        </span>
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('t_2bf99a38')}</h3>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t('t_3ce8ee9af')}</p>
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setTemplate('tech')} 
                                                            className="text-xs font-bold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded-lg transition-colors border border-indigo-200"
                                                        >
                                                            
                                                            {t('t_38a47765')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 border border-slate-100 dark:border-zinc-800">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600">
                                                        <span className="material-symbols-outlined text-[20px]">web</span>
                                                    </span>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('t_5a60b784')}</h3>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">

                                                    {activeTemplateSlugs.includes('tech') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'tech'} onChange={() => setTemplate('tech')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm ">
                                                                <span className="material-symbols-outlined">devices</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_750dbc3f')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_1cad79d5c')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('fashion') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'fashion'} onChange={() => setTemplate('fashion')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">checkroom</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_175fbf02a')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_13d5c4977')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('perfume') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'perfume'} onChange={() => setTemplate('perfume')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-[#fof3e5] dark:bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">auto_awesome</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_27c57e27')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_53b62418')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('food') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'food'} onChange={() => setTemplate('food')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">restaurant</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_b05391e5')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_b7b1f905')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('skincare') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'skincare'} onChange={() => setTemplate('skincare')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">water_drop</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_f59051b4')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_21e1dd967')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('digital') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'digital'} onChange={() => setTemplate('digital')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-sky-50 dark:bg-sky-950/30 text-sky-500 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">menu_book</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_10f24f487')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_1762d4b01')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('decor') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'decor'} onChange={() => setTemplate('decor')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-[#f0ede6] dark:bg-[#8c7d70]/10 text-[#8c7d70] border border-[#8c7d70]/20 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">weekend</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_1227f09d')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_14330134')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('image') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'image'} onChange={() => setTemplate('image')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-[#f0f9ff] dark:bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">image</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_2a8e7aaf9')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_1e45b7d0')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {/* Separator for General Templates */}
                                                    <div className="col-span-full pt-4 pb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent"></div>
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('t_134c34c07')}</span>
                                                            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                                        </div>
                                                    </div>

                                                    {activeTemplateSlugs.includes('classic') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'classic'} onChange={() => setTemplate('classic')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">dashboard</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_762a9797')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_ced7cee8')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('bold') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'bold'} onChange={() => setTemplate('bold')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">bolt</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_37cb0541')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_1e0be090f')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('minimal') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'minimal'} onChange={() => setTemplate('minimal')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-[#fafaf9] dark:bg-zinc-800 text-[#1a1a1a] dark:text-zinc-300 border border-[#e5e5e5] flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">remove</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_f307ad0')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_82d50deb')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('elegant') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'elegant'} onChange={() => setTemplate('elegant')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-[#f8f5f1] dark:bg-[#b09e88]/10 text-[#b09e88] border border-[#e8dccf] flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">diamond</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_2ceabec0')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_7c944b1d')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('fresh') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'fresh'} onChange={() => setTemplate('fresh')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">eco</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_3494e00f')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_1187153c1')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('luxury') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'luxury'} onChange={() => setTemplate('luxury')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-[#0c0b0a] dark:bg-black text-[#c9a84c] border border-[#c9a84c]/20 flex items-center justify-center shadow-sm ">
                                                                <span className="material-symbols-outlined">stars</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('t_df26f4f9')}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_c54b08ab')}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('simple') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'simple'} onChange={() => setTemplate('simple')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-sm">
                                                                <span className="material-symbols-outlined">web</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{t("t_2a7c523")}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t("t_5f42296e")}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}

                                                    {activeTemplateSlugs.includes('classic-pro') && (
                                                    <label className="relative block cursor-pointer group">
                                                        <input checked={template === 'classic-pro'} onChange={() => setTemplate('classic-pro')} className="peer sr-only" name="template" type="radio" />
                                                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 flex items-center gap-3 hover:border-slate-300 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                                                            <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shadow-sm">
                                                                <span className="material-symbols-outlined">auto_awesome_motion</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{lang === 'ar' ? 'كلاسيكي محترف' : 'Classic Pro'}</span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'تصميم بصفحة دفع فورية بجانب المنتج لزيادة المبيعات' : 'Sleek COD template with instant checkout next to image'}</span>
                                                            </div>
                                                            <div className="mr-auto text-primary opacity-0 peer-checked:opacity-100">
                                                                <span className="material-symbols-outlined">check_circle</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 border border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                                                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                                                </span>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('t_55e1133c')}</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="checkbox" checked={shippingFree} onChange={(e) => setShippingFree(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5" />
                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('t_71569d32')}</span>
                                                </label>
                                                {!shippingFree && (
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('t_159d5d4')}</label>
                                                        <input value={shippingHomePrice} onChange={(e) => setShippingHomePrice(e.target.value)} type="number" min="0" className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm py-2.5 focus:border-primary focus:ring-primary" placeholder={t('t_8c3fca53')} />
                                                    </div>
                                                )}

                                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-4"></div>

                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="checkbox" checked={shippingOfficeFree} onChange={(e) => setShippingOfficeFree(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5" />
                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('t_1438cf6d4')}</span>
                                                </label>
                                                {!shippingOfficeFree && (
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('t_c3ab5943')}</label>
                                                        <input value={shippingOfficePrice} onChange={(e) => setShippingOfficePrice(e.target.value)} type="number" min="0" className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm py-2.5 focus:border-primary focus:ring-primary" placeholder={t('t_8c3fd1d5')} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-soft p-6 border border-slate-100 dark:border-zinc-800">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('t_7f62dfba')}</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('t_252d7204')}</label>
                                                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm py-2.5 focus:border-primary focus:ring-primary">
                                                        <option value="active">{t('t_185349')}</option>
                                                        <option value="draft">{t('t_5b431ed4')}</option>
                                                        <option value="archived">{t('t_5962cf3d')}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{t('t_59a3fca7')}</label>
                                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm py-2.5 focus:border-primary focus:ring-primary">
                                                        <option value="">{t('t_9debeee4')}</option>
                                                        <option value={t('t_5b4a5c73')}>{t('t_5b4a5c73')}</option>
                                                        <option value={t('t_59994ca9')}>{t('t_59994ca9')}</option>
                                                        <option value={t('t_9d15119e')}>{t('t_9d15119e')}</option>
                                                        <option value={t('t_2f1b118')}>{t('t_2f1b118')}</option>
                                                        <option value={t('t_59a3debd')}>{t('t_59a3debd')}</option>
                                                        <option value={t('t_483d2f75')}>{t('t_483d2f75')}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sticky bottom-6 mt-2">
                                            <button disabled={loading} type="submit" className={`w-full rounded-xl py-4 px-6 text-white shadow-glow hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed ${isEditMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-black'}`}>
                                                {loading ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[20px]">{isEditMode ? 'save' : 'publish'}</span>
                                                        <span className="text-base font-bold">{isEditMode ? t('t_b00ceca4') : t('t_134569b37')}</span>
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-center text-xs text-slate-400 mt-3">{isEditMode ? t('t_170a75045') : t('t_2de178750')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </form>
                </main >
            </div >
        </>
    );
}

export default function AddProductPage() {
    const { t, lang } = useI18n();
    return (
        <Suspense fallback={
            <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <Sidebar activePage="Inventory" />
                <main className="flex-1 flex items-center justify-center pt-16 md:pt-0">
                    <SOUQAILoader size="md" text={t('t_e987a17b')} />
                </main>
            </div>
        }>
            <AddProductPageContent />
        </Suspense>
    );
}
