/**
 * Pixel Event Tracking Utilities
 * Call these functions from storefront pages to track user actions.
 */

declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
        ttq?: any;
        gtag?: (...args: any[]) => void;
        snaptr?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

// ─── Track "Add to Cart" ───
export function trackAddToCart(product: {
    id: string;
    name: string;
    price: number;
    currency?: string;
}) {
    const currency = product.currency || 'DZD';

    // Facebook
    if (window.fbq) {
        window.fbq('track', 'AddToCart', {
            content_ids: [product.id],
            content_name: product.name,
            content_type: 'product',
            value: product.price,
            currency,
        });
    }

    // TikTok
    if (window.ttq) {
        window.ttq.track('AddToCart', {
            content_id: product.id,
            content_name: product.name,
            content_type: 'product',
            value: product.price,
            currency,
        });
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', 'add_to_cart', {
            currency,
            value: product.price,
            items: [{ item_id: product.id, item_name: product.name, price: product.price }],
        });
    }

    // Snapchat
    if (window.snaptr) {
        window.snaptr('track', 'ADD_CART', {
            item_ids: [product.id],
            price: product.price,
            currency,
        });
    }
}

// ─── Track "Initiate Checkout" ───
export function trackInitiateCheckout(order: {
    value: number;
    currency?: string;
    productIds?: string[];
}) {
    const currency = order.currency || 'DZD';

    if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
            value: order.value,
            currency,
            content_ids: order.productIds || [],
        });
    }

    if (window.ttq) {
        window.ttq.track('InitiateCheckout', {
            value: order.value,
            currency,
        });
    }

    if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
            currency,
            value: order.value,
        });
    }

    if (window.snaptr) {
        window.snaptr('track', 'START_CHECKOUT', {
            price: order.value,
            currency,
        });
    }
}

// ─── Track "Purchase" (Conversion) ───
export function trackPurchase(order: {
    orderId: string;
    value: number;
    currency?: string;
    productIds?: string[];
    productNames?: string[];
}) {
    const currency = order.currency || 'DZD';

    if (window.fbq) {
        window.fbq('track', 'Purchase', {
            content_ids: order.productIds || [],
            content_type: 'product',
            value: order.value,
            currency,
            order_id: order.orderId,
        });
    }

    if (window.ttq) {
        window.ttq.track('CompletePayment', {
            content_id: order.productIds?.[0] || '',
            content_type: 'product',
            value: order.value,
            currency,
        });
    }

    if (window.gtag) {
        window.gtag('event', 'purchase', {
            transaction_id: order.orderId,
            value: order.value,
            currency,
            items: (order.productIds || []).map((id, i) => ({
                item_id: id,
                item_name: order.productNames?.[i] || '',
            })),
        });
    }

    if (window.snaptr) {
        window.snaptr('track', 'PURCHASE', {
            price: order.value,
            currency,
            transaction_id: order.orderId,
            item_ids: order.productIds || [],
        });
    }
}

// ─── Track "View Content" (Product Page View) ───
export function trackViewContent(product: {
    id: string;
    name: string;
    price: number;
    currency?: string;
}) {
    const currency = product.currency || 'DZD';

    if (window.fbq) {
        window.fbq('track', 'ViewContent', {
            content_ids: [product.id],
            content_name: product.name,
            content_type: 'product',
            value: product.price,
            currency,
        });
    }

    if (window.ttq) {
        window.ttq.track('ViewContent', {
            content_id: product.id,
            content_name: product.name,
            content_type: 'product',
            value: product.price,
            currency,
        });
    }

    if (window.gtag) {
        window.gtag('event', 'view_item', {
            currency,
            value: product.price,
            items: [{ item_id: product.id, item_name: product.name, price: product.price }],
        });
    }

    if (window.snaptr) {
        window.snaptr('track', 'VIEW_CONTENT', {
            item_ids: [product.id],
            price: product.price,
            currency,
        });
    }
}
