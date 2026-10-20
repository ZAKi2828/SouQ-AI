'use client';

import FashionTemplate from '@/components/templates/FashionTemplate';
import { useI18n } from "@/context/I18nContext";

export default function DemoPage() {
    const { t } = useI18n();
    const mockProduct = {
        name: t('t_d3fa34da'),
        description: t('t_1476a013c'),
        price: '12,500',
        compareAtPrice: '16,000',
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop'
    };

    return <FashionTemplate product={mockProduct} />;
}
