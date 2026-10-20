'use client';

import React, { useState } from 'react';

interface ImageGalleryProps {
    images: string[];
    mainImage: string;
    productName: string;
    variant?: 'light' | 'dark' | 'minimal';
}

export default function ImageGallery({ images, mainImage, productName, variant = 'light' }: ImageGalleryProps) {
    // Combine mainImage with images array, removing duplicates
    const allImages = Array.from(new Set([mainImage, ...images].filter(Boolean)));
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedImage = allImages[selectedIndex] || mainImage;

    if (allImages.length <= 1) {
        // Single image — just show it
        return (
            <div className="w-full aspect-square overflow-hidden rounded-3xl group">
                <img
                    src={mainImage}
                    alt={productName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 cursor-zoom-in"
                />
            </div>
        );
    }

    const borderColor = variant === 'dark' ? 'border-white/20' : variant === 'minimal' ? 'border-[#1a1a1a]' : 'border-primary';
    const thumbBg = variant === 'dark' ? 'bg-white/5 border-white/10' : variant === 'minimal' ? 'bg-[#f0f0ee] border-[#e5e5e5]' : 'bg-slate-100 border-slate-200 dark:border-zinc-800';
    const thumbActiveBg = variant === 'dark' ? `ring-2 ring-purple-500 ${borderColor}` : variant === 'minimal' ? `ring-2 ring-[#1a1a1a]` : `ring-2 ring-primary`;

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="w-full aspect-square overflow-hidden rounded-3xl relative group">
                <img
                    src={selectedImage}
                    alt={`${productName} - صورة ${selectedIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 cursor-zoom-in"
                />
                {/* Left/Right Navigation */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={() => setSelectedIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:bg-zinc-900"
                        >
                            <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
                        </button>
                        <button
                            onClick={() => setSelectedIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:bg-zinc-900"
                        >
                            <span className="material-symbols-outlined !text-[20px]">chevron_left</span>
                        </button>
                        {/* Counter */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                            {selectedIndex + 1} / {allImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1 px-1" dir="ltr">
                {allImages.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                            i === selectedIndex ? thumbActiveBg : `${thumbBg} opacity-60 hover:opacity-100`
                        }`}
                    >
                        <img
                            src={img}
                            alt={`${productName} - مصغر ${i + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
