"use server";

import { db } from "@/db/connection";
import {
  users,
  roles,
  shifts,
  orders,
} from "@/db/schema";
import { eq, and, sql, sum, count, desc, lt, gte } from "drizzle-orm";

const tenantId = "tenant_1";
const storeId = "store_1";

export async function getStaff() {
  return db
    .select({
      id: users.id,
      name: users.full_name,
      email: users.email,
      phone: users.phone,
      role_name: roles.name,
      role_id: users.role_id,
      is_active: users.is_active,
      created_at: users.created_at,
    })
    .from(users)
    .leftJoin(roles, eq(users.role_id, roles.id))
    .where(
      and(
        eq(users.tenant_id, tenantId),
        eq(users.store_id, storeId),
        eq(users.is_active, 1),
      ),
    )
    .orderBy(users.full_name);
}

export async function getShifts(limit = 20) {
  return db
    .select({
      id: shifts.id,
      user_id: shifts.user_id,
      user_name: users.full_name,
      shift_type: shifts.shift_type,
      clock_in: shifts.clock_in,
      clock_out: shifts.clock_out,
      break_minutes: shifts.break_minutes,
      opening_cash: shifts.opening_cash,
      closing_cash: shifts.closing_cash,
      expected_cash: shifts.expected_cash,
      variance: shifts.variance,
      status: shifts.status,
      created_at: shifts.created_at,
    })
    .from(shifts)
    .leftJoin(users, eq(shifts.user_id, users.id))
    .where(
      and(
        eq(shifts.tenant_id, tenantId),
        eq(shifts.store_id, storeId),
      ),
    )
    .orderBy(desc(shifts.created_at))
    .limit(limit);
}

export async function getActiveShift(userId: string) {
  const [active] = await db
    .select({
      id: shifts.id,
      clock_in: shifts.clock_in,
    })
    .from(shifts)
    .where(
      and(
        eq(shifts.user_id, userId),
        eq(shifts.status, "open"),
        eq(shifts.tenant_id, tenantId),
        eq(shifts.store_id, storeId),
      ),
    );
  return active;
}

export async function clockIn(userId: string) {
  const existing = await getActiveShift(userId);
  if (existing) {
    return { error: "Already clocked in" };
  }

  await db.insert(shifts).values({
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    store_id: storeId,
    user_id: userId,
    shift_type: "opening",
    clock_in: new Date().toISOString(),
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return { success: true };
}

export async function clockOut(userId: string) {
  const active = await getActiveShift(userId);
  if (!active) {
    return { error: "No active shift found" };
  }

  const clockInTime = new Date(active.clock_in);
  const clockOutTime = new Date();
  const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

  // Calculate cash from orders during this shift
  const [cashResult] = await db
    .select({ total: sum(orders.total_amount) })
    .from(orders)
    .where(
      and(
        eq(orders.tenant_id, tenantId),
        eq(orders.store_id, storeId),
        gte(orders.created_at, active.clock_in),
        lt(orders.created_at, clockOutTime.toISOString()),
        eq(orders.payment_method, "cash"),
      ),
    );

  const expectedCash = Number(cashResult?.total || 0);

  await db
    .update(shifts)
    .set({
      clock_out: clockOutTime.toISOString(),
      expected_cash: expectedCash,
      status: "closed",
      updated_at: new Date().toISOString(),
    })
    .where(eq(shifts.id, active.id));

  return {
    success: true,
    hoursWorked: Math.round(hoursWorked * 100) / 100,
    expectedCash,
  };
}

export async function getStaffStats() {
  const staff = await getStaff();
  const stats = await Promise.all(
    staff.map(async (s) => {
      const [shiftData] = await db
        .select({
          total_hours: sum(sql`strftime('%s', clock_out) - strftime('%s', clock_in)`),
          shift_count: count(),
        })
        .from(shifts)
        .where(
          and(
            eq(shifts.user_id, s.id),
            eq(shifts.status, "closed"),
            eq(shifts.tenant_id, tenantId),
            eq(shifts.store_id, storeId),
          ),
        );

      const totalHours = shiftData?.total_hours
        ? Number(shiftData.total_hours) / 3600
        : 0;

      return {
        ...s,
        totalHours: Math.round(totalHours * 100) / 100,
        shiftCount: Number(shiftData.shift_count || 0),
      };
    }),
  );

  return stats;
}

export async function getTodayStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [sales] = await db
    .select({ total: sum(orders.total_amount), count: count() })
    .from(orders)
    .where(
      and(
        eq(orders.tenant_id, tenantId),
        eq(orders.store_id, storeId),
        gte(orders.created_at, today.toISOString()),
        lt(orders.created_at, tomorrow.toISOString()),
      ),
    );

  const [activeShifts] = await db
    .select({ count: count() })
    .from(shifts)
    .where(
      and(
        eq(shifts.tenant_id, tenantId),
        eq(shifts.store_id, storeId),
        eq(shifts.status, "open"),
      ),
    );

  return {
    sales: Number(sales?.total || 0),
    orders: Number(sales?.count || 0),
    activeShifts: Number(activeShifts?.count || 0),
  };
}
