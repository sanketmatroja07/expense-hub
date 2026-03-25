import { NextResponse } from "next/server";
import { markAllNotificationsReadInState } from "@/lib/expense-hub-core";
import { getOptionalAuthIdentity } from "@/lib/auth";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function POST() {
  const identity = await getOptionalAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await mutateExpenseHubState(identity, (current) =>
    markAllNotificationsReadInState(current)
  );
  return NextResponse.json({ state });
}
