"use server";

import { db } from "@/db/connection";
import { eq } from "drizzle-orm";
import { users, roles } from "@/db/schema";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE = "savorstack_session";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user || !user.password_hash) {
    return { error: "Invalid email or password" };
  }

  const isValid = await compare(password, user.password_hash);
  if (!isValid) {
    return { error: "Invalid email or password" };
  }

  // Look up role name
  const [role] = await db
    .select({ name: roles.name })
    .from(roles)
    .where(eq(roles.id, user.role_id));

  // Set session cookie
  const sessionValue = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.full_name,
    roleId: user.role_id,
    roleName: role?.name || "Cashier",
    tenantId: user.tenant_id,
    storeId: user.store_id,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  (await cookies()).set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return { success: true, redirect: "/dashboard" };
}

export async function signOut() {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return { redirect: "/" };
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie);
  } catch {
    return null;
  }
}
