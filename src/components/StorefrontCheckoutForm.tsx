'use client';

import React, { useState } from 'react';
import { insforge } from '@/lib/insforge';
import { trackPurchase, trackInitiateCheckout, trackViewContent } from '@/lib/pixelEvents';
import { getWilayas, getCommunesByWilayaId } from 'algeria-locations';
import { useProductOptions } from './ProductOptionsProvider';
import ProductOptionsSelector from './ProductOptionsSelector';
import SmartUpsell from './SmartUpsell';
import CountdownTimer from './CountdownTimer';
import { useI18n } from "@/context/I18nContext";

export default function StorefrontCheckoutForm({ product, storeDomain }: { product?: any, storeDomain?: string }) {
    const { t, lang } = useI18n();

    // Checkout customization
    const useCustom = product?.checkout_use_custom || false;
    const cBg = useCustom && product?.checkout_bg_color ? product.checkout_bg_color : null;
    const cInputBg = useCustom && product?.checkout_input_bg ? product.checkout_input_bg : null;
    const cInputBorder = useCustom && product?.checkout_input_border ? product.checkout_input_border : null;
    const cPriceBg = useCustom && product?.checkout_price_bg ? product.checkout_price_bg : null;
    const cPriceBorder = useCustom && product?.checkout_price_border ? product.checkout_price_border : null;
    const cBadgeBg = useCustom && product?.checkout_badge_bg ? product.checkout_badge_bg : null;
    const showWhatsapp = product?.checkout_show_whatsapp ?? true;
    const showFakeReviews = product?.checkout_show_fake_reviews ?? true;
    const cButtonText = useCustom && product?.checkout_button_text ? product.checkout_button_text : t('t_23eca3cc');
    const cButtonIcon = useCustom && product?.checkout_button_icon !== undefined ? product.checkout_button_icon : 'check_circle';
    const cButtonBg = useCustom && product?.checkout_button_bg ? product.checkout_button_bg : null;
    const cButtonColor = useCustom && product?.checkout_button_color ? product.checkout_button_color : null;
    const storeColor = product?.store_color || '#008096';
    
    // Robust phone parsing
    let cleanPhone = (product?.storePhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('213')) cleanPhone = cleanPhone.slice(3);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
    const hasValidPhone = cleanPhone.length >= 8;

    // Detect if custom bg is light
    const isLightBg = cBg ? ['#F8F9FC','#FFFFFF','#f0f9fa','#fdf2f8','#f0fdf4','#fefce8','#f3f4f6','#ecfdf5','#fef3c7','#ffffff','#f8f9fc'].includes(cBg.toLowerCase()) || cBg.toLowerCase() > '#888888' : false;
    const isLightInput = cInputBg ? ['#FFFFFF','#f8fafc','#f0f9fa','#fefce8','#ffffff'].includes(cInputBg.toLowerCase()) || cInputBg.toLowerCase() > '#888888' : false;
    const isLightPrice = cPriceBg ? ['#f3f4f6','#f0f9fa','#ecfdf5','#fef3c7','#ffffff'].includes(cPriceBg.toLowerCase()) || cPriceBg.toLowerCase() > '#888888' : false;
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

    // Form fields state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [wilaya, setWilaya] = useState('');
    const [commune, setCommune] = useState('');
    const wilayasList = getWilayas();
    const communesList = wilaya ? getCommunesByWilayaId(Number(wilaya)) : [];
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [reviewsCount] = useState(() => Math.floor(Math.random() * 200 + 50));
    
    // Anti Fraud System added states
    const [honeypot, setHoneypot] = useState(''); 
    const startTime = React.useRef(Date.now());
    
    // Captcha States
    const [captchaEnabled, setCaptchaEnabled] = useState(false);
    const [captchaAnswer, setCaptchaAnswer] = useState(0);
    const [userCaptcha, setUserCaptcha] = useState('');
    const [captchaEquation, setCaptchaEquation] = useState('');

    React.useEffect(() => {
        const domain = storeDomain || product?.store_domain;
        if (!domain) return;
        fetch(`/api/store-fraud?domain=${domain}`)
            .then(res => res.json())
            .then(data => {
                if (data.enabled) {
                    setCaptchaEnabled(true);
                    const n1 = Math.floor(Math.random() * 9) + 1;
                    const n2 = Math.floor(Math.random() * 9) + 1;
                    setCaptchaAnswer(n1 + n2);
                    setCaptchaEquation(`${n1} + ${n2}`);
                }
            })
            .catch(() => {});
    }, [storeDomain, product]);
    
    // Product options from Context
    const { selectedOptions } = useProductOptions();

    // Delivery Configuration State
    const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
    const [stopDeskOffice, setStopDeskOffice] = useState('');

    // Dynamic Shipping Rates from Database
    const [dbShippingRates, setDbShippingRates] = useState<Record<string, { home: number, desk: number }>>({});

    React.useEffect(() => {
        const domain = storeDomain || product?.store_domain;
        if (!domain) return;
        fetch(`/api/shipping-rates?domain=${domain}`)
            .then(res => res.json())
            .then(data => {
                if (data.rates && data.rates.length > 0) {
                    const ratesMap: Record<string, { home: number, desk: number }> = {};
                    data.rates.forEach((r: any) => { ratesMap[String(Number(r.wilaya_code))] = { home: r.home_price, desk: r.desk_price }; });
                    setDbShippingRates(ratesMap);
                }
            })
            .catch(() => {});
    }, [storeDomain, product]);

    const FALLBACK_RATES: Record<string, { home: number, desk: number }> = {
        '16': { home: 450, desk: 300 }, '31': { home: 650, desk: 400 }, '25': { home: 650, desk: 400 },
        '9': { home: 500, desk: 350 }, 'default': { home: 750, desk: 500 }
    };

    const wilayaKey = wilaya ? String(Number(wilaya)) : '';
    const defaultRates = wilaya
        ? (dbShippingRates[wilayaKey] || FALLBACK_RATES[wilayaKey] || FALLBACK_RATES['default'])
        : { home: 0, desk: 0 };

    const currentRates = {
        home: product?.shipping_home_price ? Number(product.shipping_home_price) : defaultRates.home,
        desk: product?.shipping_office_price ? Number(product.shipping_office_price) : defaultRates.desk
    };

    // Product price + shipping
    let productTotal = parseFloat(product?.price || '0') * quantity;
    let bundleFreeDelivery = false;
    if (product?.upsell_enabled && Array.isArray(product?.upsell_bundles)) {
        const bundle = product.upsell_bundles.find((b: any) => parseInt(b.quantity) === quantity);
        if (bundle) {
            productTotal = parseFloat(bundle.price);
            if (bundle.freeDelivery) bundleFreeDelivery = true;
        }
    }

    const shippingCostHome = (product?.shipping_free || bundleFreeDelivery) ? 0 : currentRates.home;
    const shippingCostDesk = (product?.shipping_office_free || bundleFreeDelivery) ? 0 : currentRates.desk;
    const shippingCost = wilaya ? (deliveryType === 'home' ? shippingCostHome : shippingCostDesk) : 0;
    const finalTotal = productTotal + shippingCost;

    // Pixel tracking states
    const [hasTrackedView, setHasTrackedView] = useState(false);
    const [hasInitiatedCheckout, setHasInitiatedCheckout] = useState(false);

    // Track ViewContent on load
    React.useEffect(() => {
        if (!hasTrackedView && product) {
            trackViewContent({
                id: product.id,
                name: product.name || t('t_213c8c66'),
                price: parseFloat(product.price || '0')
            });
            setHasTrackedView(true);
        }
    }, [product, hasTrackedView]);

    // Track InitiateCheckout on first interaction
    const handleInteraction = () => {
        if (!hasInitiatedCheckout && product) {
            trackInitiateCheckout({
                value: parseFloat(product.price || '0') * quantity,
                productIds: [product.id]
            });
            setHasInitiatedCheckout(true);
        }
    };

    const handlePhoneChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        setCustomerPhone(digitsOnly);
        if (digitsOnly.length === 0) {
            setPhoneError('');
        } else if (digitsOnly.length < 10) {
            setPhoneError(t('t_d587ead7'));
        } else if (digitsOnly.length === 10 && !/^0[567]/.test(digitsOnly)) {
            setPhoneError(t('t_ac66aafc'));
        } else if (digitsOnly.length > 10) {
            setPhoneError(t('t_a8357a0f'));
        } else {
            setPhoneError('');
        }
    };

    // Automatically track abandoned form when name and phone are filled
    const [abandonedTracked, setAbandonedTracked] = useState(false);
    React.useEffect(() => {
        if (abandonedTracked) return;
        const phoneDigits = customerPhone.replace(/\D/g, '');
        const isPhoneValid = phoneDigits.length === 10 && /^0[567]/.test(phoneDigits);
        const isNameValid = customerName.trim().length >= 2;

        if (isPhoneValid && isNameValid) {
            const timer = setTimeout(() => {
                trackAbandonedForm(phoneDigits, customerName);
                setAbandonedTracked(true);
            }, 1000); // 1-second debounce to avoid spamming
            return () => clearTimeout(timer);
        }
    }, [customerPhone, customerName, abandonedTracked]);

    // Track abandoned form
    const trackAbandonedForm = async (phone: string, name: string) => {
        try {
            const domain = storeDomain || product?.store_domain;
            if (!domain || !phone) return;

            // Get user_id from product or from store domain
            let userId = product?.user_id;

            // If no user_id in product, try to fetch it from the store
            if (!userId) {
                try {
                    const storeResponse = await fetch(`/api/store-fraud?domain=${domain}`);
                    const storeData = await storeResponse.json();
                    userId = storeData.user_id;
                } catch (err) {
                    console.error('Error fetching store info:', err);
                }
            }

            if (!userId) {
                console.warn('No user_id found for abandoned form tracking');
                return;
            }

            const formData = {
                customer_name: name,
                customer_address: address,
                customer_state: wilaya,
                commune: commune,
                delivery_type: deliveryType,
                quantity: quantity,
                notes: notes,
                timestamp: new Date().toISOString(),
            };

            const response = await fetch('/api/abandoned-forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    storeDomain: domain,
                    productId: product?.id,
                    productName: product?.name,
                    customerPhone: phone,
                    customerName: name,
                    customerAddress: address,
                    customerState: wilaya,
                    quantity: quantity,
                    totalPrice: finalTotal,
                    formData: formData,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Error tracking abandoned form - Status:', response.status);
                console.error('Error details:', error);
            } else {
                const result = await response.json();
                console.log('Abandoned form tracked successfully:', result);
            }
        } catch (error) {
            console.error('Error tracking abandoned form - Exception:', error);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate Algerian phone number
        const cleanPhone = customerPhone.replace(/\s+/g, '');
        if (cleanPhone.length !== 10 || !/^0[567]/.test(cleanPhone)) {
            setPhoneError(t('t_ce16aaa0'));
            setLoading(false);
            return;
        }

        // Validate Captcha
        if (captchaEnabled && parseInt(userCaptcha) !== captchaAnswer) {
            alert('الإجابة على اختبار الأمان خاطئة. يرجى إدخال المجموع الصحيح.');
            setLoading(false);
            return;
        }

        // Validate product options are selected
        if (product?.options && Array.isArray(product.options)) {
            for (const opt of product.options) {
                if (!selectedOptions[opt.name]) {
                    alert(`يرجى تحديد: ${opt.name} قبل إتمام الطلب.`);
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            const orderData = {
                // If the product doesn't have an owner, default it so it at least saves (though it should always have one now)
                store_domain: storeDomain || product?.store_domain || 'unknown',
                product_id: product?.id,
                product_name: product?.name || t('t_213c8c66'),
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: `${address} | ${communesList.find((c: any) => String(c.id) === String(commune))?.name_ar || commune} | ${deliveryType === 'desk' ? `استلام من مكتب التوصيل (${stopDeskOffice || t('t_fa8f3d66')})` : ''}`,
                customer_state: wilaya,
                total_price: finalTotal,
                quantity: quantity,
                notes: `نوع التوصيل: ${deliveryType === 'home' ? t('t_c5a7333') : t('t_c5a66dc')}${Object.keys(selectedOptions).length > 0 ? ` | الخيارات: ${Object.entries(selectedOptions).map(([k, v]) => `${k} (${v})`).join(t('t_60c'))}` : ''} | ${notes}`,
                time_elapsed: Date.now() - startTime.current,
                honeypot: honeypot,
                source: typeof window !== 'undefined' ? sessionStorage.getItem('landing_page_source') || 'direct' : 'direct',
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const dataObj = await response.json();

            if (!response.ok) {
                console.error('Order submission error:', dataObj.error);
                throw new Error(dataObj.error || t('t_55c7be80'));
            }

            // check if response indicates blocking
            if (dataObj.status === 'blocked') {
                alert("تم رفض الطلب بناءً على نظام أمان المتجر.");
                window.location.reload();
                return;
            }

            // Fire Purchase event via Browser Pixels
            trackPurchase({
                orderId: dataObj.order?.id || `ORD-${Date.now()}`,
                value: parseFloat(product?.price || '0') * quantity,
                productIds: [product?.id],
                productNames: [product?.name || t('t_213c8c66')]
            });

            // Mark abandoned form as converted
            try {
                await fetch('/api/abandoned-forms/convert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerPhone: customerPhone,
                        orderId: dataObj.order?.id,
                        storeDomain: storeDomain || product?.store_domain,
                    }),
                });
            } catch (err) {
                console.error('Error marking form as converted:', err);
            }

            setOrderSuccess(dataObj.order?.id || 'ORD-UNKNOWN');
        } catch (error: any) {
            console.error('Checkout error details:', error);
            alert(error?.message || error?.details || t('t_435bbf5a'));
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="bg-surface-dark border border-slate-800 lg:border-slate-700 shadow-2xl rounded-3xl p-6 md:p-10 relative overflow-hidden" id="checkout-section">
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-[60px] -z-0"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -z-0"></div>

                <div className="relative z-10 flex flex-col items-center text-center py-8">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center animate-pulse">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                                <span className="material-symbols-outlined text-white text-4xl font-bold">check</span>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-green-500/20 rounded-full -z-10 animate-ping" style={{ animationDuration: '3s' }}></div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-white font-display mb-3">
                        
                        {t('t_12ede9dce')}
                    </h2>
                    <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed mb-6">
                        
                        {t('t_3f7d65c82')}
                    </p>

                    <div className="w-full bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col items-center gap-2 p-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <span className="text-sm font-bold text-white">{t('t_2cb0ef5e')}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_8e3d2edb')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                    <span className="material-symbols-outlined">local_shipping</span>
                                </div>
                                <span className="text-sm font-bold text-white">{t('t_b70da944')}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_2af2c833')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <span className="text-sm font-bold text-white">{t('t_8c4b14b8')}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{t('t_591e3f82')}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => window.location.reload()} className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10">
                        <span className="flex items-center gap-2">
                            <span>{t('t_f4014ae4')}</span>
                            <span className="material-symbols-outlined">arrow_back</span>
                        </span>
                    </button>
                    
                    <SmartUpsell 
                        product={product} 
                        currentOrderId={orderSuccess} 
                        customerPhone={customerPhone} 
                        customerName={customerName} 
                        customerState={wilaya} 
                        customerAddress={address} 
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={useCustom && cBg ? '' : 'bg-surface-dark border border-slate-800 lg:border-slate-700'} style={useCustom && cBg ? { background: cBg, border: `1px solid ${cInputBorder || '#e5e7eb'}` } : {}} id="checkout-section">
            <div className="shadow-2xl rounded-3xl p-4 sm:p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -z-0"></div>

            {/* Countdown Timer */}
            <CountdownTimer 
                enabled={product?.product_countdown_enabled === true || product?.product_countdown_enabled === 'true'} 
                text={product?.countdown_text || t('t_a61cb099')} 
                duration={parseInt(product?.countdown_duration || '60', 10)} 
            />

            <div className="text-center mb-0 relative z-10">
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black font-display ${useCustom && isLightBg ? 'text-[#181116]' : 'text-white'}`}>{t('t_10d0aa348')}</h2>
                <p className={`mt-2 sm:mt-3 text-base sm:text-lg ${useCustom && isLightBg ? 'text-gray-500' : 'text-slate-400'}`}>{t('t_148337f81')}</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
                {/* Product Options / Variants Section */}
                <ProductOptionsSelector options={product?.options || []} variant="form" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5 sm:space-y-2">
                        <label className={`text-xs sm:text-sm font-bold ${useCustom && isLightBg ? 'text-gray-700' : 'text-slate-300'}`}>{t('t_1155ce44')} <span className="text-red-500">*</span></label>
                        <input onFocus={handleInteraction} value={customerName} onChange={(e) => setCustomerName(e.target.value)} required type="text" placeholder={t('t_480df1e9')} className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" style={useCustom ? { background: cInputBg || undefined, border: `1.5px solid ${cInputBorder || '#334155'}`, color: isLightInput ? '#181116' : '#fff' } : {}} />
                    </div>
                    <div className="space-y-2 relative">
                        {/* Honeypot field - visually hidden, screen readers ignore it ideally, but if a bot fills it, it's blocked */}
                        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                            <input type="text" name="customer_email_alt" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                        </div>

                        <label className={`text-xs sm:text-sm font-bold ${useCustom && isLightBg ? 'text-gray-700' : 'text-slate-300'}`}>{t('t_d581c00')} <span className="text-red-500">*</span></label>
                        <input onFocus={handleInteraction} value={customerPhone} onChange={(e) => handlePhoneChange(e.target.value)} required type="tel" placeholder="05xx xx xx xx" maxLength={10} className={`w-full rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:ring-2 transition-all text-right shadow-inner ${phoneError ? 'focus:ring-red-500' : 'focus:ring-primary/50'}`} style={useCustom ? { background: cInputBg || undefined, border: `1.5px solid ${phoneError ? '#ef4444' : (cInputBorder || '#334155')}`, color: isLightInput ? '#181116' : '#fff' } : {}} dir="ltr" />
                        {phoneError && <p className="text-red-400 text-xs mt-1.5 font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{phoneError}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5 sm:space-y-2">
                        <label className={`text-xs sm:text-sm font-bold ${useCustom && isLightBg ? 'text-gray-700' : 'text-slate-300'}`}>{t('t_8108782d')} <span className="text-red-500">*</span></label>
                        <select value={wilaya} onChange={(e) => { setWilaya(e.target.value); setCommune(''); }} required className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer shadow-inner" style={useCustom ? { background: cInputBg || undefined, border: `1.5px solid ${cInputBorder || '#334155'}`, color: isLightInput ? '#181116' : '#fff' } : {}}>
                            <option value="">{t('t_136ca55ed')}</option>
                            {wilayasList.map((w: any) => (
                                <option key={w.id} value={w.id}>
                                    {w.id} - {w.name_ar} ({w.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <label className={`text-xs sm:text-sm font-bold ${useCustom && isLightBg ? 'text-gray-700' : 'text-slate-300'}`}>{t('t_7f45a615')} <span className="text-red-500">*</span></label>
                        <select disabled={!wilaya} value={commune} onChange={(e) => setCommune(e.target.value)} required className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer shadow-inner disabled:opacity-50 disabled:cursor-not-allowed" style={useCustom ? { background: cInputBg || undefined, border: `1.5px solid ${cInputBorder || '#334155'}`, color: isLightInput ? '#181116' : '#fff' } : {}}>
                            <option value="">{t('t_125492cd5')}</option>
                            {communesList.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name_ar} ({c.name})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {wilaya && commune && (
                    <div className="p-3 sm:p-4 rounded-xl mb-4 animate-in fade-in slide-in-from-top-4" style={useCustom ? { background: cPriceBg || 'rgba(15,23,42,0.6)', border: `1px solid ${cPriceBorder || 'rgba(51,65,85,0.5)'}` } : { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}>
                        <label className={`text-xs sm:text-sm font-bold block mb-3 sm:mb-4 ${useCustom && isLightPrice ? 'text-gray-700' : 'text-slate-300'}`}>{t('t_11dd67715')} <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Home Delivery */}
                            <label className={`relative flex items-center justify-between p-3.5 sm:p-4 cursor-pointer rounded-xl border-2 transition-all active:scale-[0.98] ${deliveryType === 'home' ? 'shadow-md' : 'border-slate-700 bg-slate-900 hover:border-slate-600'}`} style={deliveryType === 'home' ? { borderColor: storeColor, background: `${storeColor}0d` } : {}}>
                                <input type="radio" name="deliveryType" className="sr-only" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} />
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0`} style={deliveryType === 'home' ? { borderColor: storeColor } : { borderColor: '#9ca3af' }}>
                                        {deliveryType === 'home' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: storeColor }}></div>}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-sm ${useCustom && isLightPrice ? 'text-[#181116]' : 'text-white'}`}>{t('t_10c3b95de')}</span>
                                        <span className={`text-[11px] sm:text-xs mt-0.5 ${useCustom && isLightPrice ? 'text-gray-500' : 'text-slate-400'}`}>{t('t_323cd05e')}</span>
                                    </div>
                                </div>
                                <span className={`font-black text-sm flex-shrink-0 ${product?.shipping_free ? 'text-green-500' : (useCustom && isLightPrice ? 'text-[#181116]' : 'text-white')}`}>{product?.shipping_free ? t('t_217db6d41') : `${currentRates.home} د.ج`}</span>
                            </label>

                            {/* Stop Desk */}
                            <label className={`relative flex items-center justify-between p-3.5 sm:p-4 cursor-pointer rounded-xl border-2 transition-all active:scale-[0.98] ${deliveryType === 'desk' ? 'shadow-md' : 'border-slate-700 bg-slate-900 hover:border-slate-600'}`} style={deliveryType === 'desk' ? { borderColor: storeColor, background: `${storeColor}0d` } : {}}>
                                <input type="radio" name="deliveryType" className="sr-only" checked={deliveryType === 'desk'} onChange={() => setDeliveryType('desk')} />
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0`} style={deliveryType === 'desk' ? { borderColor: storeColor } : { borderColor: '#9ca3af' }}>
                                        {deliveryType === 'desk' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: storeColor }}></div>}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-sm ${useCustom && isLightPrice ? 'text-[#181116]' : 'text-white'}`}>{t('t_f6b63e0a')}</span>
                                        <span className="text-emerald-400 font-bold text-[11px] sm:text-xs mt-0.5">{t('t_d544468b')}</span>
                                    </div>
                                </div>
                                <span className={`font-black text-sm flex-shrink-0 ${product?.shipping_office_free ? 'text-green-500' : (useCustom && isLightPrice ? 'text-[#181116]' : 'text-white')}`}>{product?.shipping_office_free ? t('t_217db6d41') : `${currentRates.desk} د.ج`}</span>
                            </label>
                        </div>
                    </div>
                )}


                {
                    deliveryType === 'home' && (
                        <div className="space-y-1.5 sm:space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className={`text-xs sm:text-sm font-bold ${useCustom && isLightBg ? 'text-gray-700' : 'text-slate-300'}`}>{t('t_279640181')} <span className="text-red-500">*</span></label>
                            <input value={address} onChange={(e) => setAddress(e.target.value)} required type="text" placeholder={t('t_1b81afba4')} className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" style={useCustom ? { background: cInputBg || undefined, border: `1.5px solid ${cInputBorder || '#334155'}`, color: isLightInput ? '#181116' : '#fff' } : {}} />
                        </div>
                    )
                }

                <div className="space-y-1.5 sm:space-y-2">
                    <label className={`text-xs sm:text-sm font-bold ${useCustom && isLightBg ? 'text-gray-700' : 'text-slate-300'}`}>{t('t_15458b38c')}</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={t('t_5498ecc5')} className="w-full rounded-xl px-4 py-3 sm:py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner resize-none" style={useCustom ? { background: cInputBg || undefined, border: `1.5px solid ${cInputBorder || '#334155'}`, color: isLightInput ? '#181116' : '#fff' } : {}}></textarea>
                </div>

                {/* Quantity Breaks / Upsell */}
                {product?.upsell_enabled && Array.isArray(product?.upsell_bundles) && product.upsell_bundles.length > 0 && (
                    <div className="mt-6 space-y-3">
                        <h3 className={`font-bold text-lg mb-2 ${useCustom && isLightBg ? 'text-[#181116]' : 'text-white'}`}>
                            {product.upsell_title || t('t_4344879c')}
                        </h3>
                        
                        {/* Base Quantity (1) */}
                        <div 
                            onClick={() => setQuantity(1)} 
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${quantity === 1 ? '' : useCustom && isLightBg ? 'border-gray-200 bg-white' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
                            style={quantity === 1 ? { borderColor: storeColor, background: `${storeColor}1a` } : {}}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`} style={quantity === 1 ? { borderColor: storeColor } : { borderColor: '#9ca3af' }}>
                                    {quantity === 1 && <div className="w-2.5 h-2.5 rounded-full" style={{ background: storeColor }}></div>}
                                </div>
                                <span className={`font-bold ${useCustom && isLightBg ? 'text-[#181116]' : 'text-white'}`}>{t("t_9d2368d6")}</span>
                            </div>
                            <span className={`font-bold ${useCustom && isLightBg ? 'text-[#181116]' : 'text-white'}`}>{product?.price || '0'} د.ج</span>
                        </div>

                        {/* Bundles */}
                        {product.upsell_bundles.map((bundle: any, idx: number) => {
                            const bQty = parseInt(bundle.quantity);
                            const bPrice = parseFloat(bundle.price);
                            const isSelected = quantity === bQty;
                            const unitPrice = Math.round(bPrice / bQty);
                            const hasFreeDelivery = bundle.freeDelivery || false;
                            
                            return (
                                <div 
                                    key={idx}
                                    onClick={() => setQuantity(bQty)} 
                                    className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? '' : useCustom && isLightBg ? 'border-gray-200 bg-white' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
                                    style={isSelected ? { borderColor: storeColor, background: `${storeColor}1a` } : {}}
                                >
                                    {isSelected && (
                                        <span className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded-md" style={{ background: storeColor }}>{t('t_b8e9da1b')}</span>
                                    )}
                                    {bundle.discount_percent > 0 && (
                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md" dir="ltr">
                                            -{bundle.discount_percent}%
                                        </span>
                                    )}
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`} style={isSelected ? { borderColor: storeColor } : { borderColor: '#9ca3af' }}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: storeColor }}></div>}
                                        </div>
                                        <div>
                                            <span className={`block font-bold ${useCustom && isLightBg ? 'text-[#181116]' : 'text-white'}`}>{bundle.label || `اطلب ${bQty} حبات بسعر مخفض`}</span>
                                        </div>
                                    </div>
                                    <span className={`font-bold mt-1 text-lg`} style={{ color: storeColor }}>{bPrice} د.ج</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="rounded-2xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-6 shadow-md" style={useCustom ? { background: cPriceBg || 'rgba(15,23,42,0.8)', border: `1px solid ${cPriceBorder || 'rgba(51,65,85,0.5)'}` } : { background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}>
                    <div className={`flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b ${useCustom && isLightPrice ? 'border-gray-200' : 'border-slate-800'}`}>
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <img src={product?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwGOjy1je8skGoUtzLJRDBxZ8NcRJ5fCy4VuoIzJR4dgmjjyYxMl9pR8tPGHKNJaAb3Pfp1GpPMFJuTPqqzmYOwkSGCzYPy-_xmDkq3quX4sjzMaEtejgc6qm0LeRDIjeap1wb2pJJgmInqO36WrSQByvZKDX9IfyOce1ZJoRiS81vkORooqxV8zf8XmD3YfBtiDInmequ6BnVaWBI-lACOKBaEjKiRfyKPW1ImdaQYW6ThFPC4uuYP576ptjCmyKUVfcySTkoAytQ'} alt="Product thumbnail" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm sm:text-base truncate ${useCustom && isLightPrice ? 'text-[#181116]' : 'text-white'}`}>{product?.name || t('t_a7384b88')}</h4>
                            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                                <span className={`text-[11px] sm:text-xs ${useCustom && isLightPrice ? 'text-gray-500' : 'text-slate-400'}`}>{t('t_80c2f07c')}</span>
                                <div className="flex items-center gap-2 sm:gap-3 bg-slate-950 rounded-lg border border-slate-700 p-0.5">
                                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-transform">-</button>
                                    <span className="font-bold text-sm min-w-[20px] text-center">{quantity}</span>
                                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-transform">+</button>
                                </div>
                            </div>
                        </div>
                        <div className={`text-left font-bold text-sm sm:text-base flex-shrink-0 ${useCustom && isLightPrice ? 'text-[#181116]' : 'text-white'}`}>
                            {productTotal.toLocaleString()}  {t('t_17422d')}
                        </div>
                    </div>
                    {product?.compareAtPrice && parseFloat(product.compareAtPrice) > 0 && (
                        <div className="flex justify-between items-center text-xs sm:text-sm md:text-base mb-2">
                            <span className={useCustom && isLightPrice ? 'text-gray-500' : 'text-slate-400'}>{t('t_d2edcb34')}</span>
                            <span className={`line-through ${useCustom && isLightPrice ? 'text-gray-400' : 'text-slate-400'}`}>{product.compareAtPrice}  {t('t_17422d')}</span>
                        </div>
                    )}
                    {product?.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
                        <div className="flex justify-center mb-3">
                            <span className="px-3 py-1 rounded-lg text-white text-xs font-black" style={{ background: cBadgeBg || '#ef4444' }}>
                                🔥 خصم {Math.round(((parseFloat(product.compareAtPrice) - parseFloat(product.price)) / parseFloat(product.compareAtPrice)) * 100)}%
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-xs sm:text-sm md:text-base mb-2">
                        <span className={useCustom && isLightPrice ? 'text-gray-500' : 'text-slate-400'}>{t('t_11313c64d')}</span>
                        <span className={shippingCost === 0 ? "text-green-500 font-bold" : `font-bold ${useCustom && isLightPrice ? 'text-[#181116]' : 'text-white'}`}>
                            {shippingCost === 0 ? (wilaya ? t('t_217db6d41') : t('t_19498a87d')) : `+ ${shippingCost} د.ج`}
                        </span>
                    </div>
                    <div className={`flex justify-between items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${useCustom && isLightPrice ? 'border-gray-200' : 'border-slate-800'}`}>
                        <span className={`font-bold text-base sm:text-lg ${useCustom && isLightPrice ? 'text-[#181116]' : 'text-white'}`}>{t('t_bfbcc538')}</span>
                        <span className="font-black text-xl sm:text-2xl" dir="ltr" style={{ color: storeColor }}>{finalTotal.toLocaleString()}  {t('t_17422d')}</span>
                    </div>
                </div>

                {captchaEnabled && (
                    <div className="bg-slate-900/80 rounded-2xl p-4 md:p-5 border border-slate-700/50 mt-6 shadow-md animate-in fade-in slide-in-from-bottom-2">
                        <label className="text-sm font-bold text-slate-300 block mb-3">{t("t_8cc3e3ee")}<span className="text-red-500">*</span></label>
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="bg-slate-950 text-white font-black text-xl px-6 py-3.5 rounded-xl border border-slate-700 w-full md:w-fit shrink-0 tracking-widest text-center shadow-inner" dir="ltr">
                                {captchaEquation} =
                            </div>
                            <input 
                                type="number" 
                                required 
                                value={userCaptcha} 
                                onChange={(e) => setUserCaptcha(e.target.value)} 
                                placeholder={t("t_c588564e")} 
                                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-center text-xl font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner" 
                            />
                        </div>
                    </div>
                )}

                <button
                    disabled={loading}
                    type="submit"
                    className={`w-full font-black text-lg sm:text-xl h-14 sm:h-16 rounded-xl shadow-neon-strong transition-all flex justify-center items-center gap-2 sm:gap-3 mt-6 sm:mt-8 disabled:opacity-70 group animate-attention active:scale-[0.98] ${useCustom && cButtonBg ? '' : 'bg-primary hover:bg-blue-600 text-white'}`}
                    style={useCustom && cButtonBg ? { background: cButtonBg, color: cButtonColor || '#ffffff' } : {}}
                >
                    {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>{cButtonText}</span>
                            {cButtonIcon && (
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">{cButtonIcon}</span>
                            )}
                        </>
                    )}
                </button>
                <div className={`flex items-center justify-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm ${useCustom && isLightBg ? 'text-gray-400' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-green-500 text-base sm:text-lg">shield</span>
                    <span>{t('t_16e60af64')}</span>
                </div>

                {/* Fake Reviews Section */}
                {showFakeReviews && (
                    <div className="mt-6 p-4 rounded-2xl flex items-center justify-center gap-3" style={useCustom ? { background: cPriceBg || 'rgba(15,23,42,0.6)', border: `1px solid ${cPriceBorder || 'rgba(51,65,85,0.5)'}` } : { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}>
                        <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                                <span key={s} className="text-amber-400 text-lg">★</span>
                            ))}
                        </div>
                        <span className={`text-sm font-bold ${useCustom && isLightPrice ? 'text-[#181116]' : 'text-white'}`}>4.9</span>
                        <span className={`text-xs ${useCustom && isLightPrice ? 'text-gray-500' : 'text-slate-400'}`}>
                            {lang === 'ar' ? `(${reviewsCount} تقييم)` : lang === 'fr' ? `(${reviewsCount} évaluations)` : `(${reviewsCount} reviews)`}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-white text-[10px] font-black" style={{ background: cBadgeBg || '#ef4444' }}>
                            {lang === 'ar' ? 'موثوق ✓' : lang === 'fr' ? 'Confiance ✓' : 'Trusted ✓'}
                        </span>
                    </div>
                )}
            </form>
            </div>

            {/* Floating WhatsApp Button */}
            {showWhatsapp && hasValidPhone && (
                <a
                    href={`https://wa.me/213${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-24 right-5 z-[9999] w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-500/40 hover:scale-110 transition-transform animate-bounce md:bottom-10"
                    style={{ animationDuration: '2s' }}
                    title={t("t_72b3f7ca")}
                >
                    <svg className="w-8 h-8 text-white relative right-[1px]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
            )}
        </div>
    );
}
