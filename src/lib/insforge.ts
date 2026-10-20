import { createClient } from '@insforge/sdk';

export const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '',
});

export const insforgeAdmin = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://q97h29qu.us-east.insforge.app',
    anonKey: 'ik_c00c3d4285111ebccaf8ca3116f447d1', // Project Admin Key (behaves like service role key)
});
