"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer on authentication pages
  const isAuthPage = ["/login", "/create", "/otp-login"].includes(pathname);
  if (isAuthPage) return null;

  return (
    <footer className="bg-background w-full mt-auto border-t border-accent/10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-4 text-center">
          <div>
            <h3 className="text-sm font-serif font-semibold text-foreground tracking-[0.2em] uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-serif font-semibold text-foreground tracking-[0.2em] uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/contact"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-serif font-semibold text-foreground tracking-[0.2em] uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/privacy"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-serif font-semibold text-foreground tracking-[0.2em] uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="https://www.facebook.com/"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com/?lang=en-in"
                  className="text-base text-foreground/80 hover:text-accent transition-colors duration-300 font-light"
                >
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-accent/20 pt-8">
          <p className="text-base text-muted text-center font-light tracking-widest">
            &copy; 2025 Kalika Boutique. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
