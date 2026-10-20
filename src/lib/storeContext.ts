import { insforge } from '@/lib/insforge';

export async function getStoreContext() {
    try {
        const { data: sessionData } = await insforge.auth.getCurrentSession();
        if (!sessionData?.session?.user) return null;

        const uid = sessionData.session.user.id;
        const email = sessionData.session.user.email || '';

        // Check if user is an active or pending team member
        // Use case-insensitive match to handle different email formats
        const { data: members } = await insforge.database
            .from('team_members')
            .select('id, store_owner_id, role, status')
            .ilike('member_email', email)
            .in('status', ['active', 'pending']);

        // Pick first matching member (in case there are multiple)
        const member = members && members.length > 0 ? members[0] : null;

        // If they were pending, try to activate them
        if (member && member.status === 'pending') {
            try {
                await insforge.database
                    .from('team_members')
                    .update({ status: 'active', last_active: new Date().toISOString() })
                    .eq('id', member.id);
                member.status = 'active'; // Update local reference
            } catch (e) { }
        }

        const targetUserId = member?.store_owner_id ? member.store_owner_id : uid;
        const role = member?.role || 'owner';

        // Fetch store details
        const { data: store } = await insforge.database
            .from('stores')
            .select('id, store_name, store_domain, custom_domain, logo_url')
            .eq('user_id', targetUserId)
            .maybeSingle();

        const { data: profile } = await insforge.database
            .from('profiles')
            .select('plan, plan_expires_at, store_slug')
            .eq('id', targetUserId)
            .maybeSingle();

        return {
            uid,
            targetUserId, // The store owner's UID
            email,
            role,         // 'owner', 'manager', 'editor', 'viewer'
            storeDomain: store?.store_domain || profile?.store_slug || null,
            customDomain: store?.custom_domain || null,
            storeName: store?.store_name || null,
            logoUrl: store?.logo_url || null,
            plan: profile?.plan || 'free',
            planExpiry: profile?.plan_expires_at || null,
            planExpiresAt: profile?.plan_expires_at || null,
        };
    } catch (err) {
        console.error('Error fetching store context:', err);
        return null;
    }
}
