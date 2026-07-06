"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>(() => {
  if (typeof window === "undefined") return [];

  const savedCart = localStorage.getItem("cart");

  return savedCart ? JSON.parse(savedCart) : [];
});

useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cart));
}, [cart]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
  setCart((prev) => {
    const existing = prev.find((p) => p.id === item.id);

    let updatedCart;

    if (existing) {
      updatedCart = prev.map((p) =>
        p.id === item.id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      );
    } else {
      updatedCart = [...prev, { ...item, quantity: 1 }];
    }

    console.log("Cart:", updatedCart);

    return updatedCart;
  });
};

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };
  function clearCart() {
  setCart([]);
}

  return (
    <CartContext.Provider
      value={{
  cart,
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
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