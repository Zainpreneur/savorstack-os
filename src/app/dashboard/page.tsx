import { getDashboardStats, getMonthlySales, getTopSellingProducts } from "@/lib/dashboard";
import Link from "next/link";
import {
  BarChart3,
  ShoppingCart,
  CreditCard,
  Truck,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const monthlySales = await getMonthlySales(6);
  const topProducts = await getTopSellingProducts(5);

  const revenueChange =
    stats.prevMonthRevenue > 0
      ? ((stats.currentMonthRevenue - stats.prevMonthRevenue) / stats.prevMonthRevenue) * 100
      : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              {new Date().toLocaleDateString("en-PK", { month: "long", year: "numeric" })}
            </span>
            <Link href="/pos" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
              New Sale
            </Link>
            <Link href="/kds" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors">
              Kitchen Display
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Sales"
            value={fmt(stats.totalSales)}
            subtitle="All time"
            trend={{
              label: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}% vs last month`,
              up: revenueChange >= 0,
            }}
            icon={ShoppingCart}
            color="text-violet-600 bg-violet-600/10"
          />
          <StatCard
            title="Orders"
            value={stats.totalOrders}
            subtitle="All time"
            icon={Clock}
            color="text-blue-600 bg-blue-600/10"
          />
          <StatCard
            title="Profit"
            value={fmt(stats.profit)}
            subtitle="This month"
            trend={{ label: "65% margin", up: true }}
            icon={CreditCard}
            color="text-emerald-600 bg-emerald-600/10"
          />
          <StatCard
            title="Expenses"
            value={fmt(stats.expense)}
            subtitle="This month"
            trend={{ label: "35% of revenue", up: false }}
            icon={AlertTriangle}
            color="text-rose-600 bg-rose-600/10"
          />
          <StatCard
            title="Avg Order"
            value={fmt(stats.avgOrderValue)}
            subtitle="Per transaction"
            icon={TrendingUp}
            color="text-amber-600 bg-amber-600/10"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Monthly Revenue" height={320}>
            <SimpleBarChart data={monthlySales} />
          </ChartCard>

          <div className="lg:col-span-2 space-y-6">
            <ChartCard title="Top Selling Products" height={320}>
              <TopProductsTable products={topProducts} />
            </ChartCard>

            <ChartCard title="Low Stock Alerts" height={200}>
              <LowStockAlerts ingredients={stats.lowStockIngredients} />
            </ChartCard>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Orders</h2>
            <Link href="/pos" className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-4">View all orders</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="pb-3 font-medium text-slate-200">Order #</th>
                  <th className="pb-3 font-medium text-slate-200">Customer</th>
                  <th className="pb-3 font-medium text-slate-200 text-right">Total</th>
                  <th className="pb-3 font-medium text-slate-200">Status</th>
                  <th className="pb-3 font-medium text-slate-200">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No orders yet. Start selling from POS.
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 font-medium text-slate-200">#{order.orderNumber}</td>
                      <td className="py-3 text-slate-300">Walk-in</td>
                      <td className="py-3 text-right font-medium text-slate-200">{fmt(order.total)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : order.status === "pending"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
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

function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: { label: string; up: boolean };
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 rounded-lg {color} flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.up ? "text-emerald-400" : "text-rose-400"}`}>
            {trend.up ? "▲" : "▼"} {trend.label}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-sm text-slate-500">{subtitle}</span>
      </div>
    </div>
  );
}

function ChartCard({ children, title, height }: { children: React.ReactNode; title: string; height?: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
      <div className="h-full" style={{ height: height ?? 240 }}>{children}</div>
    </div>
  );
}

function SimpleBarChart({ data }: { data: { month: string; revenue: number }[] }) {
  if (data.length === 0) return <div className="h-full flex items-center justify-center text-slate-500">No data</div>;

  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex items-end gap-2 h-full pb-4">
      {data.map((d) => {
        const pct = (d.revenue / max) * 100;
        return (
          <div key={d.month} className="flex flex-col items-center gap-2 w-20">
            <div className="w-full bg-slate-700 rounded-t-lg relative overflow-hidden" style={{ height: "100%" }}>
              <div
                className="absolute bottom-0 left-0 w-full bg-violet-600 rounded-t-lg transition-all duration-700"
                style={{ height: `${pct}%` }}
              >
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-violet-300 whitespace-nowrap">
                  {fmt(d.revenue)}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function TopProductsTable({ products }: { products: Array<{ name: string; totalQty: number; totalRevenue: number }> }) {
  if (products.length === 0) return <div className="h-full flex items-center justify-center text-slate-500">No data</div>;

  return (
    <table className="w-full text-sm text-slate-400">
      <thead>
        <tr className="border-b border-slate-800 text-left">
          <th className="pb-3 font-medium text-slate-200">Product</th>
          <th className="pb-3 font-medium text-slate-200 text-right">Qty</th>
          <th className="pb-3 font-medium text-slate-200 text-right">Revenue</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
        {products.map((p) => (
          <tr key={p.name} className="hover:bg-slate-700/30 transition">
            <td className="py-3 font-medium text-slate-200">{p.name}</td>
            <td className="py-3 text-right">{p.totalQty}</td>
            <td className="py-3 text-right font-medium text-slate-200">{fmt(p.totalRevenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LowStockAlerts({ ingredients }: { ingredients: Array<{ name: string; currentStock: number; reorderLevel: number; unit: string }> }) {
  if (ingredients.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        All ingredients stocked ✓
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {ingredients.slice(0, 5).map((ing) => (
        <li key={ing.name} className="flex items-center justify-between p-2 rounded-lg border border-slate-700 bg-slate-800/50">
          <div>
            <p className="text-sm font-medium text-slate-200">{ing.name}</p>
            <p className="text-xs text-slate-500">
              {ing.currentStock} {ing.unit} left (reorder at {ing.reorderLevel})
            </p>
          </div>
          <span className="text-xs font-bold text-rose-400">REORDER</span>
        </li>
      ))}
    </ul>
  );
}
