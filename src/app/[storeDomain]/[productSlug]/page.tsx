import FashionTemplate from '@/components/templates/FashionTemplate';
import TechTemplate from '@/components/templates/TechTemplate';
import PerfumeTemplate from '@/components/templates/PerfumeTemplate';
import FoodTemplate from '@/components/templates/FoodTemplate';
import SkincareTemplate from '@/components/templates/SkincareTemplate';
import DigitalTemplate from '@/components/templates/DigitalTemplate';
import DecorTemplate from '@/components/templates/DecorTemplate';
import ImageTemplate from '@/components/templates/ImageTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import BoldTemplate from '@/components/templates/BoldTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import FreshTemplate from '@/components/templates/FreshTemplate';
import LuxuryTemplate from '@/components/templates/LuxuryTemplate';
import StoreNotFoundTemplate from '@/components/templates/StoreNotFoundTemplate';
import SimpleTemplate from '@/components/templates/SimpleTemplate';
import ClassicProTemplate from '@/components/templates/ClassicProTemplate';
import PixelScripts from '@/components/PixelScripts';
import { ProductOptionsProvider } from '@/components/ProductOptionsProvider';

import { insforge } from '@/lib/insforge';

export default async function ProductLandingPage({ params }: { params: Promise<{ storeDomain: string, productSlug: string }> }) {
    const resolvedParams = await params;
    console.log('[ProductLandingPage] params:', resolvedParams);

    // Explicitly decode just in case Next.js passed it encoded
    const productSlug = decodeURIComponent(resolvedParams.productSlug);
    const storeDomain = decodeURIComponent(resolvedParams.storeDomain);
    console.log('[ProductLandingPage] decoded params:', { storeDomain, productSlug });

    // Fetch the store to get the true store_domain
    const { data: stores, error: storeError } = await insforge.database
        .from('stores')
        .select('store_domain, hide_branding, store_name, logo_url, store_color, announcement_text, checkout_bg_color, checkout_input_bg, checkout_input_border, checkout_price_bg, checkout_price_border, checkout_badge_bg, checkout_show_whatsapp, checkout_show_fake_reviews, checkout_use_custom, phone_number, checkout_button_text, checkout_button_icon, checkout_button_bg, checkout_button_color')
        .or(`store_domain.eq.${storeDomain},custom_domain.eq.${storeDomain}`)
        .limit(1);

    if (storeError || !stores || stores.length === 0) {
        return (
            <div dir="ltr" style={{ padding: '20px', fontFamily: 'monospace' }}>
                <h2>Debug 404: Store Not Found</h2>
                <pre>{JSON.stringify({
                    passedStoreDomain: resolvedParams.storeDomain,
                    decodedStoreDomain: storeDomain,
                    error: storeError
                }, null, 2)}</pre>
            </div>
        );
    }

    const store = stores[0];
    const trueStoreDomain = store.store_domain;

    // Fetch the product from actual InsForge DB using trueStoreDomain
    const { data: products, error } = await insforge.database
        .from('products')
        .select(`
            id,
            user_id,
            store_domain,
            name,
            description,
            price,
            compare_at_price,
            image_url,
            template,
            status,
            shipping_free,
            shipping_office_free,
            shipping_home_price,
            shipping_office_price,
            options,
            images,
            upsell_enabled,
            upsell_title,
            upsell_bundles,
            product_countdown_enabled,
            countdown_text,
            countdown_duration
        `)
        .eq('store_domain', trueStoreDomain)
        .eq('product_slug', productSlug)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

    const product = products?.[0];

    if (error || !product) {
        // Default if product doesn't exist or not active
        return (
            <div dir="ltr" style={{ padding: '20px', fontFamily: 'monospace' }}>
                <h2>Debug 404</h2>
                <pre>{JSON.stringify({
                    passedStoreDomain: resolvedParams.storeDomain,
                    passedProductSlug: resolvedParams.productSlug,
                    decodedStoreDomain: storeDomain,
                    decodedProductSlug: productSlug,
                    trueStoreDomain,
                    error,
                    product
                }, null, 2)}</pre>
            </div>
        );
    }

    // Check user plan to auto-hide SOUQ AI branding for paid users
    const { data: profile } = await insforge.database
        .from('profiles')
        .select('plan, is_paid')
        .eq('id', product.user_id)
        .single();
        
    const isPaid = profile && (profile.plan === 'pro' || profile.plan === 'vip' || profile.is_paid === true);
    
    // Respect store.hide_branding if set by admin, otherwise fallback to plan-based check
    let hideBranding = false;
    if (store && (store.hide_branding === true || store.hide_branding === false)) {
        hideBranding = store.hide_branding;
    } else {
        hideBranding = isPaid ? true : false;
    }



    const mappedProduct = {
        id: product.id,
        user_id: product.user_id,
        store_domain: product.store_domain,
        name: product.name || 'منتج بدون اسم',
        description: product.description || '',
        price: product.price ? product.price.toString() : '0',
        compareAtPrice: product.compare_at_price ? product.compare_at_price.toString() : undefined,
        imageUrl: product.image_url || 'https://placehold.co/800x800',
        shipping_free: product.shipping_free,
        shipping_office_free: product.shipping_office_free,
        shipping_home_price: product.shipping_home_price,
        shipping_office_price: product.shipping_office_price,
        options: product.options,
        images: product.images || [],
        hide_branding: hideBranding,
        logoUrl: store?.logo_url || null,
        storeName: store?.store_name || null,
        checkout_bg_color: store?.checkout_bg_color || null,
        checkout_input_bg: store?.checkout_input_bg || null,
        checkout_input_border: store?.checkout_input_border || null,
        checkout_price_bg: store?.checkout_price_bg || null,
        checkout_price_border: store?.checkout_price_border || null,
        checkout_badge_bg: store?.checkout_badge_bg || null,
        checkout_show_whatsapp: store?.checkout_show_whatsapp ?? true,
        checkout_show_fake_reviews: store?.checkout_show_fake_reviews ?? true,
        checkout_use_custom: store?.checkout_use_custom || false,
        checkout_button_text: store?.checkout_button_text || 'اطلب الآن',
        checkout_button_icon: store?.checkout_button_icon || 'check_circle',
        checkout_button_bg: store?.checkout_button_bg || '#E91E63',
        checkout_button_color: store?.checkout_button_color || '#ffffff',
        storePhone: store?.phone_number || null,
        store_color: store?.store_color || '#008096',
        announcement_text: store?.announcement_text || '',
        upsell_enabled: product.upsell_enabled || false,
        upsell_title: product.upsell_title || '',
        upsell_bundles: product.upsell_bundles || [],
        product_countdown_enabled: product.product_countdown_enabled || false,
        countdown_text: product.countdown_text || 'ينتهي العرض خلال:',
        countdown_duration: product.countdown_duration || '60'
    };

    // Render based on the template saved in DB
    const pixelUserId = product.user_id;

    let TemplateComponent = <TechTemplate product={mappedProduct} />;
    
    switch (product.template) {
        case 'fashion': TemplateComponent = <FashionTemplate product={mappedProduct} />; break;
        case 'perfumes':
        case 'perfume': TemplateComponent = <PerfumeTemplate product={mappedProduct} />; break;
        case 'food': TemplateComponent = <FoodTemplate product={mappedProduct} />; break;
        case 'skincare': TemplateComponent = <SkincareTemplate product={mappedProduct} />; break;
        case 'digital': TemplateComponent = <DigitalTemplate product={mappedProduct} />; break;
        case 'decor': TemplateComponent = <DecorTemplate product={mappedProduct} />; break;
        case 'image': TemplateComponent = <ImageTemplate product={mappedProduct} />; break;
        case 'classic': TemplateComponent = <ClassicTemplate product={mappedProduct} />; break;
        case 'bold': TemplateComponent = <BoldTemplate product={mappedProduct} />; break;
        case 'minimal': TemplateComponent = <MinimalTemplate product={mappedProduct} />; break;
        case 'elegant': TemplateComponent = <ElegantTemplate product={mappedProduct} />; break;
        case 'fresh': TemplateComponent = <FreshTemplate product={mappedProduct} />; break;
        case 'luxury': TemplateComponent = <LuxuryTemplate product={mappedProduct} />; break;
        case 'simple': TemplateComponent = <SimpleTemplate product={mappedProduct} store={{ store_color: store?.store_color, announcement_text: store?.announcement_text, store_name: store?.store_name }} />; break;
        case 'classic-pro':
        case 'classic_professional': TemplateComponent = <ClassicProTemplate product={mappedProduct} store={{ store_color: store?.store_color, announcement_text: store?.announcement_text, store_name: store?.store_name }} />; break;
    }

    return (
        <ProductOptionsProvider>
            <PixelScripts userId={pixelUserId} storeDomain={trueStoreDomain} productSlug={productSlug} />
            {TemplateComponent}
        </ProductOptionsProvider>
    );
}
