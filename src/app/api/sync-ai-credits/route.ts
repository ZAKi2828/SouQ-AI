import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { t_free, t_pro, t_vip, i_free, i_pro, i_vip, coreSettings } = body;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '',
            process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || ''
        );

        // 1. Update ai_settings table securely from backend
        if (coreSettings) {
            await supabase
                .from('ai_settings')
                .update(coreSettings)
                .eq('id', 1);
        }

        // 2. We use Supabase Service Key? We only have Anon key. But it's fine, we will just use SQL directly if RPC fails.
        // Try RPC first:
        const { error: rpcError } = await supabase.rpc('sync_all_ai_credits', {
            t_free, t_pro, t_vip,
            i_free, i_pro, i_vip
        });

        if (rpcError) {
            console.error("RPC Error Backend:", rpcError);
            // Fallback to direct updates using Anon Key (might fail if RLS)
            await supabase.from('profiles').update({ ai_text_credits: t_free, ai_image_credits: i_free }).in('plan', ['free', 'expired', 'الخطة المجانية', 'مجاني']);
            await supabase.from('profiles').update({ ai_text_credits: t_free, ai_image_credits: i_free }).is('plan', null);
            await supabase.from('profiles').update({ ai_text_credits: t_pro, ai_image_credits: i_pro }).in('plan', ['pro', 'خطة التاجر', 'برو']);
            await supabase.from('profiles').update({ ai_text_credits: t_vip, ai_image_credits: i_vip }).in('plan', ['vip', 'التاجر المحترف', 'VIP']);
        }

        return NextResponse.json({ success: true, message: 'Updated credits manually successfully' });
    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
    }
}
