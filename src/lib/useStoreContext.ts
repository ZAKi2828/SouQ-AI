import { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';

export function useStoreContext() {
    const [context, setContext] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchContext() {
            try {
                const { data: sessionData } = await insforge.auth.getCurrentSession();
                if (!sessionData?.session?.user) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const uid = sessionData.session.user.id;
                const email = sessionData.session.user.email || '';

                // Try fetching as team member first
                const { data: member } = await insforge.database
                    .from('team_members')
                    .select('store_owner_id, role, status')
                    .eq('member_email', email)
                    .eq('status', 'active')
                    .maybeSingle();

                const targetUserId = member?.store_owner_id ? member.store_owner_id : uid;
                const role = member?.role || 'owner';

                // Fetch target profile limits
                const { data: profile } = await insforge.database
                    .from('profiles')
                    .select('full_name, store_slug, plan, plan_expires_at')
                    .eq('id', targetUserId)
                    .single();

                // Fetch store details
                const { data: store } = await insforge.database
                    .from('stores')
                    .select('id, store_name, store_domain, custom_domain, logo_url')
                    .eq('user_id', targetUserId)
                    .single();

                if (isMounted) {
                    setContext({
                        uid,
                        targetUserId,
                        email,
                        role,
                        storeDomain: profile?.store_slug || store?.store_domain || null,
                        customDomain: store?.custom_domain || null,
                        storeName: store?.store_name || null,
                        logoUrl: store?.logo_url || null,
                        plan: profile?.plan || 'free',
                        planExpiresAt: profile?.plan_expires_at || null,
                        ownerName: profile?.full_name || null
                    });
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching store context:', err);
                if (isMounted) setLoading(false);
            }
        }
        fetchContext();
        return () => { isMounted = false; };
    }, []);

    return { context, loading };
}
