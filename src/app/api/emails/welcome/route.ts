import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { Resend } from 'resend';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, storeUrl } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Try env variable first (fastest + most reliable)
        let resendKey = process.env.RESEND_API_KEY;
        let platformName = 'SOUQ AI';

        // Fallback to DB if env not set
        if (!resendKey) {
            const { data: settings, error: dbError } = await insforge.database
                .from('platform_settings')
                .select('resend_key, platform_name')
                .eq('id', 1)
                .single();

            console.log("FETCHED DB ERROR:", dbError);
            console.log("FETCHED SETTINGS:", settings);

            if (dbError) {
                console.error('[DB Error]:', dbError);
                return NextResponse.json({ error: 'DB_ERROR: ' + JSON.stringify(dbError) }, { status: 500 });
            }

            if (!settings?.resend_key) {
                return NextResponse.json({ error: 'RESEND_KEY_MISSING' }, { status: 500 });
            }

            resendKey = settings.resend_key;
            platformName = settings.platform_name || 'SOUQ AI';
        }

        const resend = new Resend(resendKey);

        const html = `
            <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                    <h2 style="color: #ec4899; margin: 0;">أهلاً بك في ${platformName} يا ${name}!</h2>
                </div>
                
                <p style="font-size: 16px;">سعداء جداً بانضمامك إلينا وبدء رحلتك في عالم التجارة الإلكترونية الخارقة!</p>
                <p style="font-size: 16px;">لقد تم إنشاء متجرك وعالمك الخاص بنجاح، وهو الآن جاهز للتحليق واستقبال منتجاتك وعملائك.</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-right: 4px solid #3b82f6; margin: 25px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #475569;">🔗 الرابط السحري لمتجرك هو:</p>
                    <a href="${storeUrl}" style="color: #3b82f6; text-decoration: none; font-size: 18px; font-weight: bold; display: inline-block;">${storeUrl}</a>
                </div>

                <div style="background-color: #fdf2f8; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #be185d; margin-top: 0;">🎯 ما هي خطواتك القادمة؟</h3>
                    <ul style="padding-right: 20px; margin-bottom: 0;">
                        <li style="margin-bottom: 8px;">أضف أول منتجاتك للمتجر من لوحة التحكم</li>
                        <li style="margin-bottom: 8px;">قم بملء الإعدادات وشعار متجرك، وأدخل معلومات الاتصال لكي تظهر في متجرك</li>
                        <li>شارك رابط المتجر مع عملائك وابدأ بتحقيق المبيعات!</li>
                    </ul>
                </div>

                <p style="font-size: 16px; font-weight: bold;">نتمنى لك مبيعات ضخمة وتجارة رابحة لا تتوقف! 🚀</p>
                <br>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #64748b; font-size: 14px; text-align: center;">مع خالص التحيات،<br>فريق ${platformName}</p>
            </div>
        `;

        console.log('[Welcome Email] Sending via official Resend SDK...');
        const emailResponse = await resend.emails.send({
            from: `${platformName} <hello@souqai.net>`,
            to: email,
            subject: `🎉 أهلاً بك في ${platformName} - تم إنشاء متجرك بنجاح!`,
            html: html
        });

        if (emailResponse.error) {
            console.error('[Resend Error]:', emailResponse.error);
            return NextResponse.json({ 
                error: emailResponse.error.message || 'Resend error', 
                details: emailResponse.error 
            }, { status: 400 });
        }

        console.log('[Welcome Email] Success! ID:', emailResponse.data?.id);
        return NextResponse.json({ success: true, id: emailResponse.data?.id });

    } catch (error: any) {
        console.error('[Welcome Email Exception]:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
