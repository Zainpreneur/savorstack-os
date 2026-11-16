"use server";

import { db } from "@/db/connection";
import { orders, orderItems, ingredients } from "@/db/schema";
import { eq, sql, sum, count, avg, gte, lt, and, desc } from "drizzle-orm";

const now = new Date();
const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const tenantId = "tenant_1";
const storeId = "store_1";

export async function getDashboardStats() {
  const [
    totalSales,
    totalOrders,
    avgOrderValue,
    currentMonthRevenue,
    prevMonthRevenue,
    recentOrders,
    lowStockIngredients,
  ] = await Promise.all([
    db
      .select({ total: sum(orders.total_amount) })
      .from(orders)
      .where(and(eq(orders.tenant_id, tenantId), eq(orders.store_id, storeId))),
    db
      .select({ count: count() })
      .from(orders)
      .where(and(eq(orders.tenant_id, tenantId), eq(orders.store_id, storeId))),
    db
      .select({ avg: avg(orders.total_amount) })
      .from(orders)
      .where(and(eq(orders.tenant_id, tenantId), eq(orders.store_id, storeId))),
    db
      .select({ total: sum(orders.total_amount) })
      .from(orders)
      .where(
        and(
          eq(orders.tenant_id, tenantId),
          eq(orders.store_id, storeId),
          gte(orders.created_at, currentMonthStart.toISOString()),
          lt(orders.created_at, currentMonthEnd.toISOString()),
        ),
      ),
    db
      .select({ total: sum(orders.total_amount) })
      .from(orders)
      .where(
        and(
          eq(orders.tenant_id, tenantId),
          eq(orders.store_id, storeId),
          gte(orders.created_at, prevMonthStart.toISOString()),
          lt(orders.created_at, prevMonthEnd.toISOString()),
        ),
      ),
    db
      .select({
        id: orders.id,
        order_number: orders.order_number,
        total_amount: orders.total_amount,
        status: orders.status,
        created_at: orders.created_at,
      })
      .from(orders)
      .where(and(eq(orders.tenant_id, tenantId), eq(orders.store_id, storeId)))
      .orderBy(desc(orders.created_at))
      .limit(10),
    db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        current_stock: ingredients.current_stock,
        reorder_level: ingredients.reorder_level,
        unit: ingredients.unit,
      })
      .from(ingredients)
      .where(
        and(
          eq(ingredients.tenant_id, tenantId),
          eq(ingredients.store_id, storeId),
          sql`${ingredients.current_stock} <= ${ingredients.reorder_level}`,
        ),
      ),
  ]);

  const profit = currentMonthRevenue[0]?.total ? Number(currentMonthRevenue[0].total) * 0.65 : 0;
  const expense = currentMonthRevenue[0]?.total ? Number(currentMonthRevenue[0].total) * 0.35 : 0;

  return {
    totalSales: Number(totalSales[0]?.total || 0),
    totalOrders: totalOrders[0]?.count || 0,
    avgOrderValue: Number(avgOrderValue[0]?.avg || 0),
    currentMonthRevenue: Number(currentMonthRevenue[0]?.total || 0),
    prevMonthRevenue: Number(prevMonthRevenue[0]?.total || 0),
    profit,
    expense,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      total: Number(o.total_amount || 0),
      status: o.status,
      createdAt: o.created_at,
    })),
    lowStockIngredients: lowStockIngredients.map((i) => ({
      id: i.id,
      name: i.name,
      currentStock: Number(i.current_stock),
      reorderLevel: Number(i.reorder_level),
      unit: i.unit,
    })),
  };
}

export async function getMonthlySales(months = 6) {
  const data = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const result = await db
      .select({ total: sum(orders.total_amount) })
      .from(orders)
      .where(
        and(
          eq(orders.tenant_id, tenantId),
          eq(orders.store_id, storeId),
          gte(orders.created_at, d.toISOString()),
          lt(orders.created_at, new Date(monthEnd.getTime() + 86400000).toISOString()),
        ),
      );
    data.push({
      month: monthNames[d.getMonth()],
      revenue: Number(result[0]?.total || 0),
    });
  }
  return data;
}

export async function getTopSellingProducts(limit = 5) {
  const result = await db
    .select({
      productId: orderItems.product_id,
      totalQty: sum(orderItems.qty),
      totalRevenue: sum(orderItems.line_total),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.order_id))
    .where(
      and(
        eq(orderItems.tenant_id, tenantId),
        eq(orders.store_id, storeId),
      ),
    )
    .groupBy(orderItems.product_id)
    .orderBy(desc(sum(orderItems.qty)))
    .limit(limit);

  return result.map((r) => ({
    productId: r.productId,
    name: (r.productId || "Unknown") as string,
    totalQty: Number(r.totalQty || 0),
    totalRevenue: Number(r.totalRevenue || 0),
  }));
}
