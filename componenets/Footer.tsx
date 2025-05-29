'use client';
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-700 w-full mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-4 text-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-white hover:text-blue-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-base text-white hover:text-blue-400">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-base text-white hover:text-blue-400">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/contact" className="text-base text-white hover:text-blue-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-base text-white hover:text-blue-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-white hover:text-blue-400">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-base text-white hover:text-blue-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-white hover:text-blue-400">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-base text-white hover:text-blue-400">
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="https://www.facebook.com/" className="text-base text-white hover:text-blue-400">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/" className="text-base text-white hover:text-blue-400">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="https://x.com/?lang=en-in" className="text-base text-white hover:text-blue-400">
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-600 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; 2025 veriDeal, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
