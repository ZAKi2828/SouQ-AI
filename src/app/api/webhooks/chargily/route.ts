import { NextResponse } from 'next/server';
import { verifySignature } from '@chargily/chargily-pay';
import { insforge } from '@/lib/insforge';

// Map Arabic plan names to DB values
const planMap: Record<string, string> = {
    'خطة التاجر': 'pro',
    'التاجر المحترف': 'vip',
    'pro': 'pro',
    'vip': 'vip'
};

export async function POST(request: Request) {
    try {
        const signature = request.headers.get('signature') || '';
        const payloadBuffer = await request.arrayBuffer();
        const payloadString = new TextDecoder().decode(payloadBuffer);

        const { data: settings } = await insforge.database
            .from('platform_settings')
            .select('stripe_key')
            .eq('id', 1)
            .single();

        let secretKey = process.env.CHARGILY_SECRET_KEY || settings?.stripe_key || '';
        secretKey = secretKey.trim();

        if (!secretKey) {
            console.error('Chargily Webhook Error: Missing Secret Key');
            return NextResponse.json({ error: 'Config Error' }, { status: 500 });
        }

        try {
            // @ts-ignore
            verifySignature(Buffer.from(payloadString) as any, signature, secretKey);
        } catch (error) {
            console.error('Chargily Webhook Error: Invalid Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        const event = JSON.parse(payloadString);

        if (event.type === 'checkout.paid') {
            const checkout = event.data;
            const metadataObj = checkout.metadata || {};

            let userId = metadataObj.user_id || null;
            let plan = metadataObj.plan || null;
            let cycle = metadataObj.cycle || null;

            if (userId && plan) {
                const dbPlan = planMap[plan] || plan;
                
                // Use yearly RPC if billing cycle is yearly (365-day expiry)
                const rpcName = cycle === 'yearly' ? 'activate_plan_yearly' : 'activate_plan_webhook';
                const { error: updateError } = await insforge.database.rpc(rpcName, {
                    p_user_id: userId,
                    p_plan: dbPlan
                });

                if (updateError) {
                    console.error(`Failed to upgrade user ${userId} to ${dbPlan}:`, updateError);
                } else {
                    console.log(`Successfully upgraded user ${userId} to ${dbPlan} (${cycle}) via ${rpcName} RPC`);
                    
                    // Send renewal confirmation email via Resend
                    try {
                        const { data: settings } = await insforge.database
                            .from('platform_settings')
                            .select('resend_key, platform_name')
                            .eq('id', 1)
                            .single();
                        
                        if (settings?.resend_key) {
                            const { Resend } = await import('resend');
                            const resend = new Resend(settings.resend_key);
                            
                            const { data: profile } = await insforge.database
                                .from('profiles')
                                .select('email, store_name')
                                .eq('id', userId)
                                .single();
                            
                            if (profile?.email) {
                                const platformName = settings.platform_name || 'SOUQ AI';
                                const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://souqai.net';
                                await resend.emails.send({
                                    from: `${platformName} <noreply@souqai.net>`,
                                    to: profile.email,
                                    subject: `✅ تم تفعيل اشتراكك بنجاح - ${platformName}`,
                                    html: `
<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<div style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
<span style="font-size:48px;">✅</span>
<h1 style="color:white;font-size:24px;margin:8px 0;">تم تفعيل اشتراكك بنجاح!</h1>
<p style="color:rgba(255,255,255,0.8);font-size:14px;">خطة ${plan} — ${cycle === 'yearly' ? 'سنوي' : 'شهري'}</p>
</div>
<div style="padding:32px;text-align:center;">
<p style="color:#374151;font-size:15px;">مرحباً<strong>${profile.store_name || 'التاجر'}</strong>،</p>
<p style="color:#6b7280;font-size:14px;margin:16px 0 24px;">يمكنك الآن الاستمتاع بجميع مميزات خطتك. لوحة التحكم جاهزة لك!</p>
<a href="${origin}/merchant" style="display:inline-block;background:linear-gradient(135deg,#E91E63,#ec4899);color:white;padding:14px 40px;border-radius:12px;text-decoration:none;font-weight:bold;">الذهاب للوحة التحكم</a>
</div>
<div style="background:#f8f9fc;padding:20px;text-align:center;border-top:1px solid #e5e7eb;"><p style="color:#9ca3af;font-size:12px;">© 2026 ${platformName}</p></div>
</div></body></html>`
                                });
                            }
                        }
                    } catch (emailErr) {
                        console.error('Failed to send confirmation email:', emailErr);
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Chargily Webhook Exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
