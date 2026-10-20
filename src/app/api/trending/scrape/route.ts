import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@insforge/sdk';
import { resolveProductImage } from '@/lib/imageResolver';

const insforgeAdmin = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '',
});

async function getGeminiKey(): Promise<string> {
    try {
        const { data } = await insforgeAdmin.database
            .from('platform_settings')
            .select('gemini_key')
            .eq('id', 1)
            .single();
        if (data?.gemini_key) return data.gemini_key;
    } catch (e) { /* fallback to env */ }
    return process.env.GEMINI_API_KEY || '';
}

interface DirectScrapeResult {
    success: boolean;
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
}

function resolveUrl(baseUrlStr: string, relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
        return relativeUrl;
    }
    if (relativeUrl.startsWith('//')) {
        return 'https:' + relativeUrl;
    }
    try {
        const parsedUrl = new URL(baseUrlStr);
        const resolved = new URL(relativeUrl, parsedUrl.origin);
        return resolved.toString();
    } catch (e) {
        return relativeUrl;
    }
}

function extractMeta(html: string, nameOrProperty: string): string {
    const tagRegex = /<meta\s+[^>]*>/gi;
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
        const tag = match[0];
        const hasTarget = new RegExp(`(?:property|name)=["']${nameOrProperty}["']`, 'i').test(tag);
        if (hasTarget) {
            const contentMatch = tag.match(/content=["']([^"']*)["']/i);
            if (contentMatch) {
                return contentMatch[1];
            }
        }
    }
    return '';
}

function extractLdJson(html: string): any {
    const scriptRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        const innerText = match[1].trim();
        try {
            const parsed = JSON.parse(innerText);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of items) {
                if (item['@type'] === 'Product' || (typeof item['@type'] === 'string' && item['@type'].includes('Product'))) {
                    return item;
                }
            }
        } catch (e) {}
    }
    return null;
}

function extractImages(html: string, baseUrl: string): string[] {
    const images: string[] = [];
    
    const ogImage = extractMeta(html, 'og:image');
    if (ogImage) images.push(resolveUrl(baseUrl, ogImage));
    
    const twImage = extractMeta(html, 'twitter:image');
    if (twImage) images.push(resolveUrl(baseUrl, twImage));

    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        const url = match[1];
        if (!url.includes('pixel') && !url.includes('tracking') && !url.includes('logo') && !url.endsWith('.gif')) {
            images.push(resolveUrl(baseUrl, url));
        }
    }

    const shopifyCdnRegex = /cdn\.shopify\.com\/s\/files\/[^\s"']+/g;
    const shopifyMatches = html.match(shopifyCdnRegex);
    if (shopifyMatches) {
        shopifyMatches.forEach(m => {
            let cleanUrl = m.replace(/\\/g, '');
            if (!cleanUrl.startsWith('http')) {
                cleanUrl = 'https://' + cleanUrl;
            }
            images.push(cleanUrl);
        });
    }

    return [...new Set(images)].filter(u => u && u.startsWith('http'));
}

async function scrapeDirectly(url: string): Promise<DirectScrapeResult> {
    try {
        console.log('Attempting direct fetch for:', url);
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            next: { revalidate: 0 } // bypass nextjs fetch cache
        });

        if (!res.ok) {
            throw new Error(`Direct fetch failed with status: ${res.status}`);
        }

        const html = await res.text();
        if (html.length < 500) {
            throw new Error('Returned HTML is too short');
        }

        const ldProduct = extractLdJson(html);
        const ogTitle = extractMeta(html, 'og:title');
        const ogDesc = extractMeta(html, 'og:description');
        const allImages = extractImages(html, url);

        let title = ogTitle || '';
        let description = ogDesc || '';
        let imagesList = allImages;

        // Try extracting price and currency from metadata
        const ogPrice = extractMeta(html, 'og:price:amount') || extractMeta(html, 'product:price:amount');
        const ogCurrency = extractMeta(html, 'og:price:currency') || extractMeta(html, 'product:price:currency') || 'DZD';

        let price = ogPrice ? parseFloat(ogPrice.replace(/,/g, '')) : 0;
        let currency = ogCurrency;

        if (ldProduct) {
            if (!title) title = ldProduct.name || '';
            if (!description) description = ldProduct.description || '';
            
            // Extract price from offers if not already found in metadata
            if (price === 0 && ldProduct.offers) {
                const offersObj = ldProduct.offers;
                const getOfferPrice = (offer: any) => {
                    if (offer && offer.price) {
                        return parseFloat(String(offer.price).replace(/,/g, ''));
                    }
                    return 0;
                };

                if (Array.isArray(offersObj)) {
                    for (const offer of offersObj) {
                        const p = getOfferPrice(offer);
                        if (p > 0) {
                            price = p;
                            currency = offer.priceCurrency || currency;
                            break;
                        }
                    }
                } else {
                    const p = getOfferPrice(offersObj);
                    if (p > 0) {
                        price = p;
                        currency = offersObj.priceCurrency || currency;
                    }
                }
            }

            // Extract image from LD product
            if (ldProduct.image) {
                const imgVal = ldProduct.image;
                if (Array.isArray(imgVal)) {
                    imgVal.forEach(img => imagesList.unshift(resolveUrl(url, img)));
                } else if (typeof imgVal === 'string') {
                    imagesList.unshift(resolveUrl(url, imgVal));
                }
            }
        }

        // Shopify JSON meta / window.Shopify price extraction fallback
        if (price === 0) {
            const shopifyPriceRegex = /"price"\s*:\s*([0-9]+)/g;
            let match;
            while ((match = shopifyPriceRegex.exec(html)) !== null) {
                const val = parseInt(match[1]);
                if (val > 100) {
                    if (val > 50000) {
                        price = val / 100;
                    } else {
                        price = val;
                    }
                    break;
                }
            }
        }

        imagesList = [...new Set(imagesList)].filter(u => u && u.startsWith('http'));

        return {
            success: !!(title || imagesList.length > 0),
            title,
            description,
            price,
            currency,
            images: imagesList
        };
    } catch (err: any) {
        console.error('Direct scrape failed:', err.message);
        return {
            success: false,
            title: '',
            description: '',
            price: 0,
            currency: 'DZD',
            images: []
        };
    }
}

// Apify fallback crawler function
async function runApifyCrawler(url: string, token: string): Promise<string> {
    const startRes = await fetch(`https://api.apify.com/v2/acts/apify~website-content-crawler/runs?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            startUrls: [{ url }],
            maxCrawlPages: 1,
            crawlerType: 'cheerio',
            maxCrawlDepth: 0,
        })
    });

    if (!startRes.ok) throw new Error('Failed to start Apify run');
    const startData = await startRes.json();
    const runId = startData.data?.id;
    const datasetId = startData.data?.defaultDatasetId;
    if (!runId || !datasetId) throw new Error('Missing runId or datasetId');

    const maxWait = 50_000;
    const pollInterval = 3_000;
    let elapsed = 0;
    let status = 'RUNNING';

    while (elapsed < maxWait && (status === 'RUNNING' || status === 'READY')) {
        await new Promise(r => setTimeout(r, pollInterval));
        elapsed += pollInterval;
        const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
        if (statusRes.ok) {
            const statusData = await statusRes.json();
            status = statusData.data?.status || 'UNKNOWN';
        }
    }

    if (status !== 'SUCCEEDED') {
        throw new Error(`Apify run status: ${status}`);
    }

    const dsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&limit=1`);
    if (!dsRes.ok) throw new Error('Failed to fetch dataset');
    const items = await dsRes.json();
    if (!items || items.length === 0) throw new Error('No items in dataset');

    const item = items[0];
    const parts: string[] = [];
    if (item.title) parts.push(`Title: ${item.title}`);
    if (item.metadata?.title) parts.push(`Meta Title: ${item.metadata.title}`);
    if (item.metadata?.description) parts.push(`Meta Description: ${item.metadata.description}`);
    if (item.description) parts.push(`Description: ${item.description}`);
    if (item.text) parts.push(`Page Text:\n${item.text}`);
    if (item.markdown) parts.push(`Page Markdown:\n${item.markdown}`);

    return parts.join('\n\n').substring(0, 6000);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'يرجى تقديم رابط صالح للكشط' }, { status: 400 });
        }

        const geminiKey = await getGeminiKey();
        if (!geminiKey) {
            return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: geminiKey });

        // Phase 1: Try Direct Fetch Scraping (100% Free, bypasses API keys/credits, retrieves exact HTML metadata/images)
        const directResult = await scrapeDirectly(url);
        
        let crawledText = '';
        let crawledImages: string[] = [];
        let crawlSuccess = false;
        let scrapMethod = 'direct';

        if (directResult.success) {
            crawlSuccess = true;
            crawledText = `
Title: ${directResult.title}
Description: ${directResult.description}
Price Found: ${directResult.price}
Currency: ${directResult.currency}
            `.trim();
            crawledImages = directResult.images;
            console.log('Direct scraping succeeded. Images extracted:', crawledImages.length);
        } else {
            // Phase 2: Fallback to Apify
            const apifyToken = process.env.APIFY_TOKEN;
            if (apifyToken) {
                try {
                    const text = await runApifyCrawler(url, apifyToken);
                    if (text.length > 50) {
                        crawlSuccess = true;
                        crawledText = text;
                        scrapMethod = 'apify';
                        console.log('Apify crawler fallback succeeded.');
                    }
                } catch (apifyErr: any) {
                    console.error('Apify fallback crawler failed:', apifyErr.message);
                }
            }
        }

        let prompt = '';
        if (crawlSuccess && scrapMethod === 'direct') {
            prompt = `
You are a precise product data extractor for the Algerian COD e-commerce market.
We successfully fetched the page HTML directly. Here is the parsed data:
- URL: ${url}
- Title: ${directResult.title}
- Description: ${directResult.description}
- Price Found: ${directResult.price}
- Currency Found: ${directResult.currency}

STRICT RULES:
1. NAME: Translate the product title/name into Arabic. Make it concise and professional.
2. PRICE: Convert the price to Algerian Dinars (DZD).
   - If the priceCurrency is 'DZD' or 'DA' or price is found in DZD: use the exact price: ${directResult.price}.
   - If 'USD' or '$': multiply by 210.
   - If 'EUR' or '€': multiply by 230.
   - If price is 0 or not found, estimate a realistic price for this product category in Algeria (between 1500 and 6500 DZD).
   - NEVER invent or default to 5500 if a real price of ${directResult.price} is found.
3. COST_PRICE: Calculate as exactly 40% of the price in DZD.
4. DESCRIPTION: Write a highly persuasive Arabic description highlighting product benefits.
5. CATEGORY: Must be one of: tech, beauty, home, fashion, accessories.

Return ONLY a valid JSON object:
{
  "name": "الاسم الحقيقي للمنتج بالعربية",
  "description": "وصف تسويقي مقنع بالعربية للمنتج",
  "price": <الرقم الفعلي المحول للـ DZD>,
  "cost_price": <40% من السعر الفعلي>,
  "category": "<tech|beauty|home|fashion|accessories>",
  "image_url": "placeholder",
  "options": [{"name": "اللون أو المقاس", "values": ["..."]}],
  "ad_views": "<رقم واقعي>",
  "ad_likes": "<رقم واقعي>",
  "yalidine_rate": <رقم بين 80 و 96>,
  "trend_badge": "<وسم مناسب>"
}
Return strictly valid JSON only, no markdown.`;
        } else if (crawlSuccess && scrapMethod === 'apify') {
            prompt = `
You are a precise product data extractor for the Algerian e-commerce COD market.
We successfully crawled the page via Apify. Here is the raw text content:
--- START OF CONTENT ---
${crawledText}
--- END OF CONTENT ---

STRICT RULES:
1. NAME: Extract the exact product title/name and translate it into Arabic.
2. PRICE: Extract the exact price. Convert to DZD (USD * 210, EUR * 230, etc.). If DZD is present, use it. Do not default.
3. COST_PRICE: Calculate as 40% of the selling price.
4. DESCRIPTION: Write a compelling Arabic description based on the page features.
5. CATEGORY: One of: tech, beauty, home, fashion, accessories.

Return ONLY a valid JSON object:
{
  "name": "اسم المنتج بالعربية",
  "description": "وصف تسويقي بالعربية",
  "price": <السعر الفعلي بالدينار الجزائري>,
  "cost_price": <40% من سعر البيع>,
  "category": "<tech|beauty|home|fashion|accessories>",
  "image_url": "placeholder",
  "options": [{"name": "اللون أو المقاس", "values": ["..."]}],
  "ad_views": "<رقم واقعي>",
  "ad_likes": "<رقم واقعي>",
  "yalidine_rate": <رقم بين 80 و 96>,
  "trend_badge": "<وسم مناسب>"
}
Return strictly valid JSON only, no markdown.`;
        } else {
            // Full fallback if both direct fetch and Apify failed
            prompt = `
You are a product data extractor for the Algerian e-commerce market.
We failed to scrape this URL: "${url}"

Analyze the URL path to identify the product and write product info:
1. Name: Extract name from URL path, translate to Arabic.
2. Price: Estimate a realistic price in DZD based on product type:
   - Hair styling tools: 2500-4500 DZD
   - Small kitchen appliances: 2000-5000 DZD
   - Phone accessories: 800-2500 DZD
   - Smart watches: 3000-8000 DZD
   - Beauty devices: 2000-6000 DZD
3. cost_price = 40% of price.
4. Category: One of: tech, beauty, home, fashion, accessories.

Return ONLY a valid JSON object:
{
  "name": "اسم المنتج المستنتج من الرابط بالعربية",
  "description": "وصف تسويقي بالعربية",
  "price": <سعر واقعي بالدينار الجزائري>,
  "cost_price": <40% من السعر>,
  "category": "<tech|beauty|home|fashion|accessories>",
  "image_url": "placeholder",
  "options": [{"name": "اللون أو المقاس", "values": ["..."]}],
  "ad_views": "<رقم واقعي>",
  "ad_likes": "<رقم واقعي>",
  "yalidine_rate": <رقم بين 80 و 96>,
  "trend_badge": "<وسم مناسب>"
}
Return strictly valid JSON only, no markdown.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || '{}';
        try {
            const product = JSON.parse(text);

            if (!product.name || product.name.length < 3) {
                return NextResponse.json({
                    error: 'لم يتمكن النظام من التعرف على المنتج. يرجى التحقق من الرابط.'
                }, { status: 400 });
            }

            // Image resolution logic:
            // 1. If we got images from the page content (e.g. direct Result or crawledImages), use the first one
            // 2. Otherwise fallback to high quality category image
            let finalImage = '';
            if (crawledImages && crawledImages.length > 0) {
                finalImage = crawledImages[0];
            } else {
                finalImage = resolveProductImage(product.name, product.category);
            }

            const resolvedProduct = {
                ...product,
                image_url: finalImage,
                scraped_via_apify: scrapMethod === 'apify' && crawlSuccess,
                scraped_directly: scrapMethod === 'direct' && crawlSuccess,
                source_url: url
            };
            return NextResponse.json(resolvedProduct);
        } catch (parseErr) {
            console.error("Failed to parse Gemini response:", text);
            return NextResponse.json({ error: 'فشل في قراءة بيانات المنتج. يرجى إعادة المحاولة.' }, { status: 500 });
        }
    } catch (e: any) {
        console.error('Error in scraper API:', e);
        return NextResponse.json({ error: e.message || 'حدث خطأ غير متوقع' }, { status: 500 });
    }
}
