import { db } from "./src/db/connection";
import { eq } from "drizzle-orm";
import { users } from "./src/db/schema";

async function main() {
  const [user] = await db.select().from(users).where(eq(users.email, "owner@chai.local"));
  console.log("User found:", user ? user.email : "NOT FOUND");
  if (user) {
    console.log("Full user:", JSON.stringify({ id: user.id, email: user.email, role_id: user.role_id, hasPassword: !!user.password_hash }));
  }
}

main();
