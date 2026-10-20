import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const domain = searchParams.get('domain');

    try {
        let targetUserId = userId;

        if (!targetUserId && domain) {
            const { data: store } = await insforge.database.from('stores').select('user_id').eq('store_domain', domain).single();
            if (!store) return NextResponse.json({ rates: [] });
            targetUserId = store.user_id;
        }

        if (!targetUserId) return NextResponse.json({ error: 'Missing user_id or domain' }, { status: 400 });

        const { data, error } = await insforge.database
            .from('shipping_rates')
            .select('*')
            .eq('user_id', targetUserId)
            .order('wilaya_code', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ rates: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { user_id, rates } = await request.json();
        if (!user_id || !rates || !Array.isArray(rates)) {
            return NextResponse.json({ error: 'Missing user_id or rates array' }, { status: 400 });
        }

        const upsertData = rates.map((r: any) => ({
            user_id,
            wilaya_code: r.wilaya_code,
            wilaya_name_ar: r.wilaya_name_ar,
            wilaya_name_fr: r.wilaya_name_fr,
            home_price: Number(r.home_price) || 0,
            desk_price: Number(r.desk_price) || 0,
            is_active: r.is_active !== false,
            updated_at: new Date().toISOString(),
        }));

        const { data, error } = await insforge.database
            .from('shipping_rates')
            .upsert(upsertData, { onConflict: 'user_id,wilaya_code' });

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
