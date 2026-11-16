"use client";

import { useEffect, useState } from "react";
import { getKDSOrders, updateKitchenStatus } from "@/lib/kds";
import {
  Coffee,
  Utensils,
  RefreshCw,
  CheckCircle2,
  Clock,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

function fmtWaitTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function waitColor(ms: number) {
  const minutes = ms / 60000;
  if (minutes < 5) return "text-emerald-400";
  if (minutes < 10) return "text-amber-400";
  return "text-rose-400";
}

function statusColor(status: string) {
  switch (status) {
    case "preparing": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "ready": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "served": return "text-slate-400 bg-slate-700/50 border-slate-600/50";
    default: return "text-slate-500 bg-slate-800/50 border-slate-700";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "preparing": return "Preparing";
    case "ready": return "Ready";
    case "served": return "Served";
    default: return "Pending";
  }
}

type OrderItem = {
  id: string;
  orderId: string;
  orderNumber: string;
  productName: string;
  qty: number;
  kitchenStatus: string;
  kitchenRoute: string;
  createdAt: string;
  notes: string | null;
  waitTime: number;
};

export const dynamic = "force-dynamic";

export default function KDSPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(fetchOrders, 3000);
    fetchOrders();
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshKey]);

  async function fetchOrders() {
    try {
      const data = await getKDSOrders();
      setOrders(data);
    } catch (err) {
      console.error("KDS fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(itemId: string, status: "preparing" | "ready" | "served") {
    await updateKitchenStatus(itemId, status);
    setRefreshKey((k) => k + 1);
  }

  const baristaItems = orders.filter((o) => o.kitchenRoute === "barista" || o.kitchenRoute === "both");
  const kitchenItems = orders.filter((o) => o.kitchenRoute === "kitchen" || o.kitchenRoute === "both");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 rounded-xl flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              {new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Barista / Beverages Station */}
          <KDSStation
            title="Barista & Beverages"
            icon={<Coffee className="w-5 h-5" />}
            items={baristaItems}
            onStatusChange={handleStatusChange}
            route="barista"
          />

          {/* Kitchen / Food Station */}
          <KDSStation
            title="Kitchen & Food"
            icon={<Utensils className="w-5 h-5" />}
            items={kitchenItems}
            onStatusChange={handleStatusChange}
            route="kitchen"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-500">
            Loading orders…
          </div>
        )}
      </div>
    </div>
  );
}

function KDSStation({
  title,
  icon,
  items,
  onStatusChange,
  route,
}: {
  title: string;
  icon: React.ReactNode;
  items: OrderItem[];
  onStatusChange: (id: string, status: "preparing" | "ready" | "served") => void;
  route: string;
}) {
  const pending = items.filter((i) => i.kitchenStatus === "pending");
  const preparing = items.filter((i) => i.kitchenStatus === "preparing");
  const ready = items.filter((i) => i.kitchenStatus === "ready");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-lg overflow-hidden flex flex-col h-full">
      <div className="border-b border-slate-800 bg-slate-800/50 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h2>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${
            pending.length > 5 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
          }`}>
            {pending.length} pending
          </span>
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Clock className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No {title.toLowerCase()} orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {preparing.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 px-2">
                  Preparing ({preparing.length})
                </h3>
                <div className="space-y-2">
                  {preparing.map((item) => (
                    <KDSTicket
                      key={item.id}
                      item={item}
                      status="preparing"
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </div>
              </div>
            )}
            {pending.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  Pending ({pending.length})
                </h3>
                <div className="space-y-2">
                  {pending.map((item) => (
                    <KDSTicket
                      key={item.id}
                      item={item}
                      status="pending"
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </div>
              </div>
            )}
            {ready.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 px-2">
                  Ready ({ready.length})
                </h3>
                <div className="space-y-2">
                  {ready.map((item) => (
                    <KDSTicket
                      key={item.id}
                      item={item}
                      status="ready"
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function KDSTicket({
  item,
  status,
  onStatusChange,
}: {
  item: OrderItem;
  status: "pending" | "preparing" | "ready";
  onStatusChange: (id: string, status: "preparing" | "ready" | "served") => void;
}) {
  const nextStatus =
    status === "pending" ? "preparing" : status === "preparing" ? "ready" : "served";
  const wc = waitColor(item.waitTime);
  const sc = statusColor(item.kitchenStatus);

  const handleNext = () => {
    onStatusChange(item.id, nextStatus as "preparing" | "ready" | "served");
  };

  return (
    <div className={`rounded-lg border p-3 flex items-center justify-between bg-slate-800/40 transition-all ${sc}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-slate-300">#{item.orderNumber}</span>
          <span className={`text-[10px] font-bold ${wc}`}>{fmtWaitTime(item.waitTime)}</span>
        </div>
        <h3 className="text-sm font-medium text-slate-100 mb-1">{item.productName}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            {item.qty}x
          </span>
          {item.notes && (
            <span className="flex items-center gap-1 italic text-amber-300">
              <span>•</span> {item.notes}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleNext}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            item.kitchenStatus === "pending"
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : item.kitchenStatus === "preparing"
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-rose-500 text-white hover:bg-rose-600"
          }`}
        >
          {item.kitchenStatus === "pending" ? "Start" : item.kitchenStatus === "preparing" ? "Ready" : "Served"}
        </button>
      </div>
    </div>
  );
}
