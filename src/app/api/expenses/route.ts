import { NextRequest, NextResponse } from "next/server";
import { addExpenseToState, type ExpenseInput } from "@/lib/expense-hub-core";
import { getOptionalAuthIdentity } from "@/lib/supabase/auth";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function POST(request: NextRequest) {
  const input = (await request.json()) as ExpenseInput;
  const identity = await getOptionalAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await mutateExpenseHubState(identity, (current) =>
      addExpenseToState(current, input)
    );
    return NextResponse.json({ state });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to add expense.",
      },
      { status: 400 }
    );
  }
}
