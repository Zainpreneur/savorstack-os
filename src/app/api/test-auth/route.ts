import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  console.log("TEST API: body:", body);
  return NextResponse.json({ received: body });
}
