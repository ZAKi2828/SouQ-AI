import StorefrontIndexTemplate from '@/components/templates/StorefrontIndexTemplate';
import PixelScripts from '@/components/PixelScripts';
import { insforge } from '@/lib/insforge';
import { notFound } from 'next/navigation';

export default async function StorefrontPage({ params }: { params: Promise<{ storeDomain: string }> }) {
    const resolvedParams = await params;

    // Fetch store details by store_domain or custom_domain
    const { data: stores, error: storeError } = await insforge.database
        .from('stores')
        .select('*')
        .or(`store_domain.eq.${resolvedParams.storeDomain},custom_domain.eq.${resolvedParams.storeDomain}`)
        .limit(1);

    if (storeError || !stores || stores.length === 0) {
        return notFound();
    }

    const store = stores[0];

    // Fetch products using the true store_domain
    const { data: products, error: productsError } = await insforge.database
        .from('products')
        .select('*')
        .eq('store_domain', store.store_domain)
        .eq('status', 'active');

    // Check user plan to auto-hide SOUQ AI branding for paid users
    const { data: profile } = await insforge.database
        .from('profiles')
        .select('plan, is_paid')
        .eq('id', store.user_id)
        .single();
        
    const isPaid = profile && (profile.plan === 'pro' || profile.plan === 'vip' || profile.is_paid === true);
    
    // Respect store.hide_branding if set by admin, otherwise fallback to plan-based check
    let hideBranding = false;
    if (store && (store.hide_branding === true || store.hide_branding === false)) {
        hideBranding = store.hide_branding;
    } else {
        hideBranding = isPaid ? true : false;
    }
    
    const storeWithBranding = {
        ...store,
        hide_branding: hideBranding,
    };

    return (
        <>
            <PixelScripts userId={store.user_id} storeDomain={store.store_domain} />
            <StorefrontIndexTemplate store={storeWithBranding} products={products || []} />
        </>
    );
}
