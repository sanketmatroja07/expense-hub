import { NextRequest, NextResponse } from "next/server";
import { addExpenseToState, type ExpenseInput } from "@/lib/expense-hub-core";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function POST(request: NextRequest) {
  const input = (await request.json()) as ExpenseInput;

  try {
    const state = await mutateExpenseHubState((current) =>
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
