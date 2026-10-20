import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { processServerTracking } from '@/lib/serverTracking';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const customer_ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0';

        if (!body.product_id || !body.store_domain || !body.customer_phone) {
            return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
        }

        // Always validate Algerian phone format (10 digits, starts with 05/06/07)
        const phoneClean = (body.customer_phone || '').replace(/\s+/g, '');
        if (phoneClean.length !== 10 || !/^0[567]\d{8}$/.test(phoneClean)) {
            return NextResponse.json({ error: 'رقم الهاتف غير صحيح. يجب أن يكون رقم جزائري من 10 أرقام يبدأ بـ 05، 06، أو 07' }, { status: 400 });
        }

        // 1. Fetch Store details to find the user_id (the merchant) and true store_domain
        const { data: store, error: storeError } = await insforge.database
            .from('stores')
            .select('user_id, store_domain')
            .or(`store_domain.eq.${body.store_domain},custom_domain.eq.${body.store_domain}`)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'المتجر غير موجود' }, { status: 404 });
        }

        const merchantId = store.user_id;
        const trueStoreDomain = store.store_domain;

        // 2. Fetch the Merchant's pixel settings early for Anti-Fraud
        const { data: pixelSettings } = await insforge.database
            .from('store_pixels')
            .select('*')
            .eq('user_id', merchantId)
            .single();

        // 3. Anti-Fraud Checks
        let riskScore = 'safe';
        let fraudFlags: string[] = [];
        
        if (pixelSettings?.anti_fraud_enabled) {
            
            // Check configs with sensible defaults
            const maxIpOrdersStr = pixelSettings.anti_fraud_max_orders_ip?.trim() || '3';
            const blockForeign = pixelSettings.anti_fraud_block_foreign?.trim() !== 'false'; // default true
            const blockAction = pixelSettings.anti_fraud_block_action?.trim() === 'flag' ? 'flag' : 'block'; // default block
            
            // 3.0 Instant Ban Check (Blacklist)
            const isBannedPhone = pixelSettings.banned_phones?.includes(body.customer_phone);
            const isBannedIp = pixelSettings.banned_ips?.includes(customer_ip);
            
            if (isBannedPhone || (customer_ip !== '0.0.0.0' && isBannedIp)) {
                return NextResponse.json({ status: 'blocked', error: 'عذراً، نظام الحماية الخاصة بالمتجر يرفض استلام طلبك.' }, { status: 403 });
            }

            // Check honeypot (if filled, it's a bot)
            if (body.honeypot) {
                fraudFlags.push('تم تعبئة حقل Honeypot (بوت روبوت)');
            }
            
            // Check time elapsed (if less than 3 seconds it's a bot)
            if (body.time_elapsed && body.time_elapsed < 3000) {
                fraudFlags.push('سرعة تعبئة خارقة أقل من 3 ثواني (بوت روبوت)');
            }
            
            // Validate name (checking if name is just numbers or gibberish ideally, but we keep it simple)
            if (body.customer_name && body.customer_name.length < 2) {
                fraudFlags.push('اسم المشتري قصير جداً أو حرف واحد');
            }
            if (/^\d+$/.test(body.customer_name)) {
                fraudFlags.push('اسم المشتري يحتوي أرقام فقط');
            }
            
            // Validate phone format (Algerian format usually 10 digits starting with 05, 06, 07)
            const phone = body.customer_phone ? body.customer_phone.replace(/\s+/g, '') : '';
            if (phone.length !== 10 || !/^0[567]/.test(phone)) {
                fraudFlags.push('رقم هاتف المشتري غير صحيح أو لا يطابق الصيغة الجزائرية');
            }
            
            // Check Foreign IP Country
            const customer_country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'Unknown';
            if (blockForeign && customer_country !== 'Unknown' && customer_country !== 'DZ' && customer_country !== '127.0.0.1') {
                fraudFlags.push(`طلب من خارج الجزائر (الدولة: ${customer_country})`);
            }
            
            // Prevent Duplicate Orders (Spam clicks)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { count: duplicateCount } = await insforge.database
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', merchantId)
                .eq('product_id', body.product_id)
                .eq('customer_phone', body.customer_phone)
                .gte('created_at', fiveMinutesAgo);

            if (duplicateCount && duplicateCount > 0) {
                fraudFlags.push('تكرار نفس الطلب (نفس المنتج ورقم الهاتف) خلال آخر 5 دقائق');
            }

            // Limit orders by IP
            const maxOrders = parseInt(maxIpOrdersStr, 10);
            
            if (!isNaN(maxOrders) && customer_ip !== '0.0.0.0' && customer_ip !== '::1' && customer_ip !== '127.0.0.1' && !customer_ip.includes('localhost')) {
                const today = new Date();
                today.setHours(0,0,0,0);
                
                const { count: ipOrdersCount, error: ipError } = await insforge.database
                    .from('orders')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', merchantId)
                    .eq('customer_ip', customer_ip)
                    .gte('created_at', today.toISOString());
                    
                if (!ipError && ipOrdersCount !== null && ipOrdersCount >= maxOrders) {
                     fraudFlags.push(`نفس الـ IP قام بعمل أكثر من ${maxOrders} طلبات اليوم`);
                }
            }
            
            if (fraudFlags.length > 0) {
                riskScore = 'high';
                // Take action
                if (blockAction !== 'flag') {
                    // Refuse completely and do not insert
                    return NextResponse.json({ status: 'blocked', error: 'عذراً، نظام الحماية يرفض هذا الطلب لوجود نشاط غير طبيعي أو بيانات غير صحيحة.' }, { status: 403 });
                }
                // If 'flag' it will insert but marked as high risk
            }
        }

        // 4. Enforce Platform Order Limits
        try {
            // Get user's plan
            const { data: profile } = await insforge.database
                .from('profiles')
                .select('plan, is_paid')
                .eq('id', merchantId)
                .single();
            
            let userPlan = 'free';
            if (profile?.plan === 'التاجر المحترف') userPlan = 'vip';
            else if (profile?.plan === 'خطة التاجر' || profile?.is_paid) userPlan = 'pro';

            // Get platform configs
            const { data: settings } = await insforge.database
                .from('platform_settings')
                .select('app_plans')
                .eq('id', 1)
                .single();
            
            const ordersLimit = settings?.app_plans?.orders_limit?.[userPlan] ?? (userPlan === 'vip' ? 50000 : userPlan === 'pro' ? 500 : 50);

            // Count orders for current month
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
            const { count: ordersCount, error: countError } = await insforge.database
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', merchantId)
                .gte('created_at', startOfMonth);

            if (!countError && ordersCount !== null && ordersCount >= ordersLimit) {
                return NextResponse.json({ error: 'عذراً، هذا المتجر قد وصل للحد الأقصى للطلبات المسموحة في باقته الحالية' }, { status: 403 });
            }
        } catch (e) {
            console.error('Limit check failed for orders:', e);
        }

        // 5. Prepare Order Data
        const orderData = {
            store_domain: trueStoreDomain,
            user_id: merchantId, 
            product_id: body.product_id,
            product_name: body.product_name,
            customer_name: body.customer_name,
            customer_phone: body.customer_phone,
            customer_address: body.customer_address,
            customer_state: body.customer_state,
            total_price: body.total_price,
            quantity: body.quantity || 1,
            notes: body.notes || '',
            status: 'pending',
            // Anti-Fraud enhancements
            customer_ip: customer_ip,
            risk_score: riskScore,
            fraud_flags: fraudFlags,
            source: body.source || 'direct'
        };

        // 6. Save order to DB securely on backend
        const { data: newOrder, error: orderError } = await insforge.database
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError) {
            console.error('[Backend Order Insert Error]', orderError);
            return NextResponse.json({ error: 'فشل في حفظ الطلب: ' + orderError.message }, { status: 500 });
        }

        // 7. Fire Server-Side Tracking 
        if (pixelSettings) {
            const reqHeaders = {
                ip: customer_ip,
                userAgent: req.headers.get('user-agent') || '',
                url: req.headers.get('referer') || `https://${body.store_domain}.souqai.net`,
            };

            processServerTracking(newOrder, pixelSettings, reqHeaders);
        }

        // 7.5 Realtime notification is handled automatically by database trigger (trg_order_realtime)

        // 8. Return Success immediately
        return NextResponse.json({ success: true, order: newOrder }, { status: 201 });

    } catch (err: any) {
        console.error('[API Orders Route]', err);
        return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
    }
}
