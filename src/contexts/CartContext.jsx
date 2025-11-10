// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Add service to cart
  const addToCart = (service) => {
    setCartItems(prev => {
      // Check if service already exists
      const existingIndex = prev.findIndex(
        item => item.serviceId === service.serviceId
      );

      if (existingIndex >= 0) {
        // Increase quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      } else {
        // Add new item
        return [...prev, { ...service, quantity: 1 }];
      }
    });
  };

  // Add package to cart
  const addPackageToCart = (pkg) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.packageId === pkg.packageId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      } else {
        return [...prev, { ...pkg, quantity: 1, isPackage: true }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId, isPackage = false) => {
    setCartItems(prev =>
      prev.filter(item =>
        isPackage
          ? item.packageId !== itemId
          : item.serviceId !== itemId
      )
    );
  };

  // Update quantity
  const updateQuantity = (itemId, quantity, isPackage = false) => {
    if (quantity <= 0) {
      removeFromCart(itemId, isPackage);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (isPackage && item.packageId === itemId) {
          return { ...item, quantity };
        } else if (!isPackage && item.serviceId === itemId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total items count
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.isPackage
        ? (item.totalPriceAfterDiscount || item.basePrice || 0)
        : (item.basePrice || 0);
      return total + (price * item.quantity);
    }, 0);
  };

  const value = {
    cartItems,
    addToCart,
    addPackageToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
