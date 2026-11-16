import Link from "next/link";
import { Coffee, Shield, BarChart3, Users, Truck, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">SavorStack OS</h1>
          </div>
          <Link
            href="/auth/signin"
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-sm mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            From First Leaf to Final Ledger
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Full-Stack ERP & POS for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              Food & Beverage
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Built for tea stalls, scaled for restaurants. Manage orders, inventory, staff,
            and finances in one blazing-fast platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/auth/signin"
            className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-violet-600/25"
          >
            Sign In → Manager / Cashier
          </Link>
          <Link
            href="/pos"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-lg transition-colors border border-slate-700"
          >
            Quick POS (Demo)
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Coffee, title: "Lightning POS", desc: "Keyboard-first, tablet-optimized checkout" },
            { icon: Shield, title: "NextAuth v5 + RBAC", desc: "Role-based access for every staff member" },
            { icon: BarChart3, title: "Smart Inventory", desc: "Recipe-based BOM with auto-deduction" },
            { icon: Users, title: "Staff & Shifts", desc: "Clock-in/out, payroll, and performance" },
            { icon: Truck, title: "Procurement", desc: "Purchase orders & supplier management" },
            { icon: Clock, title: "Kitchen Display", desc: "Real-time order tickets for barista & kitchen" },
          ].map((feature) => (
            <div key={feature.title} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-violet-500/50 hover:bg-slate-800/70 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-4">Powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Next.js 16", "SQLite + Drizzle", "NextAuth v5", "Zustand", "Tailwind v4"].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-sm hover:border-violet-500 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
