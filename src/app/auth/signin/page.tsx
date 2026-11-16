"use client";

import { useState } from "react";
import Link from "next/link";
import { Coffee } from "lucide-react";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl mb-4">
            <Coffee className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SavorStack OS</h1>
          <p className="text-slate-400 mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleEnter} className="space-y-5 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              name="email"
              type="email"
              defaultValue="owner@chai.local"
              className="w-full pl-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              name="password"
              type="password"
              defaultValue="password123"
              className="w-full pl-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl">
          <p className="text-slate-400 text-sm text-center">
            <span className="text-violet-400 font-medium">Demo credentials:</span><br />
            owner@chai.local / password123
          </p>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 mt-6 text-slate-400 hover:text-white transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
