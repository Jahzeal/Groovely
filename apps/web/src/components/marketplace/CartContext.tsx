'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartOverlay } from './CartOverlay';
import { PaymentSuccessOverlay } from './PaymentSuccessOverlay';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  trackId?: number;
  title: string;
  creator: string;
  image: string;
  license: string;
  price: number;
  currency?: string;
  editionId?: number;
}

interface CartContextType {
  isCartOpen: boolean;
  isPaymentSuccessOpen: boolean;
  cartItems: CartItem[];
  cartCount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  completePayment: () => void;
  closePaymentSuccess: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'groovely_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  const updateCart = (newItems: CartItem[]) => {
    setCartItems(newItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (item: CartItem) => {
    if (cartItems.some(i => String(i.id) === String(item.id))) {
      toast('Item is already in your cart', { icon: '🛒' });
      setIsCartOpen(true);
      return;
    }
    const updated = [...cartItems, item];
    updateCart(updated);
    toast.success(`Added "${item.title}" to cart!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    const updated = cartItems.filter(i => String(i.id) !== String(id));
    updateCart(updated);
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    updateCart([]);
  };
  
  const completePayment = () => {
    clearCart();
    setIsCartOpen(false);
    setIsPaymentSuccessOpen(true);
  };

  const closePaymentSuccess = () => setIsPaymentSuccessOpen(false);

  return (
    <CartContext.Provider value={{ 
      isCartOpen, 
      isPaymentSuccessOpen,
      cartItems,
      cartCount: cartItems.length,
      openCart, 
      closeCart, 
      toggleCart,
      addToCart,
      removeFromCart,
      clearCart,
      completePayment,
      closePaymentSuccess
    }}>
      {children}
      <CartOverlay isOpen={isCartOpen} onClose={closeCart} />
      <PaymentSuccessOverlay isOpen={isPaymentSuccessOpen} onClose={closePaymentSuccess} />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
