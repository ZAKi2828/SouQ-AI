'use client';

import React, { createContext, useContext, useState } from 'react';

type ProductOptionsContextType = {
    selectedOptions: Record<string, string>;
    setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

const ProductOptionsContext = createContext<ProductOptionsContextType | undefined>(undefined);

export function ProductOptionsProvider({ children }: { children: React.ReactNode }) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    return (
        <ProductOptionsContext.Provider value={{ selectedOptions, setSelectedOptions }}>
            {children}
        </ProductOptionsContext.Provider>
    );
}

export function useProductOptions() {
    const context = useContext(ProductOptionsContext);
    if (!context) {
        // Fallback for standalone usage (e.g. if a component is rendered outside the provider)
        console.warn('useProductOptions used outside ProductOptionsProvider. Returning dummy context.');
        return {
            selectedOptions: {},
            setSelectedOptions: () => {}
        };
    }
    return context;
}
