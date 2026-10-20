import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

export async function POST(req: NextRequest) {
    try {
        const { query, storeDomain } = await req.json();

        if (!query || !storeDomain) {
            return NextResponse.json({ error: 'query and storeDomain are required' }, { status: 400 });
        }

        // Generate embedding for the search query
        const embeddingResponse = await insforgeAdmin.ai.embeddings.create({
            model: 'openai/text-embedding-3-small',
            input: query,
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // Search using the match_products RPC
        const { data: results, error: searchError } = await insforgeAdmin.database.rpc('match_products', {
            query_embedding: queryEmbedding,
            target_store_domain: storeDomain,
            match_count: 12,
            match_threshold: 0.68,
        });

        if (searchError) {
            console.error('Semantic search error:', searchError);
            return NextResponse.json({ error: searchError.message }, { status: 500 });
        }

        return NextResponse.json({
            results: results || [],
            count: results?.length || 0,
        });
    } catch (error: any) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
