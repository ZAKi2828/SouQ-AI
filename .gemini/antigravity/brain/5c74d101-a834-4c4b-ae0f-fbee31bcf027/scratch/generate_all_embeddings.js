const { createClient } = require('@insforge/sdk');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

const insforgeAdmin = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app',
    anonKey: 'ik_c00c3d4285111ebccaf8ca3116f447d1', // Admin key
});

async function populateAllEmbeddings() {
    console.log('Fetching products without embeddings...');
    try {
        const { data: products, error: fetchError } = await insforgeAdmin.database
            .from('products')
            .select('id, name, description, category, store_domain')
            .is('embedding', null);

        if (fetchError) {
            console.error('Error fetching products:', fetchError);
            return;
        }

        console.log(`Found ${products.length} products needing embeddings.`);
        if (products.length === 0) {
            console.log('All products already have embeddings.');
            return;
        }

        // Build text strings for the embedding model
        const texts = products.map((p) => {
            const parts = [p.name || ''];
            if (p.description) parts.push(p.description);
            if (p.category) parts.push(`التصنيف: ${p.category}`);
            return parts.join(' | ');
        });

        // Send to OpenAI embeddings in batches
        const BATCH_SIZE = 20;
        for (let i = 0; i < texts.length; i += BATCH_SIZE) {
            const batchTexts = texts.slice(i, i + BATCH_SIZE);
            const batchProducts = products.slice(i, i + BATCH_SIZE);

            console.log(`Processing batch ${i / BATCH_SIZE + 1} (${batchProducts.length} products)...`);
            const embeddingResponse = await insforgeAdmin.ai.embeddings.create({
                model: 'openai/text-embedding-3-small',
                input: batchTexts,
            });

            if (!embeddingResponse.data || embeddingResponse.data.length === 0) {
                console.error('Failed to get embeddings from API:', embeddingResponse);
                continue;
            }

            for (let j = 0; j < batchProducts.length; j++) {
                const product = batchProducts[j];
                const embedding = embeddingResponse.data[j].embedding;

                const { error: updateError } = await insforgeAdmin.database
                    .from('products')
                    .update({ embedding })
                    .eq('id', product.id);

                if (updateError) {
                    console.error(`❌ Failed to update embedding for product ${product.id}:`, updateError);
                } else {
                    console.log(`✅ Updated embedding for: ${product.name} (${product.store_domain})`);
                }
            }
        }

        console.log('Embedding generation completed successfully!');
    } catch (err) {
        console.error('An error occurred during execution:', err);
    }
}

populateAllEmbeddings();
