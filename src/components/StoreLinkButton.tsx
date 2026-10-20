'use client';
import { useI18n } from '@/context/I18nContext';
import React, { useState, useEffect } from 'react';
import { getStoreContext } from '@/lib/storeContext';

export default function StoreLinkButton() {
    const { t } = useI18n();
    const [storeLink, setStoreLink] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchStore = async () => {
            const ctx = await getStoreContext();
            if (ctx && isMounted) {
                const isLocal = window.location.hostname.includes('localhost');
                let link = '';
                if (isLocal) {
                    link = `http://${ctx.storeDomain || ctx.customDomain}.localhost:3000`;
                } else if (ctx.customDomain) {
                    link = `https://${ctx.customDomain}`;
                } else if (ctx.storeDomain) {
                    link = `https://${ctx.storeDomain}.souqai.net`;
                }
                if (link) setStoreLink(link);
            }
        };
        fetchStore();
        return () => { isMounted = false; };
    }, []);

    if (!storeLink) return null;

    return (
        <a
            href={storeLink}
            target="_blank"
            rel="noopener noreferrer"
            title={t("t_5e2b4460")}
            className="relative flex items-center justify-center w-12 h-12 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary shadow-sm hover:shadow-md transition-all group"
        >
            <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform duration-300">storefront</span>
        </a>
    );
}
