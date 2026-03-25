import { NextResponse } from "next/server";
import { markAllNotificationsReadInState } from "@/lib/expense-hub-core";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function POST() {
  const state = await mutateExpenseHubState((current) =>
    markAllNotificationsReadInState(current)
  );
  return NextResponse.json({ state });
}
