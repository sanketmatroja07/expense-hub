import { NextRequest, NextResponse } from "next/server";
import { createGroupInState, type CreateGroupInput } from "@/lib/expense-hub-core";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function POST(request: NextRequest) {
  const input = (await request.json()) as CreateGroupInput;

  try {
    const state = await mutateExpenseHubState((current) =>
      createGroupInState(current, input)
    );
    return NextResponse.json({ state });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create group.",
      },
      { status: 400 }
    );
  }
}
