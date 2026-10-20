module.exports = async function(request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const url = new URL(request.url);
        const domainName = url.searchParams.get('domain');

        if (!domainName || domainName.length < 2) {
            return new Response(JSON.stringify({ error: 'Domain name required (min 2 chars)' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Spaceship API credentials
        const API_KEY = process.env.SPACESHIP_API_KEY || '';
        const API_SECRET = process.env.SPACESHIP_API_SECRET || '';

        // TLD list with USD wholesale prices (approximate Spaceship pricing)
        const tlds = [
            { ext: '.com',    usdPrice: 9.28 },
            { ext: '.net',    usdPrice: 10.18 },
            { ext: '.org',    usdPrice: 9.68 },
            { ext: '.io',     usdPrice: 33.18 },
            { ext: '.ai',     usdPrice: 17.00 },
            { ext: '.store',  usdPrice: 1.98 },
            { ext: '.shop',   usdPrice: 0.98 },
            { ext: '.online', usdPrice: 0.98 },
            { ext: '.site',   usdPrice: 0.98 },
            { ext: '.co',     usdPrice: 11.18 },
            { ext: '.app',    usdPrice: 14.18 },
            { ext: '.dev',    usdPrice: 12.18 },
            { ext: '.me',     usdPrice: 0.98 },
            { ext: '.xyz',    usdPrice: 0.98 },
            { ext: '.info',   usdPrice: 0.98 },
        ];

        // Pricing logic:
        // .com, .net, .org, .io, .ai => 3500 DZD
        // USD price <= 5.00 => 1500 DZD
        // USD price > 5.00 => price * 300 (USD to DZD)
        const fixedPriceTLDs = ['.com', '.net', '.org', '.io', '.ai'];

        function calcDZD(ext, usdPrice) {
            if (fixedPriceTLDs.includes(ext)) return 3500;
            if (usdPrice <= 5.0) return 1500;
            return Math.round(usdPrice * 300);
        }

        const results = [];

        // If Spaceship API keys are configured, check real availability
        if (API_KEY && API_SECRET) {
            const checks = tlds.map(async (tld) => {
                const fullDomain = domainName + tld.ext;
                try {
                    const res = await fetch(`https://spaceship.dev/api/v1/domains/${fullDomain}/available`, {
                        method: 'GET',
                        headers: {
                            'X-Api-Key': API_KEY,
                            'X-Api-Secret': API_SECRET,
                        },
                    });
                    const data = await res.json();
                    return {
                        name: fullDomain,
                        tld: tld.ext,
                        price: calcDZD(tld.ext, tld.usdPrice),
                        priceUSD: tld.usdPrice,
                        available: data.available === true,
                    };
                } catch (err) {
                    return {
                        name: fullDomain,
                        tld: tld.ext,
                        price: calcDZD(tld.ext, tld.usdPrice),
                        priceUSD: tld.usdPrice,
                        available: false,
                    };
                }
            });
            const settled = await Promise.all(checks);
            results.push(...settled);
        } else {
            // Fallback: Use RDAP to check domain availability
            const checks = tlds.map(async (tld) => {
                const fullDomain = domainName + tld.ext;
                try {
                    // RDAP returns 404 if the domain is NOT registered (available)
                    // and 200 if it IS registered (unavailable)
                    const res = await fetch(`https://rdap.org/domain/${fullDomain}`);
                    return {
                        name: fullDomain,
                        tld: tld.ext,
                        price: calcDZD(tld.ext, tld.usdPrice),
                        priceUSD: tld.usdPrice,
                        available: res.status === 404,
                    };
                } catch (err) {
                    return {
                        name: fullDomain,
                        tld: tld.ext,
                        price: calcDZD(tld.ext, tld.usdPrice),
                        priceUSD: tld.usdPrice,
                        available: false, // Default to false on error
                    };
                }
            });
            const settled = await Promise.all(checks);
            results.push(...settled);
        }

        return new Response(JSON.stringify({ results, apiConnected: !!(API_KEY && API_SECRET) }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
};
