import { NextResponse } from 'next/server';
import { runDZWinningProductsAgent } from '@/lib/agents/dzWinningProductsAgent';

export async function POST() {
    try {
        const products = await runDZWinningProductsAgent({ count: 8 });
        return NextResponse.json({ success: true, count: products.length, products });
    } catch (e: any) {
        console.error('Error syncing trends:', e);
        return NextResponse.json({ error: e.message || 'حدث خطأ أثناء تحديث التريندات' }, { status: 500 });
    }
}
