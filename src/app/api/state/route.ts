import { NextResponse } from "next/server";
import { getOptionalAuthIdentity } from "@/lib/auth";
import { readExpenseHubState } from "@/lib/server/expense-hub-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const identity = await getOptionalAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ state: await readExpenseHubState(identity) });
}
