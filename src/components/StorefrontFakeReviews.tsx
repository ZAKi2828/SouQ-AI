'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useI18n } from '@/context/I18nContext';

function CountUp({ to, duration = 2 }: { to: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const end = to;
        const stepTime = Math.abs(Math.floor((duration * 1000) / end));
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, stepTime === 0 ? 1 : stepTime);
        return () => clearInterval(timer);
    }, [to, duration, isInView]);

    return <span ref={ref}>{count}</span>;
}

export default function StorefrontFakeReviews({ product }: { product?: any }) {
    const { t } = useI18n();
    const useCustom = product?.checkout_use_custom || false;
    const cPriceBg = useCustom && product?.checkout_price_bg ? product.checkout_price_bg : null;
    const cPriceBorder = useCustom && product?.checkout_price_border ? product.checkout_price_border : null;
    const cBadgeBg = useCustom && product?.checkout_badge_bg ? product.checkout_badge_bg : null;
    const isLightPrice = cPriceBg ? ['#f3f4f6','#f0f9fa','#ecfdf5','#fef3c7','#ffffff'].includes(cPriceBg.toLowerCase()) || cPriceBg.toLowerCase() > '#888888' : false;

    // Use a fixed random seed based on product ID so it doesn't jump constantly, or just a solid number
    const [reviewCount] = useState(() => Math.floor(product?.id ? (product.id % 150) + 50 : Math.random() * 200 + 50));

    if (product?.checkout_show_fake_reviews === false) {
        return null;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-4 p-4 rounded-2xl flex items-center justify-center gap-3 w-full relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow" 
            style={useCustom ? { background: cPriceBg || 'rgba(15,23,42,0.6)', border: `1px solid ${cPriceBorder || 'rgba(51,65,85,0.5)'}` } : { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)' }}
        >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .star-pop { animation: starPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; transform: scale(0); }
                @keyframes starPop { to { opacity: 1; transform: scale(1); } }
            `}} />

            <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s, i) => (
                    <span key={s} className="star-pop text-amber-400 text-lg drop-shadow-sm" style={{ animationDelay: `${i * 0.1}s` }}>★</span>
                ))}
            </div>
            
            <div className="flex items-center gap-1.5 ml-1">
                <span className={`text-[15px] font-black ${useCustom && isLightPrice ? 'text-[#181116]' : 'text-white'}`}>4.9</span>
                <span className={`text-[13px] font-medium ${useCustom && isLightPrice ? 'text-gray-500' : 'text-slate-400'}`}>
                    (<CountUp to={reviewCount} duration={1.5} /> {t('t_ba801a24') || 'تقييم'})
                </span>
            </div>
            
            <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" }}
                className="px-2.5 py-0.5 ml-2 rounded-md text-white text-[11px] font-black tracking-wide shadow-sm" 
                style={{ background: cBadgeBg || '#059669' }}
            >{t('t_327170a4') || 'موثوق ✓'}</motion.span>
        </motion.div>
    );
}
