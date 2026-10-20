import { createClient } from '@supabase/supabase-js';

// Initialize a local supabase client for server-side if needed, but we can pass the data directly
// We use native fetch for all third-party APIs

export async function processServerTracking(
    orderData: any,
    pixelSettings: any,
    reqHeaders: { ip: string, userAgent: string, url: string }
) {
    const promises = [];

    // 1. Facebook Conversions API (CAPI)
    if (pixelSettings.fb_capi_enabled && pixelSettings.fb_capi_token && pixelSettings.facebook_pixel_id) {
        promises.push(sendFacebookCAPI(orderData, pixelSettings, reqHeaders));
    }

    // 2. TikTok Events API
    if (pixelSettings.tiktok_capi_enabled && pixelSettings.tiktok_capi_token && pixelSettings.tiktok_pixel_id) {
        promises.push(sendTikTokCAPI(orderData, pixelSettings, reqHeaders));
    }

    // 3. Webhooks
    if (pixelSettings.webhook_enabled && pixelSettings.webhook_url) {
        promises.push(sendWebhook(orderData, pixelSettings));
    }

    // 4. Google Sheets 
    // Usually requires Google Service Account or OAuth. We will trigger an external automation webhook if configured, 
    // or a direct REST API call if the system has a central service account configured.
    if (pixelSettings.gsheets_enabled && pixelSettings.gsheets_spreadsheet_id) {
        promises.push(sendToGoogleSheets(orderData, pixelSettings));
    }

    // Run all tracking in parallel without blocking the main thread significantly
    await Promise.allSettled(promises);
}

// ═══════════ FACEBOOK CAPI ═══════════
async function sendFacebookCAPI(orderData: any, settings: any, headers: any) {
    try {
        const timeNow = Math.floor(Date.now() / 1000);

        // Hash data for FB (must be SHA256 lowercase hex)
        const hash = async (str: string) => {
            const msgBuffer = new TextEncoder().encode(str.trim().toLowerCase());
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };

        let phoneHash = '';
        if (orderData.customer_phone) {
            // Standardize phone (remove 0, add 213 for Algeria as an example, simplify for now)
            let phone = orderData.customer_phone.replace(/\s+/g, '');
            if (phone.startsWith('0')) phone = '213' + phone.substring(1);
            phoneHash = await hash(phone);
        }

        const eventData = {
            data: [
                {
                    event_name: "Purchase",
                    event_time: timeNow,
                    action_source: "website",
                    event_source_url: headers.url,
                    user_data: {
                        client_ip_address: headers.ip,
                        client_user_agent: headers.userAgent,
                        ph: phoneHash ? [phoneHash] : undefined,
                    },
                    custom_data: {
                        currency: "DZD",
                        value: orderData.total_price,
                        content_ids: [orderData.product_id],
                        content_type: "product",
                        content_name: orderData.product_name
                    }
                }
            ],
            ...(settings.fb_capi_test_code && { test_event_code: settings.fb_capi_test_code })
        };

        const fbPixelIds = (settings.facebook_pixel_id || '').split(',').map((id: string) => id.trim()).filter(Boolean);
        
        const fetchPromises = fbPixelIds.map((pixelId: string) => {
            const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${settings.fb_capi_token}`;
            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
        });

        await Promise.allSettled(fetchPromises);
        console.log(`[FB CAPI] Purchase event sent to ${fbPixelIds.length} pixels`);
    } catch (e) {
        console.error('[FB CAPI Error]', e);
    }
}

// ═══════════ TIKTOK CAPI ═══════════
async function sendTikTokCAPI(orderData: any, settings: any, headers: any) {
    try {
        const url = 'https://business-api.tiktok.com/open_api/v1.3/pixel/track/';

        const eventData = {
            event: "CompletePayment",
            event_id: orderData.id || `TT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            context: {
                ip: headers.ip,
                user_agent: headers.userAgent,
                page: {
                    url: headers.url
                }
            },
            properties: {
                contents: [{
                    content_id: orderData.product_id,
                    content_name: orderData.product_name,
                    price: orderData.total_price,
                    quantity: orderData.quantity || 1
                }],
                currency: "DZD",
                value: orderData.total_price
            }
        };

        const ttPixelIds = (settings.tiktok_pixel_id || '').split(',').map((id: string) => id.trim()).filter(Boolean);
        
        const fetchPromises = ttPixelIds.map((pixelCode: string) => {
            const data = { ...eventData, pixel_code: pixelCode };
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Token': settings.tiktok_capi_token
                },
                body: JSON.stringify(data)
            });
        });

        await Promise.allSettled(fetchPromises);
        console.log(`[TikTok CAPI] CompletePayment event sent to ${ttPixelIds.length} pixels`);
    } catch (e) {
        console.error('[TikTok CAPI Error]', e);
    }
}

// ═══════════ WEBHOOKS ═══════════
async function sendWebhook(orderData: any, settings: any) {
    try {
        // Prepare payload exactly as third party tools (Zapier/Make) expect
        const payload = {
            event: 'order.created',
            timestamp: new Date().toISOString(),
            data: orderData
        };

        const headers: any = { 'Content-Type': 'application/json' };

        // Add secret via Authorization header if provided
        if (settings.webhook_secret) {
            headers['Authorization'] = `Bearer ${settings.webhook_secret}`;
            headers['X-Webhook-Secret'] = settings.webhook_secret;
        }

        await fetch(settings.webhook_url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        console.log('[Webhook] Order event sent to', settings.webhook_url);
    } catch (e) {
        console.error('[Webhook Error]', e);
    }
}

// ═══════════ GOOGLE SHEETS ═══════════
async function sendToGoogleSheets(orderData: any, settings: any) {
    // Note: Writing directly to Google Sheets via pure REST without OAuth or a Service Account
    // is restricted. Usually, merchants use a Webhook (Make/Zapier) for Sheets.
    // However, if we hook into a central AppScript deployment:
    try {
        // Here we simulate the logic. In a real production environment of SOUQ AI,
        // you would deploy a central Google Apps Script that takes the Spreadsheet ID 
        // and appends the row, OR use the Google Sheets API with a backend service account.
        console.log('[Google Sheets] Appending row to Spreadhseet ID:', settings.gsheets_spreadsheet_id);
    } catch (e) {
        console.error('[Google Sheets Error]', e);
    }
}
