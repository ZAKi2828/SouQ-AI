'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Language = 'ar' | 'en' | 'fr';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

import arDict from '@/locales/ar.json';
import enDict from '@/locales/en.json';
import frDict from '@/locales/fr.json';

const translations: Record<Language, Record<string, string>> = {
  ar: {
    ...arDict,
    dashboard: 'لوحة التحكم',
    trending: 'المنتجات الرابحة 🔥',
    orders: 'الطلبـات',
    inventory: 'المنتجات والمخزون',
    customers: 'العمـلاء',
    analytics: 'التحليـلات',
    abandoned_carts: 'السلة المتروكة',
    templates: 'القوالب والتصميم',
    ai_landing: 'صفحات هبوط (AI)',
    team: 'فريق العمل',
    apps: 'التطبيقات والإضافات',
    settings: 'الإعدادات',
    logout: 'تسجـيل الخروج',
    store_preview: 'رؤية المتجر',
    my_store: 'متجري',
    souqai_platform: 'منصة SOUQAI',
    upgrade_plan: 'ترقية الخطة الآن',
    current_plan: 'الخطة الحالية',
    free_plan: 'الخطة المجانية 🚀',
    pro_plan: 'خطة التاجر ⭐',
    vip_plan: 'التاجر المحترف 👑',
    collapse_menu: 'طي القائمة',
    expand_menu: 'توسيع القائمة',
    light_mode: 'الوضع الفاتح',
    dark_mode: 'الوضع الداكن',
    super_admin_badge: 'SUPER ADMIN',
    notifications: 'التنبيهات',
    store_overview: 'نظرة عامة على المتجر',
    welcome_back: 'مرحباً بعودتك،',
    add_new_product: 'إضافة منتج جديد',
    ai_assistant: 'مساعد الذكاء الاصطناعي',
    analyzing: 'جاري التحليل...',
    analyzing_data: 'جاري تحليل بيانات متجرك وإعداد توصية مخصصة...',
    total_sales: 'إجمالي المبيعات',
    total_orders: 'إجمالي الطلبات',
    active_products: 'المنتجات النشطة',
    total_customers: 'إجمالي العملاء',
    latest_products: 'أحدث المنتجات',
    view_all: 'عرض الكل',
    product: 'المنتج',
    category: 'الفئة',
    price: 'السعر',
    stock: 'المخزون',
    ai_score: 'AI Score',
    status: 'الحالة',
    best_landing_page: 'أفضل صفحة هبوط',
    pending_tasks: 'المهام المعلقة',
    add_task: 'إضافة مهمة',
    unit: 'وحدة',
    active: 'نشط',
    draft: 'مسودة',
    no_products: 'لا يوجد منتجات متاحة.',
    currency: 'د.ج',
    dzd: 'د.ج',
    merchant_label: 'التاجر',
    ai_analysis_error: 'لم يتمكن المحلل من قراءة البيانات حالياً. حاول مرة أخرى.',
    no_ai_data: 'لا توجد بيانات كافية لتحليلها حالياً.',
    dashboard_subtitle: 'إليك أداء متجرك لهذا اليوم.',
    // Plan Expiry Banner translations
    t_20f269df: 'تنبيه عاجل: أوشكت صلاحية اشتراكك على الانتهاء!',
    t_c394c8e7: 'تنبيه: ستنتهي صلاحية اشتراكك قريباً.',
    t_44a: 'اشتراكك الحالي:',
    t_8a88bf0a: 'أوشك الاشتراك على الانتهاء!',
    t_26b6bc74: 'ينتهي الاشتراك قريباً.',
    t_bf54: 'يوم',
    t_62c: 'ساعة',
    t_62e: 'دقيقة',
    t_25505c87: 'ترقية الآن',
    free: 'الخطة المجانية 🚀',
    pro: 'خطة التاجر ⭐',
    vip: 'التاجر المحترف 👑',
    expired: 'منتهي الصلاحية',
  },
  en: {
    ...enDict,
    dashboard: 'Dashboard',
    trending: 'Winning Products 🔥',
    orders: 'Orders',
    inventory: 'Inventory & Stock',
    customers: 'Customers',
    analytics: 'Analytics',
    abandoned_carts: 'Abandoned Carts',
    templates: 'Templates & Design',
    ai_landing: 'AI Landing Pages',
    team: 'Team Staff',
    apps: 'Apps & Addons',
    settings: 'Settings',
    logout: 'Logout',
    store_preview: 'View Store',
    my_store: 'My Store',
    souqai_platform: 'SOUQAI Platform',
    upgrade_plan: 'Upgrade Plan Now',
    current_plan: 'Current Plan',
    free_plan: 'Free Plan 🚀',
    pro_plan: 'Merchant Plan ⭐',
    vip_plan: 'Pro Merchant 👑',
    collapse_menu: 'Collapse Menu',
    expand_menu: 'Expand Menu',
    light_mode: 'Light Mode',
    dark_mode: 'Dark Mode',
    super_admin_badge: 'SUPER ADMIN',
    notifications: 'Notifications',
    store_overview: 'Store Overview',
    welcome_back: 'Welcome back,',
    add_new_product: 'Add New Product',
    ai_assistant: 'AI Assistant',
    analyzing: 'Analyzing...',
    analyzing_data: 'Analyzing store data and preparing recommendation...',
    total_sales: 'Total Sales',
    total_orders: 'Total Orders',
    active_products: 'Active Products',
    total_customers: 'Total Customers',
    latest_products: 'Latest Products',
    view_all: 'View All',
    product: 'Product',
    category: 'Category',
    price: 'Price',
    stock: 'Stock',
    ai_score: 'AI Score',
    status: 'Status',
    best_landing_page: 'Best Landing Page',
    pending_tasks: 'Pending Tasks',
    add_task: 'Add Task',
    unit: 'Unit',
    active: 'Active',
    draft: 'Draft',
    no_products: 'No products available.',
    currency: 'DZD',
    dzd: 'DZD',
    merchant_label: 'Merchant',
    ai_analysis_error: 'The assistant could not analyze data right now. Try again.',
    no_ai_data: 'Not enough data for analysis yet.',
    dashboard_subtitle: 'Here is your store performance today.',
    // Plan Expiry Banner translations
    t_20f269df: 'Urgent warning: Your plan is expiring very soon!',
    t_c394c8e7: 'Warning: Your plan will expire soon.',
    t_44a: 'Current Plan:',
    t_8a88bf0a: 'Plan expiring very soon!',
    t_26b6bc74: 'Plan expiring soon.',
    t_bf54: 'd',
    t_62c: 'h',
    t_62e: 'm',
    t_25505c87: 'Upgrade Now',
    free: 'Free Plan 🚀',
    pro: 'Merchant Plan ⭐',
    vip: 'Pro Merchant 👑',
    expired: 'Expired',
  },
  fr: {
    ...frDict,
    dashboard: 'Tableau de bord',
    trending: 'Produits Gagnants 🔥',
    orders: 'Commandes',
    inventory: 'Inventaire et Stock',
    customers: 'Clients',
    analytics: 'Analyses',
    abandoned_carts: 'Paniers Abandonnés',
    templates: 'Modèles et Design',
    ai_landing: 'Pages d\'atterrissage AI',
    team: 'Équipe',
    apps: 'Applications',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    store_preview: 'Voir la boutique',
    my_store: 'Ma Boutique',
    souqai_platform: 'Plateforme SOUQAI',
    upgrade_plan: 'Mettre à jour le plan',
    current_plan: 'Plan Actuel',
    free_plan: 'Plan Gratuit 🚀',
    pro_plan: 'Plan Marchand ⭐',
    vip_plan: 'Marchand Pro 👑',
    collapse_menu: 'Réduire le menu',
    expand_menu: 'Agrandir le menu',
    light_mode: 'Mode Clair',
    dark_mode: 'Mode Sombre',
    super_admin_badge: 'SUPER ADMIN',
    notifications: 'Notifications',
    store_overview: 'Aperçu de la boutique',
    welcome_back: 'Bon retour,',
    add_new_product: 'Ajouter un produit',
    ai_assistant: 'Assistant IA',
    analyzing: 'Analyse...',
    analyzing_data: 'Analyse des données et préparation des recommandations...',
    total_sales: 'Ventes Totales',
    total_orders: 'Commandes Totales',
    active_products: 'Produits Actifs',
    total_customers: 'Clients Totaux',
    latest_products: 'Derniers Produits',
    view_all: 'Voir tout',
    product: 'Produit',
    category: 'Catégorie',
    price: 'Prix',
    stock: 'Stock',
    ai_score: 'AI Score',
    status: 'Statut',
    best_landing_page: 'Meilleure Page',
    pending_tasks: 'Tâches En Attente',
    add_task: 'Ajouter tâche',
    unit: 'Unité',
    active: 'Actif',
    draft: 'Brouillon',
    no_products: 'Aucun produit disponible.',
    currency: 'DA',
    dzd: 'DA',
    merchant_label: 'Marchand',
    ai_analysis_error: 'L\'assistant n\'a pas pu analyser les données. Réessayez.',
    no_ai_data: 'Pas assez de données pour l\'analyse.',
    dashboard_subtitle: 'Voici les performances de votre boutique aujourd\'hui.',
    // Plan Expiry Banner translations
    t_20f269df: 'Alerte urgente: Votre abonnement expire très bientôt !',
    t_c394c8e7: 'Attention: Votre abonnement expire bientôt.',
    t_44a: 'Plan Actuel :',
    t_8a88bf0a: 'Abonnement expire très bientôt !',
    t_26b6bc74: 'Abonnement expire bientôt.',
    t_bf54: 'j',
    t_62c: 'h',
    t_62e: 'm',
    t_25505c87: 'Mettre à jour',
    free: 'Plan Gratuit 🚀',
    pro: 'Plan Marchand ⭐',
    vip: 'Marchand Pro 👑',
    expired: 'Expiré',
  }
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('souqai-lang') as Language | null;
    if (saved && ['ar', 'en', 'fr'].includes(saved)) {
      setLangState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('souqai-lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const t = useCallback((key: string) => {
    if (!key) return '';
    const group = translations[lang] || translations['en'] || translations['ar'];
    return group[key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
