import { create } from "zustand";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (productId: string) => void;
  changeQty: (productId: string, delta: number) => void;
  clear: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find((i: CartItem) => i.productId === item.productId);
    if (existing) {
      set({
        items: get().items.map((i: CartItem) =>
          i.productId === item.productId
            ? { ...i, qty: i.qty + (item.qty ?? 1) }
            : i
        ),
      });
    } else {
      set({ items: [...get().items, { ...item, qty: item.qty ?? 1 }] });
    }
  },
  removeItem: (productId) =>
    set({ items: get().items.filter((i: CartItem) => i.productId !== productId) }),
  changeQty: (productId, delta) =>
    set({
      items: get()
        .items.map((i: CartItem) =>
          i.productId === productId ? { ...i, qty: i.qty + delta } : i
        )
        .filter((i: CartItem) => i.qty > 0),
    }),
  clear: () => set({ items: [] }),
  subtotal: () =>
    get().items.reduce((sum: number, i: CartItem) => sum + i.price * i.qty, 0),
  itemCount: () =>
    get().items.reduce((sum: number, i: CartItem) => sum + i.qty, 0),
}));
