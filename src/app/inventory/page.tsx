"use client";

import { useEffect, useState } from "react";
import {
  getIngredients,
  getLowStockIngredients,
  adjustStock,
  getStockMovements,
} from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { Plus, Package, TrendingDown, RefreshCw } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
}

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Adjust stock form
  const [adjIngredientId, setAdjIngredientId] = useState("");
  const [adjQty, setAdjQty] = useState("1");
  const [adjType, setAdjType] = useState<"in" | "out" | "adjustment">("in");
  const [adjRef, setAdjRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  async function loadData() {
    const [ings, low, movs] = await Promise.all([
      getIngredients(),
      getLowStockIngredients(),
      getStockMovements(10),
    ]);
    setIngredients(ings);
    setLowStock(low);
    setMovements(movs);
    setLoading(false);
  }

  const ingredientRows = ingredients.map((ing) => {
    const isLow = Number(ing.current_stock) <= Number(ing.reorder_level);
    const value = Number(ing.current_stock) * Number(ing.unit_cost || 0);
    return (
      <tr key={ing.id} className="hover:bg-slate-800/30 transition">
        <td className="py-3 font-medium text-slate-200">{ing.name}</td>
        <td className="py-3 text-center">
          <span className={`font-mono ${isLow ? "text-rose-400" : "text-emerald-400"}`}>
            {ing.current_stock} {ing.unit}
          </span>
        </td>
        <td className="py-3 text-right">{fmt(ing.unit_cost || 0)}</td>
        <td className="py-3 text-right font-medium text-slate-200">{fmt(value)}</td>
        <td className="py-3 text-center">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            isLow ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
          }`}>
            {isLow ? "Reorder" : "OK"}
          </span>
        </td>
      </tr>
    );
  });

  const movementRows = movements.map((m) => {
    const typeColor = m.type === "in" ? "text-emerald-400" : m.type === "out" ? "text-rose-400" : "text-amber-400";
    return (
      <tr key={m.id} className="hover:bg-slate-800/30 transition">
        <td className="py-3 text-slate-200">{m.ingredient_id}</td>
        <td className="py-3 text-center">
          <span className={`text-xs font-bold ${typeColor}`}>{m.type.toUpperCase()}</span>
        </td>
        <td className="py-3 text-center font-mono text-slate-200">{m.qty}</td>
        <td className="py-3 text-slate-500 text-sm">{m.reference || "—"}</td>
        <td className="py-3 text-slate-500 text-xs">
          {new Date(m.created_at).toLocaleDateString("en-PK", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </td>
      </tr>
    );
  });

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await adjustStock(
      adjIngredientId,
      Number(adjQty || 0),
      adjType,
      adjRef,
    );
    setRefreshKey((k) => k + 1);
    setAdjQty("1");
    setAdjRef("");
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Inventory</h1>
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
        {/* Low Stock Alert Banner */}
        {lowStock.length > 0 && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              <span className="text-sm font-bold text-rose-300 uppercase tracking-wider">
                {lowStock.length} Low Stock Item(s)
              </span>
            </div>
            <div className="space-y-1 text-sm">
              {lowStock.slice(0, 5).map((ing) => (
                <div key={ing.id} className="flex justify-between">
                  <span className="text-slate-400">{ing.name}</span>
                  <span className="text-rose-400 font-mono">
                    {ing.current_stock} {ing.unit} (reorder at {ing.reorder_level})
                  </span>
                </div>
              ))}
              {lowStock.length > 5 && (
                <div className="text-xs text-slate-500 mt-1">
                  +{lowStock.length - 5} more items need reordering
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stock Adjustment Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Adjust Stock
          </h2>
          <form onSubmit={handleAdjust} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <select
              name="ingredientId"
              value={adjIngredientId}
              onChange={(e) => setAdjIngredientId(e.target.value)}
              required
              className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:border-amber-500 focus:outline-none appearance-none"
            >
              <option value="">Select ingredient</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.current_stock} {i.unit})
                </option>
              ))}
            </select>
            <input
              name="qty"
              type="number"
              step="0.1"
              value={adjQty}
              onChange={(e) => setAdjQty(e.target.value)}
              placeholder="Qty"
              className="w-full pl-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
            <select
              name="type"
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as "in" | "out" | "adjustment")}
              className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:border-amber-500 focus:outline-none appearance-none"
            >
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Adjustment</option>
            </select>
            <input
              name="reference"
              value={adjRef}
              onChange={(e) => setAdjRef(e.target.value)}
              placeholder="Reference (e.g. PO-101)"
              className="w-full pl-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
            <Button variant="primary" type="submit" disabled={submitting} className="w-full py-2.5">
              {submitting ? "Saving…" : "Adjust"}
            </Button>
          </form>
        </div>

        {/* Ingredients Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-800/50 px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Stock List</h2>
            <span className="text-xs text-slate-500">{ingredients.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400">
              <thead className="border-b border-slate-800 text-left">
                <tr>
                  <th className="pb-3 font-medium text-slate-200">Ingredient</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Stock</th>
                  <th className="pb-3 font-medium text-slate-200 text-right">Unit Cost</th>
                  <th className="pb-3 font-medium text-slate-200 text-right">Value</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No ingredients added yet.
                    </td>
                  </tr>
                ) : (
                  ingredientRows
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-800/50 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Stock Movements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400">
              <thead className="border-b border-slate-800 text-left">
                <tr>
                  <th className="pb-3 font-medium text-slate-200">Ingredient</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Type</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Qty</th>
                  <th className="pb-3 font-medium text-slate-200 text-left">Reference</th>
                  <th className="pb-3 font-medium text-slate-200 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No movements yet.
                    </td>
                  </tr>
                ) : (
                  movementRows
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
