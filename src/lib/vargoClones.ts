// ============================================================================
// SOUQai Shipping Carriers Registry
// Based on analysis of KaziSTM/vargo (https://github.com/KaziSTM/vargo)
// Each carrier's auth fields, base URL, and headers are extracted from actual
// driver source code to ensure 100% accuracy.
// Official logos are pulled directly from the Vargo repository assets.
// ============================================================================

export type CarrierFamily = 'yalidine' | 'ecotrack' | 'procolis' | 'zr' | 'noest' | 'maystro' | 'elogistia' | 'ecom' | 'near' | 'mdm' | 'zimou';

export interface AuthFieldConfig {
    key: string;       // internal key (maps to shipping_api_id or shipping_api_token)
    label: string;     // English label
    labelAr: string;   // Arabic label
    type: 'text' | 'password';
}

export interface CarrierInfo {
    id: string;
    name: string;
    nameAr: string;
    family: CarrierFamily;
    baseUrl: string;
    color: string;
    logo?: string;
    // Dynamic auth fields - field1 maps to shipping_api_id, field2 maps to shipping_api_token
    field1?: AuthFieldConfig;  // First credential (optional - some carriers don't need it)
    field2: AuthFieldConfig;   // Second credential (always required - the main token)
    needsFromWilaya?: boolean; // Only Yalidine family needs origin wilaya
}

// Raw content base URL for Vargo official logos
const VARGO_LOGO_BASE = 'https://raw.githubusercontent.com/KaziSTM/vargo/main/public/assets/logo';

// ============================================================================
// Helper to create carriers for each family
// ============================================================================

const yalidineCarrier = (id: string, name: string, nameAr: string, baseUrl: string, color: string, logoName: string): CarrierInfo => ({
    id, name, nameAr, family: 'yalidine', baseUrl, color,
    logo: `${VARGO_LOGO_BASE}/${logoName}`,
    field1: { key: 'api_id', label: 'API ID', labelAr: 'معرّف API', type: 'text' },
    field2: { key: 'api_token', label: 'API Token', labelAr: 'رمز API', type: 'password' },
    needsFromWilaya: true,
});

const ecotrackCarrier = (id: string, name: string, nameAr: string, baseUrl: string, color: string, logoName: string): CarrierInfo => ({
    id, name, nameAr, family: 'ecotrack', baseUrl, color,
    logo: `${VARGO_LOGO_BASE}/${logoName}`,
    // EcoTrack clones ONLY need api_token (no api_id!)
    field2: { key: 'api_token', label: 'API Token', labelAr: 'رمز API', type: 'password' },
});

const procolisCarrier = (id: string, name: string, nameAr: string, baseUrl: string, color: string, logoName: string): CarrierInfo => ({
    id, name, nameAr, family: 'procolis', baseUrl, color,
    logo: `${VARGO_LOGO_BASE}/${logoName}`,
    field1: { key: 'key', label: 'API Key', labelAr: 'مفتاح API', type: 'password' },
    field2: { key: 'token', label: 'API Token', labelAr: 'رمز API', type: 'text' },
});

// ============================================================================
// ALL CARRIERS REGISTRY WITH OFFICIAL LOGOS
// ============================================================================

export const CLONE_CARRIERS: Record<string, CarrierInfo> = {

    // ═══════════════════════════════════════════════════════════════════════
    // YALIDINE FAMILY (6 carriers) — X-API-ID + X-API-TOKEN + from_wilaya
    // ═══════════════════════════════════════════════════════════════════════
    yalidine:   yalidineCarrier('yalidine', 'Yalidine Express', 'ياليدين إكسبريس', 'https://api.yalidine.app', '#FF6B00', 'yalidine.png'),
    yalitec:    yalidineCarrier('yalitec', 'Yalitec', 'ياليتيك', 'https://api.yalitec.me', '#FF8C00', 'yalitec.png'),
    guepex:     yalidineCarrier('guepex', 'Guepex Express', 'قيباكس إكسبريس', 'https://api.guepex.app', '#E53935', 'guepex.png'),
    economiqua: yalidineCarrier('economiqua', 'Economiqua', 'إيكونوميكا', 'https://api.economiqua.app', '#FF7043', 'economiqua.png'),
    easy_speed: yalidineCarrier('easy_speed', 'Easy & Speed', 'إيزي آند سبيد', 'https://api.easyandspeed.app', '#FB8C00', 'easy-and-speed.png'),
    wecan:      yalidineCarrier('wecan', 'We Can Express', 'وي كان إكسبريس', 'https://api.wecanservices.me/v1', '#FF5722', 'we-can.png'),

    // ═══════════════════════════════════════════════════════════════════════
    // ZR EXPRESS (independent) — X-Api-Key + X-Tenant
    // ═══════════════════════════════════════════════════════════════════════
    zr: {
        id: 'zr', name: 'ZR Express', nameAr: 'زد آر إكسبريس', family: 'zr',
        baseUrl: 'https://api.zrexpress.app', color: '#1E88E5',
        logo: `${VARGO_LOGO_BASE}/zrexpress.png`,
        field1: { key: 'tenant_id', label: 'Tenant ID', labelAr: 'معرّف المستأجر', type: 'text' },
        field2: { key: 'api_key', label: 'API Key', labelAr: 'مفتاح API', type: 'password' },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PROCOLIS FAMILY (5 carriers) — Token + Key headers
    // ═══════════════════════════════════════════════════════════════════════
    procolis:       procolisCarrier('procolis', 'Procolis', 'بروكوليس', 'https://procolis.com/api_v1', '#7B1FA2', 'abex.png'), // Procolis has no generic logo, using abex as fallback
    abex:           procolisCarrier('abex', 'ABEX Express', 'أبكس إكسبريس', 'https://procolis.com/api_v1', '#9C27B0', 'abex.png'),
    leopard:        procolisCarrier('leopard', 'Leopard Express', 'ليوبارد إكسبريس', 'https://procolis.com/api_v1', '#8E24AA', 'leopard-express.png'),
    colilog:        procolisCarrier('colilog', 'Colilog Express', 'كوليلوغ إكسبريس', 'https://procolis.com/api_v1', '#AB47BC', 'colilog.png'),
    flash_delivery: procolisCarrier('flash_delivery', 'Flash Delivery', 'فلاش ديليفري', 'https://procolis.com/api_v1', '#CE93D8', 'flash-delivery.png'),

    // ═══════════════════════════════════════════════════════════════════════
    // ECOTRACK FAMILY (50+ carriers) — Bearer token only
    // ═══════════════════════════════════════════════════════════════════════
    ecotrack:           ecotrackCarrier('ecotrack', 'EcoTrack', 'إيكوتراك', 'https://gold.ecotrack.dz', '#43A047', 'ecotrack.png'),
    samex:              ecotrackCarrier('samex', 'Samex', 'ساميكس', 'https://samex.ecotrack.dz', '#66BB6A', 'samex.png'),
    dhd:                ecotrackCarrier('dhd', 'DHD Express', 'دي إتش دي إكسبريس', 'https://platform.dhd-dz.com', '#4CAF50', 'dhd.png'),
    allo_livraison:     ecotrackCarrier('allo_livraison', 'Allo Livraison', 'ألو ليفريزون', 'https://allolivraison.ecotrack.dz', '#2E7D32', 'allo-livraison.png'),
    swift:              ecotrackCarrier('swift', 'Swift Express', 'سويفت إكسبريس', 'https://swift.ecotrack.dz', '#388E3C', 'swift-express.png'),
    sbl:                ecotrackCarrier('sbl', 'SBL Express', 'إس بي إل إكسبريس', 'https://sbl.ecotrack.dz', '#1B5E20', 'sbl-express.png'),
    world_express:      ecotrackCarrier('world_express', 'World Express', 'وورلد إكسبريس', 'https://world-express.ecotrack.dz', '#4CAF50', 'world-express.png'),
    anderson:           ecotrackCarrier('anderson', 'Anderson', 'أندرسون', 'https://anderson.ecotrack.dz', '#81C784', 'anderson.png'),
    weewee:             ecotrackCarrier('weewee', 'WeeWee Delivery', 'ويوي ديليفري', 'https://weeweedelivery.ecotrack.dz', '#A5D6A7', 'weewee-delivery.png'),
    jaguar:             ecotrackCarrier('jaguar', 'Jaguar Livraison', 'جاغوار ليفريزون', 'https://jaguar.ecotrack.dz', '#2E7D32', 'jaguar-livraison.png'),
    hr48:               ecotrackCarrier('hr48', '48HR Courier', '48 ساعة كوريير', 'https://48hr.ecotrack.dz', '#388E3C', '48hr.png'),
    packers:            ecotrackCarrier('packers', 'Packers', 'باكرز', 'https://packers.ecotrack.dz', '#43A047', 'packers.png'),
    rb_livraison:       ecotrackCarrier('rb_livraison', 'RB Livraison', 'آر بي ليفريزون', 'https://rblivraison.ecotrack.dz', '#66BB6A', 'rb-livraison.png'),
    rj360:              ecotrackCarrier('rj360', 'RJ360 Express', 'آر جي 360 إكسبريس', 'https://rj360express.ecotrack.dz', '#4CAF50', 'rj360.png'),
    golivri:            ecotrackCarrier('golivri', 'GoLivri', 'غوليفري', 'https://golivri.ecotrack.dz', '#2E7D32', 'golivri.png'),
    conexlog:           ecotrackCarrier('conexlog', 'Conexlog', 'كونيكسلوغ', 'https://app.conexlog-dz.com', '#388E3C', 'conexlog.png'),
    expedia_chrono:     ecotrackCarrier('expedia_chrono', 'Expedia Chrono', 'إكسبيديا كرونو', 'https://expediachrono.ecotrack.dz', '#43A047', 'expedia-chrono.png'),
    mars_express:       ecotrackCarrier('mars_express', 'Mars Express', 'مارس إكسبريس', 'https://marsexpress.ecotrack.dz', '#66BB6A', 'mars-express.png'),
    lynx:               ecotrackCarrier('lynx', 'Lynx', 'لينكس', 'https://lynx.ecotrack.dz', '#4CAF50', 'lynx-express.png'),
    coyote:             ecotrackCarrier('coyote', 'Coyote Express', 'كايوتي إكسبريس', 'https://coyoteexpressdz.ecotrack.dz', '#2E7D32', 'coyote-express.png'),
    eco_rapide:         ecotrackCarrier('eco_rapide', 'Eco Rapide Express', 'إيكو رابيد إكسبريس', 'https://ecorapide-express.ecotrack.dz', '#388E3C', 'eco-rapide-express.png'),
    navex:              ecotrackCarrier('navex', 'Navex Delivery', 'نافكس ديليفري', 'https://navexdelivery.ecotrack.dz', '#43A047', 'navex-delivery.png'),
    rex_livraison:      ecotrackCarrier('rex_livraison', 'Rex Livraison', 'ريكس ليفريزون', 'https://rex.ecotrack.dz', '#66BB6A', 'rex-livraison.png'),
    rm_express:         ecotrackCarrier('rm_express', 'RM Express', 'آر إم إكسبريس', 'https://rmexpress.ecotrack.dz', '#4CAF50', 'rm-express.png'),
    ba_express:         ecotrackCarrier('ba_express', 'BA Express', 'بي أ إكسبريس', 'https://bacexpress.ecotrack.dz', '#2E7D32', 'ba-express.png'),
    rihal:              ecotrackCarrier('rihal', 'Rihal Express', 'ريحال إكسبريس', 'https://rihalexpress.ecotrack.dz', '#388E3C', 'rihal-express.png'),
    areex:              ecotrackCarrier('areex', 'Areex Delivery', 'أريكس ديليفري', 'https://areex.ecotrack.dz', '#43A047', 'areex-delivery.png'),
    atlas_express:      ecotrackCarrier('atlas_express', 'Atlas Express', 'أطلس إكسبريس', 'https://atlaexpress.ecotrack.dz', '#66BB6A', 'atlas-express.png'),
    boogi:              ecotrackCarrier('boogi', 'Boogi', 'بوقي', 'https://boogi.ecotrack.dz', '#4CAF50', 'boogi.png'),
    chronorex:          ecotrackCarrier('chronorex', 'Chronorex', 'كرونوريكس', 'https://chronorex.ecotrack.dz', '#2E7D32', 'chronorex.png'),
    cirta_express:      ecotrackCarrier('cirta_express', 'Cirta Express', 'سيرتا إكسبريس', 'https://cirtaexpress.ecotrack.dz', '#388E3C', 'cirta-express.png'),
    colireli:           ecotrackCarrier('colireli', 'Colireli', 'كوليريلي', 'https://colireli.ecotrack.dz', '#43A047', 'colireli.png'),
    colizone:           ecotrackCarrier('colizone', 'Colizone', 'كوليزون', 'https://colizone.ecotrack.dz', '#66BB6A', 'colizone.png'),
    gs_ecommerce:       ecotrackCarrier('gs_ecommerce', 'GS Ecommerce', 'جي إس إيكومرس', 'https://gsecommerce.ecotrack.dz', '#4CAF50', 'gs-ecommerce.png'),
    jo_express:         ecotrackCarrier('jo_express', 'Jo Express', 'جو إكسبريس', 'https://joexpress.ecotrack.dz', '#2E7D32', 'jo-express.png'),
    om_express:         ecotrackCarrier('om_express', 'OM Express', 'أو إم إكسبريس', 'https://omexpress.ecotrack.dz', '#388E3C', 'om-express.png'),
    ontime:             ecotrackCarrier('ontime', 'On Time Express', 'أون تايم إكسبريس', 'https://ontime.ecotrack.dz', '#43A047', 'on-time-express.png'),
    pdex:               ecotrackCarrier('pdex', 'PDEX', 'بي دي إكس', 'https://pdex.ecotrack.dz', '#66BB6A', 'pdex.png'),
    quick_delivery:     ecotrackCarrier('quick_delivery', 'Quick Delivery', 'كويك ديليفري', 'https://quickdelivery.ecotrack.dz', '#4CAF50', 'quick-delivery.png'),
    rs_express:         ecotrackCarrier('rs_express', 'RS Express', 'آر إس إكسبريس', 'https://rsexpress.ecotrack.dz', '#2E7D32', 'rs-express.png'),
    ruta_express:       ecotrackCarrier('ruta_express', 'Ruta Express', 'روتا إكسبريس', 'https://rutaexpress.ecotrack.dz', '#388E3C', 'ruta-express.png'),
    tawsil_star:        ecotrackCarrier('tawsil_star', 'Tawsil Star', 'توصيل ستار', 'https://tawsil.ecotrack.dz', '#43A047', 'tawsil-star.png'),
    tsl_express:        ecotrackCarrier('tsl_express', 'TSL Express', 'تي إس إل إكسبريس', 'https://tsl.ecotrack.dz', '#66BB6A', 'tsl-express.png'),
    univer_delivery:    ecotrackCarrier('univer_delivery', 'Univer Delivery', 'يونيفر ديليفري', 'https://univerdelivery.ecotrack.dz', '#4CAF50', 'univer-delivery.png'),
    vitrans:            ecotrackCarrier('vitrans', 'Vitrans', 'فيترانس', 'https://vitrans.ecotrack.dz', '#2E7D32', 'vitrans.png'),
    aranex:             ecotrackCarrier('aranex', 'Aranex', 'أرانيكس', 'https://aranex.ecotrack.dz', '#388E3C', 'aranex.png'),
    bfk_express:        ecotrackCarrier('bfk_express', 'BFK Express', 'بي إف كي إكسبريس', 'https://bfkexpress.ecotrack.dz', '#43A047', 'bfk-express.png'),
    hdd_express:        ecotrackCarrier('hdd_express', 'HDD Express', 'إتش دي دي إكسبريس', 'https://hhdexpress.ecotrack.dz', '#66BB6A', 'hdd-express.png'),
    med_express:        ecotrackCarrier('med_express', 'Med Express', 'ميد إكسبريس', 'https://medexpress.ecotrack.dz', '#4CAF50', 'med-express.png'),
    alania:             ecotrackCarrier('alania', 'Alania Express', 'ألانيا إكسبريس', 'https://alania.ecotrack.dz', '#2E7D32', 'alania-express.png'),
    champion:           ecotrackCarrier('champion', 'Champion Logistics', 'شامبيون لوجيستيك', 'https://champion.ecotrack.dz', '#388E3C', 'champion-logistics.png'),
    colex:              ecotrackCarrier('colex', 'Colex', 'كوليكس', 'https://colex.ecotrack.dz', '#43A047', 'colex.png'),
    delivro_mail:       ecotrackCarrier('delivro_mail', 'Delivro Mail', 'ديليفرو ميل', 'https://delivromail.ecotrack.dz', '#66BB6A', 'delivro-mail.png'),
    distazero:          ecotrackCarrier('distazero', 'Distazero', 'ديستازيرو', 'https://distazero.ecotrack.dz', '#4CAF50', 'distazero.png'),
    elguide:            ecotrackCarrier('elguide', 'Elguide Delivery', 'الدليل ديليفري', 'https://elguidedelivery.ecotrack.dz', '#2E7D32', 'elguide-delivery.png'),
    fast_horse:         ecotrackCarrier('fast_horse', 'Fast Horse Express', 'فاست هورس إكسبريس', 'https://fasthorse.ecotrack.dz', '#388E3C', 'fast-horse-express.png'),
    fret_direct:        ecotrackCarrier('fret_direct', 'Fret Direct', 'فريت ديركت', 'https://fret.ecotrack.dz', '#43A047', 'fret-direct.png'),
    fz_delivery:        ecotrackCarrier('fz_delivery', 'FZ Delivery', 'إف زد ديليفري', 'https://fzdelivery.ecotrack.dz', '#66BB6A', 'fz-delivery.png'),
    imir:               ecotrackCarrier('imir', 'Imir Logistics', 'إيمير لوجيستيك', 'https://imir.ecotrack.dz', '#4CAF50', 'imir-logistics.png'),
    lihlih:             ecotrackCarrier('lihlih', 'LihLih Express', 'ليحليح إكسبريس', 'https://lihlihexpress.ecotrack.dz', '#2E7D32', 'lihlih-express.png'),
    mazaya:             ecotrackCarrier('mazaya', 'Mazaya Logistics', 'مزايا لوجيستيك', 'https://mazaya.ecotrack.dz', '#388E3C', 'mazaya-logistics.png'),
    msmgo:              ecotrackCarrier('msmgo', 'MSM Go', 'إم إس إم غو', 'https://msmgo.ecotrack.dz', '#43A047', 'msmgo.png'),
    ovred:              ecotrackCarrier('ovred', 'Ovred', 'أوفريد', 'https://ovred.ecotrack.dz', '#66BB6A', 'ovred.png'),
    prest:              ecotrackCarrier('prest', 'Prest', 'بريست', 'https://prest.ecotrack.dz', '#4CAF50', 'prest.png'),
    rocket_delivery:    ecotrackCarrier('rocket_delivery', 'Rocket Delivery', 'روكيت ديليفري', 'https://rocket.ecotrack.dz', '#2E7D32', 'rocket-delivery.png'),
    salva:              ecotrackCarrier('salva', 'Salva Delivery', 'سالفا ديليفري', 'https://salvadelivery.ecotrack.dz', '#388E3C', 'salva-delivery.png'),
    speed_mail:         ecotrackCarrier('speed_mail', 'Speed Mail', 'سبيد ميل', 'https://speedmail.ecotrack.dz', '#43A047', 'speed-mail.png'),
    win_delivery:       ecotrackCarrier('win_delivery', 'Win Delivery', 'وين ديليفري', 'https://windelivery.ecotrack.dz', '#66BB6A', 'win-delivery.png'),
    amana_speed:        ecotrackCarrier('amana_speed', 'Amana Speed', 'أمانة سبيد', 'https://amana.ecotrack.dz', '#4CAF50', 'amana-speed.png'),
    zinya_tec:          ecotrackCarrier('zinya_tec', 'ZinyaTec', 'زينياتك', 'https://zinyatec.ecotrack.dz', '#2E7D32', 'zinya-tec.png'),
    sultan_colis:       ecotrackCarrier('sultan_colis', 'Sultan Colis Express', 'سلطان كوليس إكسبريس', 'https://sultancolisexpress.ecotrack.dz', '#388E3C', 'sultan-colis-express.png'),
    major_ex:           ecotrackCarrier('major_ex', 'Major Ex', 'ماجور إكس', 'https://majorex.ecotrack.dz', '#43A047', 'major-ex.png'),
    red_ex:             ecotrackCarrier('red_ex', 'Red Ex', 'ريد إكس', 'https://redex.ecotrack.dz', '#E53935', 'red-ex.png'),

    // ═══════════════════════════════════════════════════════════════════════
    // NOEST (independent) — Bearer Token + User GUID
    // ═══════════════════════════════════════════════════════════════════════
    noest: {
        id: 'noest', name: 'Noest', nameAr: 'نويست', family: 'noest',
        baseUrl: 'https://app.noest-dz.com', color: '#5C6BC0',
        logo: `${VARGO_LOGO_BASE}/noest.png`,
        field1: { key: 'user_guid', label: 'User GUID', labelAr: 'معرّف المستخدم', type: 'text' },
        field2: { key: 'api_token', label: 'API Token', labelAr: 'رمز API', type: 'password' },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MAYSTRO DELIVERY (independent) — Access Token + Store ID
    // ═══════════════════════════════════════════════════════════════════════
    maystro: {
        id: 'maystro', name: 'Maystro Delivery', nameAr: 'مايسترو ديليفري', family: 'maystro',
        baseUrl: 'https://b.maystro-delivery.com/api', color: '#E53935',
        logo: `${VARGO_LOGO_BASE}/maystro-delivery.png`,
        field1: { key: 'store_id', label: 'Store ID', labelAr: 'معرّف المتجر (UUID)', type: 'text' },
        field2: { key: 'access_token', label: 'Access Token', labelAr: 'رمز الوصول', type: 'password' },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ELOGISTIA (independent) — API Key only (sent as request param)
    // ═══════════════════════════════════════════════════════════════════════
    elogistia: {
        id: 'elogistia', name: 'Elogistia', nameAr: 'إيلوجيستيا', family: 'elogistia',
        baseUrl: 'https://api.elogistia.com', color: '#00ACC1',
        logo: `${VARGO_LOGO_BASE}/elogistia.png`,
        field2: { key: 'api_key', label: 'API Key', labelAr: 'مفتاح API', type: 'password' },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ECOM DELIVERY (independent) — Token + Key headers (like Procolis)
    // ═══════════════════════════════════════════════════════════════════════
    ecom: {
        id: 'ecom', name: 'Ecom Delivery', nameAr: 'إيكوم ديليفري', family: 'ecom',
        baseUrl: 'https://ecom-dz.net', color: '#F57C00',
        logo: `${VARGO_LOGO_BASE}/ecom-delivery.png`,
        field1: { key: 'api_key', label: 'API Key', labelAr: 'مفتاح API', type: 'password' },
        field2: { key: 'api_token', label: 'API Token', labelAr: 'رمز API', type: 'text' },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NEAR DELIVERY (independent) — ApiKey + ApiSecret headers
    // ═══════════════════════════════════════════════════════════════════════
    near: {
        id: 'near', name: 'Near Delivery', nameAr: 'نير ديليفري', family: 'near',
        baseUrl: 'https://api.neardelivery.app/api/v1', color: '#00897B',
        logo: `${VARGO_LOGO_BASE}/near-delivery.png`,
        field1: { key: 'api_key', label: 'API Key', labelAr: 'مفتاح API', type: 'password' },
        field2: { key: 'api_secret', label: 'API Secret', labelAr: 'المفتاح السري', type: 'password' },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MDM EXPRESS (independent) — x-api-key header + store_id
    // ═══════════════════════════════════════════════════════════════════════
    mdm: {
        id: 'mdm', name: 'MDM Express', nameAr: 'إم دي إم إكسبريس', family: 'mdm',
        baseUrl: 'https://api.mdm.express', color: '#5E35B1',
        logo: `${VARGO_LOGO_BASE}/mdm.png`,
        field1: { key: 'store_id', label: 'Store ID', labelAr: 'معرّف المتجر', type: 'text' },
        field2: { key: 'api_key', label: 'API Key', labelAr: 'مفتاح API', type: 'password' },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ZIMOU EXPRESS (independent) — Bearer Token only
    // ═══════════════════════════════════════════════════════════════════════
    zimou: {
        id: 'zimou', name: 'Zimou Express', nameAr: 'زيمو إكسبريس', family: 'zimou',
        baseUrl: 'https://zimou.express/api', color: '#0277BD',
        logo: `${VARGO_LOGO_BASE}/zimou-express.png`,
        field2: { key: 'api_token', label: 'API Token', labelAr: 'رمز API', type: 'password' },
    },
};

// ============================================================================
// Helper functions
// ============================================================================

export function getCarrierInfo(id: string): CarrierInfo | undefined {
    return CLONE_CARRIERS[id];
}

/** Get carriers grouped by family */
export function getCarriersByFamily(): Record<CarrierFamily, CarrierInfo[]> {
    const grouped: Record<string, CarrierInfo[]> = {};
    for (const carrier of Object.values(CLONE_CARRIERS)) {
        if (!grouped[carrier.family]) grouped[carrier.family] = [];
        grouped[carrier.family].push(carrier);
    }
    return grouped as Record<CarrierFamily, CarrierInfo[]>;
}

/** Family display names */
export const FAMILY_LABELS: Record<CarrierFamily, { name: string; nameAr: string; color: string; icon: string }> = {
    yalidine:   { name: 'Yalidine Family', nameAr: 'عائلة ياليدين', color: '#FF6B00', icon: '🟠' },
    zr:         { name: 'ZR Express', nameAr: 'زد آر إكسبريس', color: '#1E88E5', icon: '🔵' },
    procolis:   { name: 'Procolis Family', nameAr: 'عائلة بروكوليس', color: '#7B1FA2', icon: '🟣' },
    ecotrack:   { name: 'EcoTrack Family', nameAr: 'عائلة إيكوتراك', color: '#43A047', icon: '🟢' },
    noest:      { name: 'Noest', nameAr: 'نويست', color: '#5C6BC0', icon: '🔷' },
    maystro:    { name: 'Maystro Delivery', nameAr: 'مايسترو ديليفري', color: '#E53935', icon: '🔴' },
    elogistia:  { name: 'Elogistia', nameAr: 'إيلوجيستيا', color: '#00ACC1', icon: '🩵' },
    ecom:       { name: 'Ecom Delivery', nameAr: 'إيكوم ديليفري', color: '#F57C00', icon: '🟡' },
    near:       { name: 'Near Delivery', nameAr: 'نير ديليفري', color: '#00897B', icon: '🟩' },
    mdm:        { name: 'MDM Express', nameAr: 'إم دي إم إكسبريس', color: '#5E35B1', icon: '💜' },
    zimou:      { name: 'Zimou Express', nameAr: 'زيمو إكسبريس', color: '#0277BD', icon: '💙' },
};

/** Total number of supported carriers */
export const TOTAL_CARRIERS = Object.keys(CLONE_CARRIERS).length;
