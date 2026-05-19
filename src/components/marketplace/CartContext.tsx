'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartOverlay } from './CartOverlay';
import { PaymentSuccessOverlay } from './PaymentSuccessOverlay';

interface CartContextType {
  isCartOpen: boolean;
  isPaymentSuccessOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  completePayment: () => void;
  closePaymentSuccess: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);
  
  const completePayment = () => {
    setIsCartOpen(false);
    setIsPaymentSuccessOpen(true);
  };

  const closePaymentSuccess = () => setIsPaymentSuccessOpen(false);

  return (
    <CartContext.Provider value={{ 
      isCartOpen, 
      isPaymentSuccessOpen,
      openCart, 
      closeCart, 
      toggleCart,
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
