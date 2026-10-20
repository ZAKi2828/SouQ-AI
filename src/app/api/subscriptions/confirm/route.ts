import { NextResponse } from 'next/server';
import dns from 'node:dns';
import { insforge } from '@/lib/insforge';

// Fix for Node >= 18 under Windows causing fetch timeouts on IPv6 DNS queries
try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {
    // ignore
}

// Map Arabic plan names to DB values
const planMap: Record<string, string> = {
    'خطة التاجر': 'pro',
    'التاجر المحترف': 'vip',
    'pro': 'pro',
    'vip': 'vip'
};

const BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app';
const ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

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
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        const { plan } = body;

        const dbPlan = planMap[plan];
        if (!dbPlan) {
            console.error(`[Confirm] Invalid plan value: "${plan}"`);
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Use the custom RPC function to activate the plan
        // This bypasses the RLS policy that requires auth.uid() = id since it runs as SECURITY DEFINER
        const { error: updateError } = await insforge.database.rpc('activate_plan_webhook', {
            p_user_id: userId,
            p_plan: dbPlan
        });

        if (updateError) {
            console.error(`[Confirm] RPC update failed:`, updateError);
            return NextResponse.json({ error: 'Failed to activate plan' }, { status: 500 });
        }

        console.log(`[Subscription] User ${userId} activated plan: ${dbPlan}`);
        return NextResponse.json({ success: true, plan: dbPlan });

    } catch (error: any) {
        console.error('Confirm Subscription Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
