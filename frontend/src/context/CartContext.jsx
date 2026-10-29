import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Initialize shopping cart from local storage cache fallback safely
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('se_cart')) || [];
    } catch {
      return [];
    }
  });

  // Keep local storage synchronized with state changes
  useEffect(() => {
    localStorage.setItem('se_cart', JSON.stringify(items));
  }, [items]);

  // Add an item to the cart or increment quantity if it exists, respecting stock limits
  const add = (product, quantity = 1) => {
    setItems((old) => {
      const found = old.find((x) => x.id === product.id);
      
      if (found) {
        return old.map((x) =>
          x.id === product.id
            ? { ...x, quantity: Math.min(x.quantity + quantity, product.stock || 999) }
            : x
        );
      }
      
      return [...old, { ...product, quantity }];
    });
  };

  // Remove an item entirely from the cart
  const remove = (id) => {
    setItems((old) => old.filter((x) => x.id !== id));
  };

  // Update a specific item's quantity directly within safe boundaries (min 1, max stock)
  const update = (id, quantity) => {
    setItems((old) =>
      old.map((x) =>
        x.id === id
          ? { ...x, quantity: Math.max(1, Math.min(Number(quantity) || 1, x.stock || 999)) }
          : x
      )
    );
  };

  // Wipe all items from the active state
  const clear = () => setItems([]);

  // Compute calculated values dynamically based on items state changes
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);