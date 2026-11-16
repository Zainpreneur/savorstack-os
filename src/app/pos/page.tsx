"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

const PRODUCTS = [
  { id: "1", name: "Masala Chai", price: 25, unit: "cup" },
  { id: "2", name: "Ginger Chai", price: 30, unit: "cup" },
  { id: "3", name: "Plain Tea", price: 15, unit: "cup" },
  { id: "4", name: "Aloo Paratha", price: 40, unit: "pcs" },
  { id: "5", name: "Paneer Paratha", price: 60, unit: "pcs" },
  { id: "6", name: "Plain Paratha", price: 30, unit: "pcs" },
  { id: "7", name: "Samosa", price: 15, unit: "pcs" },
  { id: "8", name: "Cold Coffee", price: 50, unit: "glass" },
];

export default function POSPage() {
  const { items, addItem, removeItem, changeQty, subtotal, itemCount, clear } =
    useCartStore();
  const [receipt, setReceipt] = useState<{ total: number; items: typeof items } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = `savorstack-cart-${Date.now()}`;
    // persisted cart could be restored here
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setReceipt({ total: subtotal(), items: [...items] });
    clear();
    setLoading(false);
  };

  if (receipt) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-lg mx-auto">
          <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-lg mb-6">
            <h2 className="text-lg font-bold text-amber-900 mb-1">Receipt</h2>
            <p className="text-xs text-amber-600 mb-4">SavorStack OS • Chai Tapri</p>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-amber-100">
                  <th className="text-left pb-2 text-amber-700 font-medium">Item</th>
                  <th className="text-right pb-2 text-amber-700 font-medium">Qty</th>
                  <th className="text-right pb-2 text-amber-700 font-medium">Amt</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((i) => (
                  <tr key={i.productId} className="border-b border-amber-50">
                    <td className="py-2">{i.name}</td>
                    <td className="text-right py-2">{i.qty}</td>
                    <td className="text-right py-2 font-medium">
                      {(i.price * i.qty).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between pt-3 border-t border-amber-100">
              <span className="text-amber-800 font-bold">Total</span>
              <span className="text-2xl font-bold text-amber-600">
                {receipt.total.toFixed(0)}
              </span>
            </div>
          </div>
          <Button onClick={() => setReceipt(null)} className="w-full">
            New Order
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Counter POS</h1>
            <p className="text-amber-600 text-sm">Fast, keyboard-navigable billing</p>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-right hidden md:block">
              <div className="text-xs text-amber-500">Items</div>
              <div className="text-lg font-bold text-amber-800">{itemCount()}</div>
            </span>
            <span className="text-right">
              <div className="text-xs text-amber-500">Subtotal</div>
              <div className="text-lg font-bold text-amber-600">
                {subtotal().toFixed(0)}
              </div>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Product Grid */}
          <div className="md:col-span-8 space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-800 mb-3">Menu</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRODUCTS.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-amber-100 bg-white p-3 text-center hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
                    onClick={() => addItem({ productId: p.id, name: p.name, price: p.price })}
                  >
                    <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center mx-auto mb-2 text-amber-700 group-hover:bg-amber-200 transition">
                      ☕
                    </div>
                    <p className="text-sm font-medium text-amber-800">{p.name}</p>
                    <span className="text-xs font-bold text-amber-600">
                      {p.price} / {p.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Panel */}
          <div className="md:col-span-4 space-y-4">
            <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm sticky top-4">
              <h3 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Order ({itemCount()})
              </h3>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {items.length === 0 ? (
                  <p className="text-center text-amber-500 text-sm py-6">
                    Empty cart. Tap items to add.
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-2 p-2 rounded-lg border border-amber-100 bg-amber-50/50"
                    >
                      <span className="text-sm font-medium text-amber-800 truncate">
                        {item.name}
                      </span>
                      <div className="flex-1 text-right text-sm">
                        <span className="font-medium text-amber-700">
                          {item.price} × {item.qty}
                        </span>
                        <span className="ml-2 text-amber-500">
                          {(item.price * item.qty).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeQty(item.productId, -1)}
                          className="p-1"
                        >
                          −
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeQty(item.productId, 1)}
                          className="p-1"
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.productId)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-amber-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-600">Subtotal</span>
                  <span className="font-medium text-amber-800">{subtotal().toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm text-amber-500">
                  <span>Tax (0%)</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-100">
                  <span className="text-sm font-bold text-amber-900">Total</span>
                  <span className="text-lg font-bold text-amber-600">
                    {subtotal().toFixed(0)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full py-3.5 font-semibold mt-4"
                disabled={items.length === 0 || loading}
                onClick={handleCheckout}
              >
                {loading ? "Processing…" : "Place Order"}
              </Button>
              <button
                onClick={clear}
                className="w-full py-2 rounded-lg border border-amber-200 bg-white text-amber-600 text-sm font-medium hover:bg-amber-50 transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
