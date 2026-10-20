'use client';
import { InsforgeBrowserProvider, type InitialAuthState } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import * as React from 'react';

export function InsforgeProvider({ children }: { children: React.ReactNode }) {
    return (
        // @ts-ignore -- Mismatched SDK types between nextjs and sdk packages
        <InsforgeBrowserProvider client={insforge} afterSignInUrl="/merchant">
            {children}
        </InsforgeBrowserProvider>
    );
}
