import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getDisplayNameFromEmail, type AuthIdentity } from "@/lib/expense-hub-core";

export function toAuthIdentity(user: SupabaseUser): AuthIdentity {
  const email = user.email || "user@expensehub.app";
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : "";

  return {
    id: user.id,
    email,
    name: metadataName || getDisplayNameFromEmail(email),
  };
}

export async function getOptionalAuthIdentity() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? toAuthIdentity(user) : null;
}

export async function requireAuthIdentity() {
  const identity = await getOptionalAuthIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}
