"use client";

import { useEffect, useState } from "react";
import { getRecipes, getIngredients } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { Factory, Plus, Coffee, Utensils, Coffee as CoffeeIcon } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export const dynamic = "force-dynamic";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  async function loadData() {
    const [recps, ings] = await Promise.all([getRecipes(), getIngredients()]);
    setRecipes(recps);
    setIngredients(ings);
    setLoading(false);
  }

  const routeIcon = (productName: string) => {
    const lower = productName.toLowerCase();
    if (lower.includes("tea") || lower.includes("coffee") || lower.includes("chai") || lower.includes("lassi")) return <CoffeeIcon className="w-4 h-4 text-amber-400" />;
    return <Utensils className="w-4 h-4 text-emerald-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center text-amber-600 animate-pulse mb-2">
            <Factory className="w-6 h-6" />
          </div>
          <p className="text-amber-600 font-medium">Loading recipes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600 rounded-xl flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Recipes (BOM)</h1>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            <span className="w-5 h-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-200">Recipe Management</h2>
            <p className="text-slate-500 text-sm">Bill of Materials — define ingredients used per menu item</p>
          </div>
        </div>

        {/* Recipes List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-800/50 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recipe List ({recipes.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="pb-3 font-medium text-slate-200">Menu Item</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Route</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Yield</th>
                  <th className="pb-3 font-medium text-slate-200 text-left">Ingredients</th>
                  <th className="pb-3 font-medium text-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recipes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No recipes defined yet. Add recipes to link menu items to ingredients.
                    </td>
                  </tr>
                ) : (
                  recipes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          {routeIcon(r.productName)}
                          {r.productName}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          r.productName.toLowerCase().includes("tea") || r.productName.toLowerCase().includes("coffee")
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {r.productName.toLowerCase().includes("tea") || r.productName.toLowerCase().includes("coffee") ? "Barista" : "Kitchen"}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono text-slate-200">{r.yieldQty}</td>
                      <td className="py-3 text-slate-500 text-sm max-w-xs truncate">
                        {r.ingredients.map((ri: any) => `${ri.qtyPerUnit} ${ri.unit} ${ri.ingredientName}`).join(", ")}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Example Recipe Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Example: Masala Chai Recipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tea Leaves</p>
              <p className="text-lg font-bold text-slate-200">0.003 kg</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Milk</p>
              <p className="text-lg font-bold text-slate-200">0.06 liter</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sugar</p>
              <p className="text-lg font-bold text-slate-200">0.008 kg</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Selling 1 Masala Chai deducts: 3g tea leaves, 60ml milk, 8g sugar automatically from inventory.
          </p>
        </div>
      </div>
    </div>
  );
}
