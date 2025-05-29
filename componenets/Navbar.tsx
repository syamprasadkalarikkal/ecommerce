'use client';

import React, { useEffect, useState } from 'react';
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

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="p-2  hover:text-indigo-600 focus:outline-none text-gray-700 md:hidden"
              aria-label="Open search"
            >
              <Search size={20} />
            </button>

            <div className="relative" data-dropdown>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 text-gray-700 hover:text-indigo-600 focus:outline-none"
                aria-label="Profile options"
              >
                <User size={20} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  {user ? (
                    <>
                      <Link
                        href="/user"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>

            <Link href="/cart" className="p-2 text-gray-700 hover:text-indigo-600 relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={getLinkClass(href, true)}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 text-black rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => {
                if (searchTerm.trim()) {
                  setSearchOpen(false);
                  router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                }
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
