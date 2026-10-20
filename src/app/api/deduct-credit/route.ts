import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, creditType } = body;

        if (!userId || !creditType) {
            return NextResponse.json({ error: 'Missing userId or creditType' }, { status: 400 });
        }

        if (!['ai_text_credits', 'ai_image_credits'].includes(creditType)) {
            return NextResponse.json({ error: 'Invalid creditType' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '',
            process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || ''
        );

        // 1. Fetch current credits and plan
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('ai_text_credits, ai_image_credits, plan')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            console.error('Fetch profile error:', fetchError);
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // 2. Check if VIP with unlimited
        const plan = ((profile as any).plan || '').toLowerCase();
        const isVip = plan === 'vip' || (profile as any).plan === 'التاجر المحترف';

        if (isVip) {
            const { data: settings } = await supabase
                .from('ai_settings')
                .select('vip_text_quota, vip_image_quota')
                .eq('id', 1)
                .single();

            const quotaField = creditType === 'ai_text_credits' ? 'vip_text_quota' : 'vip_image_quota';
            if (settings && (settings as any)[quotaField] === 'unlimited') {
                return NextResponse.json({ 
                    success: true, 
                    newBalance: 999999999, 
                    message: 'VIP unlimited - no deduction' 
                });
            }
        }

        // 3. Check if credits available
        const currentCredits: number = Number((profile as any)[creditType]) || 0;
        if (currentCredits < 1) {
            return NextResponse.json({ error: 'No credits remaining', newBalance: 0 }, { status: 403 });
        }

        // 4. Deduct using RPC function (SECURITY DEFINER bypasses RLS)
        const newBalance = Math.max(0, currentCredits - 1);
        
        const { error: updateError } = await supabase.rpc('deduct_ai_credit', {
            p_user_id: userId,
            p_credit_type: creditType,
            p_new_balance: newBalance
        });

        if (updateError) {
            console.error('RPC deduct error, trying direct update:', updateError);
            // Fallback: direct update
            const { error: sqlError } = await supabase
                .from('profiles')
                .update({ [creditType]: newBalance })
                .eq('id', userId);

            if (sqlError) {
                console.error('Direct update also failed:', sqlError);
                return NextResponse.json({ error: 'Failed to deduct credits', detail: sqlError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ 
            success: true, 
            newBalance,
            message: `Deducted 1 ${creditType}. New balance: ${newBalance}` 
        });
    } catch (e: any) {
        console.error('API deduct-credit error:', e);
        return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
    }
}
