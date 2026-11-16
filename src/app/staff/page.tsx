"use client";

import { useEffect, useState } from "react";
import {
  getStaff,
  getShifts,
  getStaffStats,
  getTodayStats,
  clockIn,
  clockOut,
} from "@/lib/staff";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  DollarSign,
  Activity,
  RefreshCw,
  CheckCircle,
  X,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
}

function fmtHours(h: number) {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours}h ${minutes}m`;
}

export const dynamic = "force-dynamic";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  async function loadData() {
    const [staffData, shiftsData, today] = await Promise.all([
      getStaffStats(),
      getShifts(10),
      getTodayStats(),
    ]);
    setStaff(staffData);
    setShifts(shiftsData);
    setTodayStats(today);
    setLoading(false);
  }

  async function handleClockIn(userId: string) {
    const result = await clockIn(userId);
    if (result.error) {
      alert(result.error);
      return;
    }
    setRefreshKey((k) => k + 1);
  }

  async function handleClockOut(userId: string) {
    if (!confirm("Clock out of current shift?")) return;
    const result = await clockOut(userId);
    if (result.error) {
      alert(result.error);
      return;
    }
    alert(`Shift closed. Hours: ${result.hoursWorked}h, Cash: ${fmt(result.expectedCash ?? 0)}`);
    setRefreshKey((k) => k + 1);
  }

  const staffRows = staff.map((s) => {
    const activeShift = shifts.find(
      (sh) => sh.user_id === s.id && sh.status === "open",
    );
    return (
      <tr key={s.id} className="hover:bg-slate-800/30 transition">
        <td className="py-3 font-medium text-slate-200">{s.name}</td>
        <td className="py-3 text-center">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            s.role_name === "Owner"
              ? "bg-violet-500/20 text-violet-400"
              : s.role_name === "Manager"
              ? "bg-blue-500/20 text-blue-400"
              : s.role_name === "Cashier"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-slate-500/20 text-slate-400"
          }`}>
            {s.role_name}
          </span>
        </td>
        <td className="py-3 text-center font-mono text-slate-200">
          {fmtHours(s.totalHours || 0)}
        </td>
        <td className="py-3 text-center text-slate-500 text-sm">
          {s.shiftCount}
        </td>
        <td className="py-3 text-center">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            s.is_active
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-rose-500/20 text-rose-400"
          }`}>
            {s.is_active ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="py-3 text-center">
          {activeShift ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClockOut(s.id)}
              className="p-1 text-rose-600 hover:bg-rose-500/10"
            >
              <X size={14} strokeWidth={2} />
              Clock Out
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleClockIn(s.id)}
              className="p-1 text-emerald-600 hover:bg-emerald-500/10"
            >
              <Clock size={14} strokeWidth={2} />
              Clock In
            </Button>
          )}
        </td>
      </tr>
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-violet-200 flex items-center justify-center text-violet-600 animate-pulse mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-violet-600 font-medium">Loading staff data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-users-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Staff & Shifts</h1>
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
        {/* Today Stats */}
        {todayStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Today's Sales"
              value={fmt(todayStats.sales)}
              icon={DollarSign}
              color="text-emerald-600 bg-emerald-600/10"
            />
            <StatCard
              title="Orders Today"
              value={todayStats.orders}
              icon={Activity}
              color="text-blue-600 bg-blue-600/10"
            />
            <StatCard
              title="Active Shifts"
              value={todayStats.activeShifts}
              icon={Clock}
              color="text-amber-600 bg-amber-600/10"
            />
          </div>
        )}

        {/* Staff List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-800/50 px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Staff Roster</h2>
            <span className="text-xs text-slate-500">{staff.length} members</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400">
              <thead className="border-b border-slate-800 text-left">
                <tr>
                  <th className="pb-3 font-medium text-slate-200">Name</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Role</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Hours Worked</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Shifts</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Status</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Clock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  staffRows
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Shifts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-800/50 px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Shifts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400">
              <thead className="border-b border-slate-800 text-left">
                <tr>
                  <th className="pb-3 font-medium text-slate-200">Staff</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Clock In</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Clock Out</th>
                  <th className="pb-3 font-medium text-slate-200 text-center">Status</th>
                  <th className="pb-3 font-medium text-slate-200 text-right">Expected Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No shifts recorded yet.
                    </td>
                  </tr>
                ) : (
                  shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-medium text-slate-200">{s.user_name}</td>
                      <td className="py-3 text-center text-slate-500 text-sm">
                        {new Date(s.clock_in).toLocaleTimeString("en-PK", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 text-center text-slate-500 text-sm">
                        {s.clock_out ? new Date(s.clock_out).toLocaleTimeString("en-PK", {
                          hour: "2-digit", minute: "2-digit",
                        }) : "—"}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          s.status === "open"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-slate-200">
                        {fmt(s.expected_cash || 0)}
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
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center {color}">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
    </div>
  );
}
