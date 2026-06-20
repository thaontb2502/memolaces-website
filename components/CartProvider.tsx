'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/lib/types';

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'csv-commerce-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (item: CartItem) => {
      if (item.stock <= 0 || item.price <= 0) return;
      setItems((current) => {
        const existing = current.find((cartItem) => cartItem.variantId === item.variantId);
        if (!existing) return [...current, { ...item, quantity: Math.min(item.quantity, item.stock) }];

        return current.map((cartItem) =>
          cartItem.variantId === item.variantId
            ? { ...cartItem, quantity: Math.min(cartItem.quantity + item.quantity, item.stock) }
            : cartItem,
        );
      });
    };

    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
      addItem,
      updateQuantity: (variantId, quantity) => {
        setItems((current) =>
          current.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
              : item,
          ),
        );
      },
      removeItem: (variantId) => setItems((current) => current.filter((item) => item.variantId !== variantId)),
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};
