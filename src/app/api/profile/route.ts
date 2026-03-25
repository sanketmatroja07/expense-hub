import { NextRequest, NextResponse } from "next/server";
import { updateCurrentUserInState } from "@/lib/expense-hub-core";
import { getOptionalAuthIdentity } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types";
import { mutateExpenseHubState } from "@/lib/server/expense-hub-db";

export async function PATCH(request: NextRequest) {
  const updates = (await request.json()) as Partial<User>;
  const identity = await getOptionalAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nextName = updates.name?.trim();
  if (nextName && nextName !== identity.name) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: nextName },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  const { email: _ignoredEmail, ...remainingUpdates } = updates;
  const sanitizedUpdates: Partial<User> = {
    ...remainingUpdates,
    ...(nextName ? { name: nextName } : {}),
  };

  const state = await mutateExpenseHubState(identity, (current) =>
    updateCurrentUserInState(current, sanitizedUpdates)
  );
  return NextResponse.json({ state });
}
