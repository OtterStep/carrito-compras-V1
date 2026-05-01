import { create } from 'zustand';

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any) => boolean; // Retorna true si se pudo agregar
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => boolean; // Retorna true si se pudo actualizar
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,
  addItem: (product) => {
    let success = false;
    set((state) => {
      const existingItem = state.items.find(item => item.id === product.id);
      let newItems;
      
      if (existingItem) {
        if (existingItem.cantidad + 1 > product.stock) {
          success = false;
          return state;
        }
        newItems = state.items.map(item =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
        success = true;
      } else {
        if (product.stock <= 0) {
          success = false;
          return state;
        }
        newItems = [...state.items, { ...product, cantidad: 1 }];
        success = true;
      }
      const newTotal = newItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      return { items: newItems, total: newTotal };
    });
    return success;
  },
  removeItem: (id) => set((state) => {
    const newItems = state.items.filter(item => item.id !== id);
    const newTotal = newItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    return { items: newItems, total: newTotal };
  }),
  updateQuantity: (id, cantidad) => {
    let success = false;
    set((state) => {
      const item = state.items.find(i => i.id === id);
      if (!item) return state;

      const nuevaCantidad = Math.max(1, cantidad);
      if (nuevaCantidad > item.stock) {
        success = false;
        return state;
      }

      const newItems = state.items.map(item => 
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      );
      const newTotal = newItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      success = true;
      return { items: newItems, total: newTotal };
    });
    return success;
  },
  clearCart: () => set({ items: [], total: 0 }),
}));
