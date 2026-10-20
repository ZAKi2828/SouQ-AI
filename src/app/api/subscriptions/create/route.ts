import { NextResponse } from 'next/server';
import { ChargilyClient } from '@chargily/chargily-pay';
import { insforge } from '@/lib/insforge';
import dns from 'node:dns';

// Fix for Node >= 18 under Windows causing 21s fetch timeouts on IPv6 DNS queries
try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {
    // ignore
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        const tokenMatch = authHeader.match(/^Bearer\s+(.*)$/);
        const accessToken = tokenMatch ? tokenMatch[1] : '';

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Decode the JWT to get the user ID and email
        let userId = '';
        let email = '';
        try {
            const payloadStr = Buffer.from(accessToken.split('.')[1], 'base64').toString();
            const payload = JSON.parse(payloadStr);
            userId = payload.sub || payload.id;
            email = payload.email || '';
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: User ID not found' }, { status: 401 });
        }

        // RBAC Guard: Only owners can manage billing/subscriptions
        if (email) {
            const { data: member } = await insforge.database
                .from('team_members')
                .select('id')
                .ilike('member_email', email)
                .eq('status', 'active')
                .maybeSingle();

            if (member) {
                return NextResponse.json({ error: 'Forbidden: Only store owners can upgrade plans.' }, { status: 403 });
            }
        }
        const body = await request.json();
        const { plan, billingCycle = 'monthly', action = 'upgrade' } = body;

        // Support both upgrade and renewal
        const validPlans = ['خطة التاجر', 'التاجر المحترف'];
        if (!validPlans.includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Get platform prices and chargily key (stored in stripe_key)
        const { data: settings } = await insforge.database
            .from('platform_settings')
            .select('pro_price, vip_price, stripe_key')
            .eq('id', 1)
            .single();

        let amount = 0;
        if (plan === 'خطة التاجر') {
            amount = Number(settings?.pro_price || 1000);
        } else if (plan === 'التاجر المحترف') {
            amount = Number(settings?.vip_price || 2500);
        }

        if (billingCycle === 'yearly') {
            amount = amount * 10; // 2 months free as per UI
        }
        
        // Ensure amount is valid
        if (amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount or free plan' }, { status: 400 });
        }

        // Get origin for callbacks
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Initialize Chargily Client using the key from database or env
        let secretKey = settings?.stripe_key || process.env.CHARGILY_SECRET_KEY || ''; 
        secretKey = secretKey.trim();
        
        if (!secretKey) {
            console.error('Chargily Settings Error: Missing Secret Key in Settings');
            return NextResponse.json({ error: 'لم يتم تفعيل بوابة الدفع بعد، يرجى تزويد مفتاح Chargily Pay للمدير' }, { status: 400 });
        }

        const client = new ChargilyClient({
            api_key: secretKey,
            mode: secretKey.startsWith('test_') ? 'test' : 'live'
        });

        // 1. Create a Chargily Checkout Session
        // Use a dummy public endpoint for webhooks if testing locally to prevent Chargily from hanging (25s timeout)
        const webhookEndpoint = origin.includes('localhost') 
            ? 'https://your-production-domain.com/api/webhooks/chargily'
            : `${origin}/api/webhooks/chargily`;

        const checkoutInfo = {
            amount: amount,
            currency: "dzd",
            success_url: `${origin}/upgrade?success=true&plan=${encodeURIComponent(plan)}`,
            failure_url: `${origin}/upgrade?canceled=true`,
            webhook_endpoint: webhookEndpoint,
            description: `SOUQ AI ${action === 'renew' ? 'Renewal' : 'Subscription'} - ${plan} (${billingCycle})`,
            metadata: {
                user_id: userId,
                plan: plan,
                cycle: billingCycle,
                action: action
            }
        };

        const checkout = await client.createCheckout(checkoutInfo);

        if (!checkout || !checkout.checkout_url) {
            throw new Error('Failed to create Chargily checkout URL');
        }

        return NextResponse.json({ url: checkout.checkout_url });

    } catch (error: any) {
        console.error('Chargily Checkout Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create checkout' }, { status: 500 });
    }
}
