"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

const WishlistContext = createContext(undefined);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadWishlistFromDatabase = async (uid) => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Wishlist fetch error:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    const fetchSessionAndWishlist = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          setIsAuthenticated(false);
          setUserId(null);
          setWishlist([]);
        } else {
          const uid = session.user.id;
          setIsAuthenticated(true);
          setUserId(uid);
          const items = await loadWishlistFromDatabase(uid);
          setWishlist(items);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUserId(null);
        setWishlist([]);
      }
      setIsLoading(false);
    };

    fetchSessionAndWishlist();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      setIsAuthenticated(!!uid);

      if (uid && event === "SIGNED_IN") {
        setWishlist(await loadWishlistFromDatabase(uid));
      } else if (event === "SIGNED_OUT") {
        setWishlist([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addToWishlist = async (item) => {
    if (!userId || !isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      return;
    }

    const exists = wishlist.some((w) => w.product_id === (item.id || item.product_id));
    if (exists) {
      toast("Item is already in your wishlist");
      return;
    }

    // Optimistic UI update
    setWishlist((prev) => {
      const updated = [{ ...item, product_id: item.id || item.product_id }, ...prev];
      return updated;
    });

    toast.success("Added to wishlist!", {
      style: {
        background: "#FDFBF7",
        color: "#800000",
        border: "1px solid rgba(0,0,0,0.1)",
      },
    });

    try {
      const payload = {
        user_id: userId,
        product_id: item.id || item.product_id,
        name: item.name || "",
        price: item.price || 0,
        image: item.image || null,
        description: item.description || null,
        category: item.category || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("wishlist")
        .insert([payload]);

      if (error) {
        console.error("Database error adding to wishlist:", error.message || JSON.stringify(error));
      }
    } catch (e) {
      console.error("Exception adding to wishlist:", e);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!userId || !isAuthenticated) {
      toast.error("Please log in to manage your wishlist");
      return;
    }

    // Optimistic UI update
    setWishlist((prev) => prev.filter((w) => w.product_id !== productId && w.id !== productId));
    toast.success("Removed from wishlist");

    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

      if (error) {
        console.error("Database error removing from wishlist:", error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
