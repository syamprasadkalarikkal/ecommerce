"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/search?category=dresses", label: "Dresses" },
  { href: "/search?category=tops", label: "Tops" },
  { href: "/search?category=bags", label: "Handbags" },
  { href: "/search?category=shoes", label: "Shoes" },
];

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // All Hooks MUST be called unconditionally before any early returns.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { cartItems } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [user, setUser] = useState(null);
  const searchInputRef = useRef(null);

  // Helper to check if a link is active (considering query params for categories)
  const isLinkActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      if (path !== pathname) return false;
      const params = new URLSearchParams(query);
      for (const [key, value] of params.entries()) {
        if (searchParams?.get(key) !== value) return false;
      }
      return true;
    }
    return pathname === href;
  };

  // Hide Navbar on authentication pages
  const isAuthPage = ["/login", "/create", "/otp-login"].includes(pathname);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const cartCount = cartItems.length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    window.location.reload();
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      setSearchOpen(false);
      setMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmedTerm)}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest("[data-dropdown]")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center pr-8">
              <Link href="/" className="flex flex-col hover:opacity-80 transition-opacity">
                <span className="text-3xl font-serif tracking-tighter text-[#800000]">Kalika</span>
                <span className="text-[8px] uppercase tracking-[0.4em] opacity-60 -mt-1">Arts of Elegance</span>
              </Link>
            </div>

            {/* Large Screen Navigation */}
            <div className="hidden md:flex md:space-x-4 items-center h-full">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`h-full flex items-center px-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 border-b-2 ${active
                      ? "text-[#800000] border-[#800000]"
                      : "text-foreground opacity-40 border-transparent hover:opacity-100 hover:border-foreground/20"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full border border-gray-300 text-black rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-accent focus:outline-none text-gray-700 md:hidden transition-colors"
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>

            <div className="relative" data-dropdown>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 text-gray-700 hover:text-accent focus:outline-none transition-colors"
                aria-label="Profile options"
              >
                <User size={20} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                  {user ? (
                    <>
                      <Link
                        href="/user"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/wishlist"
                        className={`block px-4 py-2 text-sm transition-colors ${pathname === '/wishlist' ? 'text-accent bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/cart"
              className={`p-2 relative transition-colors ${pathname === '/cart' ? 'text-accent' : 'text-gray-700 hover:text-accent'}`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-accent rounded-full min-w-[1.25rem] h-5 shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
          <div className="pt-2 pb-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-3 border-l-4 text-xs font-bold uppercase tracking-widest transition-all ${active
                    ? "bg-gray-50 border-accent text-accent"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-accent hover:text-accent"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Search */}
      {searchOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 text-black rounded-md py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
