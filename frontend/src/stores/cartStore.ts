import { create } from 'zustand';

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,
  addItem: (product) => set((state) => {
    const existingItem = state.items.find(item => item.id === product.id);
    let newItems;
    
    if (existingItem) {
      const nuevaCantidad = existingItem.cantidad + 1;
      if (nuevaCantidad > product.stock) {
        return state; // No agregar más si supera el stock
      }
      newItems = state.items.map(item =>
        item.id === product.id ? { ...item, cantidad: nuevaCantidad } : item
      );
    } else {
      if (product.stock <= 0) return state; // No agregar si no hay stock
      newItems = [...state.items, { ...product, cantidad: 1 }];
    }
    const newTotal = newItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    return { items: newItems, total: newTotal };
  }),
  removeItem: (id) => set((state) => {
    const newItems = state.items.filter(item => item.id !== id);
    const newTotal = newItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    return { items: newItems, total: newTotal };
  }),
  updateQuantity: (id, cantidad) => set((state) => {
    const item = state.items.find(i => i.id === id);
    if (!item) return state;

    // Validar contra el stock disponible
    const nuevaCantidad = Math.max(1, Math.min(cantidad, item.stock));
    
    const newItems = state.items.map(item => 
      item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    );
    const newTotal = newItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    return { items: newItems, total: newTotal };
  }),
  clearCart: () => set({ items: [], total: 0 }),
}));
