"use client";
import { useI18n } from "@/context/I18nContext";
import React, { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';

export default function WhatsAppWidget() {
    const { t } = useI18n();
    const [whatsappNumber, setWhatsappNumber] = useState('21300000000');

    useEffect(() => {
        const fetchNumber = async () => {
            try {
                const { data } = await insforge.database
                    .from('platform_settings')
                    .select('whatsapp_number')
                    .eq('id', 1)
                    .single();
                if (data && data.whatsapp_number) {
                    setWhatsappNumber(data.whatsapp_number);
                }
            } catch (err) {
                console.error("Error fetching whatsapp number:", err);
            }
        };
        fetchNumber();
    }, []);

    return (
        <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-50 group flex items-center gap-0 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-1.5 rounded-full shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
            style={{ 
                boxShadow: "0 20px 40px -10px rgba(233, 30, 99, 0.3)",
            }}
            title={t("t_ea85c12a")}
            dir="ltr"
        >
            {/* The Icon Circle */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E91E63] to-[#C2185B] flex items-center justify-center text-white shadow-inner relative z-10">
                {/* Ripple effect behind icon */}
                <div className="absolute inset-0 rounded-full border-2 border-[#E91E63] animate-ping opacity-20"></div>
                
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    width="24" 
                    height="24" 
                    fill="currentColor"
                    className="relative z-10 transition-transform group-hover:scale-110 duration-300"
                >
                    <path d="M12.031 2.052c-5.592 0-10.131 4.539-10.131 10.131 0 1.776.459 3.513 1.343 5.048l-1.444 5.275 5.397-1.415c1.474.808 3.149 1.233 4.835 1.233v.001c5.589-.001 10.132-4.54 10.132-10.132 0-2.71-1.055-5.257-2.971-7.173a10.082 10.082 0 0 0-7.161-2.968zm0 18.571c-1.503 0-2.977-.404-4.269-1.168l-.306-.182-3.172.83.845-3.093-.2-.317A8.448 8.448 0 0 1 3.593 12.18c0-4.665 3.796-8.461 8.463-8.461 2.261 0 4.385.881 5.983 2.48 1.598 1.597 2.478 3.722 2.478 5.984-.002 4.664-3.799 8.46-8.486 8.46zm4.64-6.347c-.254-.127-1.505-.744-1.74-.83-.232-.085-.403-.127-.572.127-.168.254-.658.83-.807.999-.148.17-.297.191-.55.064-.254-.127-1.074-.396-2.049-1.265-.758-.676-1.269-1.51-1.418-1.764-.148-.255-.015-.393.111-.52.115-.115.254-.297.382-.446.126-.148.168-.254.254-.424.085-.169.043-.318-.021-.444-.064-.127-.573-1.383-.784-1.892-.206-.497-.414-.429-.572-.436-.148-.008-.318-.008-.488-.008-.168 0-.444.064-.678.318-.232.254-.889.869-.889 2.119s.91 2.46 1.037 2.63c.126.169 1.794 2.735 4.341 3.833 2.112.912 2.87.893 3.421.751.62-.159 1.505-.615 1.717-1.208.212-.593.212-1.1.148-1.208-.064-.106-.233-.169-.488-.297z"/>
                </svg>
            </div>

            {/* The Expanding Text */}
            <div className="overflow-hidden w-0 opacity-0 group-hover:w-[110px] group-hover:opacity-100 group-hover:pl-4 transition-all duration-500 ease-out">
                <span className="text-[#E91E63] font-black text-[13px] whitespace-nowrap block" dir="rtl">
                    تحتاج مساعدة؟
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold whitespace-nowrap block mt-0.5" dir="rtl">
                    تواصل معنا الان
                </span>
            </div>
        </a>
    );
}
