"use client";

import { useEffect, useState } from "react";
import { getProcurements, createProcurement } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { Plus, Truck, RefreshCw } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
}

export const dynamic = "force-dynamic";

export default function ProcurementPage() {
  const [procurements, setProcurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // PO form
  const [poNumber, setPoNumber] = useState("");
  const [items, setItems] = useState<Array<{ ingredientId: string; qty: string; unitCost: string }>>([{ ingredientId: "", qty: "", unitCost: "" }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  async function loadData() {
    const data = await getProcurements();
    setProcurements(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const validItems = items.filter((i) => i.ingredientId && i.qty && i.unitCost);
    if (validItems.length === 0 || !poNumber) {
      setSubmitting(false);
      return;
    }
    const parsedItems = validItems.map((i) => ({
      ingredientId: i.ingredientId,
      qty: Number(i.qty),
      unitCost: Number(i.unitCost),
    }));
    await createProcurement(poNumber, parsedItems);
    setRefreshKey((k) => k + 1);
    setPoNumber("");
    setItems([{ ingredientId: "", qty: "", unitCost: "" }]);
    setSubmitting(false);
  }

  const addItem = () => {
    setItems([...items, { ingredientId: "", qty: "", unitCost: "" }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-truck-600 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Procurement</h1>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* New PO Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            New Purchase Order
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                name="poNumber"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO Number (e.g. PO-2024-001)"
                required
                className="w-full pl-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              />
              <div className="flex items-end">
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-auto">
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <input
                    value={item.ingredientId}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].ingredientId = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="Ingredient ID"
                    className="w-48 pl-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={item.qty}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].qty = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="Qty"
                    className="w-24 pl-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="1"
                    value={item.unitCost}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].unitCost = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="Unit Cost (₨)"
                    className="w-32 pl-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-rose-500 hover:bg-rose-500/10"
                    onClick={() => {
                      const newItems = [...items];
                      newItems.splice(idx, 1);
                      setItems(newItems);
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No items added.</p>
              )}
            </div>

            <Button variant="primary" type="submit" disabled={submitting || !poNumber || items.length === 0} className="w-full py-3">
              {submitting ? "Creating PO…" : "Create Purchase Order"}
            </Button>
          </form>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-800/50 px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Purchase Orders ({procurements.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="pb-3 font-medium text-slate-200">PO Number</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Status</th>
                  <th className="pb-3 font-medium text-slate-200 text-right">Total</th>
                  <th className="pb-3 font-medium text-slate-200 text-left">Ordered</th>
                  <th className="pb-3 font-medium text-slate-200 text-left">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {procurements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No purchase orders yet.
                    </td>
                  </tr>
                ) : (
                  procurements.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-medium text-slate-200">{p.po_number}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          p.status === "received" ? "bg-emerald-500/20 text-emerald-400" : p.status === "ordered" ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-slate-200">{fmt(p.total_amount || 0)}</td>
                      <td className="py-3 text-slate-500 text-xs">{new Date(p.ordered_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}</td>
                      <td className="py-3 text-slate-500 text-xs">{p.received_at ? new Date(p.received_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" }) : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
