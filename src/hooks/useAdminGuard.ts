"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { isSuperAdminEmail } from '@/lib/admin-config';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  useAdminGuard - Super Admin Authorization Hook              ║
 * ║  This hook MUST be used in every super-admin page.           ║
 * ║  It performs dual verification:                              ║
 * ║  1. Checks auth session exists                               ║
 * ║  2. Verifies email is in the hardcoded whitelist             ║
 * ║  Any failure redirects to /merchant (dashboard home).        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

interface AdminGuardResult {
    isLoading: boolean;
    isAuthorized: boolean;
    adminEmail: string | null;
    adminId: string | null;
}

export function useAdminGuard(): AdminGuardResult {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminEmail, setAdminEmail] = useState<string | null>(null);
    const [adminId, setAdminId] = useState<string | null>(null);

    const verifyAdmin = useCallback(async () => {
        try {
            // Step 1: Check if user is even logged in
            const { data: sessionData, error: sessionError } = await insforge.auth.getCurrentSession();
            
            if (sessionError || !sessionData?.session?.user) {
                console.warn('[AdminGuard] No active session, redirecting to login');
                router.replace('/login');
                return;
            }

            const user = sessionData.session.user;
            const email = user.email;

            // Step 2: Verify email is in the hardcoded admin whitelist
            if (!isSuperAdminEmail(email)) {
                console.warn(`[AdminGuard] Unauthorized access attempt by: ${email}`);
                // Redirect to merchant dashboard — don't reveal admin pages exist
                router.replace('/merchant');
                return;
            }

            // Step 3: User is verified as super admin
            setAdminEmail(email);
            setAdminId(user.id);
            setIsAuthorized(true);

        } catch (err) {
            console.error('[AdminGuard] Critical error during authorization:', err);
            router.replace('/merchant');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        verifyAdmin();
    }, [verifyAdmin]);

    return { isLoading, isAuthorized, adminEmail, adminId };
}
