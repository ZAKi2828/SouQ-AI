import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { getCarrierInfo } from '@/lib/vargoClones';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, storeDomain } = body;

        if (!orderId || !storeDomain) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch store settings
        const { data: store, error: storeError } = await insforge.database
            .from('stores')
            .select('shipping_provider, shipping_api_token, shipping_api_id, shipping_from_wilaya, shipping_ecotrack_boutique, shipping_use_stock, shipping_is_exchange, shipping_is_insured, shipping_is_express')
            .eq('store_domain', storeDomain)
            .single();

        if (storeError || !store) return NextResponse.json({ error: 'Store not found' }, { status: 500 });
        if (!store.shipping_provider || store.shipping_provider === 'none') return NextResponse.json({ error: 'لا توجد شركة شحن مفعلة في الإعدادات.' }, { status: 400 });
        if (!store.shipping_api_token) return NextResponse.json({ error: 'الرجاء إدخال رمز API الخاص بشركة الشحن أولاً في الإعدادات.' }, { status: 400 });

        // 2. Fetch Order Data to send to the shipping company
        const { data: order } = await insforge.database
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        let trackingNumber = '';
        let labelUrl = '';

        const carrierInfo = getCarrierInfo(store.shipping_provider);

        // Check if sandbox/test credentials are used
        const isSandbox = store.shipping_api_token.toLowerCase() === 'sandbox' || store.shipping_api_token.toLowerCase() === 'test';

        if (isSandbox) {
            trackingNumber = `SANDBOX-${carrierInfo?.id?.toUpperCase() || 'TEST'}-${Math.floor(100000 + Math.random() * 900000)}`;
            labelUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        } else {

        // -------------------------------------------------------------
        // INTEGRATION WITH REAL ALGERIAN LOGISTICS APIs
        // Based on KaziSTM/vargo driver analysis
        // -------------------------------------------------------------

        const names = order.customer_name ? order.customer_name.split(' ') : ['Client', ''];
        const firstname = names[0] || 'Client';
        const familyname = names.slice(1).join(' ') || 'Client';

        // Helper to check if notes indicate Stop Desk
        const isStopDesk = order.notes?.toLowerCase().includes('stop desk') ||
            order.notes?.toLowerCase().includes('desk') ||
            order.notes?.includes('مكتب');

        let isFreeShipping = false; // Typically standard ecommerce consumer pays shipping

        const addressParts = order.customer_address ? order.customer_address.split('|').map((p: string) => p.trim()) : [];
        const actualAddress = addressParts[0] || order.customer_state || 'Alger';
        const communeName = addressParts[1] || order.customer_state || 'Alger';

        // ═══════════════════════════════════════════════════════════════
        // 1. YALIDINE FAMILY — X-API-ID + X-API-TOKEN
        // Yalidine, Yalitec, Guepex, Economiqua, Easy & Speed, We Can
        // ═══════════════════════════════════════════════════════════════
        if (carrierInfo?.family === 'yalidine') {
            const baseUrl = carrierInfo.baseUrl;
            const yalidineResponse = await fetch(`${baseUrl}/v1/parcels/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-ID': store.shipping_api_id,
                    'X-API-TOKEN': store.shipping_api_token
                },
                body: JSON.stringify([{
                    order_id: order.id.toString(),
                    from_wilaya_name: store.shipping_from_wilaya || "Alger",
                    firstname: firstname,
                    familyname: familyname,
                    contact_phone: order.customer_phone,
                    address: actualAddress,
                    to_wilaya_name: order.customer_state,
                    to_commune_name: communeName,
                    product_list: order.product_name || 'Commande SOUQ AI',
                    price: order.total_price,
                    freeshipping: isFreeShipping,
                    is_stopdesk: !!isStopDesk,
                    has_exchange: !!store.shipping_is_exchange,
                    do_insurance: !!store.shipping_is_insured,
                    declared_value: store.shipping_is_insured ? order.total_price : 0,
                    length: 0, width: 0, height: 0, weight: 0
                }])
            });

            const result = await yalidineResponse.json();
            if (!yalidineResponse.ok || result[order.id.toString()]?.success === 'false' || result[order.id.toString()]?.success === false) {
                return NextResponse.json({ error: result[order.id.toString()]?.message || result.message || `فشل في الاتصال بموفر الشحن (${carrierInfo.name}).` }, { status: 400 });
            }

            trackingNumber = result[order.id.toString()]?.tracking || `YAL${Date.now()}`;
            labelUrl = `${baseUrl.replace('api.', '').replace('/v1/', '')}/app/bordereau/?tracking=${trackingNumber}`;
        }

        // ═══════════════════════════════════════════════════════════════
        // 2. ZR EXPRESS — X-Api-Key + X-Tenant (INDEPENDENT, NOT PROCOLIS!)
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'zr') {
            const baseUrl = carrierInfo.baseUrl; // https://api.zrexpress.app
            const zrResponse = await fetch(`${baseUrl}/api/v1/parcels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': store.shipping_api_token,  // field2 = api_key
                    'X-Tenant': store.shipping_api_id || ''  // field1 = tenant_id
                },
                body: JSON.stringify({
                    reference: order.id.toString(),
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    address: actualAddress,
                    wilaya_id: parseInt(order.customer_state) || 16,
                    commune: communeName,
                    price: order.total_price,
                    product: order.product_name || 'Product',
                    delivery_type: isStopDesk ? 'stopdesk' : 'home',
                    has_exchange: !!store.shipping_is_exchange,
                    note: order.notes || 'SOUQ AI',
                })
            });

            const result = await zrResponse.json();
            if (!zrResponse.ok || result.success === false) {
                return NextResponse.json({ error: result.message || `فشل في الاتصال بـ ZR Express.` }, { status: 400 });
            }

            trackingNumber = result.data?.tracking || result.tracking || `ZR${Date.now()}`;
            labelUrl = result.data?.label_url || '';
        }

        // ═══════════════════════════════════════════════════════════════
        // 3. PROCOLIS FAMILY — Token + Key headers
        // Procolis, ABEX, Leopard, Colilog, Flash Delivery
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'procolis') {
            const baseUrl = carrierInfo.baseUrl; // https://procolis.com/api_v1
            const procolisResponse = await fetch(`${baseUrl}/add_colis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Token': store.shipping_api_token,  // field2 = token
                    'Key': store.shipping_api_id || store.shipping_api_token  // field1 = key
                },
                body: JSON.stringify({
                    Colis: [{
                        TypeLivraison: isStopDesk ? 1 : 0,
                        TypeColis: store.shipping_is_exchange ? 1 : 0,
                        Confrimee: 1,
                        Client: order.customer_name,
                        MobileA: order.customer_phone,
                        Adresse: actualAddress,
                        IDWilaya: parseInt(order.customer_state) || 16,
                        Commune: communeName,
                        Total: order.total_price,
                        Note: order.notes || 'SOUQ AI',
                        TProduit: order.product_name || 'Product',
                        id_Externe: order.id.toString()
                    }]
                })
            });

            const result = await procolisResponse.json();
            if (!procolisResponse.ok || result.Colis?.[0]?.MessageRetour !== 'Good') {
                return NextResponse.json({ error: result.Colis?.[0]?.MessageRetour || `فشل في الاتصال بموفر الشحن (${carrierInfo.name}).` }, { status: 400 });
            }

            trackingNumber = result.Colis?.[0]?.Tracking || `PRO${Date.now()}`;
            labelUrl = result.Colis?.[0]?.Bordereau || `${baseUrl.replace('/api_v1', '')}/pdf/${trackingNumber}`;
        }

        // ═══════════════════════════════════════════════════════════════
        // 4. ECOTRACK FAMILY — Authorization: Bearer <token>
        // 50+ carriers (EcoTrack, Samex, DHD, GoLivri, Packers, etc.)
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'ecotrack') {
            const baseUrl = carrierInfo.baseUrl;
            const ecoResponse = await fetch(`${baseUrl}/api/v1/create/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store.shipping_api_token}`
                },
                body: JSON.stringify({
                    reference: order.id.toString(),
                    nom_client: order.customer_name,
                    telephone: order.customer_phone,
                    adresse: actualAddress,
                    code_wilaya: parseInt(order.customer_state) || 16,
                    commune: communeName,
                    montant: order.total_price,
                    produit: order.product_name,
                    type: store.shipping_is_exchange ? 2 : 1,
                    stop_desk: isStopDesk ? 1 : 0,
                    stock: store.shipping_use_stock ? 1 : 0,
                    produit_a_recupere: '',
                    ...(store.shipping_use_stock ? { quantite: 1 } : {}),
                    ...(store.shipping_ecotrack_boutique ? { boutique: store.shipping_ecotrack_boutique } : {})
                })
            });

            const result = await ecoResponse.json();
            if (!ecoResponse.ok || result.success === false) {
                return NextResponse.json({ error: result.message || `فشل في الاتصال بموفر الشحن (${carrierInfo.name}).` }, { status: 400 });
            }

            trackingNumber = result.tracking_code || result.data?.tracking || `ECO${Date.now()}`;
            labelUrl = result.bordereau_url || '';
        }

        // ═══════════════════════════════════════════════════════════════
        // 5. NOEST — Bearer Token + user_guid in request body
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'noest') {
            const baseUrl = carrierInfo.baseUrl; // https://app.noest-dz.com
            const noestResponse = await fetch(`${baseUrl}/api/parcels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${store.shipping_api_token}`
                },
                body: JSON.stringify({
                    user_guid: store.shipping_api_id, // field1 = user_guid
                    reference: order.id.toString(),
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    address: actualAddress,
                    wilaya_id: parseInt(order.customer_state) || 16,
                    commune: communeName,
                    price: order.total_price,
                    product: order.product_name || 'Product',
                    delivery_type: isStopDesk ? 'stopdesk' : 'home',
                    has_exchange: !!store.shipping_is_exchange,
                    note: order.notes || 'SOUQ AI',
                })
            });

            const result = await noestResponse.json();
            if (!noestResponse.ok || result.success === false) {
                return NextResponse.json({ error: result.message || `فشل في الاتصال بـ Noest.` }, { status: 400 });
            }

            trackingNumber = result.data?.tracking || result.tracking || `NST${Date.now()}`;
            labelUrl = result.data?.label_url || '';
        }

        // ═══════════════════════════════════════════════════════════════
        // 6. MAYSTRO DELIVERY — Authorization: <token>, store_id
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'maystro') {
            const baseUrl = carrierInfo.baseUrl; // https://b.maystro-delivery.com/api
            const maystroResponse = await fetch(`${baseUrl}/stores/orders/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${store.shipping_api_token}`
                },
                body: JSON.stringify({
                    external_order_id: order.id.toString(),
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    destination_text: actualAddress,
                    wilaya: parseInt(order.customer_state) || 16,
                    commune: communeName || 1,
                    product_price: order.total_price,
                    note_to_driver: order.notes,
                    products: [order.product_name || 'Item'],
                    delivery_type: isStopDesk ? 1 : 0,
                    express: !!store.shipping_is_express,
                    source: 4
                })
            });

            const result = await maystroResponse.json();
            if (!maystroResponse.ok) return NextResponse.json({ error: result.message || 'فشل الاتصال بـ Maystro.' }, { status: 400 });

            trackingNumber = result.id || result.tracking || `MYS${Date.now()}`;
            labelUrl = `https://maystro-delivery.com/trackingSD.html`;
        }

        // ═══════════════════════════════════════════════════════════════
        // 7. ELOGISTIA — API Key as request param
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'elogistia') {
            const baseUrl = carrierInfo.baseUrl; // https://api.elogistia.com
            const elogResponse = await fetch(`${baseUrl}/createOrder?key=${encodeURIComponent(store.shipping_api_token)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    reference: order.id.toString(),
                    nom_client: order.customer_name,
                    telephone: order.customer_phone,
                    adresse: actualAddress,
                    wilaya: parseInt(order.customer_state) || 16,
                    commune: communeName,
                    montant: order.total_price,
                    produit: order.product_name || 'Product',
                    type_livraison: isStopDesk ? 'stopdesk' : 'domicile',
                    echange: !!store.shipping_is_exchange,
                    remarque: order.notes || 'SOUQ AI',
                })
            });

            const result = await elogResponse.json();
            if (!elogResponse.ok || result.success === false) {
                return NextResponse.json({ error: result.message || `فشل في الاتصال بـ Elogistia.` }, { status: 400 });
            }

            trackingNumber = result.data?.tracking || result.tracking || `ELG${Date.now()}`;
            labelUrl = result.data?.label_url || '';
        }

        // ═══════════════════════════════════════════════════════════════
        // 8. ECOM DELIVERY — Token + Key headers (similar to Procolis)
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'ecom') {
            const baseUrl = carrierInfo.baseUrl; // https://ecom-dz.net
            const ecomResponse = await fetch(`${baseUrl}/Api_v1/add_colis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Token': store.shipping_api_token,
                    'Key': store.shipping_api_id || '',
                },
                body: JSON.stringify({
                    Colis: [{
                        TypeLivraison: isStopDesk ? 1 : 0,
                        TypeColis: store.shipping_is_exchange ? 1 : 0,
                        Confrimee: 1,
                        Client: order.customer_name,
                        MobileA: order.customer_phone,
                        Adresse: actualAddress,
                        IDWilaya: parseInt(order.customer_state) || 16,
                        Commune: communeName,
                        Total: order.total_price,
                        Note: order.notes || 'SOUQ AI',
                        TProduit: order.product_name || 'Product',
                        id_Externe: order.id.toString()
                    }]
                })
            });

            const result = await ecomResponse.json();
            if (!ecomResponse.ok) {
                return NextResponse.json({ error: result.Colis?.[0]?.MessageRetour || `فشل في الاتصال بـ Ecom Delivery.` }, { status: 400 });
            }

            trackingNumber = result.Colis?.[0]?.Tracking || `ECOM${Date.now()}`;
            labelUrl = result.Colis?.[0]?.Bordereau || '';
        }

        // ═══════════════════════════════════════════════════════════════
        // 9. NEAR DELIVERY — ApiKey + ApiSecret headers
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'near') {
            const baseUrl = carrierInfo.baseUrl; // https://api.neardelivery.app/api/v1
            const nearResponse = await fetch(`${baseUrl}/parcels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ApiKey': store.shipping_api_id || '',
                    'ApiSecret': store.shipping_api_token,
                },
                body: JSON.stringify({
                    reference: order.id.toString(),
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    address: actualAddress,
                    wilaya_id: parseInt(order.customer_state) || 16,
                    commune: communeName,
                    price: order.total_price,
                    product: order.product_name || 'Product',
                    delivery_type: isStopDesk ? 'stopdesk' : 'home',
                    has_exchange: !!store.shipping_is_exchange,
                    note: order.notes || 'SOUQ AI',
                })
            });

            const result = await nearResponse.json();
            if (!nearResponse.ok || result.success === false) {
                return NextResponse.json({ error: result.message || `فشل في الاتصال بـ Near Delivery.` }, { status: 400 });
            }

            trackingNumber = result.data?.tracking || result.tracking || `NR${Date.now()}`;
            labelUrl = result.data?.label_url || '';
        }

        // ═══════════════════════════════════════════════════════════════
        // 10. MDM EXPRESS — x-api-key header + store_id
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'mdm') {
            const baseUrl = carrierInfo.baseUrl; // https://api.mdm.express
            const mdmResponse = await fetch(`${baseUrl}/api/v1/parcels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-api-key': store.shipping_api_token,
                },
                body: JSON.stringify({
                    store_id: store.shipping_api_id || '',
                    reference: order.id.toString(),
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    address: actualAddress,
                    wilaya_id: parseInt(order.customer_state) || 16,
                    commune: communeName,
                    price: order.total_price,
                    product: order.product_name || 'Product',
                    delivery_type: isStopDesk ? 'stopdesk' : 'home',
                    has_exchange: !!store.shipping_is_exchange,
                    note: order.notes || 'SOUQ AI',
                })
            });

            const result = await mdmResponse.json();
            if (!mdmResponse.ok || result.success === false) {
                return NextResponse.json({ error: result.message || `فشل في الاتصال بـ MDM Express.` }, { status: 400 });
            }

            trackingNumber = result.data?.tracking || result.tracking || `MDM${Date.now()}`;
            labelUrl = result.data?.label_url || '';
        }

        // ═══════════════════════════════════════════════════════════════
        // 11. ZIMOU EXPRESS — Authorization: Bearer <token>
        // ═══════════════════════════════════════════════════════════════
        else if (carrierInfo?.family === 'zimou') {
            const baseUrl = carrierInfo.baseUrl; // https://zimou.express/api
            const zimouResponse = await fetch(`${baseUrl}/v3/parcels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${store.shipping_api_token}`,
                },
                body: JSON.stringify({
                    reference: order.id.toString(),
                    customer_name: order.customer_name,
                    customer_phone: order.customer_phone,
                    address: actualAddress,
                    wilaya_id: parseInt(order.customer_state) || 16,
                    commune: communeName,
                    price: order.total_price,
                    product: order.product_name || 'Product',
                    delivery_type: isStopDesk ? 'stopdesk' : 'home',
                    has_exchange: !!store.shipping_is_exchange,
                    note: order.notes || 'SOUQ AI',
                })
            });

            const result = await zimouResponse.json();
            if (!zimouResponse.ok || result.success === false) {
                return NextResponse.json({ error: result.message || `فشل في الاتصال بـ Zimou Express.` }, { status: 400 });
            }

            trackingNumber = result.data?.tracking || result.tracking || `ZMO${Date.now()}`;
            labelUrl = result.data?.label_url || '';
        }

        }


        // 3. Update the order with tracking info in Database
        const { error: updateError } = await insforge.database
            .from('orders')
            .update({
                tracking_number: trackingNumber,
                shipping_company: store.shipping_provider,
                shipping_label_url: labelUrl,
                status: 'shipping' // Auto update status to shipping when label is created
            })
            .eq('id', orderId);

        if (updateError) {
            console.error(updateError);
            return NextResponse.json({ error: 'تم إرسال الطلب لشركة الشحن، لكن فشل حفظ الرقم في قاعدة البيانات.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            trackingNumber: trackingNumber,
            labelUrl: labelUrl,
            company: store.shipping_provider,
            message: 'تم تفويض شركة التوصيل بنجاح وجلب رقم التتبع (Bordereau).'
        }, { status: 200 });

    } catch (error) {
        console.error('Shipping API Error:', error);
        return NextResponse.json({ error: 'حدث خطأ داخلي في نظام المنصة أثناء الاتصال بشركة الشحن.' }, { status: 500 });
    }
}
