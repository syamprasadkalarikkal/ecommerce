'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export type Rating = {
  rate: number;
  count: number;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  description?: string;
  rating?: Rating; // ✅ Add this line
};


export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  updateQuantity: (id: number, quantity: number) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  syncError: string | null;
  debugInfo: any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const log = (message: string, data?: any) => {
    console.log(`CART DEBUG: ${message}`, data || '');
    setDebugInfo((prev: any) => ({
      ...prev,
      [new Date().toISOString()]: { message, data }
    }));
  };

  const testDatabaseConnection = async () => {
    try {
      log('Testing database connection...');
      const { data, error } = await supabase.from('cart').select('count').limit(1);
      
      if (error) {
        log('Database connection failed', error);
        setSyncError(`Database error: ${error.message}`);
        return false;
      }
      
      log('Database connection successful');
      return true;
    } catch (err) {
      log('Database connection exception', err);
      setSyncError('Database connection failed');
      return false;
    }
  };

  const loadCartFromDatabase = async (userId: string): Promise<CartItem[]> => {
    try {
      log('Loading cart from database for user:', userId);
      
      const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      log('Database query result:', { data, error });

      if (error) {
        log('Error loading cart from database', error);
        setSyncError(`Failed to load cart: ${error.message}`);
        return [];
      }

      const items = (data || []).map(item => ({
        id: item.product_id,
        name: item.product_name,
        price: parseFloat(item.product_price),
        image: item.product_image || '',
        quantity: item.quantity || 1,
        description: item.product_description,
        category: item.product_category
      }));

      log('Cart loaded successfully', { itemCount: items.length, items });
      setSyncError(null);
      return items;
    } catch (error) {
      log('Unexpected error loading cart', error);
      setSyncError('Failed to connect to database');
      return [];
    }
  };

  const saveCartItemToDatabase = async (item: CartItem, userId: string): Promise<boolean> => {
    if (isSigningOut) {
      log('Prevented database save during sign out');
      return false;
    }
    
    try {
      log('Saving cart item to database', { item, userId });

      const dataToSave = {
        user_id: userId,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price.toString(),
        product_image: item.image,
        product_description: item.description || null,
        product_category: item.category || null,
        quantity: item.quantity,
        updated_at: new Date().toISOString()
      };

      log('Data being saved:', dataToSave);

      const { data, error } = await supabase
        .from('cart')
        .upsert(dataToSave, { 
          onConflict: 'user_id,product_id',
          ignoreDuplicates: false
        })
        .select();

      log('Upsert result:', { data, error });

      if (error) {
        log('Error saving cart item', error);
        setSyncError(`Failed to save item: ${error.message}`);
        return false;
      }

      log('Item saved successfully', data);
      setSyncError(null);
      return true;
    } catch (error) {
      log('Unexpected error saving cart item', error);
      setSyncError('Failed to save item to database');
      return false;
    }
  };

  const removeCartItemFromDatabase = async (productId: number, userId: string): Promise<boolean> => {
    if (isSigningOut) {
      log('Prevented database remove during sign out');
      return false;
    }
    
    try {
      log('Removing cart item from database', { productId, userId });

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        log('Error removing cart item', error);
        setSyncError(`Failed to remove item: ${error.message}`);
        return false;
      }

      log('Item removed successfully');
      setSyncError(null);
      return true;
    } catch (error) {
      log('Unexpected error removing cart item', error);
      setSyncError('Failed to remove item from database');
      return false;
    }
  };

  const clearCartFromDatabase = async (userId: string): Promise<boolean> => {
    if (isSigningOut) {
      log('Prevented database clear during sign out');
      return false;
    }
    
    try {
      log('Clearing cart from database', userId);

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) {
        log('Error clearing cart', error);
        setSyncError(`Failed to clear cart: ${error.message}`);
        return false;
      }

      log('Cart cleared successfully');
      setSyncError(null);
      return true;
    } catch (error) {
      log('Unexpected error clearing cart', error);
      setSyncError('Failed to clear cart from database');
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      log('Initializing authentication...');
      setIsLoading(true);

      const dbConnected = await testDatabaseConnection();
      log('Database connection status:', dbConnected);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        log('Current session:', { session: session?.user?.id, error });
        
        if (error) {
          log('Auth error', error);
          setIsAuthenticated(false);
          setUserId(null);
          setCartItems([]);
        } else if (session?.user) {
          log('User authenticated', session.user.id);
          setIsAuthenticated(true);
          setUserId(session.user.id);
          
          if (dbConnected) {
            const items = await loadCartFromDatabase(session.user.id);
            setCartItems(items);
            log('Cart items loaded on initialization:', items);
          } else {
            log('Database not connected, cannot load cart');
          }
        } else {
          log('User not authenticated');
          setIsAuthenticated(false);
          setUserId(null);
          setCartItems([]);
        }
      } catch (error) {
        log('Initialization error', error);
        setIsAuthenticated(false);
        setUserId(null);
        setCartItems([]);
      }

      setIsLoading(false);
      log('Initialization complete');
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log('Auth state changed', { event, userId: session?.user?.id });

        if (event === 'SIGNED_IN' && session?.user) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          
          const dbConnected = await testDatabaseConnection();
          if (dbConnected) {
            const items = await loadCartFromDatabase(session.user.id);
            setCartItems(items);
            log('User signed in, cart loaded from database', { itemCount: items.length });
          }
        } else if (event === 'SIGNED_OUT') {
          setIsSigningOut(true);
          log('User signing out - preserving database, clearing memory only');
          setIsAuthenticated(false);
          setUserId(null);
          setCartItems([]);
          setSyncError(null);
          log('User signed out, cart cleared from memory ONLY (database preserved)');
          setTimeout(() => setIsSigningOut(false), 1000);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addToCart = async (item: CartItem) => {
    log('addToCart called', { item, isAuthenticated, userId });

    if (!isAuthenticated || !userId) {
      log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    const currentItems = await loadCartFromDatabase(userId);
    log('Current items in database before adding:', currentItems);

    const existingItem = currentItems.find(p => p.id === item.id);
    const newQuantity = existingItem 
      ? existingItem.quantity + (item.quantity || 1)
      : (item.quantity || 1);

    const itemToSave = {
      ...item,
      quantity: newQuantity
    };

    log('Item to save:', itemToSave);

    const success = await saveCartItemToDatabase(itemToSave, userId);
    
    if (success) {
      log('Item saved to database, reloading cart');
      const updatedItems = await loadCartFromDatabase(userId);
      setCartItems(updatedItems);
      log('Cart updated in state:', updatedItems);
    } else {
      log('Failed to save item to database');
    }
  };

  const removeFromCart = async (id: number) => {
    if (!userId) return;
    log('Removing from cart', id);

    const success = await removeCartItemFromDatabase(id, userId);
    
    if (success) {
      const updatedItems = await loadCartFromDatabase(userId);
      setCartItems(updatedItems);
      log('Item removed, cart updated');
    } else {
      log('Failed to remove item from database');
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (!userId || quantity < 1) return;
    log('Updating quantity', { id, quantity });

    const item = cartItems.find(item => item.id === id);
    if (item) {
      const updatedItem = { ...item, quantity };
      const success = await saveCartItemToDatabase(updatedItem, userId);
      
      if (success) {
        const updatedItems = await loadCartFromDatabase(userId);
        setCartItems(updatedItems);
        log('Quantity updated');
      } else {
        log('Failed to update quantity');
      }
    }
  };

  const clearCart = async () => {
    console.trace('clearCart() was called from:');
    
    if (!userId || !isAuthenticated || isSigningOut) {
      log('Cannot clear cart: user not authenticated, no userId, or signing out', {
        userId: !!userId,
        isAuthenticated,
        isSigningOut
      });
      return;
    }
    
    log('User explicitly clearing entire cart');

    const success = await clearCartFromDatabase(userId);
    
    if (success) {
      setCartItems([]);
      log('Cart cleared by user action');
    } else {
      log('Failed to clear cart');
    }
  };

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    isAuthenticated,
    isLoading,
    syncError,
    debugInfo
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
