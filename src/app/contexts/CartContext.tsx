"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ProdukRecord, ProdukVarianRecord } from '../services/produk';

// Cart item interface
export interface CartItem {
  produk: ProdukRecord;
  varian?: ProdukVarianRecord;
  quantity: number;
}

// Cart state interface
interface CartState {
  items: CartItem[];
  total: number;
}

// Cart action types
type CartAction =
  | { type: 'ADD_ITEM'; payload: { produk: ProdukRecord; varian?: ProdukVarianRecord; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { produkId: string; varianId?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { produkId: string; varianId?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Cart context interface
interface CartContextType {
  state: CartState;
  addItem: (produk: ProdukRecord, quantity: number, varian?: ProdukVarianRecord) => void;
  removeItem: (produkId: string, varianId?: string) => void;
  updateQuantity: (produkId: string, quantity: number, varianId?: string) => void;
  clearCart: () => void;
  getItemQuantity: (produkId: string, varianId?: string) => number;
  getItemTotal: (produkId: string, varianId?: string) => number;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { produk, varian, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.produk.id === produk.id && item.varian?.id === varian?.id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        const newItem: CartItem = { produk, varian, quantity };
        const updatedItems = [...state.items, newItem];
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      }
    }

    case 'REMOVE_ITEM': {
      const { produkId, varianId } = action.payload;
      const updatedItems = state.items.filter(
        item => !(item.produk.id === produkId && item.varian?.id === varianId)
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case 'UPDATE_QUANTITY': {
      const { produkId, varianId, quantity } = action.payload;
      const updatedItems = state.items.map(item => {
        if (item.produk.id === produkId && item.varian?.id === varianId) {
          return { ...item, quantity: Math.max(0, quantity) };
        }
        return item;
      }).filter(item => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };

    case 'LOAD_CART':
      return {
        items: action.payload,
        total: calculateTotal(action.payload)
      };

    default:
      return state;
  }
}

// Calculate total price
function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const price = item.varian?.harga || item.produk.harga;
    return total + (price * item.quantity);
  }, 0);
}

// Cart provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (produk: ProdukRecord, quantity: number, varian?: ProdukVarianRecord) => {
    dispatch({ type: 'ADD_ITEM', payload: { produk, varian, quantity } });
  };

  const removeItem = (produkId: string, varianId?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { produkId, varianId } });
  };

  const updateQuantity = (produkId: string, quantity: number, varianId?: string) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { produkId, varianId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (produkId: string, varianId?: string): number => {
    const item = state.items.find(
      item => item.produk.id === produkId && item.varian?.id === varianId
    );
    return item ? item.quantity : 0;
  };

  const getItemTotal = (produkId: string, varianId?: string): number => {
    const item = state.items.find(
      item => item.produk.id === produkId && item.varian?.id === varianId
    );
    if (!item) return 0;
    const price = item.varian?.harga || item.produk.harga;
    return price * item.quantity;
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    getItemTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}






