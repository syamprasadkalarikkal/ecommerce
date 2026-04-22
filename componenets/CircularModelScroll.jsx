"use client";
import React, { useState, useEffect } from "react";

const MODELS = [
    {
        id: 1,
        color: "#FFD1DC", // Pastel Pink
        title: "Rose Petal",
        category: "Evening",
        letter: "P"
    },
    {
        id: 2,
        color: "#7FFFD4", // Aquamarine
        title: "Ocean Breeze",
        category: "Resort",
        letter: "A"
    },
    {
        id: 3,
        color: "#90EE90", // Light Green
        title: "Spring Bloom",
        category: "Daywear",
        letter: "G"
    }
];

export default function CircularModelScroll() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % MODELS.length);
        }, 2000);
        return () => clearInterval(timer);
    }, [isHovered]);

    const getPositionStyle = (index) => {
        const total = MODELS.length;
        let diff = index - currentIndex;

        // Handle wrapping for 3 items: -1, 0, 1
        if (diff > 1) diff -= total;
        if (diff < -1) diff += total;

        const isCenter = diff === 0;
        const isLeft = diff === -1;
        const isRight = diff === 1;

        return {
            transform: `translateX(${diff * 75}%) scale(${isCenter ? 1.2 : 0.75})`,
            zIndex: isCenter ? 30 : 10,
            opacity: isCenter ? 1 : 0.4,
            filter: isCenter ? "blur(0)" : "blur(2px)",
            backgroundColor: MODELS[index].color
        };
    };

    return (
        <div
            className="relative w-full h-[600px] flex items-center justify-center bg-transparent overflow-visible"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center overflow-visible">
                {MODELS.map((model, index) => {
                    const style = getPositionStyle(index);
                    const isCenter = (index === currentIndex);

                    return (
                        <div
                            key={model.id}
                            className="absolute w-[280px] h-[400px] md:w-[340px] md:h-[480px] rounded-[48px] shadow-2xl transition-all duration-1000 ease-out flex items-center justify-center border border-black/10"
                            style={style}
                        >
                            <span
                                className={`font-serif select-none transition-all duration-1000 ${isCenter ? 'text-[220px] md:text-[300px] opacity-20' : 'text-[120px] md:text-[180px] opacity-10'}`}
                            >
                                {model.letter}
                            </span>

                            {isCenter && (
                                <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                    <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/40 mb-2">{model.category}</span>
                                    <h3 className="text-2xl md:text-3xl font-serif italic text-black/80">{model.title}</h3>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Focal Navigation Indicators */}
            <div className="absolute bottom-4 flex gap-4">
                {MODELS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1 transition-all duration-500 rounded-full ${currentIndex === i ? 'bg-[#800000] w-12' : 'bg-gray-300 w-6 hover:bg-gray-400'}`}
                        aria-label={`Show collection ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
