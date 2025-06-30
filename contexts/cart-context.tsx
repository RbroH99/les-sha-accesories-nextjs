"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  productId: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  cartId: string | null;
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CART"; payload: { id: string; items: any[] } }
  | { type: "CLEAR_CART" };

const CartContext = createContext<{
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity" | "productId"> & { id: string }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  items: CartItem[];
  total: number;
  loading: boolean;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CART":
      const items = action.payload.items.map((item: any) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0] || "/placeholder.svg",
        quantity: item.quantity,
        category: item.product.categoryId,
      }));
      return {
        ...state,
        cartId: action.payload.id,
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        loading: false,
      };
    case "CLEAR_CART":
      return { ...state, items: [], total: 0, cartId: null };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    loading: true,
    cartId: null,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCart = useCallback(async () => {
    if (!user) {
      dispatch({ type: "CLEAR_CART" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_CART", payload: data });
      } else {
        dispatch({ type: "CLEAR_CART" });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      dispatch({ type: "CLEAR_CART" });
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (item: Omit<CartItem, "quantity" | "productId"> & { id: string }) => {
    if (!user || !state.cartId) return;
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.id, quantity: 1 }),
      });
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_CART", payload: data });
        toast({
          title: "Producto agregado",
          description: `${item.name} se agregó al carrito`,
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const removeItem = async (id: string) => {
    if (!user || !state.cartId) return;
    try {
      const response = await fetch(`/api/cart/items/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_CART", payload: data });
        toast({
          title: "Producto eliminado",
          description: `El producto se eliminó del carrito`,
        });
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user || !state.cartId) return;
    try {
      const response = await fetch(`/api/cart/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_CART", payload: data });
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  const clearCart = async () => {
    if (!user || !state.cartId) return;
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });
      if (response.ok) {
        dispatch({ type: "CLEAR_CART" });
        toast({
          title: "Carrito vaciado",
          description: "Se eliminaron todos los productos del carrito",
        });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        items: state.items,
        total: state.total,
        loading: state.loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
