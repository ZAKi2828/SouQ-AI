'use client';
import { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { insforge } from '@/lib/insforge';

interface SmartUpsellProps {
    product: any;
    currentOrderId: string;
    customerPhone: string;
    customerName: string;
    customerState: string;
    customerAddress: string;
}

export default function SmartUpsell({
    product, currentOrderId, customerPhone, customerName, customerState, customerAddress
}: SmartUpsellProps) {
    const { t } = useI18n();
    const enabled = product?.upsell_enabled === true || product?.upsell_enabled === 'true';
    const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !product?.store_domain) return;

        async function fetchUpsell() {
            try {
                // Fetch up to 2 other active products from the same store
                const { data, error } = await insforge.database
                    .from('products')
                    .select('id, name, price, compare_at_price, image_url')
                    .eq('store_domain', product.store_domain)
                    .eq('status', 'active')
                    .neq('id', product.id)
                    .limit(2);
                
                if (!error && data) {
                    setUpsellProducts(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchUpsell();
    }, [enabled, product?.store_domain, product?.id]);

    if (!enabled || loading || upsellProducts.length === 0) return null;

    const title = product.upsell_title || t('t_ec3505c2'); // 'قد يعجبك أيضاً'

    const handleAddUpsell = async (upsellProduct: any) => {
        setAdding(upsellProduct.id);
        try {
            // Create a new order for the upsell product linked to the same customer
            const orderData = {
                store_domain: product.store_domain,
                product_id: upsellProduct.id,
                product_name: upsellProduct.name,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress,
                customer_state: customerState,
                total_price: parseFloat(upsellProduct.price),
                quantity: 1,
                notes: `[Upsell Order] أضيف من صفحة الشكر للطلب: ${currentOrderId}`,
                time_elapsed: 0,
            };

            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            // "تمت إضافة X لطلبك بنجاح! شكراً لك."
            alert(`${t('t_84da')} ${upsellProduct.name} ${t('t_185c')}`);
            setUpsellProducts(prev => prev.filter(p => p.id !== upsellProduct.id));
        } catch (err) {
            console.error(err);
            alert(t('t_b705bf75')); // 'حدث خطأ أثناء إضافة المنتج. يرجى المحاولة مرة أخرى.'
        } finally {
            setAdding(null);
        }
    };

    return (
        <div className="mt-8 border-t border-slate-700/50 pt-8 w-full">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">loyalty</span>
                {title}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upsellProducts.map(up => (
                    <div key={up.id} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center text-center hover:bg-slate-800 transition-colors">
                        <div className="w-24 h-24 rounded-xl overflow-hidden mb-3 border border-slate-700 relative">
                            <img src={up.image_url || 'https://placehold.co/400x400'} alt={up.name} className="w-full h-full object-cover" />
                            {up.compare_at_price && parseFloat(up.compare_at_price) > parseFloat(up.price) && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                                    {t('t_c5a14db2')} {/* تخفيض */}
                                </div>
                            )}
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1 line-clamp-2 min-h-[40px]">{up.name}</h4>
                        <div className="flex items-center gap-2 mb-4">
                            {up.compare_at_price && <span className="line-through text-slate-500 text-xs">{up.compare_at_price} {t('dzd')}</span>}
                            <span className="font-black text-emerald-400">{up.price} {t('dzd')}</span>
                        </div>
                        <button 
                            disabled={adding === up.id}
                            onClick={() => handleAddUpsell(up)}
                            className="w-full bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 text-white border border-white/10 hover:border-emerald-500/30 rounded-xl py-2 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {adding === up.id ? (
                                <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                            ) : (
                                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                            )}
                            {t('t_47cb232b')} {/* إضافة للطلب */}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
