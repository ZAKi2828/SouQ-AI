
'use client';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@insforge/nextjs';
import Link from 'next/link';
import { useI18n } from "@/context/I18nContext";
import PlanExpiredOverlay from '@/components/PlanExpiredOverlay';
import { useExpiredPlanGuard } from '@/hooks/useExpiredPlanGuard';

export default function Page() {
    const { t } = useI18n();
    const { planExpired, currentPlan } = useExpiredPlanGuard();

  return (
    <>
      {planExpired && (
          <PlanExpiredOverlay planName={currentPlan === 'pro' ? 'خطة التاجر' : currentPlan === 'vip' ? t('t_ae782054') : t('t_e82492bf')} />
      )}
<nav className="h-16 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 z-20 shrink-0">
<div className="flex items-center gap-4">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">S</div>
<span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SOUQ<span className="text-primary">AI</span></span>
</div>
<span className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></span>
<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
<span>Projects</span>
<span className="material-icons-round text-base">chevron_right</span>
<span className="text-gray-900 dark:text-white font-medium">Summer Collection 2024</span>
</div>
</div>
<div className="flex items-center gap-4">
<button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
<span className="material-icons-round">undo</span>
</button>
<button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
<span className="material-icons-round">redo</span>
</button>
<div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
<button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium">
<span className="material-icons-round text-base">save</span>
<span>Save Draft</span>
</button>
<button className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/30 transition-all">
<span className="material-icons-round text-base">download</span>
<span>Export</span>
</button>
<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 ml-2 border-2 border-white dark:border-zinc-800"></div>
</div>
</nav>
<div className="flex-1 flex overflow-hidden">
<aside className="w-72 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-zinc-800 flex flex-col z-10 overflow-y-auto">
<div className="p-4">
<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">AI Tools</h3>
<div className="space-y-2">
<button className="w-full group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
<div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
<span className="material-icons-round">content_cut</span>
</div>
<div>
<div className="font-medium text-sm text-gray-900 dark:text-white">Remove Background</div>
<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Isolate product instantly</div>
</div>
</button>
<button className="w-full group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
<div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform">
<span className="material-icons-round">wb_sunny</span>
</div>
<div>
<div className="font-medium text-sm text-gray-900 dark:text-white">Enhance Lighting</div>
<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Studio quality lighting</div>
</div>
</button>
<button className="w-full group flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 dark:bg-primary/10 dark:border-primary/30">
<div className="p-2 rounded-lg bg-primary text-white shadow-md shadow-primary/30">
<span className="material-icons-round">auto_awesome</span>
</div>
<div>
<div className="font-medium text-sm text-gray-900 dark:text-white">Lifestyle Scene</div>
<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 dark:text-gray-400">Place product in context</div>
</div>
</button>
<button className="w-full group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
<div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
<span className="material-icons-round">aspect_ratio</span>
</div>
<div>
<div className="font-medium text-sm text-gray-900 dark:text-white">Smart Resize</div>
<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Optimize for social media</div>
</div>
</button>
</div>
<div className="mt-8 border-t border-gray-200 dark:border-zinc-800 pt-6">
<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Manual Adjustments</h3>
<div className="space-y-4 px-2">
<div>
<div className="flex justify-between text-xs mb-1.5">
<span className="text-gray-600 dark:text-gray-400">Brightness</span>
<span className="text-gray-900 dark:text-white font-mono">+12</span>
</div>
<input className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" type="range" value="62"/>
</div>
<div>
<div className="flex justify-between text-xs mb-1.5">
<span className="text-gray-600 dark:text-gray-400">Contrast</span>
<span className="text-gray-900 dark:text-white font-mono">0</span>
</div>
<input className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" type="range" value="50"/>
</div>
<div>
<div className="flex justify-between text-xs mb-1.5">
<span className="text-gray-600 dark:text-gray-400">Saturation</span>
<span className="text-gray-900 dark:text-white font-mono">+5</span>
</div>
<input className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" type="range" value="55"/>
</div>
</div>
</div>
</div>
<div className="mt-auto p-4 border-t border-gray-200 dark:border-zinc-800">
<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
<span className="flex items-center gap-1"><span className="material-icons-round text-sm">language</span> Language</span>
<div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
<button className="px-2 py-1 bg-white dark:bg-gray-600 shadow-sm  rounded text-gray-900 dark:text-white">EN</button>
<button className="px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-arabic">{t('t_2ec263a')}</button>
</div>
</div>
</div>
</aside>
<main className="flex-1 bg-gray-100 dark:bg-black/40 relative flex items-center justify-center p-8 overflow-hidden">
<div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none" style={{"backgroundImage":"radial-gradient(#6b7280 1px, transparent 1px)","backgroundSize":"20px 20px"}}></div>
<div className="relative z-10 flex flex-col items-center">
<div className="mb-4 bg-surface-light dark:bg-surface-dark p-1.5 rounded-full shadow-xl border border-gray-200 dark:border-zinc-800 flex gap-1">
<button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors" title="Pan">
<span className="material-icons-round text-xl">pan_tool</span>
</button>
<button className="p-2 bg-primary/10 text-primary rounded-full transition-colors" title="Select">
<span className="material-icons-round text-xl">near_me</span>
</button>
<button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors" title="Crop">
<span className="material-icons-round text-xl">crop</span>
</button>
<div className="w-px h-6 bg-gray-200 dark:bg-gray-600 my-auto mx-1"></div>
<button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors" title="Zoom In">
<span className="material-icons-round text-xl">add</span>
</button>
<span className="text-xs font-mono my-auto px-1 text-gray-500 dark:text-gray-400">100%</span>
<button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors" title="Zoom Out">
<span className="material-icons-round text-xl">remove</span>
</button>
</div>
<div className="relative group shadow-2xl rounded-sm">
<div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Grey_square.svg/2048px-Grey_square.svg.png')] bg-repeat opacity-20 z-0 rounded-sm"></div>
<img alt="Red Nike Sneaker Product Shot" className="block max-w-2xl max-h-[60vh] h-auto rounded-sm object-contain relative z-10 bg-transparent" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8C2dCalXEqPW5W2HnsxiB80pE2SVdY14reDpbHniSZfGwH9TH71qPnxhltcycBcagErCpCiQXurSR-r8tL6n-mx3ZAtuhpScQN7K-TGYmYRVS1MoYjwVuz4eZgEMObxTuOdpogR87HDrMSihLNhk5zmqigfj0eYmLNWU2qzb7xuVgXLzFk-zQDTwFJm5cgJwjhXWg1bqx6if_AREIpUNcX1Nv9o908QtXMftwPab99KuwBh1e1pJOyFKqxE_3FxyTKkFM66fy_wdJ"/>
<div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="bg-black/70 hover:bg-black text-white p-1.5 rounded-md text-xs backdrop-blur-sm">Original</button>
<button className="bg-primary/90 hover:bg-primary text-white p-1.5 rounded-md text-xs backdrop-blur-sm shadow-lg shadow-primary/20">Preview AI</button>
</div>
</div>
<div className="mt-8 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl px-12 py-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer w-full max-w-md">
<span className="material-icons-round text-gray-400 text-3xl mb-2">cloud_upload</span>
<p className="text-sm font-medium text-gray-600 dark:text-gray-300">Drop new image here</p>
<p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WEBP</p>
</div>
</div>
</main>
<aside className="w-80 bg-surface-light dark:bg-surface-dark border-l border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden z-10">
<div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
<h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
<span className="material-icons-round text-primary">auto_fix_high</span>
                    AI Variants
                </h2>
<span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">4 Generated</span>
</div>
<div className="flex-1 overflow-y-auto p-4 space-y-4">
<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-zinc-800">
<label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block uppercase">Scene Prompt</label>
<textarea className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-20" placeholder="Describe the scene (e.g., minimalist concrete background with morning sunlight)...">Red sneaker on a rocky mountain terrain with dramatic sunset lighting</textarea>
<div className="flex justify-end mt-2">
<button className="bg-gray-900 dark:bg-white dark:bg-zinc-900 text-white dark:text-gray-900 dark:text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                            Regenerate
                        </button>
</div>
</div>
<div className="grid grid-cols-2 gap-3">
<div className="group relative aspect-square rounded-lg overflow-hidden border-2 border-primary cursor-pointer">
<img alt="Variant 1" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0D8wUVyJlupfNPcD5VFjZLdel8A4N2DDikQeHsDvexcviVXBOkYnDMf_oiar29OlfNZwHAR6acloVhyDXr_ruu4Wzxr2MjL3JukoWO-PRvzP4cpQdewALTShtuGMOZrwWPK967cazsKH2V_q6S-4XWrOm_eQpr7GSNb5ruzy0bqnzG-gaoR83XsZzdDCcSdMMaG8bt1PAR9bJpdbt8SeInswtanWH3-O537BQVbC-Nhv63_VnSTkdsmz7u4jnXjwaIhBH0FUA8Z6o"/>
<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<button className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white p-1.5 rounded-full shadow-lg">
<span className="material-icons-round text-sm">check</span>
</button>
</div>
<div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[10px] py-1 text-center font-medium">Selected</div>
</div>
<div className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-primary/50">
<img alt="Variant 2" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9Pmfa41FjXAYt43ZQjJd3DPmcTTsKY_Z_4OYOn1_6XvZz8R00SQ27hlzOcBEs_sgRCsn8QVPBD5AidgKaWfWC67ZgER_dBx8PvYwwaiE49tkYZAaBOz_IpVJT6Tp97fFizPVAxBgmm6ApE7hBXh-w-D0Yptxm3-WmUfUYvfzBMS-LvU_9jdJ_9aq5i7o9-B_NvzLruS4Ib1X8ZOYTbdreu9TL1_2qreeXiZ7RE0UUlABkkNna84Jbz5UFaIEjZwyOF9tH1LTKi0Tb"/>
<div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">Mountain</div>
<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<button className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white p-1.5 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors">
<span className="material-icons-round text-sm">download</span>
</button>
</div>
</div>
<div className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-primary/50">
<img alt="Variant 3" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqvY3BpcwqCTD0zaD1SfQGiu7KHfGYhlalUU16LoEIt0j8HWrjXO-FAuVirumjH9jm8-dLiSWj9alsuz99MPOcw9RWrkfM0Tpsi_W85bEnb_l0cKq72l9CAaqHqn6RvmfsbXG7rgkHIfySRRxn_zFxSDFTfEsQIR4TTvKewAM3evrfJESrRBwvxvtr_QyHam1KUZeRXkEnibVZIVW54bykz4F-TZtEkcNQaAocVf-Qd8VsxdT5Wh7q6QYewivXku8v91yqPR4l2bqU"/>
<div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">Urban</div>
<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<button className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white p-1.5 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors">
<span className="material-icons-round text-sm">download</span>
</button>
</div>
</div>
<div className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 cursor-pointer hover:border-primary/50">
<img alt="Variant 4" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSd3v3d0j1OlV4ZB1rLCNWwhQ5y2ykdCF8ZBZOiBlOMzfqpdE8GxJ5lsbBkFXaLzE22B_MmTQhX8yoqMKjeV7m1OiukJqg8C7AbjLhjktauRayJBDUln8uzlbLSp4ytMKhFy71h6BHfNKKqmNnkfps9Yu-GuIO97bH8omT5vrQ7cV2Ea1NxG-7mLfCyrrkChQNMaM0JOiiOMbJRaZWyi9warlRsPz5l3Ur3JR3iVk-Br9pZeFRkepXh40DA8ZELoEf8BSC89t_D8gz"/>
<div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">Studio</div>
<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<button className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white p-1.5 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors">
<span className="material-icons-round text-sm">download</span>
</button>
</div>
</div>
</div>
<div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Generated Caption <span className="font-arabic">{t('t_b013ea3f')}</span></h3>
<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
<p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-arabic" dir="rtl">
                            
                            {t('t_7701447b2')}
                        </p>
<div className="flex gap-2 mt-3 justify-end">
<button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
<span className="material-icons-round text-[14px]">content_copy</span> Copy
                            </button>
</div>
</div>
</div>
</div>
<div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-gray-800/50">
<button className="w-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
<span className="material-icons-round">history</span> View Version History
                </button>
</div>
</aside>
</div>



    </>
  );
}