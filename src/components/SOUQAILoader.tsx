'use client';

export default function SOUQAILoader({ size = "lg", text = "جاري التحميل..." }: { size?: "sm" | "md" | "lg", text?: string }) {
    const textSize =
        size === "sm" ? "text-2xl" :
            size === "md" ? "text-4xl" : "text-6xl";

    const pulseSize =
        size === "sm" ? "text-[10px]" :
            size === "md" ? "text-xs" : "text-sm";

    return (
        <div className="flex flex-col items-center justify-center gap-5">

            {/* SOUQAI Logo: breathe in/out + spinning S */}
            <div
                className={`flex items-center font-black tracking-tight ${textSize} select-none`}
                dir="ltr"
                style={{
                    fontFamily: "'Cairo', 'Inter', sans-serif",
                    animation: 'breathe 2.4s ease-in-out infinite',
                }}
            >
                <span
                    style={{
                        lineHeight: 1,
                        display: 'inline-block',
                        color: '#E92063',
                        animation: 'spinS 1.8s linear infinite',
                        transformOrigin: 'center',
                    }}
                >
                    S
                </span>
                <span style={{ lineHeight: 1, color: '#111827' }}>OUQ</span>
                <span style={{ lineHeight: 1, color: '#E92063' }}>AI</span>
            </div>

            {/* Dot loader */}
            {text && (
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[#E92063]"
                                style={{ animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                            />
                        ))}
                    </div>
                    <p className={`text-[#6B7280] dark:text-gray-400 font-bold ${pulseSize}`}>{text}</p>
                </div>
            )}

            <style>{`
                @keyframes spinS {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes breathe {
                    0%   { transform: scale(1);    opacity: 1; }
                    40%  { transform: scale(1.15); opacity: 0.85; }
                    70%  { transform: scale(0.9);  opacity: 0.95; }
                    100% { transform: scale(1);    opacity: 1; }
                }
                @keyframes dotBounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                    40%           { transform: scale(1);   opacity: 1; }
                }
            `}</style>
        </div>
    );
}
