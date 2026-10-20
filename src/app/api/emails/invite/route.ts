import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { Resend } from 'resend';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { memberEmail, memberName, role, ownerName, storeName, inviteMessage } = body;

        console.log('[Invite Email] Called with:', { memberEmail, memberName, role, ownerName, storeName });

        if (!memberEmail) {
            return NextResponse.json({ error: 'Member email is required' }, { status: 400 });
        }

        // Try getting API key from ENV first
        let resendKey = process.env.RESEND_API_KEY;
        let platformName = 'SOUQ AI';

        // Fallback to DB if ENV is not loaded
        if (!resendKey) {
            const { data: settings, error: dbError } = await insforge.database
                .from('platform_settings')
                .select('resend_key, platform_name')
                .eq('id', 1)
                .single();

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

        const loginUrl = `https://souqai.net/login`;

        const roleLabels: Record<string, string> = {
            manager: 'مدير',
            editor: 'محرر',
            viewer: 'مشاهد',
            owner: 'مالك',
        };
        const roleLabel = roleLabels[role] || role || 'عامل';

        const html = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #1e293b; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #E91E63 0%, #9c27b0 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 12px;">👋</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900;">تمت دعوتك للانضمام!</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0; font-size: 15px;">
                    أنت مدعو للعمل في متجر <strong style="color: #fff;">${storeName || platformName}</strong>
                </p>
            </div>

            <!-- Body -->
            <div style="padding: 36px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
                
                <p style="font-size: 16px; margin-top: 0;">مرحباً<strong>${memberName || memberEmail.split('@')[0]}</strong>،
                </p>
                <p style="font-size: 15px; color: #475569;">
                    قام <strong>${ownerName || 'صاحب المتجر'}</strong> بدعوتك للانضمام إلى فريق متجر 
                    <strong>${storeName || platformName}</strong>على منصة<strong>${platformName}</strong> 
                    بصفة <span style="background:#fdf2f8; color:#be185d; padding: 2px 10px; border-radius: 20px; font-weight:bold;">${roleLabel}</span>.
                </p>

                ${inviteMessage ? `
                <div style="background-color: #f8fafc; border-right: 4px solid #E91E63; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                    <p style="margin: 0; font-style: italic; color: #475569; font-size: 14px;">
                        💬 رسالة من ${ownerName || 'صاحب المتجر'}:<br/>
                        <strong style="color: #1e293b;">"${inviteMessage}"</strong>
                    </p>
                </div>` : ''}

                <!-- Next Steps -->
                <div style="background: #fdf2f8; border-radius: 12px; padding: 22px 24px; margin: 28px 0;">
                    <h3 style="color: #be185d; margin-top: 0; font-size: 16px;">🎯 خطوات الانضمام:</h3>
                    <ol style="padding-right: 20px; margin-bottom: 0; color: #374151;">
                        <li style="margin-bottom: 10px;">سجّل الدخول باستخدام بريدك الإلكتروني:<strong style="color:#E91E63;">${memberEmail}</strong></li>
                        <li style="margin-bottom: 10px;">إذا لم يكن لديك حساب، قم بالتسجيل بنفس البريد الإلكتروني</li>
                        <li>ستظهر لك لوحة تحكم المتجر مباشرة بعد تسجيل الدخول</li>
                    </ol>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${loginUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #E91E63, #9c27b0); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 900; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(233, 30, 99, 0.35);">
                        🚀 قبول الدعوة والدخول الآن
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

                <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
                    إذا لم تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد الإلكتروني بأمان.<br/>
                    مع خالص التحيات، فريق <strong>${platformName}</strong>
                </p>
            </div>
        </div>
        `;

        console.log('[Invite Email] Sending via official Resend SDK...');
        const resend = new Resend(resendKey);

        const emailResponse = await resend.emails.send({
            from: `${platformName} <hello@souqai.net>`,
            to: memberEmail,
            subject: `🎉 تمت دعوتك للانضمام إلى ${storeName || platformName} - ${roleLabel}`,
            html: html
        });

        if (emailResponse.error) {
            console.error('[Resend Error]:', emailResponse.error);
            return NextResponse.json({ 
                error: emailResponse.error.message || 'Resend error', 
                details: emailResponse.error 
            }, { status: 400 });
        }

        console.log('[Invite Email] Success! ID:', emailResponse.data?.id);
        return NextResponse.json({ success: true, id: emailResponse.data?.id });

    } catch (error: any) {
        console.error('[Invite Email Exception]:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
