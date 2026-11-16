import { NextResponse } from "next/server";

// Auth temporarily disabled — all routes are public
export const runtime = "nodejs";

export async function middleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\..*$).*)"],
};
