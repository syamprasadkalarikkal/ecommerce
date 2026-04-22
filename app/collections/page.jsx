"use client";

import React from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

const COLLECTIONS = [
    {
        id: "dresses",
        name: "Silhouettes of Eve",
        subtitle: "The Gown Gallery",
        image: "/images/model1.png",
        count: 10,
        color: "#FDFBF7",
        description: "Masterpieces of fluid silk and architectural lace for your most memorable evenings."
    },
    {
        id: "tops",
        name: "The Atelier Edit",
        subtitle: "Precision Suiting",
        image: "/images/model2.png",
        count: 10,
        color: "#F8F5F0",
        description: "Defining modern femininity through structured blazers and delicate silk blouses."
    },
    {
        id: "bags",
        name: "Celestial Objects",
        subtitle: "The Accessories Vault",
        image: "/images/model3.png",
        count: 10,
        color: "#F4ECE2",
        description: "Handcrafted companions that bridge the gap between utility and sculpture."
    },
    {
        id: "shoes",
        name: "Sole & Spirit",
        subtitle: "Luxury Footwear",
        image: "/images/hero.png",
        count: 10,
        color: "#E8E2D9",
        description: "From stiletto precision to flat elegance, every step is a statement of grace."
    }
];

export default function CollectionsPage() {
    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Editorial Header */}
            <section className="pt-32 pb-24 px-4 max-w-6xl mx-auto flex flex-col items-center text-center">
                <span className="text-[10px] uppercase tracking-[0.8em] font-bold text-accent mb-8">Established 2024</span>
                <h1 className="text-6xl md:text-9xl font-serif tracking-tighter leading-[0.8] mb-12">
                    The <span className="italic luxury-text">Archives</span>
                </h1>
                <p className="max-w-2xl text-lg font-light leading-relaxed opacity-60">
                    A curated selection of Kalika's finest artisan pieces, organized into distinct narratives. Each collection is a testament to our commitment to timeless elegance.
                </p>
            </section>

            {/* Vertical Editorial Grid */}
            <div className="max-w-7xl mx-auto px-4 space-y-32">
                {COLLECTIONS.map((c, index) => (
                    <div
                        key={c.id}
                        className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}
                    >
                        {/* Solid Color Hero Block (Minimalist Client Presentation) */}
                        <div
                            className="flex-1 w-full aspect-[4/5] lg:aspect-square relative overflow-hidden group shadow-2xl transition-all duration-1000 border border-black/10"
                            style={{ backgroundColor: c.color }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center p-20">
                                <span className="text-[180px] md:text-[350px] font-serif opacity-[0.05] select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                    {c.name.charAt(0)}
                                </span>
                            </div>
                            <div className="absolute bottom-12 left-12">
                                <p className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-40">Ref. KLK-{c.id.substring(0, 3).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Category Content */}
                        <div className="flex-1 max-w-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent">{c.subtitle}</span>
                                <div className="h-px w-12 bg-accent/20"></div>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-serif tracking-tighter leading-[0.9] mb-8">{c.name}</h2>
                            <p className="text-xl font-light leading-relaxed opacity-60 mb-12">
                                {c.description}
                            </p>
                            <Link
                                href={`/search?category=${c.id}`}
                                className="group inline-flex items-center gap-8 py-4 border-b border-foreground/10 hover:border-[#800000] transition-colors"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] group-hover:text-[#800000] transition-colors">Discover the Archive ({c.count})</span>
                                <FaArrowRight size={12} className="group-hover:translate-x-4 transition-transform text-[#800000]" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Newsletter/Closure Section */}
            <section className="mt-48 pt-32 border-t border-foreground/5 bg-stone-50">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h3 className="text-3xl md:text-5xl font-serif mb-8">Join the inner circle</h3>
                    <p className="text-[10px] uppercase tracking-[0.4em] mb-12 opacity-40 font-bold font-sans">For updates on new editorial drops and private viewings</p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="flex-1 bg-white border border-foreground/5 px-6 py-4 text-xs tracking-widest focus:ring-1 focus:ring-accent outline-none"
                        />
                        <button className="bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#800000] transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
