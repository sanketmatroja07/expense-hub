import { NextResponse } from "next/server";
import { readExpenseHubState } from "@/lib/server/expense-hub-db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ state: await readExpenseHubState() });
}
