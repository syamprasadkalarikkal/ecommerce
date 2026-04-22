"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      setError(error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  const handleOtpRedirect = () => {
    router.push("/otp-login");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Brand Showcase */}
      <div
        className="relative lg:w-1/2 flex flex-col justify-between p-12 lg:p-20 min-h-[300px] lg:min-h-screen overflow-hidden"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        {/* Decorative Background Letter */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[400px] lg:text-[600px] font-serif text-white/[0.03] leading-none">
            K
          </span>
        </div>

        {/* Top - Brand */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl lg:text-5xl font-serif tracking-tighter text-white">
              Kalika
            </h1>
            <span className="text-[9px] uppercase tracking-[0.5em] text-white/40 font-bold">
              Arts of Elegance
            </span>
          </Link>
        </div>

        {/* Center - Editorial Quote */}
        <div className="relative z-10 my-12 lg:my-0">
          <div className="w-12 h-px bg-white/20 mb-8"></div>
          <p className="text-2xl lg:text-4xl font-serif italic text-white/80 leading-relaxed max-w-md">
            "Where tradition meets contemporary grace."
          </p>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mt-6 font-bold">
            Curated fashion for the modern woman
          </p>
        </div>

        {/* Bottom - Features */}
        <div className="relative z-10 hidden lg:flex gap-12">
          <div>
            <p className="text-white/80 text-lg font-serif mb-1">40+</p>
            <p className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold">
              Artisan Pieces
            </p>
          </div>
          <div>
            <p className="text-white/80 text-lg font-serif mb-1">4</p>
            <p className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold">
              Collections
            </p>
          </div>
          <div>
            <p className="text-white/80 text-lg font-serif mb-1">Free</p>
            <p className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold">
              Private Delivery
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-20 bg-[#FDFBF7]">
        <div className="w-full max-w-md">
          {/* Mobile brand (hidden on desktop since left panel shows it) */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/">
              <span className="text-3xl font-serif tracking-tighter text-[#800000]">Kalika</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-serif tracking-tighter mb-3">
              Welcome <span className="italic text-[#800000]">Back</span>
            </h2>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">
              Sign in to access your private collection
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <label
                className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                className="w-full px-5 py-4 bg-white border border-black/10 text-sm font-light focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-all placeholder:text-black/20"
                required
              />
            </div>

            <div>
              <label
                className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-black/10 text-sm font-light focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-all placeholder:text-black/20"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-light">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800000] text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-black/10"></div>
            <span className="px-4 text-[9px] uppercase tracking-[0.3em] opacity-30 font-bold">
              or continue with
            </span>
            <div className="flex-1 h-px bg-black/10"></div>
          </div>

          {/* OTP Login */}
          <button
            type="button"
            onClick={handleOtpRedirect}
            className="w-full py-4 border border-black/10 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500"
          >
            One-Time Password
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-10">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">
              New to Kalika?{" "}
              <Link
                href="/create"
                className="text-[#800000] font-bold hover:underline opacity-100"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Trust Signals */}
          <div className="mt-16 pt-8 border-t border-black/5 flex justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-30">Secure Login</p>
              <p className="text-[8px] uppercase tracking-[0.2em] opacity-20 mt-1">256-bit SSL</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-30">Privacy First</p>
              <p className="text-[8px] uppercase tracking-[0.2em] opacity-20 mt-1">Data Protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
