import { NextRequest, NextResponse } from "next/server";
import {
  updatePreferencesInState,
  type AppPreferences,
} from "@/lib/expense-hub-core";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function PATCH(request: NextRequest) {
  const updates = (await request.json()) as Partial<AppPreferences>;
  const state = mutateExpenseHubState((current) =>
    updatePreferencesInState(current, updates)
  );
  return NextResponse.json({ state });
}
