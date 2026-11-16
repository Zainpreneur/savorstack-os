import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db/connection";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { compare } from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        console.log("AUTHORIZE CALLED with:", JSON.stringify({ email: credentials?.email, hasPassword: !!credentials?.password }));
        if (!credentials?.email || !credentials?.password) {
          console.log("AUTHORIZE: missing credentials");
          return null;
        }
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string));

          console.log("AUTHORIZE: user found:", user ? user.email : "null");

          if (!user || !user.password_hash) {
            console.log("AUTHORIZE: no user or no password hash");
            return null;
          }

          const isValid = await compare(
            credentials.password as string,
            user.password_hash as string
          );
          console.log("AUTHORIZE: password valid:", isValid);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            roleId: user.role_id,
            tenantId: user.tenant_id,
            storeId: user.store_id,
          };
        } catch (err) {
          console.log("AUTHORIZE: error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.roleId = user.roleId;
        token.tenantId = user.tenantId;
        token.storeId = user.storeId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).roleId = token.roleId;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).storeId = token.storeId;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/signin", error: "/auth/error" },
};
