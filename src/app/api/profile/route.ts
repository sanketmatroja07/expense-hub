import { NextRequest, NextResponse } from "next/server";
import { updateCurrentUserInState } from "@/lib/expense-hub-core";
import type { User } from "@/lib/types";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function PATCH(request: NextRequest) {
  const updates = (await request.json()) as Partial<User>;

  const state = mutateExpenseHubState((current) =>
    updateCurrentUserInState(current, updates)
  );
  return NextResponse.json({ state });
}
