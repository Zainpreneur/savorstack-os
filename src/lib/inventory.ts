"use server";

import { db } from "@/db/connection";
import {
  ingredients,
  recipes,
  recipeIngredients,
  products,
  stockMovements,
  purchaseOrders,
  purchaseOrderItems,
  wasteLogs,
} from "@/db/schema";
import { eq, and, sql, sum, desc, lt } from "drizzle-orm";

const tenantId = "tenant_1";
const storeId = "store_1";

export async function getIngredients() {
  return db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      unit: ingredients.unit,
      current_stock: ingredients.current_stock,
      reorder_level: ingredients.reorder_level,
      unit_cost: ingredients.unit_cost,
      supplier: sql``.as("supplier"), // placeholder for future supplier field
      is_active: ingredients.is_active,
    })
    .from(ingredients)
    .where(
      and(
        eq(ingredients.tenant_id, tenantId),
        eq(ingredients.store_id, storeId),
        eq(ingredients.is_active, 1),
      ),
    )
    .orderBy(ingredients.name);
}

export async function getLowStockIngredients() {
  return db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      unit: ingredients.unit,
      current_stock: ingredients.current_stock,
      reorder_level: ingredients.reorder_level,
    })
    .from(ingredients)
    .where(
      and(
        eq(ingredients.tenant_id, tenantId),
        eq(ingredients.store_id, storeId),
        eq(ingredients.is_active, 1),
        sql`${ingredients.current_stock} <= ${ingredients.reorder_level}`,
      ),
    )
    .orderBy(ingredients.current_stock);
}

export async function getRecipes() {
  const allRecipes = await db
    .select({
      id: recipes.id,
      product_id: recipes.product_id,
      yield_qty: recipes.yield_qty,
      is_active: recipes.is_active,
    })
    .from(recipes)
    .where(
      and(
        eq(recipes.tenant_id, tenantId),
        eq(recipes.is_active, 1),
      ),
    );

  const enriched = [];
  for (const r of allRecipes) {
    const [product] = await db
      .select({ name: products.name })
      .from(products)
      .where(eq(products.id, r.product_id));

    const recipeIngs = await db
      .select({
        ingredient_id: recipeIngredients.ingredient_id,
        qty_per_unit: recipeIngredients.qty_per_unit,
        ingredient_name: ingredients.name,
        ingredient_unit: ingredients.unit,
      })
      .from(recipeIngredients)
      .innerJoin(ingredients, eq(ingredients.id, recipeIngredients.ingredient_id))
      .where(
        and(
          eq(recipeIngredients.tenant_id, tenantId),
          eq(recipeIngredients.recipe_id, r.id),
        ),
      );

    enriched.push({
      id: r.id,
      productName: product?.name || "Unknown",
      yieldQty: Number(r.yield_qty),
      ingredients: recipeIngs.map((ri) => ({
        ingredientId: ri.ingredient_id,
        ingredientName: ri.ingredient_name,
        qtyPerUnit: Number(ri.qty_per_unit),
        unit: ri.ingredient_unit,
      })),
    });
  }
  return enriched;
}

export async function deductStockForOrder(orderItemsData: Array<{
  productId: string;
  qty: number;
}>,
) {
  // For each order item, find the recipe and deduct ingredients
  for (const item of orderItemsData) {
    const [recipe] = await db
      .select({ id: recipes.id, yield_qty: recipes.yield_qty })
      .from(recipes)
      .where(
        and(
          eq(recipes.product_id, item.productId),
          eq(recipes.tenant_id, tenantId),
          eq(recipes.is_active, 1),
        ),
      );

    if (!recipe) continue;

    const multiplier = item.qty / Number(recipe.yield_qty);

    const recipeIngs = await db
      .select({
        ingredient_id: recipeIngredients.ingredient_id,
        qty_per_unit: recipeIngredients.qty_per_unit,
      })
      .from(recipeIngredients)
      .where(
        and(
          eq(recipeIngredients.recipe_id, recipe.id),
          eq(recipeIngredients.tenant_id, tenantId),
        ),
      );

    for (const ri of recipeIngs) {
      const deduction = Number(ri.qty_per_unit) * multiplier;
      await db
        .update(ingredients)
        .set({
          current_stock: sql`${ingredients.current_stock} - ${deduction}`,
        })
        .where(eq(ingredients.id, ri.ingredient_id));

      await db.insert(stockMovements).values({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        store_id: storeId,
        ingredient_id: ri.ingredient_id,
        type: "sale",
        qty: -deduction,
        unit: "",
        reference_id: "",
        reference_type: "order",
        notes: `Auto-deducted for product ${item.productId}`,
        created_by: "system",
        created_at: new Date().toISOString(),
      });
    }
  }
  return { success: true };
}

export async function adjustStock(
  ingredientId: string,
  qty: number,
  type: "in" | "out" | "adjustment",
  reference: string,
) {
  const multiplier = type === "in" ? 1 : type === "out" ? -1 : 1;
  const finalQty = multiplier * qty;

  await db
    .update(ingredients)
    .set({
      current_stock: sql`${ingredients.current_stock} + ${finalQty}`,
    })
    .where(eq(ingredients.id, ingredientId));

  await db.insert(stockMovements).values({
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    store_id: storeId,
    ingredient_id: ingredientId,
    type,
    qty: Math.abs(qty),
    unit: "",
    reference_id: reference,
    reference_type: "adjustment",
    notes: `Manual ${type}`,
    created_by: "system",
    created_at: new Date().toISOString(),
  });

  return { success: true };
}

export async function getStockMovements(limit = 20) {
  return db
    .select({
      id: stockMovements.id,
      ingredient_id: stockMovements.ingredient_id,
      type: stockMovements.type,
      qty: stockMovements.qty,
      reference: stockMovements.reference_id,
      notes: stockMovements.notes,
      created_at: stockMovements.created_at,
    })
    .from(stockMovements)
    .where(
      and(
        eq(stockMovements.tenant_id, tenantId),
        eq(stockMovements.store_id, storeId),
      ),
    )
    .orderBy(desc(stockMovements.created_at))
    .limit(limit);
}

export async function getProcurements() {
  return db
    .select({
      id: purchaseOrders.id,
      po_number: purchaseOrders.po_number,
      status: purchaseOrders.status,
      total_amount: purchaseOrders.total_amount,
      ordered_at: purchaseOrders.ordered_at,
      received_at: purchaseOrders.received_at,
    })
    .from(purchaseOrders)
    .where(
      and(
        eq(purchaseOrders.tenant_id, tenantId),
        eq(purchaseOrders.store_id, storeId),
      ),
    )
    .orderBy(desc(purchaseOrders.created_at));
}

export async function createProcurement(poNumber: string, items: Array<{
  ingredientId: string;
  qty: number;
  unitCost: number;
}>) {
  const total = items.reduce((s, i) => s + i.qty * i.unitCost, 0);

  await db.insert(purchaseOrders).values({
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    store_id: storeId,
    po_number: poNumber,
    status: "received",
    subtotal: total,
    tax_amount: 0,
    total_amount: total,
    ordered_at: new Date().toISOString(),
    received_at: new Date().toISOString(),
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  for (const it of items) {
    await db.insert(purchaseOrderItems).values({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      po_id: "placeholder",
      ingredient_id: it.ingredientId,
      ingredient_name_snapshot: "",
      qty_ordered: it.qty,
      qty_received: it.qty,
      unit: "",
      unit_cost: it.unitCost,
      line_total: it.qty * it.unitCost,
      created_at: new Date().toISOString(),
    });

    // Increase stock
    await db
      .update(ingredients)
      .set({
        current_stock: sql`${ingredients.current_stock} + ${it.qty}`,
      })
      .where(eq(ingredients.id, it.ingredientId));

    await db.insert(stockMovements).values({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      store_id: storeId,
      ingredient_id: it.ingredientId,
      type: "procurement",
      qty: it.qty,
      unit: "",
      reference_id: poNumber,
      reference_type: "purchase_order",
      notes: `PO ${poNumber}`,
      created_by: "system",
      created_at: new Date().toISOString(),
    });
  }

  return { success: true, total };
}

export async function logWaste(
  ingredientId: string | null,
  productId: string | null,
  qty: number,
  unit: string,
  reason: string,
) {
  await db.insert(wasteLogs).values({
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    store_id: storeId,
    ingredient_id: ingredientId,
    product_id: productId,
    qty,
    unit,
    reason,
    cost_impact: 0,
    logged_by: "system",
    created_at: new Date().toISOString(),
  });

  if (ingredientId) {
    await db
      .update(ingredients)
      .set({
        current_stock: sql`${ingredients.current_stock} - ${qty}`,
      })
      .where(eq(ingredients.id, ingredientId));
  }

  return { success: true };
}

export async function getWasteLogs(limit = 20) {
  return db
    .select({
      id: wasteLogs.id,
      ingredient_id: wasteLogs.ingredient_id,
      product_id: wasteLogs.product_id,
      qty: wasteLogs.qty,
      unit: wasteLogs.unit,
      reason: wasteLogs.reason,
      cost_impact: wasteLogs.cost_impact,
      created_at: wasteLogs.created_at,
    })
    .from(wasteLogs)
    .where(
      and(
        eq(wasteLogs.tenant_id, tenantId),
        eq(wasteLogs.store_id, storeId),
      ),
    )
    .orderBy(desc(wasteLogs.created_at))
    .limit(limit);
}
