import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

export async function POST(req: NextRequest) {
    try {
        const { storeDomain } = await req.json();

        if (!storeDomain) {
            return NextResponse.json({ error: 'storeDomain is required' }, { status: 400 });
        }

        // Fetch all active products without embeddings for this store
        const { data: products, error: fetchError } = await insforgeAdmin.database
            .from('products')
            .select('id, name, description, category')
            .eq('store_domain', storeDomain)
            .eq('status', 'active')
            .is('embedding', null);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'All products already have embeddings', count: 0 });
        }

        // Build text representation for each product
        const texts = products.map((p: any) => {
            const parts = [p.name || ''];
            if (p.description) parts.push(p.description);
            if (p.category) parts.push(`التصنيف: ${p.category}`);
            return parts.join(' | ');
        });

        // Generate embeddings in batches of 20
        const BATCH_SIZE = 20;
        let processedCount = 0;

        for (let i = 0; i < texts.length; i += BATCH_SIZE) {
            const batchTexts = texts.slice(i, i + BATCH_SIZE);
            const batchProducts = products.slice(i, i + BATCH_SIZE);

            const embeddingResponse = await insforgeAdmin.ai.embeddings.create({
                model: 'openai/text-embedding-3-small',
                input: batchTexts,
            });

            // Update each product with its embedding
            for (let j = 0; j < batchProducts.length; j++) {
                const product = batchProducts[j];
                const embedding = embeddingResponse.data[j].embedding;

                const { error: updateError } = await insforgeAdmin.database
                    .from('products')
                    .update({ embedding })
                    .eq('id', product.id);

                if (updateError) {
                    console.error(`Failed to update embedding for product ${product.id}:`, updateError);
                } else {
                    processedCount++;
                }
            }
        }

        return NextResponse.json({
            message: `Successfully generated embeddings for ${processedCount} products`,
            count: processedCount,
            total: products.length,
        });
    } catch (error: any) {
        console.error('Embedding generation error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
