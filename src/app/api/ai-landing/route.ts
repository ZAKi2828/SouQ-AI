import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@insforge/sdk';

const insforgeAdmin = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '',
});

async function getGeminiKey(): Promise<string> {
    // Try to get from database first
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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { imageBase64, language, dimension, showPrice, price, mimeType } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'لم يتم تقديم صورة' }, { status: 400 });
        }

        const geminiKey = await getGeminiKey();
        if (!geminiKey) {
            return NextResponse.json({ error: 'مفتاح Gemini API غير موجود. أضفه من إعدادات المنصة (الربط والمفاتيح)' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const isAlgerian = language === 'الدارجة الجزائرية';
        const isEnglish = language === 'English';
        const isFrench = language === 'Français';

        let ctaBtnText = "";
        let promptTemplate = "";

        const aspectRatioStr = dimension === '9:32' ? '9:32 or longer' : dimension === '9:16' ? '9:16 vertical' : '1:1 square';

        if (isAlgerian) {
            ctaBtnText = `"اطلب الآن وادفع كي توصلك السلعة${showPrice ? ' - فقط بـ ' + price + ' د.ج' : ''}"`;
            promptTemplate = `Act as a world-class Mobile E-commerce Designer specialized in Algerian high-converting Facebook and landing page ads. Generate an ultra-long vertical infographic landing page (aspect ratio ${aspectRatioStr}) for the product in the uploaded image.

CRITICAL TEXT RULES:
1. ONLY render the exact Algerian Darija Arabic text provided inside quotation marks " ".
2. ABSOLUTELY DO NOT render any English structural words or labels.
3. Ensure all Arabic typography is massive and NEVER falls below 20px to guarantee strict mobile readability.
4. The tone must sound like Algerian e-commerce ads used on Facebook and product landing pages.

AESTHETIC & FLOW INSTRUCTIONS:
Create one smooth continuous visual journey optimized for mobile conversion. Use smooth gradients matching the product colors and modern kinetic lines. No hard dividing lines. The product must appear repeatedly in dynamic floating scenes.

* Visual Flow: Dynamic background matching the product vibe with cinematic lighting and modern e-commerce style product presentation.
* Top Badge (Small Yellow Text): "الأكثر طلباً في الجزائر"
* Main Headline (HUGE WHITE BOLD): "اكتشف الحل الذكي اللي راح يسهّل حياتك من اليوم"
* Subhead (Large Text): "منتج عملي ومصمم باش يعطيك أفضل نتيجة بأقل مجهود"

* Visual Flow: Smooth transition to a muted area with subtle problem illustration icons.
* Headline (Large Bold Red): "تعبت من نفس المشكلة كل يوم؟"
* Body Text (Medium Black): "الكثير يعانوا من نفس المشكلة يومياً، حلول قديمة وما تعطيش النتيجة اللي تتمناها."

* Visual Flow: Burst of bright light transitioning to a clean futuristic background. Product appears powerful and glowing.
* Headline (HUGE BOLD COLORED TEXT): "الحل الذكي اللي كنت تستنى فيه"
* Body Text (Large Black): "بتصميم مبتكر وتقنية حديثة يعطيك نتيجة واضحة بسرعة وسهولة."

* Visual Flow: Split screen comparison layout.
* Headline (LARGE BOLD COLORED TEXT): "شوف الفرق بنفسك"
* Before Text (Medium Red): "❌ قبل: تعب ومجهود ونتائج ضعيفة"
* After Text (Medium Green): "✅ بعد: راحة، سرعة ونتيجة ممتازة"

* Visual Flow: Extreme close-up highlighting the most important feature of the product with macro product photography.
* Headline (LARGE BOLD COLORED TEXT): "جودة وتصميم احترافي"
* Body Text (Large Black): "مصنوع بمواد عالية الجودة باش يدوم معاك ويعطيك أفضل أداء كل مرة."

* Visual Flow: Close-up showing another key feature with elegant lighting.
* Headline (LARGE BOLD COLORED TEXT): "سهولة الاستعمال"
* Body Text (Large Black): "استعمله في ثواني بدون تعقيد، مصمم باش يكون عملي لأي شخص."

* Visual Flow: Clean modern comparison layout showing the product glowing versus a dull generic alternative.
* Headline (LARGE BOLD COLORED TEXT): "علاش تختار هذا المنتج؟"
* Our Product Feature 1 (Medium Green): "✔️ جودة عالية ونتائج واضحة"
* Competitor Flaw 1 (Medium Red): "❌ جودة ضعيفة ونتائج محدودة"
* Our Product Feature 2 (Medium Green): "✔️ تصميم ذكي وسهل الاستعمال"
* Competitor Flaw 2 (Medium Red): "❌ صعب الاستعمال وغير عملي"

* Visual Flow: Lifestyle scene showing the product being used naturally in daily life by a satisfied person.
* Headline (LARGE BOLD COLORED TEXT): "خليه جزء من يومك"
* Body Text (Large Black): "راح يساعدك توفر وقت ومجهود ويعطيك راحة أكثر في حياتك اليومية."

* Visual Flow: Centered glowing five-star rating section.
* Headline (LARGE BOLD BLACK): "آراء الزبائن"
* Review Text (Medium Black): "منتج رائع! استلمته بسرعة والنتيجة كانت أفضل مما توقعت."
* Guarantee Text (Medium Green): "✔️ ضمان الجودة وراحة البال"

* Visual Flow: High contrast modern footer section with strong call to action and product hero shot.
* Urgency Text (Large White Bold): "⚠️ العرض محدود والطلب كبير، اطلب الآن قبل ما يخلص"
* CTA Button (HUGE BLACK TEXT on YELLOW Button): ${ctaBtnText}`;
        } else if (isEnglish) {
            ctaBtnText = `"ORDER NOW - CASH ON DELIVERY${showPrice ? ' - ONLY ' + price + ' DZD' : ''}"`;
            promptTemplate = `Act as a world-class Mobile E-commerce Designer. Generate an ultra-long vertical infographic landing page (aspect ratio ${aspectRatioStr}) for the product in the uploaded image.

CRITICAL TEXT RULES:
1. ONLY render the exact English text provided inside the quotation marks " ".
2. ABSOLUTELY DO NOT render any structural words or labels.
3. Ensure all typography is massive and NEVER falls below 16px in size to guarantee strict mobile readability.

AESTHETIC & FLOW INSTRUCTIONS:
Create one continuous journey. Use smooth color gradients (specifically [insert English colors matching the product image here]) and subtle kinetic lines. No hard dividing lines. Feature the product repeatedly.

* Visual Flow: Dynamic background matching the [insert product vibe]. Product is floating.
* Top Badge (Small Yellow Text): "[Write: BEST SELLER or NEW ARRIVAL]"
* Main Headline (HUGE WHITE BOLD): "[Extremely catchy and powerful main headline in English]"
* Subhead (Large Text): "[A sentence explaining the main benefit of the product]"

* Visual Flow: Smooth transition to a muted area with an icon showing a problem.
* Headline (Large Bold Red): "[A question touching on the customer's pain point in English]"
* Body Text (Medium Black): "[Briefly explain the problem]"

* Visual Flow: Burst of bright light transitioning to a clean background. Product appears triumphantly.
* Headline (HUGE BOLD COLORED TEXT): "[Headline presenting the product as the ultimate solution]"
* Body Text (Large Black): "[A sentence confirming the power of the solution]"

* Visual Flow: Extreme close-up on [describe the most important feature].
* Headline (LARGE BOLD COLORED TEXT): "[Headline for the first key feature]"
* Body Text (Large Black): "[Strong explanation of the feature]"

* Visual Flow: Close-up on [describe a second important feature].
* Headline (LARGE BOLD COLORED TEXT): "[Headline for the second key feature]"
* Body Text (Large Black): "[Explanation of the second feature]"

* Visual Flow: Lifestyle background showing [describe a scene where the product is used].
* Headline (LARGE BOLD COLORED TEXT): "[Headline about the daily benefit of the product]"
* Body Text (Large Black): "[How the product improves the customer's life]"

* Visual Flow: 5 large glowing stars ★★★★★ centered.
* Headline (LARGE BOLD BLACK): "Trusted By Our Customers"
* Review Text (Medium Black): "[Short positive customer review in English]"
* Guarantee Text (Medium Green): "✅ 100% Quality & Money-Back Guarantee"

* Visual Flow: Solid, high-contrast footer section. Product prominent next to CTA button.
* Urgency Text (Large White Bold): "⚠️ Extremely Limited Stock Available, Order Now!"
* CTA Button (HUGE BLACK TEXT on YELLOW Button): ${ctaBtnText}`;
        } else if (isFrench) {
            ctaBtnText = `"COMMANDEZ MAINTENANT - PAIEMENT À LA LIVRAISON${showPrice ? ' - SEULEMENT ' + price + ' DA' : ''}"`;
            promptTemplate = `Act as a world-class Mobile E-commerce Designer. Generate an ultra-long vertical infographic landing page (aspect ratio ${aspectRatioStr}) for the product in the uploaded image.

CRITICAL TEXT RULES:
1. ONLY render the exact French text provided inside the quotation marks " ".
2. ABSOLUTELY DO NOT render any structural words or labels.
3. Ensure all typography is massive and NEVER falls below 16px in size to guarantee strict mobile readability.

AESTHETIC & FLOW INSTRUCTIONS:
Create one continuous journey. Use smooth color gradients (specifically [insert English colors matching the product image here]) and subtle kinetic lines. No hard dividing lines. Feature the product repeatedly.

* Visual Flow: Dynamic background matching the [insert product vibe]. Product is floating.
* Top Badge (Small Yellow Text): "[Write: MEILLEURE VENTE or NOUVEAUTÉ en Français]"
* Main Headline (HUGE WHITE BOLD): "[Extremely catchy and powerful main headline in French]"
* Subhead (Large Text): "[A sentence explaining the main benefit of the product in French]"

* Visual Flow: Smooth transition to a muted area with an icon showing a problem.
* Headline (Large Bold Red): "[A question touching on the customer's pain point in French]"
* Body Text (Medium Black): "[Briefly explain the problem in French]"

* Visual Flow: Burst of bright light transitioning to a clean background. Product appears triumphantly.
* Headline (HUGE BOLD COLORED TEXT): "[Headline presenting the product as the ultimate solution in French]"
* Body Text (Large Black): "[A sentence confirming the power of the solution in French]"

* Visual Flow: Extreme close-up on [describe the most important feature].
* Headline (LARGE BOLD COLORED TEXT): "[Headline for the first key feature in French]"
* Body Text (Large Black): "[Strong explanation of the feature in French]"

* Visual Flow: Close-up on [describe a second important feature].
* Headline (LARGE BOLD COLORED TEXT): "[Headline for the second key feature in French]"
* Body Text (Large Black): "[Explanation of the second feature in French]"

* Visual Flow: Lifestyle background showing [describe a scene where the product is used].
* Headline (LARGE BOLD COLORED TEXT): "[Headline about the daily benefit of the product in French]"
* Body Text (Large Black): "[How the product improves the customer's life in French]"

* Visual Flow: 5 large glowing stars ★★★★★ centered.
* Headline (LARGE BOLD BLACK): "La Confiance de Nos Clients"
* Review Text (Medium Black): "[Short positive customer review in French]"
* Guarantee Text (Medium Green): "✅ Qualité 100% Garantie & Satisfait ou Remboursé"

* Visual Flow: Solid, high-contrast footer section. Product prominent next to CTA button.
* Urgency Text (Large White Bold): "⚠️ Stock Très Limité, Commandez Vite !"
* CTA Button (HUGE BLACK TEXT on YELLOW Button): ${ctaBtnText}`;
        } else {
            ctaBtnText = `"اطلب الآن - الدفع عند الاستلام${showPrice ? ' - فقط بـ ' + price + ' د.ج' : ''}"`;
            promptTemplate = `Act as a world-class Mobile E-commerce Designer. Generate an ultra-long vertical infographic landing page (aspect ratio ${aspectRatioStr}) for the product in the uploaded image.

CRITICAL TEXT RULES:
1. ONLY render the exact Arabic text provided inside the quotation marks " ".
2. ABSOLUTELY DO NOT render any English structural words or labels.
3. Ensure all Arabic typography is massive and NEVER falls below 20px in size to guarantee strict mobile readability.

AESTHETIC & FLOW INSTRUCTIONS:
Create one continuous journey. Use smooth color gradients (specifically [insert English colors matching the product image here]) and subtle kinetic lines. No hard dividing lines. Feature the product repeatedly.

* Visual Flow: Dynamic background matching the [insert product vibe]. Product is floating.
* Top Badge (Small Yellow Text): "[اكتب: الأكثر مبيعاً أو جديد]"
* Main Headline (HUGE WHITE BOLD): "[عنوان رئيسي جذاب وقوي جداً بالعربية]"
* Subhead (Large Text): "[جملة تشرح الفائدة الكبرى للمنتج]"

* Visual Flow: Smooth transition to a muted area with an icon showing a problem.
* Headline (Large Bold Red): "[سؤال يلمس مشكلة العميل بالعربية]"
* Body Text (Medium Black): "[اشرح المشكلة باختصار]"

* Visual Flow: Burst of bright light transitioning to a clean background. Product appears triumphantly.
* Headline (HUGE BOLD COLORED TEXT): "[عنوان يقدم المنتج كحل نهائي]"
* Body Text (Large Black): "[جملة تؤكد قوة الحل]"

* Visual Flow: Split screen or side-by-side comparison layout. Left side is dark/dull showing [describe the problem state visually]. Right side is bright/vibrant showing [describe the transformed/happy state with the product].
* Headline (LARGE BOLD COLORED TEXT): "[عنوان جذاب للفرق قبل وبعد استخدام المنتج بالعربية]"
* Before Text (Medium Red): "❌ قبل: [وصف قصير للمعاناة بالعربية]"
* After Text (Medium Green): "✅ بعد: [وصف قصير للراحة والنتيجة بالعربية]"

* Visual Flow: Extreme close-up on [describe the most important feature].
* Headline (LARGE BOLD COLORED TEXT): "[عنوان الميزة الأولى بالعربية]"
* Body Text (Large Black): "[شرح قوي للميزة]"

* Visual Flow: Close-up on [describe a second important feature].
* Headline (LARGE BOLD COLORED TEXT): "[عنوان الميزة الثانية بالعربية]"
* Body Text (Large Black): "[شرح الميزة الثانية]"

* Visual Flow: Clean, modern comparison layout. Our product glowing and prominent vs a generic dull alternative.
* Headline (LARGE BOLD COLORED TEXT): "[عنوان يقارن ويثبت تفوق منتجنا بالعربية]"
* Our Product Feature 1 (Medium Green): "✔️ [ميزة حصرية في منتجنا]"
* Competitor Flaw 1 (Medium Red): "❌ [عيب في المنتجات الأخرى]"
* Our Product Feature 2 (Medium Green): "✔️ [ميزة ثانية قوية في منتجنا]"
* Competitor Flaw 2 (Medium Red): "❌ [عيب ثاني في المنتجات الأخرى]"

* Visual Flow: Lifestyle background showing [describe a scene where the product is used].
* Headline (LARGE BOLD COLORED TEXT): "[عنوان عن فائدة المنتج يومياً]"
* Body Text (Large Black): "[كيف يحسن المنتج حياة الزبون]"

* Visual Flow: 5 large glowing stars ★★★★★ centered.
* Headline (LARGE BOLD BLACK): "ثقة عملائنا"
* Review Text (Medium Black): "[مراجعة إيجابية قصيرة بلسان زبون بالعربية]"
* Guarantee Text (Medium Green): "✅ ضمان الجودة واسترداد الأموال"

* Visual Flow: Solid, high-contrast footer section. Product prominent next to CTA button.
* Urgency Text (Large White Bold): "⚠️ الكمية المتاحة محدودة جداً، اطلب الآن!"
* CTA Button (HUGE BLACK TEXT on YELLOW Button): ${ctaBtnText}`;
        }

        // Prepare system prompt based on user selection
        const systemPrompt = `أنت خبير تسويق إلكتروني (E-commerce Copywriter) متخصص في السوق العربي، ومصمم محترف للإعلانات المرئية.
قام التاجر برفع صورة لمنتجه. 
اللغة أو اللهجة المستهدفة للإعلان هي: ${language}.
هل يجب أن يظهر السعر؟ ${showPrice ? 'نعم، السعر هو ' + price + ' د.ج' : 'لا'}
أبعاد الصورة المطلوبة للإعلان هي: ${dimension === '9:16' ? 'عمودية (تصلح للقصص/ريلز 9:16)' : 'مربعة (1:1)'}.

مهمتك هي تحليل الصورة بدقة عالية وفهم طبيعة المنتج، ثم إرجاع بيانات بتنسيق JSON فقط تحتوي على المفاتيح التالية لإنشاء صفحة هبوط إعلانية عالية التحويل (High-Converting):

1. "product_name": استخراج أو اقتراح اسم تجاري جذاب للمنتج بناءً على صورته.
2. "hero_headline": عنوان رئيسي يلامس عاطفة أو مشكلة المشتري بلغة مبسطة وجذابة باللغة/اللهجة المحددة ويبرز الفائدة الأساسية للمنتج.
3. "benefits": مصفوفة (Array) تحتوي على 4 ميزات أو فوائد قصيرة وقوية جداً للمنتج باللغة/اللهجة المحددة. يجب أن يكون كل عنصر عبارة عن نص فقط. أضف إيموجي مناسب في بداية كل جملة.
4. "image_generation_prompt": عليك إنشاء وصف دقيق جداً (برومبت) لنموذج توليد الصور Nano Banana. خذ القالب التالي، وقم بتعبئة الفراغات [ما بين الأقواس المربعة] إن وجدت، بنصوص وتفاصيل مناسبة للصورة، مع الحفاظ التام على النصوص المحددة فيه:

${promptTemplate}

تذكر: يجب أن تقوم بإرجاع الاستجابة بتنسيق JSON فقط ليسهل معالجتها برمجياً.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                systemPrompt,
                {
                    inlineData: {
                        data: imageBase64.split(',')[1],
                        mimeType: mimeType || 'image/jpeg'
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error('لم يتم إرجاع أي نص من النموذج');
        }

        try {
            const parsedJson = JSON.parse(text);

            // Generate Ad Image with Nano Banana model
            let generatedImageB64: string | null = null;
            let nanoBananaError: string | null = null;

            try {
                console.log("Calling Nano Banana model (nano-banana-pro-preview)...");
                const bananaPrompt = (parsedJson.image_generation_prompt || '') + `\n\nAspect ratio: ${dimension === '9:32' ? '9:32 ultra-long vertical' : dimension === '9:16' ? '9:16 vertical' : '1:1 square'}.`;

                const bananaRes = await ai.models.generateContent({
                    model: 'nano-banana-pro-preview',
                    contents: [
                        bananaPrompt,
                        {
                            inlineData: {
                                data: imageBase64.split(',')[1],
                                mimeType: mimeType || 'image/jpeg'
                            }
                        }
                    ]
                });

                const parts = bananaRes.candidates?.[0]?.content?.parts || [];
                const imagePart = parts.find((p: any) => p.inlineData);
                if (imagePart && imagePart.inlineData) {
                    generatedImageB64 = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                }
            } catch (bananaErr: any) {
                console.warn("Nano Banana API error:", bananaErr?.message || bananaErr);
                nanoBananaError = bananaErr?.message || 'Quota limit or model unavailable';
            }

            parsedJson.generated_image_b64 = generatedImageB64;
            parsedJson.nano_banana_error = nanoBananaError;

            return NextResponse.json(parsedJson);
        } catch (e) {
            console.error("Failed to parse Gemini response as JSON:", text);
            return NextResponse.json({ error: 'Model did not return valid JSON' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Error in AI Analysis API:', error);
        return NextResponse.json({ error: error.message || 'حدث خطأ أثناء معالجة الطلب' }, { status: 500 });
    }
}
