import { NextResponse } from 'next/server';
import { runDZWinningProductsAgent } from '@/lib/agents/dzWinningProductsAgent';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { category, customQuery, count } = body;

        const products = await runDZWinningProductsAgent({
            category,
            customQuery,
            count: count ? Number(count) : 8
        });

        return NextResponse.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error: any) {
        console.error('Agent execution error:', error);
        return NextResponse.json(
            { error: error.message || 'حدث خطأ أثناء تشغيل الـ Agent' },
            { status: 500 }
        );
    }
}
