import { GoogleGenAI } from '@google/genai';
import { createClient } from '@insforge/sdk';
import { resolveProductImage, isValidImageUrl, buildRealSpyUrl, getProxiedImageUrl } from '@/lib/imageResolver';

const insforgeAdmin = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '',
});

export interface AgentProduct {
    id?: string;
    name: string;
    name_en?: string;
    description: string;
    description_en?: string;
    price: number;
    cost_price: number;
    category: string;
    image_url: string;
    extra_images?: string[];
    spy_url?: string;
    wholesale_market?: string;
    wholesale_market_en?: string;
    marketing_hook?: string;
    marketing_hook_en?: string;
    ad_views: string;
    ad_likes: string;
    yalidine_rate: number;
    trend_badge: string;
    trend_badge_en?: string;
    source: 'tiktok' | 'facebook';
    options: { name: string; values: string[] }[];
}

export interface AgentRunOptions {
    category?: string;
    customQuery?: string;
    count?: number;
}

export async function getGeminiKey(): Promise<string> {
    try {
        const { data } = await insforgeAdmin.database
            .from('platform_settings')
            .select('gemini_key')
            .eq('id', 1)
            .single();
        if (data?.gemini_key) return data.gemini_key;
    } catch {
        // Fallback to environment variable
    }
    return process.env.GEMINI_API_KEY || '';
}

/**
 * Validates and extracts OG Image from a given product URL if needed.
 */
async function fetchOgImage(url: string): Promise<string | null> {
    if (!isValidImageUrl(url)) return null;
    try {
        const pageRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(3000)
        });
        if (!pageRes.ok) return null;
        const html = await pageRes.text();
        const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
        let img = ogMatch ? ogMatch[1] : '';
        if (img && img.startsWith('//')) img = 'https:' + img;
        if (isValidImageUrl(img)) return img;
    } catch {
        // Ignore timeout or error
    }
    return null;
}

/**
 * ProFind - Autonomous Agent to research and curate at least 20 winning products for Algerian COD E-Commerce
 */
export async function runDZWinningProductsAgent(options: AgentRunOptions = {}): Promise<AgentProduct[]> {
    const geminiKey = await getGeminiKey();
    if (!geminiKey) {
        throw new Error('مفتاح Gemini API غير مهيأ. يرجى إضافته في إعدادات المنصة أو ملف البيئة.');
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const category = options.category && options.category !== 'all' ? options.category : null;
    const count = options.count || 20;

    const categoryConstraint = category
        ? `Focus strictly on products belonging to the category: "${category}".`
        : `Include a rich, balanced mix of 20 products across categories: tech, beauty, home, accessories, fashion.`;

    const customQueryPrompt = options.customQuery 
        ? `Special search theme / keyword: "${options.customQuery}".`
        : `Search for high-demand, high-converting COD products with active paid ads in Algeria.`;

    const prompt = `
You are "ProFind", the premier autonomous market research & spy agent for Algerian Cash on Delivery (COD) E-Commerce.
Your mission: Search the live web to uncover real, active, high-converting "Winning Products" currently sold by Algerian e-commerce stores and advertised on Facebook Ads and TikTok Ads in Algeria.

${categoryConstraint}
${customQueryPrompt}

Strict Rules:
1. Provide exactly ${count} products (at least 20 items).
2. NEVER invent fake URLs with "example.com" or "example.dz".
3. Product Details:
   - name: Concise, clear Arabic product name.
   - name_en: Concise, attractive English product name.
   - description: Persuasive Arabic copywriting explaining benefits, features, and target audience in Algeria.
   - description_en: Clear English product description.
   - marketing_hook: Catchy sales hook in Algerian Darija (e.g. "تهنّى من مشكل... والتوصيل حتى لباب دارك والدفع كي توصلك السلعة").
   - marketing_hook_en: English translation / equivalent sales hook.
   - price: Suggested retail price in Algerian Dinars (DZD number between 2000 and 15000).
   - cost_price: Estimated wholesale cost in DZD number.
   - wholesale_market: Algerian wholesale source in Arabic (e.g. "سوق الجملة العلمة", "الحميز (العاصمة)", "بلفور (الحراش)", "عين فكرون").
   - wholesale_market_en: English name of the wholesale market (e.g. "El Eulma Wholesale Market", "El Hamiz (Algiers)", "Belfort (El Harrach)").
   - category: One of "tech", "beauty", "home", "accessories", "fashion".
   - ad_views: Realistic views on the ad campaign (e.g. "95K", "340K", "1.2M").
   - ad_likes: Realistic likes (e.g. "7.2K", "28K").
   - yalidine_rate: Estimated delivery percentage (number 85 - 96).
   - trend_badge: Punchy Arabic badge (e.g. "إعلان فيسبوك نشط ⚡", "تريند تيك توك الجزائر 🔥", "الأكثر طلباً هذا الأسبوع").
   - trend_badge_en: Punchy English badge (e.g. "Active Facebook Ad ⚡", "Algeria TikTok Trend 🔥", "Top Seller This Week").
   - source: "facebook" or "tiktok".
   - options: Array of option objects, e.g. [{"name": "اللون", "values": ["أسود", "رمادي"]}]

Return ONLY a JSON array with exactly ${count} objects inside, without markdown fences or additional commentary.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });

    const text = response.text || '[]';
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
    }
    if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    let rawProducts: any[] = [];
    try {
        rawProducts = JSON.parse(cleanText);
    } catch {
        const match = cleanText.match(/\[[\s\S]*\]/);
        if (match) {
            rawProducts = JSON.parse(match[0]);
        } else {
            throw new Error('فشل ProFind في معالجة بيانات المنتجات الرابحة.');
        }
    }

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
        throw new Error('لم يتم العثور على منتجات كافية في هذا المسح.');
    }

    const finalizedProducts: AgentProduct[] = [];

    for (const item of rawProducts) {
        const category = item.category || 'tech';
        const name = item.name || 'منتج رابح في السوق الجزائري';
        const source: 'facebook' | 'tiktok' = item.source === 'tiktok' ? 'tiktok' : 'facebook';

        let mainImage = item.image_url;
        if (!isValidImageUrl(mainImage)) {
            if (item.url && isValidImageUrl(item.url)) {
                const og = await fetchOgImage(item.url);
                if (og) mainImage = og;
            }
        }
        if (!isValidImageUrl(mainImage)) {
            mainImage = resolveProductImage(name, category);
        } else {
            mainImage = getProxiedImageUrl(mainImage);
        }

        const spyUrl = buildRealSpyUrl(item.url, name, source);

        const options = Array.isArray(item.options) && item.options.length > 0
            ? item.options
            : [{ name: 'النوع', values: ['افتراضي'] }];

        finalizedProducts.push({
            name,
            name_en: item.name_en || undefined,
            description: item.description || '',
            description_en: item.description_en || undefined,
            price: Number(item.price) || 3500,
            cost_price: Number(item.cost_price) || 1400,
            category,
            image_url: mainImage,
            extra_images: [mainImage],
            spy_url: spyUrl,
            wholesale_market: item.wholesale_market || 'سوق الجملة العلمة / الحميز',
            wholesale_market_en: item.wholesale_market_en || undefined,
            marketing_hook: item.marketing_hook || 'التوصيل متوفر لجميع الولايات والدفع عند الاستلام',
            marketing_hook_en: item.marketing_hook_en || undefined,
            ad_views: item.ad_views || '120K',
            ad_likes: item.ad_likes || '9.5K',
            yalidine_rate: Math.min(97, Math.max(80, Number(item.yalidine_rate) || 91)),
            trend_badge: item.trend_badge || 'إعلان نشط في الجزائر 🔥',
            trend_badge_en: item.trend_badge_en || undefined,
            source,
            options
        });
    }

    // Update database table `trending_products`
    try {
        if (!options.customQuery && (!options.category || options.category === 'all')) {
            await insforgeAdmin.database
                .from('trending_products')
                .delete()
                .gt('yalidine_rate', 0);
        }

        const { error: insertErr } = await insforgeAdmin.database
            .from('trending_products')
            .insert(finalizedProducts);

        if (insertErr) {
            console.error('Error inserting into trending_products:', insertErr);
        }
    } catch (dbErr) {
        console.error('Database write error:', dbErr);
    }

    return finalizedProducts;
}
