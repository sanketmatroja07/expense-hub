import { NextRequest, NextResponse } from "next/server";
import { createGroupInState, type CreateGroupInput } from "@/lib/expense-hub-core";
import { getOptionalAuthIdentity } from "@/lib/supabase/auth";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function POST(request: NextRequest) {
  const input = (await request.json()) as CreateGroupInput;
  const identity = await getOptionalAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await mutateExpenseHubState(identity, (current) =>
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
