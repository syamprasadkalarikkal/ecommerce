'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export type WishlistItem = {
  id?: string;
  user_id?: string;
  product_id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  category?: string;
  created_at?: string;
};

type WishlistContextType = {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: number) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch session and wishlist
  useEffect(() => {
    const fetchSessionAndWishlist = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsAuthenticated(false);
          setUserId(null);
          setWishlist([]);
          return;
        }

        const uid = sessionData.session?.user?.id || null;
        setUserId(uid);
        setIsAuthenticated(!!uid);

        if (uid) {
          // Fetch wishlist items for authenticated user
          const { data: items, error: wishlistError } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false });

          if (wishlistError) {
            console.error('Wishlist fetch error:', wishlistError);
            toast.error('Failed to load wishlist');
          } else {
            setWishlist(items || []);
          }
        } else {
          // Clear wishlist if not authenticated
          setWishlist([]);
        }
      } catch (error) {
        console.error('Error in fetchSessionAndWishlist:', error);
        setIsAuthenticated(false);
        setUserId(null);
        setWishlist([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionAndWishlist();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      setIsAuthenticated(!!uid);

      if (uid && event === 'SIGNED_IN') {
        // Fetch wishlist when user signs in
        try {
          const { data: items, error } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false });

          if (!error) {
            setWishlist(items || []);
          }
        } catch (error) {
          console.error('Error fetching wishlist on sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear wishlist when user signs out
        setWishlist([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addToWishlist = async (item: WishlistItem) => {
    // Check if user is authenticated
    if (!userId || !isAuthenticated) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    // Check if item already exists in wishlist
    const exists = wishlist.some(w => w.product_id === item.product_id);
    if (exists) {
      toast('Item is already in your wishlist');
      return;
    }

    try {
      // Add to database
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ 
          ...item, 
          user_id: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error adding to wishlist:', error);
        toast.error('Failed to add to wishlist. Please try again.');
      } else {
        // Add to local state
        setWishlist(prev => [data, ...prev]);
        toast.success('Added to wishlist!', {
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #f87171',
          },
        });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!userId || !isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      return;
    }

    try {
      // Remove from database
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Database error removing from wishlist:', error);
        toast.error('Failed to remove from wishlist. Please try again.');
      } else {
        // Remove from local state
        setWishlist(prev => prev.filter(w => w.product_id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      addToWishlist, 
      removeFromWishlist, 
      isLoading, 
      isAuthenticated 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};