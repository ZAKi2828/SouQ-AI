import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

// Public API - fetches enabled pixel IDs for a store owner (no auth required - used on public pages)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        const { data, error } = await insforge.database
            .from('store_pixels')
            .select('facebook_pixel_id, facebook_enabled, tiktok_pixel_id, tiktok_enabled, google_analytics_id, google_enabled, gtm_id, gtm_enabled, snapchat_pixel_id, snapchat_enabled')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return NextResponse.json({ pixels: {} }, { status: 200 });
        }

        // Only return enabled pixels with their IDs (no secret tokens)
        const pixels: Record<string, string> = {};

        if (data.facebook_enabled && data.facebook_pixel_id) {
            pixels.fbPixelId = data.facebook_pixel_id;
        }
        if (data.tiktok_enabled && data.tiktok_pixel_id) {
            pixels.ttPixelId = data.tiktok_pixel_id;
        }
        if (data.google_enabled && data.google_analytics_id) {
            pixels.gaId = data.google_analytics_id;
        }
        if (data.gtm_enabled && data.gtm_id) {
            pixels.gtmId = data.gtm_id;
        }
        if (data.snapchat_enabled && data.snapchat_pixel_id) {
            pixels.snapPixelId = data.snapchat_pixel_id;
        }

        return NextResponse.json({ pixels }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            }
        });
    } catch (err) {
        return NextResponse.json({ pixels: {} }, { status: 200 });
    }
}
