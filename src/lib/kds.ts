"use server";

import { db } from "@/db/connection";
import { orderItems, orders } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

const tenantId = "tenant_1";
const storeId = "store_1";

export async function getKDSOrders() {
  const items = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.order_id,
      orderNumber: orders.order_number,
      productName: sql`${orderItems.product_id}`,
      qty: orderItems.qty,
      kitchenStatus: orderItems.kitchen_status,
      kitchenRoute: orderItems.kitchen_route,
      createdAt: orderItems.created_at,
      notes: orderItems.notes,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.order_id))
    .where(
      and(
        eq(orderItems.tenant_id, tenantId),
        eq(orders.store_id, storeId),
        eq(orders.status, "pending"),
      ),
    )
    .orderBy(orderItems.created_at);

  return items.map((i) => ({
    id: i.id,
    orderId: i.orderId,
    orderNumber: i.orderNumber,
    productName: String(i.productName ?? "Unknown"),
    qty: Number(i.qty),
    kitchenStatus: i.kitchenStatus,
    kitchenRoute: i.kitchenRoute,
    createdAt: i.createdAt,
    notes: i.notes,
    waitTime: Date.now() - new Date(i.createdAt).getTime(),
  }));
}

export async function updateKitchenStatus(
  itemId: string,
  status: "pending" | "preparing" | "ready" | "served",
) {
  await db
    .update(orderItems)
    .set({ kitchen_status: status })
    .where(eq(orderItems.id, itemId));
  return { success: true };
}
