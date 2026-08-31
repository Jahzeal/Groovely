'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartOverlay } from './CartOverlay';
import { PaymentSuccessOverlay } from './PaymentSuccessOverlay';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  trackId?: number;
  uploaderId?: number;
  title: string;
  creator: string;
  image: string;
  license: string;
  price: number;
  currency?: string;
  editionId?: number;
  contractEditionId?: number;
}

export interface PurchaseReceipt {
  items: CartItem[];
  txHash: string;
  totalUsdc: number;
}

interface CartContextType {
  isCartOpen: boolean;
  isPaymentSuccessOpen: boolean;
  cartItems: CartItem[];
  cartCount: number;
  lastReceipt?: PurchaseReceipt;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  completePayment: (receipt?: PurchaseReceipt) => void;
  closePaymentSuccess: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'groovely_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastReceipt, setLastReceipt] = useState<PurchaseReceipt | undefined>(undefined);

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
    // Check if user is trying to buy their own track
    const currentUserId = typeof window !== 'undefined'
      ? (Number(localStorage.getItem('grooveli_user_id')) || Number(localStorage.getItem('groovely_user_id')) || null)
      : null;

    if (currentUserId && item.uploaderId && Number(item.uploaderId) === currentUserId) {
      toast.error('You cannot purchase your own uploaded sound');
      return;
    }

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
  
  const completePayment = (receipt?: PurchaseReceipt) => {
    if (receipt) {
      setLastReceipt(receipt);
    }
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
      lastReceipt,
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
      <PaymentSuccessOverlay isOpen={isPaymentSuccessOpen} onClose={closePaymentSuccess} receipt={lastReceipt} />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      items: [],
      isCartOpen: false,
      isPaymentSuccessOpen: false,
      lastReceipt: null,
      totalPrice: 0,
      cartCount: 0,
      openCart: () => {},
      closeCart: () => {},
      toggleCart: () => {},
      addToCart: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      completePayment: () => {},
      closePaymentSuccess: () => {},
    };
  }
  return context;
};
