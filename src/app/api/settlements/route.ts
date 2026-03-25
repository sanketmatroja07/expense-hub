import { NextRequest, NextResponse } from "next/server";
import { settleUpInState, type SettleUpInput } from "@/lib/expense-hub-core";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function POST(request: NextRequest) {
  const input = (await request.json()) as SettleUpInput;

  try {
    const state = await mutateExpenseHubState((current) =>
      settleUpInState(current, input)
    );
    return NextResponse.json({ state });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to record settlement.",
      },
      { status: 400 }
    );
  }
}
