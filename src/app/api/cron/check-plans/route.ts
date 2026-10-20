import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { Resend } from 'resend';
import dns from 'node:dns';

try { dns.setDefaultResultOrder('ipv4first'); } catch (e) { }

const CRON_SECRET = process.env.CRON_SECRET || 'souqai-cron-2026';

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get('Authorization') || '';
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret') || authHeader.replace('Bearer ', '');

    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get Resend API key from platform settings
        const { data: settings } = await insforge.database
            .from('platform_settings')
            .select('resend_key, platform_name')
            .eq('id', 1)
            .single();

        const resendKey = settings?.resend_key;
        const platformName = settings?.platform_name || 'SOUQ AI';
        let resend: Resend | null = null;
        if (resendKey) {
            resend = new Resend(resendKey);
        }

        const results = { expired: 0, warned: 0, weeklyReminded: 0, emailsSent: 0, errors: [] as string[] };

        // 1. Expire overdue plans
        const { data: expiredUsers, error: expireError } = await insforge.database
            .rpc('expire_overdue_plans');

        if (expireError) {
            results.errors.push(`Expire RPC error: ${expireError.message}`);
        } else if (expiredUsers && expiredUsers.length > 0) {
            results.expired = expiredUsers.length;

            // Send expiry emails
            if (resend) {
                for (const user of expiredUsers) {
                    if (!user.email) continue;
                    try {
                        await resend.emails.send({
                            from: `${platformName} <noreply@souqai.net>`,
                            to: user.email,
                            subject: `⚠️ انتهت صلاحية اشتراكك في ${platformName}`,
                            html: generateExpiredEmail(user.store_name || 'التاجر', user.old_plan || 'الخطة', platformName),
                        });
                        results.emailsSent++;
                    } catch (emailErr: any) {
                        results.errors.push(`Email to ${user.email}: ${emailErr.message}`);
                    }
                }
            }
        }

        // 2. Warn users about upcoming expiry (Logic updated to handle free and paid users smartly)
        const { data: warningUsers, error: warnError } = await insforge.database
            .rpc('get_expiring_soon_users');

        if (warnError) {
            results.errors.push(`Warning RPC error: ${warnError.message}`);
        } else if (warningUsers && warningUsers.length > 0) {
            results.warned = warningUsers.length;

            if (resend) {
                for (const user of warningUsers) {
                    if (!user.email) continue;
                    try {
                        const daysLeft = user.days_left || 1;

                        await resend.emails.send({
                            from: `${platformName} <noreply@souqai.net>`,
                            to: user.email,
                            subject: `⏰ اشتراكك ينتهي خلال ${daysLeft} يوم - ${platformName}`,
                            html: generateWarningEmail(user.store_name || 'التاجر', user.plan, daysLeft, platformName),
                        });
                        results.emailsSent++;

                        // Mark as notified and increment level
                        const { data: profile } = await insforge.database.from('profiles').select('notification_level').eq('id', user.user_id).single();
                        await insforge.database
                            .from('profiles')
                            .update({ 
                                resend_notified: true,
                                last_email_sent_at: new Date().toISOString(),
                                notification_level: (profile?.notification_level || 0) + 1
                            })
                            .eq('id', user.user_id);

                    } catch (emailErr: any) {
                        results.errors.push(`Warning email to ${user.email}: ${emailErr.message}`);
                    }
                }
            }
        }

        // 3. Weekly Reminders for expired users
        const { data: weeklyUsers, error: weeklyError } = await insforge.database
            .rpc('get_weekly_expired_reminders');

        if (weeklyError) {
            results.errors.push(`Weekly Reminder RPC error: ${weeklyError.message}`);
        } else if (weeklyUsers && weeklyUsers.length > 0) {
            results.weeklyReminded = weeklyUsers.length;

            if (resend) {
                for (const user of weeklyUsers) {
                    if (!user.email) continue;
                    try {
                        await resend.emails.send({
                            from: `${platformName} <noreply@souqai.net>`,
                            to: user.email,
                            subject: `🌟 اشتقنا لك في ${platformName} - جدد متجرك الآن`,
                            html: generateWeeklyReminderEmail(user.store_name || 'التاجر', user.plan, platformName),
                        });
                        results.emailsSent++;

                        // Update last email sent date
                        await insforge.database
                            .from('profiles')
                            .update({ 
                                last_email_sent_at: new Date().toISOString()
                            })
                            .eq('id', user.user_id);

                    } catch (emailErr: any) {
                        results.errors.push(`Weekly email to ${user.email}: ${emailErr.message}`);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            ...results
        });

    } catch (error: any) {
        console.error('Cron check-plans error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function generateExpiredEmail(storeName: string, plan: string, platformName: string): string {
    const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://q97h29qu.insforge.site';
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px;text-align:center;">
        <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:32px;">⚠️</span>
        </div>
        <h1 style="color:white;font-size:24px;margin:0 0 8px;">انتهت صلاحية اشتراكك</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">تم إيقاف الوصول للوحة التحكم</p>
    </div>
    <div style="padding:32px;">
        <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 16px;">مرحباً<strong>${storeName}</strong>،
        </p>
        <p style="color:#6b7280;font-size:14px;line-height:1.8;margin:0 0 24px;">
            نود إعلامك أن اشتراكك في خطة <strong style="color:#E91E63;">${plan}</strong> قد انتهى.
            لا يزال متجرك مرئياً للعملاء، لكنك لن تتمكن من الوصول للوحة التحكم حتى تقوم بتجديد اشتراكك أو الترقية.
        </p>
        <div style="background:#fef2f2;border:1px solid #fee2e2;border-radius:12px;padding:16px;margin:0 0 24px;">
            <p style="color:#991b1b;font-size:13px;margin:0;font-weight:bold;">
                ❌ لا يمكنك إدارة المنتجات أو الطلبات أو الإعدادات حالياً
            </p>
        </div>
        <div style="text-align:center;">
            <a href="${origin}/upgrade" style="display:inline-block;background:linear-gradient(135deg,#E91E63,#ec4899);color:white;padding:14px 40px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(233,30,99,0.3);">
                🚀 جدد اشتراكك الآن
            </a>
        </div>
    </div>
    <div style="background:#f8f9fc;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 ${platformName}. جميع الحقوق محفوظة.</p>
    </div>
</div>
</body>
</html>`;
}

function generateWarningEmail(storeName: string, plan: string, daysLeft: number, platformName: string): string {
    const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://q97h29qu.insforge.site';
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px;text-align:center;">
        <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:32px;">⏰</span>
        </div>
        <h1 style="color:white;font-size:24px;margin:0 0 8px;">اشتراكك ينتهي قريباً!</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">متبقي ${daysLeft} أيام فقط</p>
    </div>
    <div style="padding:32px;">
        <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 16px;">مرحباً<strong>${storeName}</strong>،
        </p>
        <p style="color:#6b7280;font-size:14px;line-height:1.8;margin:0 0 24px;">
            نود تذكيرك بأن اشتراكك في خطة <strong style="color:#E91E63;">${plan}</strong>سينتهي خلال<strong style="color:#d97706;">${daysLeft} أيام</strong>.
            لتجنب فقدان الوصول للوحة التحكم، قم بتجديد اشتراكك الآن.
        </p>
        <div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:12px;padding:16px;margin:0 0 24px;">
            <p style="color:#92400e;font-size:13px;margin:0;">
                ⚡ جدد الآن لضمان استمرارية عمل متجرك بدون انقطاع
            </p>
        </div>
        <div style="text-align:center;">
            <a href="${origin}/upgrade" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:14px 40px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(217,119,6,0.3);">
                🔄 تجديد الاشتراك
            </a>
        </div>
    </div>
    <div style="background:#f8f9fc;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 ${platformName}. جميع الحقوق محفوظة.</p>
    </div>
</div>
</body>
</html>`;
}

function generateWeeklyReminderEmail(storeName: string, plan: string, platformName: string): string {
    const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://q97h29qu.insforge.site';
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:40px;text-align:center;">
        <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:32px;">🌟</span>
        </div>
        <h1 style="color:white;font-size:24px;margin:0 0 8px;">اشتقنا لك في ${platformName}</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">عد إلينا وابدأ البيع من جديد</p>
    </div>
    <div style="padding:32px;">
        <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 16px;">مرحباً<strong>${storeName}</strong>،
        </p>
        <p style="color:#6b7280;font-size:14px;line-height:1.8;margin:0 0 24px;">
            لاحظنا أن متجرك متوقف منذ فترة بسبب انتهاء الاشتراك. 
            لا تفوت فرصة تنمية مبيعاتك والوصول إلى المزيد من العملاء. قم بتجديد اشتراكك اليوم لتفعيل متجرك واستعادة كافة مميزات لوحة التحكم.
        </p>
        <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:12px;padding:16px;margin:0 0 24px;">
            <p style="color:#1d4ed8;font-size:13px;margin:0;font-weight:bold;">
                💡 بمجرد التجديد، ستعود منتجاتك للظهور فوراً للعملاء
            </p>
        </div>
        <div style="text-align:center;">
            <a href="${origin}/upgrade" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;padding:14px 40px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
                🚀 تفعيل المتجر الآن
            </a>
        </div>
    </div>
    <div style="background:#f8f9fc;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 ${platformName}. جميع الحقوق محفوظة.</p>
    </div>
</div>
</body>
</html>`;
}
