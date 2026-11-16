import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  currency: text("currency").notNull().default("PKR"),
  timezone: text("timezone").notNull().default("Asia/Karachi"),
  is_active: integer("is_active").notNull().default(1),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
});

export const stores = sqliteTable(
  "stores",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    is_default: integer("is_default").notNull().default(0),
    is_active: integer("is_active").notNull().default(1),
  },
  (t) => ({
    tenantIdx: index("stores_tenant_idx").on(t.tenant_id),
  }),
);

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  tenant_id: text("tenant_id")
    .notNull()
    .references(() => tenants.id),
  name: text("name").notNull(),
  created_at: text("created_at").notNull().default(new Date().toISOString()),
});

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash").notNull(),
    full_name: text("full_name").notNull(),
    phone: text("phone"),
    role_id: text("role_id").references(() => roles.id),
    is_active: integer("is_active").notNull().default(1),
    created_at: text("created_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    tenantIdx: index("users_tenant_idx").on(t.tenant_id),
    storeIdx: index("users_store_idx").on(t.store_id),
  }),
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    name: text("name").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    is_active: integer("is_active").notNull().default(1),
  },
  (t) => ({
    tenantIdx: index("categories_tenant_idx").on(t.tenant_id),
  }),
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    category_id: text("category_id").references(() => categories.id),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    sale_price: real("sale_price").notNull().default(0),
    cost_price: real("cost_price").notNull().default(0),
    unit: text("unit").notNull().default("piece"),
    is_active: integer("is_active").notNull().default(1),
    track_inventory: integer("track_inventory").notNull().default(1),
  },
  (t) => ({
    tenantIdx: index("products_tenant_idx").on(t.tenant_id),
    storeIdx: index("products_store_idx").on(t.store_id),
  }),
);

export const ingredients = sqliteTable(
  "ingredients",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    name: text("name").notNull(),
    unit: text("unit").notNull(),
    current_stock: real("current_stock").notNull().default(0),
    reorder_level: real("reorder_level").notNull().default(0),
    unit_cost: real("unit_cost").notNull().default(0),
    is_active: integer("is_active").notNull().default(1),
  },
  (t) => ({
    tenantIdx: index("ingredients_tenant_idx").on(t.tenant_id),
  }),
);

export const recipes = sqliteTable(
  "recipes",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    product_id: text("product_id")
      .notNull()
      .references(() => products.id),
    yield_qty: real("yield_qty").notNull().default(1),
    is_active: integer("is_active").notNull().default(1),
  },
  (t) => ({
    tenantIdx: index("recipes_tenant_idx").on(t.tenant_id),
  }),
);

export const recipeIngredients = sqliteTable(
  "recipe_ingredients",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    recipe_id: text("recipe_id")
      .notNull()
      .references(() => recipes.id),
    ingredient_id: text("ingredient_id")
      .notNull()
      .references(() => ingredients.id),
    qty_per_unit: real("qty_per_unit").notNull().default(0),
  },
  (t) => ({
    tenantIdx: index("recipe_ingredients_tenant_idx").on(t.tenant_id),
  }),
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    order_number: text("order_number").notNull(),
    status: text("status").notNull().default("pending"),
    payment_method: text("payment_method"),
    total_amount: real("total_amount").notNull().default(0),
    cashier_id: text("cashier_id").references(() => users.id),
    created_at: text("created_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    tenantIdx: index("orders_tenant_idx").on(t.tenant_id),
    storeIdx: index("orders_store_idx").on(t.store_id),
  }),
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    order_id: text("order_id")
      .notNull()
      .references(() => orders.id),
    product_id: text("product_id").references(() => products.id),
    qty: real("qty").notNull().default(1),
    unit_price: real("unit_price").notNull().default(0),
    line_total: real("line_total").notNull().default(0),
    kitchen_status: text("kitchen_status").notNull().default("pending"),
    kitchen_route: text("kitchen_route").notNull().default("both"),
    notes: text("notes"),
    created_at: text("created_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    tenantIdx: index("order_items_tenant_idx").on(t.tenant_id),
    orderIdx: index("order_items_order_idx").on(t.order_id),
    kitchenStatusIdx: index("order_items_kitchen_status_idx").on(t.kitchen_status),
  }),
);

export const shifts = sqliteTable(
  "shifts",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),
    shift_type: text("shift_type").notNull().default("opening"),
    clock_in: text("clock_in").notNull(),
    clock_out: text("clock_out"),
    break_minutes: integer("break_minutes").notNull().default(0),
    opening_cash: real("opening_cash").notNull().default(0),
    closing_cash: real("closing_cash").notNull().default(0),
    expected_cash: real("expected_cash").notNull().default(0),
    variance: real("variance").notNull().default(0),
    status: text("status").notNull().default("open"),
    created_at: text("created_at").notNull().default(new Date().toISOString()),
    updated_at: text("updated_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    tenantIdx: index("shifts_tenant_idx").on(t.tenant_id),
    userIdx: index("shifts_user_idx").on(t.user_id),
    statusIdx: index("shifts_status_idx").on(t.status),
  }),
);

export const tenantsRelations = relations(tenants, ({ many }) => ({
  stores: many(stores),
  users: many(users),
  roles: many(roles),
  categories: many(categories),
  products: many(products),
  ingredients: many(ingredients),
  recipes: many(recipes),
  orders: many(orders),
  shifts: many(shifts),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, { fields: [users.tenant_id], references: [tenants.id] }),
  store: one(stores, { fields: [users.store_id], references: [stores.id] }),
  role: one(roles, { fields: [users.role_id], references: [roles.id] }),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, { fields: [roles.tenant_id], references: [tenants.id] }),
  users: many(users),
}));

export const purchaseOrders = sqliteTable(
  "purchase_orders",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    po_number: text("po_number").notNull(),
    status: text("status").notNull().default("draft"),
    subtotal: real("subtotal").notNull().default(0),
    tax_amount: real("tax_amount").notNull().default(0),
    total_amount: real("total_amount").notNull().default(0),
    ordered_at: text("ordered_at").notNull(),
    received_at: text("received_at"),
    created_by: text("created_by").references(() => users.id),
    created_at: text("created_at").notNull().default(new Date().toISOString()),
    updated_at: text("updated_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    tenantIdx: index("purchase_orders_tenant_idx").on(t.tenant_id),
    storeIdx: index("purchase_orders_store_idx").on(t.store_id),
  }),
);

export const purchaseOrderItems = sqliteTable(
  "purchase_order_items",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    po_id: text("po_id").notNull(),
    ingredient_id: text("ingredient_id").references(() => ingredients.id),
    ingredient_name_snapshot: text("ingredient_name_snapshot").notNull(),
    qty_ordered: real("qty_ordered").notNull().default(0),
    qty_received: real("qty_received").notNull().default(0),
    unit: text("unit").notNull(),
    unit_cost: real("unit_cost").notNull().default(0),
    line_total: real("line_total").notNull().default(0),
    created_at: text("created_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    tenantIdx: index("purchase_order_items_tenant_idx").on(t.tenant_id),
    poIdx: index("purchase_order_items_po_idx").on(t.po_id),
  }),
);

export const stockMovements = sqliteTable(
  "stock_movements",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    ingredient_id: text("ingredient_id")
      .notNull()
      .references(() => ingredients.id),
    type: text("type").notNull(),
    qty: real("qty").notNull().default(0),
    unit: text("unit").notNull(),
    reference_id: text("reference_id"),
    reference_type: text("reference_type"),
    notes: text("notes"),
    created_by: text("created_by").references(() => users.id),
    created_at: text("created_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    tenantIdx: index("stock_movements_tenant_idx").on(t.tenant_id),
    storeIdx: index("stock_movements_store_idx").on(t.store_id),
    ingredientIdx: index("stock_movements_ingredient_idx").on(t.ingredient_id),
  }),
);

export const wasteLogs = sqliteTable(
  "waste_logs",
  {
    id: text("id").primaryKey(),
    tenant_id: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    store_id: text("store_id").references(() => stores.id),
    ingredient_id: text("ingredient_id").references(() => ingredients.id),
    product_id: text("product_id").references(() => products.id),
    qty: real("qty").notNull().default(0),
    unit: text("unit").notNull(),
    reason: text("reason").notNull(),
    cost_impact: real("cost_impact").notNull().default(0),
    logged_by: text("logged_by").references(() => users.id),
    created_at: text("created_at").notNull().default(new Date().toISOString()),
  },
  (t) => ({
    tenantIdx: index("waste_logs_tenant_idx").on(t.tenant_id),
    storeIdx: index("waste_logs_store_idx").on(t.store_id),
    ingredientIdx: index("waste_logs_ingredient_idx").on(t.ingredient_id),
  }),
);
