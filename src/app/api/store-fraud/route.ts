import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    
    if (!domain) return NextResponse.json({ enabled: false }, { status: 400 });

    try {
        const { data: store } = await insforge.database
            .from('stores')
            .select('user_id')
            .eq('store_domain', domain)
            .single();
        
        if (store?.user_id) {
            const { data: pixelSettings } = await insforge.database
                .from('store_pixels')
                .select('anti_fraud_enabled, anti_fraud_captcha')
                .eq('user_id', store.user_id)
                .single();
                
            if (pixelSettings?.anti_fraud_enabled) {
                const isCaptcha = pixelSettings.anti_fraud_captcha?.trim() !== 'false';
                if (isCaptcha) {
                    return NextResponse.json({ enabled: true, user_id: store.user_id });
                }
            }
            return NextResponse.json({ enabled: false, user_id: store.user_id });
        }
        return NextResponse.json({ enabled: false });
    } catch(err) {
        return NextResponse.json({ enabled: false }, { status: 500 });
    }
}
