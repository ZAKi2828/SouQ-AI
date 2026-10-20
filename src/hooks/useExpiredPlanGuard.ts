'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoreContext } from '@/lib/storeContext';

/**
 * Hook to check if the merchant's plan has expired.
 * If expired, redirects to /upgrade with a forced overlay.
 * Used across all merchant dashboard pages to enforce plan expiration.
 * 
 * Returns { planExpired, currentPlan, loading } so pages can optionally show PlanExpiredOverlay.
 */
export function useExpiredPlanGuard() {
    const router = useRouter();
    const [planExpired, setPlanExpired] = useState(false);
    const [currentPlan, setCurrentPlan] = useState('free');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkPlan() {
            try {
                const ctx = await getStoreContext();
                if (!ctx) {
                    setLoading(false);
                    return;
                }

                // Blocked users go to /blocked
                if (ctx.plan === 'blocked' || ctx.plan === 'محظور') {
                    window.location.href = '/blocked';
                    return;
                }

                setCurrentPlan(ctx.plan || 'free');

                // Check if plan is explicitly expired
                if (ctx.plan === 'expired') {
                    setPlanExpired(true);
                    setLoading(false);
                    return;
                }

                // Check if plan has expired by date
                if (ctx.planExpiresAt) {
                    const expiresAt = new Date(ctx.planExpiresAt);
                    if (expiresAt < new Date()) {
                        setPlanExpired(true);
                    }
                }
            } catch (err) {
                console.error('Plan guard error:', err);
            } finally {
                setLoading(false);
            }
        }
        checkPlan();
    }, [router]);

    return { planExpired, currentPlan, loading };
}
