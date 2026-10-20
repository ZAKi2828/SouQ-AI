'use client';
import { useI18n } from "@/context/I18nContext";

export default function CustomerOrder() {
    const { t } = useI18n();
    return (
        <>



            <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">shopping_bag</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">SOUQ AI</span>
                        </div>

                        <div className="hidden md:flex items-center space-x-reverse space-x-2">
                            <div className="flex items-center text-primary">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ml-2">1</span>
                                <span className="font-bold text-sm">{t('t_1f0c7292')}</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                            <div className="flex items-center text-gray-400 dark:text-gray-500 dark:text-gray-400">
                                <span className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-zinc-700 flex items-center justify-center text-xs font-medium ml-2">2</span>
                                <span className="font-medium text-sm">{t('t_7f531ff2')}</span>
                            </div>
                        </div>

                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span className="material-symbols-outlined text-[20px]">language</span>
                            <span>{t('t_802c7852')}</span>
                        </button>
                    </div>
                </div>

                <div className="md:hidden border-t border-gray-100 dark:border-zinc-800 px-4 py-2">
                    <div className="flex items-center justify-center space-x-reverse space-x-2 text-sm">
                        <span className="text-primary font-bold">{t('t_1f0c7292')}</span>
                        <span className="text-gray-300 dark:text-gray-600 dark:text-gray-400">/</span>
                        <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400">{t('t_7f531ff2')}</span>
                    </div>
                </div>
            </header>
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

                    <div className="lg:col-span-7 space-y-6">

                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm  border border-gray-100 dark:border-zinc-800 p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                
                                {t('t_8cdc1664')}
                            </h2>
                            <div className="space-y-6">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('t_59a40c25')}</label>
                                    <div className="flex flex-wrap gap-3">
                                        <label className="cursor-pointer group relative">
                                            <input defaultChecked className="peer sr-only" name="color" type="radio" />
                                            <span className="w-10 h-10 rounded-full bg-slate-900 block border-2 border-transparent peer-checked:border-primary ring-2 ring-transparent peer-checked:ring-2 peer-checked:ring-offset-2 dark:peer-checked:ring-offset-[#2a171d] transition-all"></span>
                                            <span className="absolute -bottom-6 right-1/2 translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">{t('t_2e23157')}</span>
                                        </label>
                                        <label className="cursor-pointer group relative">
                                            <input className="peer sr-only" name="color" type="radio" />
                                            <span className="w-10 h-10 rounded-full bg-blue-600 block border-2 border-transparent peer-checked:border-primary ring-2 ring-transparent peer-checked:ring-2 peer-checked:ring-offset-2 dark:peer-checked:ring-offset-[#2a171d] transition-all"></span>
                                        </label>
                                        <label className="cursor-pointer group relative">
                                            <input className="peer sr-only" name="color" type="radio" />
                                            <span className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 block border-2 border-gray-200 dark:border-zinc-700 peer-checked:border-primary ring-2 ring-transparent peer-checked:ring-2 peer-checked:ring-offset-2 dark:peer-checked:ring-offset-[#2a171d] transition-all"></span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('t_2522273a')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        <label className="cursor-pointer">
                                            <input className="peer sr-only" name="size" type="radio" />
                                            <span className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-primary hover:text-primary peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all block">38</span>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input className="peer sr-only" name="size" type="radio" />
                                            <span className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-primary hover:text-primary peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all block">39</span>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input defaultChecked className="peer sr-only" name="size" type="radio" />
                                            <span className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-primary hover:text-primary peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all block">40</span>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input className="peer sr-only" name="size" type="radio" />
                                            <span className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-primary hover:text-primary peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all block">41</span>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input className="peer sr-only" name="size" type="radio" />
                                            <span className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-primary hover:text-primary peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all block">42</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('t_25230082')}</label>
                                    <div className="flex items-center w-32 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-transparent">
                                        <button className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <input className="w-full h-10 text-center border-0 bg-transparent text-gray-900 dark:text-white font-medium focus:ring-0" readOnly type="text" defaultValue="1" />
                                        <button className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm  border border-gray-100 dark:border-zinc-800 p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">person</span>
                                
                                {t('t_d199e90')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('t_1155ce44')}</label>
                                    <input className="w-full rounded-xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 focus:border-primary focus:ring-primary dark:focus:border-primary p-3" placeholder={t('t_201ce0ae9')} type="text" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('t_d581c00')}</label>
                                    <div className="relative">
                                        <input className="w-full rounded-xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 focus:border-primary focus:ring-primary dark:focus:border-primary pl-4 pr-16 p-3 text-right" dir="ltr" placeholder="05 XX XX XX XX" type="tel" />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none border-l border-gray-200 dark:border-zinc-800 pl-3">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">+213</span>
                                            <img alt="Algeria Flag" className="mr-2 h-4 w-6 object-cover rounded-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuaYtoUDRLmRrZKcLQZWCKdGGByNQ6S_OUB4_yhMwB0p24J5-2CjTAdHm1DNyIC60aiCg22uR6V-qOPn_7dSKhoPl0k4pa7dcM0Ehv1QvXwCCQ8j-QfFjMAc_T9-lx-2kMCsEUW_9l-PPTdICQKIi9KmN3QR7S1qXM9WOMBsHmJ4J-VMvNfBqxr4nVH_gHxWlWV1F_bLX1oAUy3RiHNPh1OzKPWyZCDll7CDE7UNU2qrSUza-l_zym9JHAQzXparjQlZl3nxTh0pMb" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm  border border-gray-100 dark:border-zinc-800 p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                                
                                {t('t_3efa660e')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('t_8108782d')}</label>
                                    <select className="w-full rounded-xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 focus:border-primary focus:ring-primary dark:focus:border-primary p-3">
                                        <option value="">{t('t_b8cdb27b')}</option>
                                        <option value="16">{t('t_9f0ae1f')}</option>
                                        <option value="31">{t('t_1995f7e4')}</option>
                                        <option value="25">{t('t_1e6cae05')}</option>
                                        <option value="19">{t('t_8f85d05a')}</option>
                                        <option value="09">{t('t_5323e61f')}</option>
                                        <option value="13">{t('t_18db1ea08')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('t_7f45a615')}</label>
                                    <select className="w-full rounded-xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 focus:border-primary focus:ring-primary dark:focus:border-primary p-3">
                                        <option value="">{t('t_b70ae063')}</option>
                                        <option>{t('t_dcdd0a35')}</option>
                                        <option>{t('t_f004734')}</option>
                                        <option>{t('t_2d93af0e')}</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('t_d0416')}</label>
                                    <textarea className="w-full rounded-xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 focus:border-primary focus:ring-primary dark:focus:border-primary p-3 resize-none" placeholder={t('t_105ed7c74')} rows={2}></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm  border border-gray-100 dark:border-zinc-800 p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                
                                {t('t_137f8f61f')}
                            </h2>
                            <label className="relative flex items-center p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                                <input defaultChecked className="h-5 w-5 text-primary border-gray-300 dark:border-zinc-700 focus:ring-primary" name="payment" type="radio" />
                                <div className="mr-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-base font-bold text-gray-900 dark:text-white">{t('t_addbc04b')}</span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                            
                                            {t('t_c4f1702a')}
                                        </span>
                                    </div>
                                    <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">{t('t_150d533c')}</span>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 text-3xl mr-2">local_atm</span>
                            </label>
                            <label className="mt-3 relative flex items-center p-4 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer opacity-60">
                                <input className="h-5 w-5 text-primary border-gray-300 dark:border-zinc-700 focus:ring-primary" disabled name="payment" type="radio" />
                                <div className="mr-4 flex-1">
                                    <span className="block text-base font-bold text-gray-900 dark:text-white">{t('t_bf158e60')}</span>
                                    <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">{t('t_c0179770')}</span>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 text-3xl mr-2">credit_card</span>
                            </label>
                        </div>
                    </div>

                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="sticky top-24 space-y-6">

                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">

                                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 relative">
                                    <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm  z-10 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                                        
                                        {t('t_10be4a370')}
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                            <img className="w-full h-full object-cover" data-alt="Red Nike running shoe on white background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy46eI0XxBDl1AEUwmzVPuRR8pKCfpSGmPRLE-Jf7YFCs0kFvwQGazvaqSsy-Vx7WaqtxvbOq1O7GPjj92XXGfuJWcAwP1t4M4JXTJxeU4KZKg7_40KbgogRHpLumy28g24qdCrZxEVeHXceE5iwtwZJa3xUnlP1Q1Zcuu-DBuASFlX1-ikSCtQHgBf2xIgK_6DISoyTwAXcLnSbUL8XmLJv7G5R9B1nA4NHyGoT-ZnHCF3cIVa1VQIl0h10w8yZGXTe6VPvMgXsH1" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1">{t('t_af5b9d83')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('t_16798ca28')}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-extrabold text-primary">{t('t_9a5dfbee')}</span>
                                                <span className="text-sm text-gray-400 line-through">{t('t_da7d23f7')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-3">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                        <span>{t('t_5e14deab')}</span>
                                        <span className="font-medium">{t('t_9a5dfbee')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                        <span>{t('t_7f63bd34')}</span>
                                        <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            
                                            {t('t_5b3f7744')}
                                        </span>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:border-zinc-800 my-4"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{t('t_9cf81b14')}</span>
                                        <div className="text-right">
                                            <span className="block text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{t('t_9a5dfbee')}</span>
                                            <span className="text-xs text-gray-400 mt-1">{t('t_31a06a7b')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-0">
                                    <button className="w-full bg-gradient-to-l from-primary to-pink-600 hover:from-pink-600 hover:to-primary text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                                        <span>{t('t_b50a59d3')}</span>
                                        <span className="material-symbols-outlined">check</span>
                                    </button>
                                    <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">lock</span>
                                        
                                        {t('t_139be15c3')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center gap-1">
                                    <span className="material-symbols-outlined text-primary">verified_user</span>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{t('t_1f7dbd2a')}</span>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center gap-1">
                                    <span className="material-symbols-outlined text-primary">rocket_launch</span>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{t('t_b70da944')}</span>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center gap-1">
                                    <span className="material-symbols-outlined text-primary">assignment_return</span>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{t('t_b1fa2911')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 mt-auto py-6">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('t_2275f6a3a')}</p>
                </div>
            </footer>

        </>
    );
}
