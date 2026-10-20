import { NextResponse, type NextRequest } from 'next/server';
import { InsforgeMiddleware } from '@insforge/nextjs/middleware';

// ═══════════════════════════════════════════════════════════════
// SECURITY: Hardcoded admin email whitelist (mirrored from admin-config.ts)
// This MUST be kept in sync with src/lib/admin-config.ts
// We duplicate here because middleware runs on the Edge runtime
// and cannot import from client-side modules.
// ═══════════════════════════════════════════════════════════════
const SUPER_ADMIN_EMAILS = ['zakariaroui7@gmail.com'];

const authMiddleware = InsforgeMiddleware({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app',
    publicRoutes: [
        '/',
        '/api/auth',
        '/merchant',
        '/analytics',
        '/orders',
        '/inventory',
        '/inventory/add',
        '/builder',
        '/team',
        '/order',
        '/settings',
        '/login',
        '/t/demo'
    ],
});

export default async function middleware(req: NextRequest, event: any) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';
    const pathname = url.pathname;

    // ═══════════════════════════════════════════════════════════════
    // LAYER 1: SUPER ADMIN ROUTE PROTECTION
    // Block ALL /super-admin routes for unauthorized users at the edge.
    // This runs BEFORE any page component loads.
    // ═══════════════════════════════════════════════════════════════
    if (pathname.startsWith('/super-admin')) {
        // Extract user email from the InsForge session cookie/token
        const sessionCookie = req.cookies.get('insforge-session')?.value
            || req.cookies.get('sb-access-token')?.value
            || req.cookies.get('insforge-auth-token')?.value;

        if (sessionCookie) {
            try {
                // Decode JWT to extract email (JWT is base64url encoded)
                const parts = sessionCookie.split('.');
                if (parts.length >= 2) {
                    const payload = JSON.parse(
                        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
                    );
                    const email = payload.email || payload.user?.email || '';

                    if (email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
                        // ✅ Authorized admin — allow through
                        return NextResponse.next();
                    }
                }
            } catch (e) {
                // Token decode failed — deny access
                console.warn('[Middleware] Failed to decode session token for admin route');
            }
        }

        // 🚫 No valid session or email not in whitelist — redirect to merchant
        const merchantUrl = new URL('/merchant', req.url);
        return NextResponse.redirect(merchantUrl);
    }

    // Determine if the request is on a dynamic store subdomain or custom domain
    let isSubdomain = false;
    let storeDomain = '';

    const isLocalhost = hostname.includes('localhost');
    const isInsforgeSite = hostname.includes('insforge.site');
    const isVercel = hostname.includes('vercel.app');
    const isMainDomain = hostname.endsWith('souqai.net') || isInsforgeSite || isVercel;

    if (isLocalhost) {
        if (hostname.includes('.localhost:')) {
            isSubdomain = true;
            storeDomain = hostname.split('.localhost:')[0];
        }
    } else if (isInsforgeSite || isVercel) {
        // Main deployment URL on InsForge / Vercel is the SaaS platform, not a tenant store
        isSubdomain = false;
    } else if (isMainDomain) {
        if (hostname !== 'souqai.net' && hostname !== 'www.souqai.net') {
            isSubdomain = true;
            storeDomain = hostname.split('.souqai.net')[0];
        }
    } else {
        // It's a custom domain! e.g. www.perfume.dz
        isSubdomain = true;
        storeDomain = hostname;
    }

    // Exclude API, static files, platform features, and Next.js internal paths from tenant routing
    const platformRoutes = [
        '/api',
        '/_next',
        '/favicon.ico',
        '/trending',
        '/merchant',
        '/analytics',
        '/orders',
        '/inventory',
        '/builder',
        '/team',
        '/apps',
        '/customers',
        '/settings',
        '/login',
        '/super-admin'
    ];
    const isSystemPath = platformRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

    if (isSubdomain && storeDomain && !isSystemPath) {
        // Rewrite to src/app/[storeDomain]... 
        // Example: ahmed.souqai.net/iphone -> /ahmed/iphone
        // Example: www.mystore.com/iphone -> /www.mystore.com/iphone
        const rewritePath = pathname === '/' ? `/${storeDomain}` : `/${storeDomain}${pathname}`;
        return NextResponse.rewrite(new URL(rewritePath, req.url));
    }
    // Pass the request through to auth middleware ONLY for dashboard/protected routes
    const dashboardRoutes = ['/merchant', '/analytics', '/orders', '/inventory', '/builder', '/team', '/apps', '/customers', '/settings'];
    const isDashboardRoute = dashboardRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

    // Also protect the root of the SaaS app itself if needed, or let authMiddleware handle login
    // For anything that is a storefront (like /demo, /ahmed, or /t/demo), we want to make it purely public.
    const isAuthRoute = pathname === '/login' || pathname.startsWith('/api/auth');

    if (isDashboardRoute || isAuthRoute || pathname === '/') {
        return authMiddleware(req);
    }

    // Otherwise, treat as a public storefront path (e.g. /demo/iphone, /demo/thank-you)
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
