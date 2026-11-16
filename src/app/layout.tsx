"use client";

import "./globals.css";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  Package,
  Truck,
  Users,
  BarChart3,
  Settings,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/kds", label: "Kitchen Display", icon: Factory },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/recipes", label: "Recipes (BOM)", icon: Truck },
  { href: "/procurement", label: "Procurement", icon: Truck },
  { href: "/staff", label: "Staff & Shifts", icon: Clock },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  // Restore sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savorstack_sidebar_open");
      if (saved !== null) {
        setOpen(saved === "true");
      }
    }
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setMobileOpen(false);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const toggleSidebar = useCallback(() => setOpen((o) => !o), []);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <aside
          className={`fixed left-0 top-0 h-full z-40 border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-300 ${
            open ? "w-64" : "w-16"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Main navigation"
          suppressHydrationWarning
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-violet-600 rounded flex items-center justify-center">
                <span className="text-white">☕</span>
              </div>
              {open && (
                <span className="font-bold text-slate-100 tracking-tight">SavorStack</span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              className="p-1.5 rounded hover:bg-slate-700 md:hidden"
            >
              {mobileOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
            </button>
            {!mobileOpen && (
              <button
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                className="hidden md:flex p-1.5 rounded hover:bg-slate-700 transition-colors"
              >
                {open ? (
                  <ChevronLeft size={18} strokeWidth={2} />
                ) : (
                  <ChevronRight size={18} strokeWidth={2} />
                )}
              </button>
            )}
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (mobileOpen) setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-l-lg transition-colors ${
                    active
                      ? "bg-violet-600/20 text-violet-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  {open && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/80 backdrop-blur pl-0 md:pl-64">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-violet-600 rounded flex items-center justify-center">
                  <span className="text-white">☕</span>
                </div>
                <h1 className="text-xl font-bold text-slate-100">
                  {NAV.find((n) => n.href === path || path.startsWith(n.href + "/"))?.label || "SavorStack OS"}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block w-px h-5 bg-slate-700"></span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
