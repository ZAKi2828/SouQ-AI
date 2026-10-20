'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { insforge } from '@/lib/insforge';

interface PixelScriptsProps {
    userId: string;
    storeDomain?: string;
    productSlug?: string;
}

interface PixelData {
    fbPixelId?: string;
    ttPixelId?: string;
    gaId?: string;
    gtmId?: string;
    snapPixelId?: string;
}

/**
 * PixelScripts — Injects tracking pixels/scripts into storefront pages.
 * Loads pixel config from the API, then renders the appropriate <Script> tags.
 * Also logs page visits for analytics tracking.
 */
export default function PixelScripts({ userId, storeDomain, productSlug }: PixelScriptsProps) {
    const [pixels, setPixels] = useState<PixelData>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // 1. Fetch Pixel configurations
        fetch(`/api/pixels/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data?.pixels) {
                    setPixels(data.pixels);
                }
                setLoaded(true);
            })
            .catch(() => setLoaded(true));

        // 2. Track Traffic Visit Source
        if (storeDomain && typeof window !== 'undefined') {
            const pageKey = productSlug || 'home';
            const sessionKey = `visited_${storeDomain}_${pageKey}`;
            const alreadyVisited = sessionStorage.getItem(sessionKey);

            if (!alreadyVisited) {
                const urlParams = new URLSearchParams(window.location.search);
                const utmSource = urlParams.get('utm_source')?.toLowerCase() || '';
                const refParam = urlParams.get('ref')?.toLowerCase() || '';
                const referrer = document.referrer?.toLowerCase() || '';

                let source = 'direct';

                if (
                    utmSource.includes('facebook') || 
                    utmSource === 'fb' || 
                    refParam.includes('facebook') || 
                    referrer.includes('facebook.com') || 
                    referrer.includes('fb.me')
                ) {
                    source = 'facebook';
                } else if (
                    utmSource.includes('tiktok') || 
                    utmSource === 'tt' || 
                    referrer.includes('tiktok.com')
                ) {
                    source = 'tiktok';
                } else if (
                    utmSource.includes('instagram') || 
                    utmSource === 'ig' || 
                    referrer.includes('instagram.com')
                ) {
                    source = 'instagram';
                } else if (
                    utmSource.includes('snapchat') || 
                    utmSource === 'snap' || 
                    referrer.includes('snapchat.com')
                ) {
                    source = 'snapchat';
                } else if (
                    utmSource.includes('google') || 
                    utmSource === 'google_ads' || 
                    referrer.includes('google.com') || 
                    referrer.includes('googleadservices.com')
                ) {
                    source = 'google';
                } else if (utmSource) {
                    source = utmSource;
                } else if (referrer) {
                    try {
                        const parsedUrl = new URL(document.referrer);
                        source = parsedUrl.hostname.replace('www.', '');
                    } catch {
                        source = 'other';
                    }
                }

                // Save visitor source in sessionStorage for orders to capture
                sessionStorage.setItem('landing_page_source', source);
                sessionStorage.setItem(sessionKey, 'true');

                // Insert into page_visits table
                insforge.database.from('page_visits').insert({
                    store_domain: storeDomain,
                    product_slug: productSlug || null,
                    source: source
                }).then(({ error }) => {
                    if (error) {
                        console.error('[PixelScripts] Failed to log page visit:', error);
                    }
                });
            }
        }
    }, [userId, storeDomain, productSlug]);

    if (!loaded) return null;

    const fbPixelArray = (pixels.fbPixelId || '').split(',').map(id => id.trim()).filter(Boolean);
    const ttPixelArray = (pixels.ttPixelId || '').split(',').map(id => id.trim()).filter(Boolean);

    return (
        <>
            {/* ═══════════ FACEBOOK PIXEL ═══════════ */}
            {fbPixelArray.length > 0 && (
                <Script id="fb-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        ${fbPixelArray.map(id => `fbq('init', '${id}');`).join('\n                        ')}
                        fbq('track', 'PageView');
                    `}
                </Script>
            )}
            {fbPixelArray.map(id => (
                <noscript key={`fb-noscript-${id}`}>
                    <img height="1" width="1" style={{ display: 'none' }}
                        src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
                        alt="" />
                </noscript>
            ))}

            {/* ═══════════ TIKTOK PIXEL ═══════════ */}
            {ttPixelArray.length > 0 && (
                <Script id="tt-pixel" strategy="afterInteractive">
                    {`
                        !function (w, d, t) {
                            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
                            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                            ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                            ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
                            ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
                            o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
                            var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                            ${ttPixelArray.map(id => `ttq.load('${id}');`).join('\n                            ')}
                            ttq.page();
                        }(window, document, 'ttq');
                    `}
                </Script>
            )}

            {/* ═══════════ GOOGLE ANALYTICS 4 ═══════════ */}
            {pixels.gaId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${pixels.gaId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-config" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${pixels.gaId}');
                        `}
                    </Script>
                </>
            )}

            {/* ═══════════ GOOGLE TAG MANAGER ═══════════ */}
            {pixels.gtmId && (
                <>
                    <Script id="gtm-script" strategy="afterInteractive">
                        {`
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${pixels.gtmId}');
                        `}
                    </Script>
                    <noscript>
                        <iframe src={`https://www.googletagmanager.com/ns.html?id=${pixels.gtmId}`}
                            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
                    </noscript>
                </>
            )}

            {/* ═══════════ SNAPCHAT PIXEL ═══════════ */}
            {pixels.snapPixelId && (
                <Script id="snap-pixel" strategy="afterInteractive">
                    {`
                        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
                        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
                        a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
                        r.src=n;var u=t.getElementsByTagName(s)[0];
                        u.parentNode.insertBefore(r,u);})(window,document,
                        'https://sc-static.net/scevent.min.js');
                        snaptr('init', '${pixels.snapPixelId}', {});
                        snaptr('track', 'PAGE_VIEW');
                    `}
                </Script>
            )}
        </>
    );
}
