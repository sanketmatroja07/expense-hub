import { NextRequest, NextResponse } from "next/server";
import {
  updatePreferencesInState,
  type AppPreferences,
} from "@/lib/expense-hub-core";
import { getOptionalAuthIdentity } from "@/lib/auth";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function PATCH(request: NextRequest) {
  const updates = (await request.json()) as Partial<AppPreferences>;
  const identity = await getOptionalAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await mutateExpenseHubState(identity, (current) =>
    updatePreferencesInState(current, updates)
  );
  return NextResponse.json({ state });
}
