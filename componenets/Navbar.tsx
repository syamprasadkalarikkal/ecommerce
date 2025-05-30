'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { cartItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const cartCount = cartItems.length;

  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
  ];

  const getLinkClass = (href = '', isMobile = false) => {
    const base = isMobile
      ? 'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
      : 'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium';
    const active = isMobile
      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
      : 'border-indigo-500 text-gray-900';
    const inactive = isMobile
      ? 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    return `${base} ${pathname === href ? active : inactive}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    window.location.reload();
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      setSearchOpen(false);
      setMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmedTerm)}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('[data-dropdown]')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
            
            <Link href="/" className="flex-shrink-0 flex items-center ml-2">
              <span className="text-2xl font-bold text-indigo-600">veriDeal</span>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {links.map(({ href, label }) => (
                <Link key={href} href={href} className={getLinkClass(href)}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center section - Desktop Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full border border-gray-300 text-black rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-indigo-600 focus:outline-none text-gray-700 md:hidden transition-colors"
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>

            {/* User Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 text-gray-700 hover:text-indigo-600 focus:outline-none transition-colors"
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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

            {/* Cart */}
            <Link href="/cart" className="p-2 text-gray-700 hover:text-indigo-600 relative transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full min-w-[1.25rem] h-5">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {links.map(({ href, label }) => (
              <Link 
                key={href} 
                href={href} 
                onClick={() => setMobileMenuOpen(false)} 
                className={getLinkClass(href, true)}
              >
                {label}
              </Link>
            ))}
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
              className="w-full border border-gray-300 text-black rounded-md py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
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