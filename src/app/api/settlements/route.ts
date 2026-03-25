import { NextRequest, NextResponse } from "next/server";
import { settleUpInState, type SettleUpInput } from "@/lib/expense-hub-core";
import { getOptionalAuthIdentity } from "@/lib/supabase/auth";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function POST(request: NextRequest) {
  const input = (await request.json()) as SettleUpInput;
  const identity = await getOptionalAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await mutateExpenseHubState(identity, (current) =>
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
