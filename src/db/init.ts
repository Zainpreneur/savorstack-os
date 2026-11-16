import { db, sqlite } from "@/db/connection";
import {
  tenants,
  stores,
  roles,
  users,
  categories,
  products,
  ingredients,
} from "@/db/schema";
import { hash } from "bcryptjs";

const schemaSQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'PKR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  store_id TEXT REFERENCES stores(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role_id TEXT REFERENCES roles(id),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  store_id TEXT REFERENCES stores(id),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  store_id TEXT REFERENCES stores(id),
  category_id TEXT REFERENCES categories(id),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sale_price REAL NOT NULL DEFAULT 0,
  cost_price REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'piece',
  is_active INTEGER NOT NULL DEFAULT 1,
  track_inventory INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  store_id TEXT REFERENCES stores(id),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock REAL NOT NULL DEFAULT 0,
  reorder_level REAL NOT NULL DEFAULT 0,
  unit_cost REAL NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  yield_qty REAL NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  qty_per_unit REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  store_id TEXT REFERENCES stores(id),
  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  total_amount REAL NOT NULL DEFAULT 0,
  cashier_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id TEXT REFERENCES products(id),
  qty REAL NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  kitchen_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  store_id TEXT REFERENCES stores(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  clock_in TEXT NOT NULL,
  clock_out TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

sqlite.exec(schemaSQL);

async function main() {
  await db.insert(tenants).values({
    id: "tenant_1",
    name: "Chai Tapri",
    slug: "chai-tapri",
    currency: "PKR",
    timezone: "Asia/Karachi",
  }).onConflictDoNothing();

  await db.insert(stores).values({
    id: "store_1",
    tenant_id: "tenant_1",
    name: "Main Branch",
    is_default: 1,
    is_active: 1,
  }).onConflictDoNothing();

  await db.insert(roles).values([
    { id: "role_owner", tenant_id: "tenant_1", name: "Owner" },
    { id: "role_manager", tenant_id: "tenant_1", name: "Manager" },
    { id: "role_cashier", tenant_id: "tenant_1", name: "Cashier" },
    { id: "role_kitchen", tenant_id: "tenant_1", name: "KitchenStaff" },
  ]).onConflictDoNothing();

  const passwordHash = await hash("password123", 10);

  await db.insert(users).values({
    id: "user_owner",
    tenant_id: "tenant_1",
    store_id: "store_1",
    email: "owner@chai.local",
    password_hash: passwordHash,
    full_name: "Owner User",
    role_id: "role_owner",
    is_active: 1,
  }).onConflictDoNothing();

  await db.insert(categories).values([
    { id: "cat_tea", tenant_id: "tenant_1", store_id: "store_1", name: "Tea", sort_order: 1, is_active: 1 },
    { id: "cat_food", tenant_id: "tenant_1", store_id: "store_1", name: "Food", sort_order: 2, is_active: 1 },
    { id: "cat_beverage", tenant_id: "tenant_1", store_id: "store_1", name: "Beverages", sort_order: 3, is_active: 1 },
  ]).onConflictDoNothing();

  await db.insert(products).values([
    { id: "prod_1", tenant_id: "tenant_1", store_id: "store_1", category_id: "cat_tea", sku: "TEA-001", name: "Masala Chai", sale_price: 25, cost_price: 8, unit: "cup", is_active: 1, track_inventory: 1 },
    { id: "prod_2", tenant_id: "tenant_1", store_id: "store_1", category_id: "cat_tea", sku: "TEA-002", name: "Ginger Chai", sale_price: 30, cost_price: 10, unit: "cup", is_active: 1, track_inventory: 1 },
    { id: "prod_3", tenant_id: "tenant_1", store_id: "store_1", category_id: "cat_tea", sku: "TEA-003", name: "Plain Tea", sale_price: 15, cost_price: 5, unit: "cup", is_active: 1, track_inventory: 1 },
    { id: "prod_4", tenant_id: "tenant_1", store_id: "store_1", category_id: "cat_food", sku: "FOOD-001", name: "Aloo Paratha", sale_price: 40, cost_price: 15, unit: "pcs", is_active: 1, track_inventory: 1 },
    { id: "prod_5", tenant_id: "tenant_1", store_id: "store_1", category_id: "cat_food", sku: "FOOD-002", name: "Paneer Paratha", sale_price: 60, cost_price: 25, unit: "pcs", is_active: 1, track_inventory: 1 },
    { id: "prod_6", tenant_id: "tenant_1", store_id: "store_1", category_id: "cat_food", sku: "FOOD-003", name: "Plain Paratha", sale_price: 30, cost_price: 10, unit: "pcs", is_active: 1, track_inventory: 1 },
    { id: "prod_7", tenant_id: "tenant_1", store_id: "store_1", category_id: "cat_food", sku: "FOOD-004", name: "Samosa", sale_price: 15, cost_price: 6, unit: "pcs", is_active: 1, track_inventory: 1 },
    { id: "prod_8", tenant_id: "tenant_1", store_id: "store_1", category_id: "cat_beverage", sku: "BEV-001", name: "Cold Coffee", sale_price: 50, cost_price: 20, unit: "glass", is_active: 1, track_inventory: 1 },
  ]).onConflictDoNothing();

  await db.insert(ingredients).values([
    { id: "ing_1", tenant_id: "tenant_1", store_id: "store_1", name: "Tea Leaves", unit: "kg", current_stock: 5, reorder_level: 1, unit_cost: 800, is_active: 1 },
    { id: "ing_2", tenant_id: "tenant_1", store_id: "store_1", name: "Milk", unit: "liter", current_stock: 20, reorder_level: 5, unit_cost: 120, is_active: 1 },
    { id: "ing_3", tenant_id: "tenant_1", store_id: "store_1", name: "Sugar", unit: "kg", current_stock: 10, reorder_level: 2, unit_cost: 100, is_active: 1 },
    { id: "ing_4", tenant_id: "tenant_1", store_id: "store_1", name: "Flour", unit: "kg", current_stock: 15, reorder_level: 3, unit_cost: 60, is_active: 1 },
    { id: "ing_5", tenant_id: "tenant_1", store_id: "store_1", name: "Potato", unit: "kg", current_stock: 8, reorder_level: 2, unit_cost: 40, is_active: 1 },
  ]).onConflictDoNothing();

  console.log("Database seeded successfully with Drizzle ORM.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
