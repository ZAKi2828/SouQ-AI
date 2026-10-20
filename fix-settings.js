const fs = require('fs');

const file = 'c:/Users/PCZ/Desktop/SOUQai1/src/app/super-admin/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the line with resend_key
const startSearchStr = "if (settings.resend_key) setResendKey(settings.resend_key);";
const startIdx = content.indexOf(startSearchStr);

if (startIdx === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

// Ensure we include that line in the kept top part
const cutStart = startIdx + startSearchStr.length;

// Find the </aside> tag to cut out the corrupted chunk
const endSearchStr = "</aside>";
let endIdx = content.indexOf(endSearchStr, cutStart);

if (endIdx === -1) {
    console.error("Could not find end index");
    process.exit(1);
}

const cutEnd = endIdx + endSearchStr.length;

const replacement = `
                    if (settings.whatsapp_number) setWhatsappNumber(settings.whatsapp_number);
                }

            } catch (err) {
                console.error("Error loading settings:", err);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [router]);

    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        try {
            const { error } = await insforge.database
                .from('platform_settings')
                .update({
                    platform_name: platformName,
                    allow_registration: allowRegistration,
                    pro_price: Number(proPrice),
                    vip_price: Number(vipPrice),
                    commission_rate: Number(commissionRate),
                    whatsapp_number: whatsappNumber,
                })
                .eq('id', 1);
            if (error) throw error;
            alert('تم حفظ الإعدادات بنجاح');
        } catch (err) {
            console.error('Save error:', err);
            alert('Error:' + (err?.message || ''));
        }
    };

    const handleSaveIntegrations = async (e) => {
        e.preventDefault();
        try {
            const { error } = await insforge.database
                .from('platform_settings')
                .update({
                    openai_key: openAiKey,
                    gemini_key: geminiKey,
                    stripe_key: stripeKey,
                    resend_key: resendKey,
                })
                .eq('id', 1);
            if (error) throw error;
            alert('تم حفظ المفاتيح بنجاح');
        } catch (err) {
            console.error('Save error:', err);
            alert('Error:' + (err?.message || ''));
        }
    };

    const loadBrandingStores = async () => {
        setBrandingLoading(true);
        try {
            const { data, error } = await insforge.database
                .from('profiles')
                .select('id, store_name, store_domain, plan, is_paid, hide_branding')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setBrandingStores(data || []);
        } catch (err) {
            console.error('Error loading stores:', err);
        } finally {
            setBrandingLoading(false);
        }
    };

    const toggleBranding = async (storeId, currentHide) => {
        try {
            const { error } = await insforge.database
                .from('profiles')
                .update({ hide_branding: !currentHide })
                .eq('id', storeId);
            if (error) throw error;
            setBrandingStores(prev => prev.map(s => s.id === storeId ? { ...s, hide_branding: !currentHide } : s));
        } catch (err) {
            console.error('Error toggling branding:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-zinc-950 text-indigo-600">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div dir="rtl" className="min-h-screen flex overflow-hidden bg-[#F8F9FC] dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-cairo">
            <style dangerouslySetInnerHTML={{
                __html: \`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .active-nav-link {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
          border-right: 4px solid #4f46e5;
          color: #4f46e5;
        }
      \`}} />

            {/* Sidebar */}
            <aside className={\`w-72 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col h-screen z-50 transition-all \${isSidebarOpen ? '' : '-ml-72 hidden'}\`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">SOUQ AI</span>
                    </div>
                </div>

                <div className="px-6 mb-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></span>
                        SUPER ADMIN
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="font-semibold text-sm">{t('t_62962e62')}</span>
                    </Link>
                    <Link href="/super-admin/merchants" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">storefront</span>
                        <span className="font-semibold text-sm">{t('t_252ebfd7')}</span>
                    </Link>
                    <Link href="/super-admin/billing" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="font-semibold text-sm">{t('t_6bb36ed2')}</span>
                    </Link>
                    <Link href="/super-admin/templates" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">auto_awesome_motion</span>
                        <span className="font-semibold text-sm">{t('t_80b5bbe8')}</span>
                    </Link>
                    <Link href="/super-admin/ai" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">psychology</span>
                        <span className="font-semibold text-sm">{t('t_f9fbb88e')}</span>
                    </Link>
                    <Link href="/super-admin/apps" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined">extension</span>
                        <span className="font-semibold text-sm">{t('t_fa7e8d50')}</span>
                    </Link>
                    <div className="pt-4 pb-2 text-[11px] font-bold text-slate-400 px-4 uppercase tracking-widest">{t('t_2521d853')}</div>
                    <Link href="/super-admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active-nav-link">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="font-semibold text-sm">{t('t_df554a56')}</span>
                    </Link>
                </nav>
            </aside>`;

const newContent = content.substring(0, cutStart) + replacement + content.substring(cutEnd);
fs.writeFileSync(file, newContent, 'utf8');
console.log("File fixed successfully!");
