"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadCartFromDatabase = async (uid) => {
    try {
      const { data, error } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Cart fetch error:", error);
        return [];
      }

      return (data || []).map((item) => ({
        id: item.product_id,
        name: item.product_name,
        price: parseFloat(item.product_price),
        image: item.product_image || "",
        quantity: item.quantity || 1,
        description: item.product_description,
        category: item.product_category,
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          setIsAuthenticated(false);
          setUserId(null);
          setCartItems([]);
        } else {
          setIsAuthenticated(true);
          const uid = session.user.id;
          setUserId(uid);
          const items = await loadCartFromDatabase(uid);
          setCartItems(items);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUserId(null);
        setCartItems([]);
      }
      setIsLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true);
        const uid = session.user.id;
        setUserId(uid);
        setCartItems(await loadCartFromDatabase(uid));
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserId(null);
        setCartItems([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addToCart = async (item) => {
    if (!isAuthenticated || !userId) {
      router.push("/login");
      return;
    }

    // Optimistic UI update
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((p) => p.id === item.id);
      if (existingItem) {
        return prevItems.map((p) => p.id === item.id ? { ...p, quantity: p.quantity + (item.quantity || 1) } : p);
      }
      return [...prevItems, { ...item, quantity: item.quantity || 1 }];
    });

    const quantityToAdd = item.quantity || 1;
    const existingSyncItem = cartItems.find((p) => p.id === item.id);
    const updatedQuantity = existingSyncItem ? existingSyncItem.quantity + quantityToAdd : quantityToAdd;

    const dataToSave = {
      user_id: userId,
      product_id: item.id || item.product_id,
      product_name: item.name || "",
      product_price: item.price ? item.price.toString() : "0",
      product_image: item.image || null,
      product_description: item.description || null,
      product_category: item.category || null,
      quantity: updatedQuantity,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("cart").upsert(dataToSave, { onConflict: "user_id,product_id" });
    if (error) console.error("Error adding to DB:", error);
  };

  const removeFromCart = async (id) => {
    if (!userId) return;

    // Optimistic UI update
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

    const { error } = await supabase.from("cart").delete().eq("user_id", userId).eq("product_id", id);
    if (error) console.error("Error deleting from DB:", error);
  };

  const updateQuantity = async (id, quantity) => {
    if (!userId || quantity < 1) return;

    // Optimistic UI update
    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)));

    const itemObj = cartItems.find((item) => item.id === id);
    if (!itemObj) return;

    const dataToSave = {
      user_id: userId,
      product_id: itemObj.id,
      product_name: itemObj.name,
      product_price: itemObj.price.toString(),
      product_image: itemObj.image || null,
      product_description: itemObj.description || null,
      product_category: itemObj.category || null,
      quantity: quantity,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("cart").upsert(dataToSave, { onConflict: "user_id,product_id" });
    if (error) console.error("Error updating DB quantity:", error);
  };

  const clearCart = async () => {
    if (!userId || !isAuthenticated) return;

    // Optimistic
    setCartItems([]);

    const { error } = await supabase.from("cart").delete().eq("user_id", userId);
    if (error) console.error("Error clearing DB cart:", error);
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    isAuthenticated,
    isLoading,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
