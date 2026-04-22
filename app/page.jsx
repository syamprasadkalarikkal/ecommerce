"use client";

import { useState, useEffect } from "react";
import CircularModelScroll from "@/componenets/CircularModelScroll";
import NewArrival from "@/componenets/NewArrival";
import Link from "next/link";

const HERO_CARDS = [
  {
    id: 1,
    title: "Timeless Elegance",
    subtitle: "New Season Arrival",
    color: "#F5F5F5", // Soft White
    text: "text-foreground"
  },
  {
    id: 2,
    title: "Summer Luxe",
    subtitle: "Exclusive Collection",
    color: "#E8E2D9", // Warm Beige
    text: "text-foreground"
  },
  {
    id: 3,
    title: "Golden Hour",
    subtitle: "Evening Wear",
    color: "#D4AF37", // Gold
    text: "text-white"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Refined 2-Column Hero Section with Background Animation */}
        <section className="relative h-[90vh] w-full flex flex-col lg:flex-row overflow-hidden bg-background">

          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[150px] animate-pulse transition-all duration-[10s]"></div>
            <div className="absolute top-[20%] right-[30%] w-[20%] h-[20%] rounded-full bg-accent/5 blur-[80px] animate-bounce duration-[15s]"></div>
          </div>


          <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex items-center justify-center p-8 lg:p-20 z-10">
            <div className="max-w-xl text-foreground">


              <div className="space-y-12 mb-16">
                <div className="relative">
                  <h1 className="text-6xl md:text-9xl font-serif leading-[0.9] tracking-tighter">
                    Kalika
                  </h1>
                  <p className="text-2xl md:text-4xl font-serif italic luxury-text mt-2 ml-4">
                    Arts of Elegance
                  </p>
                </div>

                <div className="space-y-8">
                  <p className="text-xl md:text-2xl font-light leading-relaxed italic border-l-4 border-accent/30 pl-8 py-4 opacity-90">
                    "Elegance is the only beauty that never fades." — Audrey Hepburn
                  </p>

                  <div className="text-md opacity-70 leading-loose font-light max-w-md space-y-4">
                    <p>
                      Kalika is the definitive house of luxury, where tradition meets the avant-garde. Each silhouette is a masterpiece, crafted for those who define elegance on their own terms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  href="/search"
                  className="px-10 py-4 border border-black hover:bg-black hover:text-white font-bold tracking-[0.2em] uppercase transition-all duration-500 text-xs text-center"
                >
                  Shop The Look
                </Link>
                <Link
                  href="/products/all"
                  className="px-10 py-4 font-bold tracking-[0.2em] uppercase text-xs text-center hover:underline underline-offset-8"
                >
                  Our Vision
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Integrated 3D Circular Scroll */}
          <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative overflow-visible flex items-center justify-center">
            <div className="w-full h-full">
              <CircularModelScroll />
            </div>
          </div>
        </section>

        {/* Featured Collections Section (Integrated into Hero, so we focus on New Arrivals here) */}
        <div className="mt-20">
          <NewArrival />
        </div>

        {/* Minimalist Style Essentials / Editorial Section */}
        <section className="bg-[#800000] text-background py-32 px-4 relative overflow-hidden">
          {/* Subtle geometric overlay for modern touch */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 border border-background rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 border border-background rounded-full -translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="text-xs uppercase tracking-[0.6em] opacity-60 mb-6 block">Collection Premiere</span>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif mb-10 tracking-tighter leading-tight px-4">
              Elegance <span className="italic font-light opacity-80">Redefined</span>
            </h2>
            <div className="w-24 h-px bg-accent mx-auto mb-10"></div>
            <p className="text-xl md:text-2xl font-light mb-16 opacity-80 leading-relaxed max-w-2xl mx-auto">
              Step into a world where every stitch tells a story of sophistication. Our latest silhouettes are curated for the woman who defines luxury on her own terms.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center gap-6 group"
            >
              <span className="text-sm uppercase tracking-[0.4em] font-bold border-b border-transparent group-hover:border-background transition-all pb-1">
                Discover The Collection
              </span>
              <div className="w-12 h-12 rounded-full border border-background/30 flex items-center justify-center group-hover:bg-background group-hover:text-[#800000] transition-all duration-500">
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
