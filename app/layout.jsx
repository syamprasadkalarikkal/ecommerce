import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "../componenets/Navbar";
import Footer from "@/componenets/Footer";
import { CartProvider } from "@/context/CartContext";
import { RatingsProvider } from "@/context/RatingsContext";
import { Toaster } from "react-hot-toast";
import { WishlistProvider } from "@/context/WishlistContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kalika Boutique: Arts of Elegance",
  description: "Kalika Boutique - Arts of Elegance. High-end fashion curation for the modern woman.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <CartProvider>
          <WishlistProvider>
            <RatingsProvider>
              <Suspense fallback={<div className="h-16 bg-gray-100" />}>
                <Navbar />
              </Suspense>
              <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full">{children}</main>
              <Footer />
              <Toaster position="top-right" />
            </RatingsProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
