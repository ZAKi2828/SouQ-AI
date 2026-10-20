export default class Dolivroo {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, config?: { baseUrl?: string }) {
        this.apiKey = apiKey;
        this.baseUrl = config?.baseUrl || 'https://api.dolivroo.com/v1';
    }

    private get headers() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    private async request(path: string, options: RequestInit = {}) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers
            }
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Dolivroo API request failed with status ${response.status}`);
        }
        return response.json();
    }

    public parcels = {
        create: async (provider: string, data: any) => {
            return this.request('/parcels', {
                method: 'POST',
                body: JSON.stringify({ provider, ...data })
            });
        },
        get: async (trackingId: string, provider: string) => {
            return this.request(`/parcels/${trackingId}?provider=${encodeURIComponent(provider)}`);
        },
        getLabel: async (trackingId: string, provider: string) => {
            return this.request(`/parcels/${trackingId}/label?provider=${encodeURIComponent(provider)}`);
        },
        cancel: async (trackingId: string, provider: string) => {
            return this.request(`/parcels/${trackingId}/cancel`, {
                method: 'POST',
                body: JSON.stringify({ provider })
            });
        }
    };

    public rates = {
        get: async (provider: string, from: string, to: string) => {
            return this.request(`/rates?provider=${encodeURIComponent(provider)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        },
        compare: async (from: string, to: string) => {
            return this.request(`/rates/compare?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        }
    };

    public wilayas = {
        list: async (provider?: string) => {
            const query = provider ? `?provider=${encodeURIComponent(provider)}` : '';
            return this.request(`/wilayas${query}`);
        }
    };
}
